#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = process.cwd();
const SRC_DIR = path.join(root, 'src');
const TOOLS_DIR = path.join(SRC_DIR, 'tools');
const VIEW_DIR = path.join(root, 'view');
const VIEWMODEL_DIR = path.join(root, 'viewmodel');

const args = process.argv.slice(2);
const getArg = (name, def = undefined) => {
  const pref = `--${name}`;
  const foundIdx = args.findIndex(a => a === pref || a.startsWith(`${pref}=`));
  if (foundIdx === -1) return def;
  const val = args[foundIdx].includes('=') ? args[foundIdx].split('=')[1] : args[foundIdx + 1];
  return val ?? true;
};

const opt = {
  tool: getArg('tool', null),
  all: !!getArg('all', false),
  write: !!getArg('write', false),
  dryRun: !getArg('write', false),
};

const log = (...msg) => console.log('[migrate]', ...msg);
const warn = (...msg) => console.warn('[migrate][warn]', ...msg);
const err = (...msg) => console.error('[migrate][error]', ...msg);

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function pathExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function walk(dir, exts = ['.ts', '.tsx']) {
  const out = [];
  async function rec(d) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        await rec(full);
      } else {
        if (exts.includes(path.extname(e.name))) out.push(full);
      }
    }
  }
  await rec(dir);
  return out;
}

function panelNameFromViewBase(base) {
  return (base.endsWith('View') ? base.slice(0, -4) : base) + 'Panel';
}

