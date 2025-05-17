// Simple build script for Vercel (ESM)
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('Starting Vercel build process...');
console.log(`Node version: ${process.version}`);

try {
  // Ensure the build directory exists
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist', { recursive: true });
  }
  
  // Run the build using npm run to avoid direct executable permissions issues
  console.log('Running build command...');
  execSync('npm run vite-build', { stdio: 'inherit' });
  
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
