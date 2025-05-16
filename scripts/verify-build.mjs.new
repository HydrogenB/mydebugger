/**
 * Build verification script
 * This script verifies that all import chunks are resolving correctly
 * before the actual build happens.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Handle chalk not being available
const log = {
  green: (text) => chalk?.green?.(text) || text,
  red: (text) => chalk?.red?.(text) || text,
  yellow: (text) => chalk?.yellow?.(text) || text
};

console.log('Verifying build configuration...');

// Get current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Path to the Vite config
const viteConfigPath = path.join(rootDir, 'vite.config.ts');

// Path to the tools directory
const toolsDir = path.join(rootDir, 'src', 'tools');

// Helper to check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Read the vite config
let viteConfig;
try {
  viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  console.log(log.green('✓ Vite config found'));
} catch (error) {
  console.error(log.red(`✗ Error reading vite.config.ts: ${error.message}`));
  process.exit(1);
}

// Extract manual chunks from the config
const manualChunksMatch = viteConfig.match(/manualChunks\s*:\s*{([^}]*)}/s);
if (!manualChunksMatch) {
  console.error(log.yellow('⚠ No manual chunks found in vite.config.ts'));
  process.exit(0);
}

const manualChunks = manualChunksMatch[1];
const chunkPaths = manualChunks.match(/['"]\.\/src\/tools\/.*?['"]/g) || [];

if (chunkPaths.length === 0) {
  console.error(log.yellow('⚠ No tool paths found in manual chunks'));
  process.exit(0);
}

let allPathsExist = true;

// Verify each path in the manual chunks
chunkPaths.forEach(pathMatch => {
  const cleanPath = pathMatch.replace(/['"]/g, '');
  const absolutePath = path.join(rootDir, cleanPath);
  
  console.log(`Checking ${cleanPath}...`);
  
  if (fileExists(absolutePath)) {
    console.log(log.green(`✓ Path exists: ${cleanPath}`));
  } else {
    console.error(log.red(`✗ Path does not exist: ${cleanPath}`));
    allPathsExist = false;
  }
});

// Check all tools have index.ts files
if (fs.existsSync(toolsDir)) {
  const tools = fs.readdirSync(toolsDir).filter(dir => {
    try {
      const stat = fs.statSync(path.join(toolsDir, dir));
      return stat.isDirectory();
    } catch (err) {
      return false;
    }
  });
  
  console.log('\nVerifying index.ts files in tool directories:');
  
  tools.forEach(tool => {
    const indexPath = path.join(toolsDir, tool, 'index.ts');
    
    if (fileExists(indexPath)) {
      console.log(log.green(`✓ Index exists for ${tool}`));
    } else {
      console.log(log.yellow(`⚠ Missing index.ts for ${tool}`));
      // Create index.ts for tool directories that don't have one
      try {
        const toolFiles = fs.readdirSync(path.join(toolsDir, tool));
        const mainFile = toolFiles.find(file => file.endsWith('.tsx') && !file.includes('test'));
        
        if (mainFile) {
          const componentName = mainFile.replace('.tsx', '');
          const indexContent = `// Auto-generated index file\nimport ${componentName} from './${mainFile}';\n\nexport { ${componentName} };\nexport default ${componentName};`;
          fs.writeFileSync(path.join(toolsDir, tool, 'index.ts'), indexContent);
          console.log(log.green(`  ✓ Created index.ts for ${tool}`));
        }
      } catch (err) {
        console.log(log.yellow(`  ⚠ Could not create index.ts for ${tool}: ${err.message}`));
      }
    }
  });
}

// Verify Vercel JSON
const vercelJsonPath = path.join(rootDir, 'vercel.json');
if (fileExists(vercelJsonPath)) {
  try {
    const vercelJson = fs.readFileSync(vercelJsonPath, 'utf8');
    
    // Check for potential comments in JSON using better regex that won't match paths
    const commentRegex = /(^|\s)\/\//;
    const blockCommentRegex = /(^|\s)\/\*/;
    
    // Get all lines and check each for comments
    const lines = vercelJson.split('\n');
    const commentLines = lines.filter(line => commentRegex.test(line) || blockCommentRegex.test(line));
    
    if (commentLines.length > 0) {
      console.error(log.red('✗ vercel.json contains comments which are not allowed in JSON'));
      console.error(log.red('  Remove all comments (lines with // or blocks with /* */) from JSON files'));
      commentLines.forEach((line, i) => {
        console.error(log.red(`  Comment found: ${line.trim()}`));
      });
      allPathsExist = false;
    } else {
      // Try to parse the JSON
      JSON.parse(vercelJson);
      console.log(log.green('✓ vercel.json is valid JSON'));
    }
  } catch (error) {
    console.error(log.red(`✗ vercel.json is not valid JSON: ${error.message}`));
    allPathsExist = false;
  }
} else {
  console.log(log.yellow('⚠ vercel.json file not found'));
}

if (!allPathsExist) {
  console.error(log.red('\n✗ Some paths in configuration do not exist!'));
  process.exit(1);
} else {
  console.log(log.green('\n✓ All configuration paths exist'));
  console.log(log.green('Build verification complete - configuration looks correct'));
}
