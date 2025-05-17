import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}=== Checking MyDebugger Tools Structure ===${colors.reset}\n`);

// Path to tools directory
const toolsDir = path.join(rootDir, 'src', 'tools');

// Expected directories in each tool
const expectedStructure = [
  'components',
  'hooks',
  'utils'
];

// Expected files in each tool
const expectedFiles = [
  'index.ts',
  'types.ts'
];

// Get all tool directories
const toolDirs = fs.readdirSync(toolsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => ({
    name: dirent.name,
    path: path.join(toolsDir, dirent.name)
  }));

console.log(`${colors.cyan}Found ${toolDirs.length} tools to check${colors.reset}\n`);

// Check each tool
const results = {
  complete: [],
  incomplete: [],
  errors: []
};

toolDirs.forEach(tool => {
  console.log(`${colors.yellow}Checking tool: ${tool.name}${colors.reset}`);
  
  const issues = [];
  
  // Check directory structure
  expectedStructure.forEach(dir => {
    const dirPath = path.join(tool.path, dir);
    if (!fs.existsSync(dirPath)) {
      issues.push(`Missing directory: ${dir}`);
    }
  });
  
  // Check required files
  expectedFiles.forEach(file => {
    const filePath = path.join(tool.path, file);
    if (!fs.existsSync(filePath)) {
      issues.push(`Missing file: ${file}`);
    }
  });
  
  // Check TypeScript errors
  try {
    const typescriptFiles = `${tool.path}/**/*.ts ${tool.path}/**/*.tsx ${tool.path}/*.ts ${tool.path}/*.tsx`;
    execSync(`npx tsc --noEmit ${typescriptFiles}`, { stdio: 'pipe' });
  } catch (error) {
    issues.push('TypeScript errors found');
  }
  
  // Output results for this tool
  if (issues.length === 0) {
    console.log(`  ${colors.green}✓ Tool structure is complete${colors.reset}`);
    results.complete.push(tool.name);
  } else {
    console.log(`  ${colors.red}✗ Issues found:${colors.reset}`);
    issues.forEach(issue => {
      console.log(`    - ${issue}`);
    });
    results.incomplete.push({ name: tool.name, issues });
  }
  console.log();
});

// Summary
console.log(`${colors.blue}=== Summary ===${colors.reset}`);
console.log(`${colors.green}Complete tools (${results.complete.length}): ${results.complete.join(', ')}${colors.reset}`);

if (results.incomplete.length > 0) {
  console.log(`${colors.red}Incomplete tools (${results.incomplete.length}):${colors.reset}`);
  results.incomplete.forEach(tool => {
    console.log(`  - ${tool.name}: ${tool.issues.length} issues`);
  });
}

// Recommend next steps
console.log(`\n${colors.cyan}Recommended next steps:${colors.reset}`);
if (results.incomplete.length > 0) {
  console.log(`1. Fix the structure of incomplete tools`);
  console.log(`2. Run this script again to verify the fixes`);
} else {
  console.log(`All tools have been properly structured! Continue with other cleanup tasks.`);
}

console.log(`\n${colors.blue}=== Done ===${colors.reset}`);