function importRegexes() {
  // Match patterns like: from '../../../view/Name' or from "../../../viewmodel/useXxx"
  return {
    view: /from\s+['"](?:\.\.\/)+view\/([A-Za-z0-9_\-\/]+)['"]/g,
    viewmodel: /from\s+['"](?:\.\.\/)+viewmodel\/([A-Za-z0-9_\-\/]+)['"]/g,
    // For files that previously lived under project root (e.g. view/*) and imported from '../src/...'
    srcRelative: /from\s+['"](?:\.\.\/)+src\/([A-Za-z0-9_\-\/\.]+)['"]/g,
  };
}

async function collectToolImports(toolDir) {
  const files = await walk(toolDir);
  const regs = importRegexes();
  const imports = { views: new Map(), hooks: new Map() }; // name -> Set(files)

  for (const f of files) {
    const txt = await fs.readFile(f, 'utf8');
    let m;
    while ((m = regs.view.exec(txt))) {
      const base = m[1]; // may include subpaths, but we expect simple names
      const set = imports.views.get(base) ?? new Set();
      set.add(f);
      imports.views.set(base, set);
    }
    regs.view.lastIndex = 0;
    while ((m = regs.viewmodel.exec(txt))) {
      const base = m[1];
      const set = imports.hooks.get(base) ?? new Set();
      set.add(f);
      imports.hooks.set(base, set);
    }
    regs.viewmodel.lastIndex = 0;
  }
  return imports;
}

async function moveFile(src, dest, dryRun) {
  if (await pathExists(dest)) {
    log('skip (exists):', dest);
    return;
  }
  log((dryRun ? 'would move' : 'move'), src, '=>', dest);
  if (!dryRun) {
    await ensureDir(path.dirname(dest));
    await fs.rename(src, dest);
  }
}

function computeRelativeImport(fromFile, targetFileNoExt) {
  // Return relative path without extension, normalized to posix style
  let rel = path.relative(path.dirname(fromFile), targetFileNoExt);
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.split(path.sep).join('/');
}

async function updateImportsInFile(file, replacements) {
  let txt = await fs.readFile(file, 'utf8');
  let changed = false;
  for (const { pattern, replaceWith } of replacements) {
    const newTxt = txt.replace(pattern, (full, p1) => replaceWith(p1, file));
    if (newTxt !== txt) {
      txt = newTxt;
      changed = true;
    }
  }
  if (changed) {
    log(opt.dryRun ? 'would write' : 'write', file);
    if (!opt.dryRun) await fs.writeFile(file, txt, 'utf8');
  }
}

async function migrateTool(tool) {
  const toolDir = path.join(TOOLS_DIR, tool);
  if (!(await pathExists(toolDir))) {
    throw new Error(`Tool not found: ${toolDir}`);
  }

  const imports = await collectToolImports(toolDir);

  // Plan moves
  const plannedMoves = [];
  // Views
  for (const base of imports.views.keys()) {
    const srcView = path.join(VIEW_DIR, base + '.tsx');
    if (!(await pathExists(srcView))) {
      warn('view not found for import', base, 'expected', srcView);
      continue;
    }
    const panel = panelNameFromViewBase(path.basename(base));
    const dest = path.join(toolDir, 'components', panel + '.tsx');
    plannedMoves.push({ type: 'view', base, src: srcView, dest });
  }
  // Hooks
  for (const base of imports.hooks.keys()) {
    const srcHook = path.join(VIEWMODEL_DIR, base + '.ts');
    if (!(await pathExists(srcHook))) {
      warn('hook not found for import', base, 'expected', srcHook);
      continue;
    }
    const dest = path.join(toolDir, 'hooks', base + '.ts');
    plannedMoves.push({ type: 'hook', base, src: srcHook, dest });
  }

  // Execute moves
  for (const mv of plannedMoves) {
    await moveFile(mv.src, mv.dest, opt.dryRun);
  }

  // Update imports inside tool files
  const toolFiles = await walk(toolDir);
  const regs = importRegexes();
  for (const f of toolFiles) {
    const replacements = [
      {
        pattern: regs.view,
        replaceWith: (base /* e.g. AesCbcView */) => {
          const panel = panelNameFromViewBase(path.basename(base));
          const destAbsNoExt = path.join(toolDir, 'components', panel);
          const rel = computeRelativeImport(f, destAbsNoExt);
          return `from '${rel}'`;
        },
      },
      {
        pattern: regs.viewmodel,
        replaceWith: (base /* e.g. useAesCbc */) => {
          const destAbsNoExt = path.join(toolDir, 'hooks', base);
          const rel = computeRelativeImport(f, destAbsNoExt);
          return `from '${rel}'`;
        },
      },
      {
        // Rewrite imports that pointed at '../src/...'
        pattern: regs.srcRelative,
        replaceWith: (rest /* e.g. design-system/components/... */) => {
          const targetAbsNoExt = path.join(SRC_DIR, rest).replace(/\.(t|j)sx?$/, '');
          const rel = computeRelativeImport(f, targetAbsNoExt);
          return `from '${rel}'`;
        },
      },
    ];
    await updateImportsInFile(f, replacements);
  }

  // Update tests importing moved hooks
  const testsDir = path.join(root, '__tests__');
  if (await pathExists(testsDir)) {
    const tests = await walk(testsDir, ['.ts', '.tsx', '.js']);
    for (const t of tests) {
      let txt = await fs.readFile(t, 'utf8');
      let changed = false;
      for (const mv of plannedMoves.filter(m => m.type === 'hook')) {
        // Match imports like ../../viewmodel/useX or ../viewmodel/useX
        const fromRe = new RegExp(`from\\s+['\"](?:\\.\\.\/)\+viewmodel\/${mv.base}['\"]`, 'g');
        if (fromRe.test(txt)) {
          const relNoExt = computeRelativeImport(t, mv.dest.replace(/\\.ts$/, ''));
          txt = txt.replace(fromRe, `from '${relNoExt}'`);
          changed = true;
        }
        // Also match bare imports like viewmodel/useX (in case of non-relative usage)
        const absRe = new RegExp(`from\\s+['\"]viewmodel\/${mv.base}['\"]`, 'g');
        if (absRe.test(txt)) {
          const relNoExt = computeRelativeImport(t, mv.dest.replace(/\\.ts$/, ''));
          txt = txt.replace(absRe, `from '${relNoExt}'`);
          changed = true;
        }
      }
      if (changed) {
        log(opt.dryRun ? 'would write' : 'write', t);
        if (!opt.dryRun) await fs.writeFile(t, txt, 'utf8');
      }
    }
  }

  // Ensure directories exist
  await ensureDir(path.join(toolDir, 'components'));
  await ensureDir(path.join(toolDir, 'hooks'));
  await ensureDir(path.join(toolDir, 'lib'));

  log('Done tool:', tool, `(dryRun=${opt.dryRun})`);
}

async function enumerateTools() {
  const entries = await fs.readdir(TOOLS_DIR, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}

(async function main() {
  try {
    const allTools = await enumerateTools();
    const targets = opt.all ? allTools : opt.tool ? [opt.tool] : [];
    if (!targets.length) {
      err('Specify --tool <name> or --all');
      err('Available tools:', allTools.join(', '));
      process.exit(1);
    }
    for (const t of targets) {
      log('Migrating tool', t);
      await migrateTool(t);
    }
    log('All done');
  } catch (e) {
    err(e?.stack || String(e));
    process.exit(1);
  }
})();
