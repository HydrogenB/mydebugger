// Enhanced script to check and repair Vite binary permissions and module structure
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Log with timestamp
function log(message, isError = false) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logFn = isError ? console.error : console.log;
  logFn(`[${timestamp}] ${message}`);
}

log('Starting Vite dependency validation...');
log(`Node version: ${process.version}`);
log(`Platform: ${process.platform}`);
log(`Working directory: ${process.cwd()}`);

// Check if we're running in a Vercel environment
const isVercelEnv = process.env.VERCEL === '1' || process.env.NOW_BUILDER;
log(`Running in Vercel environment: ${isVercelEnv ? 'Yes' : 'No'}`);

// Make sure node_modules exists
if (!fs.existsSync('./node_modules')) {
  log('node_modules directory not found. Creating...', true);
  try {
    fs.mkdirSync('./node_modules', { recursive: true });
  } catch (err) {
    log(`Failed to create node_modules directory: ${err.message}`, true);
  }
}

// Paths to check
const vitePaths = {
  binPath: path.resolve('./node_modules/.bin/vite'),
  mainModule: path.resolve('./node_modules/vite/package.json'),
  cliFile: path.resolve('./node_modules/vite/dist/node/cli.js'),
  chunksDir: path.resolve('./node_modules/vite/dist/node/chunks'),
};

// Check and fix vite installation if needed
function checkAndRepairVite() {
  log('Checking Vite installation...');
  
  // First check if Vite is properly installed
  const viteInstalled = fs.existsSync(vitePaths.mainModule);
  
  if (!viteInstalled) {
    log('Vite package.json not found. Reinstalling Vite...', true);
    try {
      // Install or reinstall Vite with a specific version
      execSync('npm install --no-save vite@4.4.9', { stdio: 'inherit' });
    } catch (err) {
      log(`Failed to install Vite: ${err.message}`, true);
    }
  }
  
  // Check chunks directory which was problematic in the error logs
  if (!fs.existsSync(vitePaths.chunksDir)) {
    log('Vite chunks directory not found. This could cause build failures.', true);
    try {
      fs.mkdirSync(vitePaths.chunksDir, { recursive: true });
      log('Created chunks directory');
    } catch (err) {
      log(`Failed to create chunks directory: ${err.message}`, true);
    }
  }
  
  // Make executable
  if (process.platform !== 'win32' && fs.existsSync(vitePaths.binPath)) {
    try {
      log('Setting executable permissions...');
      execSync(`chmod +x "${vitePaths.binPath}"`, { stdio: 'inherit' });
    } catch (e) {
      log(`Failed to set permissions: ${e.message}`, true);
    }
  }

  // Get file stats if possible
  if (fs.existsSync(vitePaths.binPath)) {
    try {
      const stats = fs.statSync(vitePaths.binPath);
      log(`Vite binary exists with mode: ${stats.mode.toString(8)}`);
      log(`Is executable? ${(stats.mode & 0o111) !== 0 ? 'Yes' : 'No'}`);
    } catch (err) {
      log(`Failed to get stats for Vite binary: ${err.message}`, true);
    }
  } else {
    log('Vite binary not found at expected path', true);
  }
  
  // Check alternative locations
  const alternativeLocations = [
    './node_modules/vite/bin/vite.js',
    './node_modules/vite/bin/vite.mjs',
  ];
  
  for (const loc of alternativeLocations) {
    const fullPath = path.resolve(loc);
    if (fs.existsSync(fullPath)) {
      log(`Found alternative vite at: ${fullPath}`);
      
      // Make executable if on non-Windows
      if (process.platform !== 'win32') {
        try {
          execSync(`chmod +x "${fullPath}"`, { stdio: 'inherit' });
          log(`Made alternative binary executable: ${fullPath}`);
        } catch (e) {
          log(`Failed to set permissions for alternative path: ${e.message}`, true);
        }
      }
  });
}
