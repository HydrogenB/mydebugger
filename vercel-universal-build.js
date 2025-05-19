#!/usr/bin/env node

/**
 * Enhanced build script for cross-platform and multi-environment compatibility
 * This script is designed to ensure the application builds successfully in various environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting universal build process...');
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Working directory: ${process.cwd()}`);

// Check if we're in a CI environment
const isCI = process.env.CI === 'true' || process.env.VERCEL === '1';
console.log(`Running in CI/CD environment: ${isCI ? 'Yes' : 'No'}`);

// Helper function to execute commands with proper error handling
function runCommand(cmd, options = {}) {
  console.log(`> Running command: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', ...options });
    return true;
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    console.error(err.message);
    return false;
  }
}

// Create all necessary directories
function setupDirectories() {
  const dirs = [
    './out', 
    './out/api', 
    './out/assets'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Copy assets to the output directory
function copyAssets() {
  if (fs.existsSync('./public')) {
    console.log('Copying public assets...');
    
    // Platform-specific copy command
    const copyCmd = process.platform === 'win32'
      ? `xcopy .\\public .\\out /E /I /Y`
      : `cp -r ./public/* ./out/`;
    
    runCommand(copyCmd);
  }
}

// Create compatibility files for various hosting platforms
function createCompatibilityFiles() {
  console.log('Creating compatibility files...');
  
  // Create Next.js specific files for Vercel
  const routesManifest = {
    "version": 3,
    "basePath": "",
    "pages404": true,
    "rewrites": [],
    "redirects": [],
    "headers": [],
    "dataRoutes": []
  };
  fs.writeFileSync('./out/routes-manifest.json', JSON.stringify(routesManifest, null, 2));
  
  // Create SPA redirect rules for static hosting
  fs.writeFileSync('./out/_redirects', '/* /index.html 200');
  
  // Create a minimal package.json for the output directory
  const pkgJson = {
    "name": "mydebugger-static",
    "version": "0.1.0",
    "private": true,
    "engines": {
      "node": "18.x"
    },
    "type": "commonjs"
  };
  fs.writeFileSync('./out/package.json', JSON.stringify(pkgJson, null, 2));
  
  // Create a basic API endpoint for health checks
  const apiHealthContent = `module.exports = function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    serverTime: new Date().toISOString()
  });
}`;
  fs.writeFileSync('./out/api/index.js', apiHealthContent);
}

// Main build process
async function build() {
  try {
    // Setup output directory structure
    // setupDirectories();
    
    // Install critical dependencies
    console.log('Installing critical dependencies...');
    runCommand('npm install --no-save tailwindcss@3.3.3 postcss@8.4.27 autoprefixer@10.4.14');
    runCommand('npm install --no-save --force react-router-dom@6.20.0');
    
    // Run the build process with proper environment settings
    console.log('Running optimized build...');
    const optimizedBuildCommand = 'npx cross-env NODE_ENV=production DISABLE_ESLINT_PLUGIN=true next build'; // Modified command for standard Vercel Next.js deployment
    if (runCommand(optimizedBuildCommand)) {
      console.log('Optimized build succeeded.');
    } else {
      console.error('Standard build failed.');
      process.exit(1);
    }
    
    // Copy assets and create compatibility files regardless of build method
    // copyAssets();
    // createCompatibilityFiles();
    
    console.log('✅ Build completed successfully');
    return 0;
  } catch (error) {
    console.error('❌ Build failed:', error);
    return 1;
  }
}

// Execute the build
build().then(exitCode => {
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
});
