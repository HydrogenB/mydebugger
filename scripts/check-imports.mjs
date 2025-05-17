import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const targetDirectories = [
  'src/app',
  'src/tools/base64-image',
  'api/controllers',
  'api/services'
];

// Function to check import paths
function checkImportsForFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Pattern to match ES6 imports
  const importRegex = /import\s+(?:(?:{[\s\w,]+})|(?:[\w*]+))\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(fileContent)) !== null) {
    imports.push(match[1]);
  }
  
  // Pattern to match require
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(fileContent)) !== null) {
    imports.push(match[1]);
  }
  
  // Check if the imported paths exist
  const issues = [];
  imports.forEach(importPath => {
    // Skip node modules imports or absolute imports
    if (!importPath.startsWith('.')) return;
    
    // Get the directory of the file
    const dirPath = path.dirname(filePath);
    
    // Construct the full path of the imported file
    let fullPath = path.resolve(dirPath, importPath);
    
    // Check if the file exists with various extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const indexFiles = extensions.map(ext => path.join(fullPath, `index${ext}`));
    
    // Add extensions to fullPath if it doesn't have one
    if (!path.extname(fullPath)) {
      fullPath = extensions.map(ext => fullPath + ext);
    } else {
      fullPath = [fullPath];
    }
    
    // Check all possible paths
    const allPossiblePaths = [...fullPath, ...indexFiles];
    const exists = allPossiblePaths.some(p => fs.existsSync(p));
    
    if (!exists) {
      issues.push(`Import not found: ${importPath}`);
    }
  });
  
  return issues;
}

// Recursively check all files in the given directories
function checkDirectory(directory) {
  const fullPath = path.join(rootDir, directory);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Directory not found: ${directory}`);
    return [];
  }
  
  const results = [];
  const files = fs.readdirSync(fullPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(fullPath, file.name);
    
    if (file.isDirectory()) {
      const subDirPath = path.join(directory, file.name);
      results.push(...checkDirectory(subDirPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(file.name)) {
      const issues = checkImportsForFile(filePath);
      
      if (issues.length > 0) {
        results.push({
          file: path.relative(rootDir, filePath),
          issues
        });
      }
    }
  }
  
  return results;
}

// Check all target directories
const allResults = [];
targetDirectories.forEach(directory => {
  console.log(`Checking ${directory}...`);
  const results = checkDirectory(directory);
  allResults.push(...results);
});

// Print the results
if (allResults.length > 0) {
  console.log('\n--- Files with import issues ---');
  allResults.forEach(result => {
    console.log(`\nFile: ${result.file}`);
    result.issues.forEach(issue => console.log(`  - ${issue}`));
  });
} else {
  console.log('\nNo import issues found!');
}
