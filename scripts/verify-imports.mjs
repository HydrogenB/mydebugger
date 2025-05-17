import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directories to check
const dirsToCheck = [
  'src/app',
  'src/tools/base64-image',
  'api/controllers',
  'api/services',
];

console.log('Checking for potential import errors...');

// 1. Run TypeScript compiler in noEmit mode to check for type errors
try {
  console.log('\n--- Running TypeScript checks ---');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✓ TypeScript checks passed');
} catch (error) {
  console.error('✗ TypeScript checks failed. Please fix the errors above.');
  process.exit(1);
}

// 2. Check for files that import from nonexistent paths
console.log('\n--- Checking import paths ---');

// Walk through directories and check import statements
function walkAndCheckImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      walkAndCheckImports(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      checkImportsInFile(fullPath);
    }
  });
}

function checkImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /import\s+(?:(?:{[\s\w,]+})|(?:[\w*]+))\s+from\s+['"]([^'"]+)['"]/g;
  
  let match;
  let hasIssue = false;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Skip node module imports
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      continue;
    }
    
    // Resolve the import path
    let resolvedPath;
    if (importPath.startsWith('/')) {
      resolvedPath = path.join(process.cwd(), importPath);
    } else {
      resolvedPath = path.join(path.dirname(filePath), importPath);
    }
    
    // Handle TypeScript extensions
    let exists = fs.existsSync(resolvedPath) || 
                fs.existsSync(resolvedPath + '.ts') || 
                fs.existsSync(resolvedPath + '.tsx') ||
                fs.existsSync(resolvedPath + '.js') ||
                fs.existsSync(resolvedPath + '.jsx') ||
                fs.existsSync(resolvedPath + '/index.ts') ||
                fs.existsSync(resolvedPath + '/index.tsx') ||
                fs.existsSync(resolvedPath + '/index.js') ||
                fs.existsSync(resolvedPath + '/index.jsx');
                
    if (!exists) {
      console.error(`✗ In ${filePath}: Import '${importPath}' may not exist`);
      hasIssue = true;
    }
  }
  
  if (!hasIssue) {
    console.log(`✓ ${filePath} - All imports look valid`);
  }
}

// Check each directory
dirsToCheck.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    walkAndCheckImports(fullPath);
  } else {
    console.warn(`⚠ Directory not found: ${fullPath}`);
  }
});

console.log('\nImport path check complete!');
