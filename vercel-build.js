// Simple build script for Vercel (ESM) - Next.js optimized
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('Starting Next.js build process for Vercel...');
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Working directory: ${process.cwd()}`);

// Check the environment variables to detect if we're in Vercel
const isVercelEnv = process.env.VERCEL === '1' || process.env.NOW_BUILDER;
console.log(`Running in Vercel environment: ${isVercelEnv ? 'Yes' : 'No'}`);

try {
  // Create .next directory if it doesn't exist (not usually needed)
  if (!fs.existsSync('./.next')) {
    fs.mkdirSync('./.next', { recursive: true });
  }
  
  // Run permission check script if it exists
  if (fs.existsSync('./scripts/check-vite-permissions.js')) {
    console.log('Checking Vite permissions...');
    try {
      execSync('node ./scripts/check-vite-permissions.js', { stdio: 'inherit' });
    } catch (e) {
      console.log('Permission check script failed, continuing anyway');
    }
  }
  
  // Different approaches to run vite build to handle potential permission issues
  console.log('Running build command...');
  
  const buildApproaches = [
    // Approach 1: Direct node execution of vite.js
    {
      cmd: 'node ./node_modules/vite/bin/vite.js build',
      desc: 'Node direct execution of vite.js'
    },
    // Approach 2: Using npx in a way that works in Vercel
    {
      cmd: 'npx --no -- vite build',
      desc: 'NPX execution'
    },
    // Approach 3: Installing vite globally first
    {
      cmd: 'npm install -g vite && vite build',
      desc: 'Global vite installation'
    },
    // Approach 4: Using package.json script
    {
      cmd: 'npm run vite-build',
      desc: 'npm script execution'
    }
  ];
  
  let buildSuccess = false;
  
  // Try each approach until one succeeds
  for (const approach of buildApproaches) {
    if (buildSuccess) break;
    
    console.log(`\nTrying build approach: ${approach.desc}`);
    try {
      execSync(approach.cmd, { stdio: 'inherit' });
      console.log(`Build successful using: ${approach.desc}`);
      buildSuccess = true;
    } catch (e) {
      console.log(`Approach failed: ${approach.desc}`);
      console.error(e.message);
    }
  }
  
  if (!buildSuccess) {
    throw new Error('All build approaches failed');
  }
  
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
