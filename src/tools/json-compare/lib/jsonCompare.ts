export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface DiffEntry {
  path: string; // JSON pointer-like path e.g. /users/0/name
  type: DiffType;
  left?: unknown;
  right?: unknown;
}

export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
}

export interface DiffReport {
  summary: DiffSummary;
  changes: DiffEntry[];
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const buildPath = (base: string, key: string | number) =>
  `${base}/${String(key)}`;

const equalJsonValues = (a: unknown, b: unknown): boolean => {
  // Normalize -0 and 0 as equal
  if (typeof a === 'number' && typeof b === 'number') {
    return +a === +b; // handles -0 === 0 and NaN !== NaN
  }
  // Primitives (string, boolean, null) and undefined (should not occur in JSON)
  if (
    (typeof a !== 'object' || a === null) &&
    (typeof b !== 'object' || b === null)
  ) {
    return a === b;
  }
  return false; // objects/arrays require deep walk
};

export const compareJson = (left: unknown, right: unknown): DiffReport => {
  const changes: DiffEntry[] = [];
  const summary: DiffSummary = { added: 0, removed: 0, modified: 0 };

  const walk = (l: unknown, r: unknown, path: string) => {
    // Fast path for primitives
    if (equalJsonValues(l, r)) return;

    if (Array.isArray(l) && Array.isArray(r)) {
      const maxLen = Math.max(l.length, r.length);
      for (let i = 0; i < maxLen; i++) {
        if (i >= l.length) {
          changes.push({ path: buildPath(path, i), type: 'added', right: r[i] });
          summary.added += 1;
        } else if (i >= r.length) {
          changes.push({ path: buildPath(path, i), type: 'removed', left: l[i] });
          summary.removed += 1;
        } else {
          // Recurse; if elements differ at primitive level, count as modified
          if (!equalJsonValues(l[i], r[i])) {
            if (isObject(l[i]) || isObject(r[i]) || Array.isArray(l[i]) || Array.isArray(r[i])) {
              walk(l[i], r[i], buildPath(path, i));
            } else {
              changes.push({ path: buildPath(path, i), type: 'modified', left: l[i], right: r[i] });
              summary.modified += 1;
            }
          }
        }
      }
      return;
    }

    if (isObject(l) && isObject(r)) {
      const keys = new Set([...Object.keys(l), ...Object.keys(r)]);
      for (const key of keys) {
        if (!(key in l)) {
          changes.push({ path: buildPath(path, key), type: 'added', right: (r as any)[key] });
          summary.added += 1;
        } else if (!(key in r)) {
          changes.push({ path: buildPath(path, key), type: 'removed', left: (l as any)[key] });
          summary.removed += 1;
        } else {
          const lv = (l as any)[key];
          const rv = (r as any)[key];
          if (!equalJsonValues(lv, rv)) {
            if ((isObject(lv) && isObject(rv)) || (Array.isArray(lv) && Array.isArray(rv))) {
              walk(lv, rv, buildPath(path, key));
            } else {
              changes.push({ path: buildPath(path, key), type: 'modified', left: lv, right: rv });
              summary.modified += 1;
            }
          }
        }
      }
      return;
    }

    // Primitive or type mismatch handled as modified unless both undefined
    if (!equalJsonValues(l, r)) {
      changes.push({ path: path || '/', type: 'modified', left: l, right: r });
      summary.modified += 1;
    }
  };

  walk(left, right, '');
  return { summary, changes };
};

export const formatJsonIfValid = (text: string): { formatted: string; error: string | null } => {
  try {
    const parsed = JSON.parse(text);
    return { formatted: JSON.stringify(parsed, null, 2), error: null };
  } catch (e) {
    return { formatted: text, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
};

export const makeDownload = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const createSamplePair = () => {
  const left = {
    id: 1,
    name: 'Widget',
    tags: ['a', 'b'],
    meta: { version: 1, flags: { beta: false } },
  };
  const right = {
    id: 1,
    name: 'Widget Pro',
    tags: ['a', 'b', 'c'],
    meta: { version: 2, flags: { beta: true } },
    extra: true,
  };
  return { left, right };
};

export type { DiffReport };


