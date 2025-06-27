// Simple build script for Vercel (ESM)
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting Vercel build process...');
console.log(`Node version: ${process.version}`);

try {
  // Ensure the build directory exists
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist', { recursive: true });
  }
  
  // Run the build
  console.log('Running build command...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Copy static pages directory for API simulator
  const srcPages = path.join('.', 'pages');
  const destPages = path.join('.', 'dist', 'pages');
  if (fs.existsSync(srcPages)) {
    fs.cpSync(srcPages, destPages, { recursive: true });
    console.log('Copied pages directory to dist');
  }

  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
