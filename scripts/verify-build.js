/**
 * Build verification script
 * This script verifies that all import chunks are resolving correctly
 * before the actual build happens.
 */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: t => t, red: t => t, yellow: t => t };

console.log('Verifying build configuration...');

// Path to the Vite config
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');

// Path to the tools directory
const toolsDir = path.join(process.cwd(), 'src', 'tools');

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
  console.log(chalk.green('✓ Vite config found'));
} catch (error) {
  console.error(chalk.red(`✗ Error reading vite.config.ts: ${error.message}`));
  process.exit(1);
}

// Extract manual chunks from the config
const manualChunksMatch = viteConfig.match(/manualChunks\s*:\s*{([^}]*)}/s);
if (!manualChunksMatch) {
  console.error(chalk.yellow('⚠ No manual chunks found in vite.config.ts'));
  process.exit(0);
}

const manualChunks = manualChunksMatch[1];
const chunkPaths = manualChunks.match(/['"]\.\/src\/tools\/.*?['"]/g) || [];

if (chunkPaths.length === 0) {
  console.error(chalk.yellow('⚠ No tool paths found in manual chunks'));
  process.exit(0);
}

let allPathsExist = true;

// Verify each path in the manual chunks
chunkPaths.forEach(pathMatch => {
  const cleanPath = pathMatch.replace(/['"]/g, '');
  const absolutePath = path.join(process.cwd(), cleanPath);
  
  console.log(`Checking ${cleanPath}...`);
  
  if (fileExists(absolutePath)) {
    console.log(chalk.green(`✓ Path exists: ${cleanPath}`));
  } else {
    console.error(chalk.red(`✗ Path does not exist: ${cleanPath}`));
    allPathsExist = false;
  }
});

// Check all tools have index.ts files
if (fs.existsSync(toolsDir)) {
  const tools = fs.readdirSync(toolsDir).filter(dir => {
    const stat = fs.statSync(path.join(toolsDir, dir));
    return stat.isDirectory();
  });
  
  console.log('\nVerifying index.ts files in tool directories:');
  
  tools.forEach(tool => {
    const indexPath = path.join(toolsDir, tool, 'index.ts');
    
    if (fileExists(indexPath)) {
      console.log(chalk.green(`✓ Index exists for ${tool}`));
    } else {
      console.log(chalk.yellow(`⚠ Missing index.ts for ${tool}`));
      // Create index.ts for tool directories that don't have one
      try {
        const mainFile = fs.readdirSync(path.join(toolsDir, tool))
          .find(file => file.endsWith('.tsx') && !file.includes('test'));
        
        if (mainFile) {
          const componentName = mainFile.replace('.tsx', '');
          const indexContent = `// Auto-generated index file\nimport ${componentName} from './${mainFile}';\n\nexport { ${componentName} };\nexport default ${componentName};`;
          fs.writeFileSync(path.join(toolsDir, tool, 'index.ts'), indexContent);
          console.log(chalk.green(`  ✓ Created index.ts for ${tool}`));
        }
      } catch (err) {
        console.log(chalk.yellow(`  ⚠ Could not create index.ts for ${tool}: ${err.message}`));
      }
    }
  });
}

// Verify Vercel JSON
const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
if (fileExists(vercelJsonPath)) {
  try {
    const vercelJson = fs.readFileSync(vercelJsonPath, 'utf8');
    JSON.parse(vercelJson); // Will throw if not valid JSON
    console.log(chalk.green('✓ vercel.json is valid JSON'));
  } catch (error) {
    console.error(chalk.red(`✗ vercel.json is not valid JSON: ${error.message}`));
    allPathsExist = false;
  }
} else {
  console.log(chalk.yellow('⚠ vercel.json file not found'));
}

if (!allPathsExist) {
  console.error(chalk.red('\n✗ Some paths in manual chunks configuration do not exist!'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✓ All manual chunk paths exist'));
  console.log(chalk.green('Build verification complete - configuration looks correct'));
}
