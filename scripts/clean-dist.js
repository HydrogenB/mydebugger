// Clean dist directory to ensure fresh builds
import fs from 'fs';
import path from 'path';

/**
 * Recursively removes a directory and its contents
 */
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call for directories
        removeDirectory(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

// Main execution
console.log('Cleaning dist directory...');
const distPath = path.resolve(process.cwd(), 'dist');

try {
  if (fs.existsSync(distPath)) {
    removeDirectory(distPath);
    console.log('Dist directory removed successfully');
  } else {
    console.log('Dist directory does not exist, nothing to clean');
  }
  
  // Create fresh dist directory
  fs.mkdirSync(distPath);
  console.log('Fresh dist directory created');
  
} catch (error) {
  console.error('Error cleaning dist directory:', error.message);
  process.exit(1);
}
