// Simple script to check Vite binary permissions
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const viteBinPath = path.resolve('./node_modules/.bin/vite');

console.log('Checking Vite binary permissions...');

if (fs.existsSync(viteBinPath)) {
  try {
    // Try to make it executable
    if (process.platform !== 'win32') {
      try {
        console.log('Setting executable permissions...');
        execSync(`chmod +x "${viteBinPath}"`, { stdio: 'inherit' });
      } catch (e) {
        console.error('Failed to set permissions:', e);
      }
    }

    // Get and log the file stats
    const stats = fs.statSync(viteBinPath);
    console.log('Vite binary exists with mode:', stats.mode.toString(8));
    console.log('Is executable?', (stats.mode & 0o111) !== 0 ? 'Yes' : 'No');
    
    // Check if we can execute it
    try {
      console.log('Testing vite binary execution...');
      execSync(`"${viteBinPath}" --version`, { stdio: 'inherit' });
      console.log('Vite binary can be executed directly');
    } catch (e) {
      console.error('Failed to execute Vite binary directly:', e.message);
    }
  } catch (error) {
    console.error('Error checking Vite binary:', error);
  }
} else {
  console.log('Vite binary not found at expected path:', viteBinPath);
  
  // Check for alternative locations
  const alternativeLocations = [
    './node_modules/vite/bin/vite.js',
    './node_modules/vite/bin/vite.mjs',
  ];
  
  alternativeLocations.forEach(loc => {
    const fullPath = path.resolve(loc);
    if (fs.existsSync(fullPath)) {
      console.log('Found alternative vite at:', fullPath);
    }
  });
}
