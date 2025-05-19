// Simple static export build script for Vercel
import { execSync } from 'child_process';
import fs from 'fs';

console.log('Starting Vercel static export build process...');
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Working directory: ${process.cwd()}`);

try {
  // Clean dist directory
  console.log('Cleaning dist directory...');
  try {
    execSync('node scripts/clean-dist.js', { stdio: 'inherit' });
  } catch (e) {
    console.log('Clean script failed, creating dist directory manually');
    if (!fs.existsSync('./dist')) {
      fs.mkdirSync('./dist', { recursive: true });
    }
  }
  console.log('Installing exact dependency versions for stability...');
  // Make sure we have the exact versions that are known to work
  execSync('npm install --no-save vite@4.4.9 @vitejs/plugin-react@4.0.3', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
    console.log('Building static export...');

  // Try multiple build approaches to ensure one works
  const buildCommands = [
    'npx vite build --config config/vite/static-export.ts --outDir dist',
    'node ./node_modules/vite/bin/vite.js build --config config/vite/static-export.ts --outDir dist',
    'npm run static-export'
  ];

  let buildSuccess = false;

  for (const cmd of buildCommands) {
    if (buildSuccess) break;
    
    console.log(`Trying build command: ${cmd}`);
    try {
      execSync(cmd, {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      console.log(`Build successful using: ${cmd}`);
      buildSuccess = true;
    } catch (error) {
      console.error(`Build command failed: ${cmd}`);
      // Continue to next command
    }
  }

  if (!buildSuccess) {
    throw new Error('All build approaches failed');
  }  console.log('Creating Vercel routing config...');
  
  // Create _redirects file for single-page app routing (for Netlify compatibility)
  const redirectsContent = '/* /index.html 200';
  fs.writeFileSync('./dist/_redirects', redirectsContent);
  
  // Create a vercel.json file in the dist folder
  const vercelConfig = {
    "routes": [
      { "handle": "filesystem" },
      { "src": "/assets/(.*)", "dest": "/assets/$1" },
      { "src": "/(.*)", "dest": "/index.html" }
    ]
  };
  fs.writeFileSync('./dist/vercel.json', JSON.stringify(vercelConfig, null, 2));
  
  // Ensure we have an index.html in the root in case it's not generated properly
  if (fs.existsSync('./dist/index.html')) {
    console.log('Found index.html in dist directory');
  } else {
    console.log('Creating fallback index.html');
    // Create a simple fallback index.html that redirects to the actual app
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyDebugger</title>
  <script>
    // Find the main JS chunk and redirect to load it properly
    fetch('/assets/')
      .then(response => response.text())
      .then(html => {
        const mainJsMatch = html.match(/["']\/assets\/main-[^"']+\.js["']/);
        if (mainJsMatch) {
          const mainJs = mainJsMatch[0].replace(/["']/g, '');
          const script = document.createElement('script');
          script.src = mainJs;
          script.type = 'module';
          document.body.appendChild(script);
        } else {
          document.body.innerHTML = '<p>Loading application...</p>';
        }
      })
      .catch(() => {
        window.location.reload();
      });
  </script>
</head>
<body>
  <div id="root">Loading application...</div>
</body>
</html>`;
    fs.writeFileSync('./dist/index.html', fallbackHtml);
  }
  console.log('Static export build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
