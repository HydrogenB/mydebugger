import { execSync } from 'child_process';

console.log('Checking for TypeScript errors...');

try {
  // Run TypeScript compiler with list of files mode
  const result = execSync('npx tsc --noEmit --listFiles', { 
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log('✓ No TypeScript errors found.');
} catch (error) {
  console.error('TypeScript errors found:');
  console.error(error.stderr || error.stdout);
  
  // Try to extract the specific files with errors
  const errorOutput = error.stderr || error.stdout || '';
  const fileMatches = errorOutput.match(/([a-zA-Z]:\\[^:]+\.ts[x]?):\d+:\d+/g);
  
  if (fileMatches && fileMatches.length) {
    const uniqueFiles = [...new Set(fileMatches.map(match => match.split(':')[0]))];
    console.log('\nFiles with errors:');
    uniqueFiles.forEach(file => console.log(`- ${file}`));
  }
}

console.log('\nDone!');
