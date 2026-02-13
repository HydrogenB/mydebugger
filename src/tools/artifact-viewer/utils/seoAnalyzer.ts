
export const analyzeCode = (code: string) => {
  // 1. Find Imports to create Tags
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const dependencies = new Set<string>();
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const lib = match[1].split('/')[0]; // Get main lib name (e.g., 'framer-motion' from 'framer-motion/dist/...')
    if (!lib.startsWith('.')) dependencies.add(lib);
  }

  // 2. Calculate Stats
  const lines = code.split('\n').length;
  // Simple byte count for UTF-8 approximation
  const bytes = new Blob([code]).size;
  const sizeKB = (bytes / 1024).toFixed(2);

  // 3. Guess Component Name (find export default function ...)
  const nameMatch = code.match(/export\s+default\s+function\s+(\w+)/);
  const title = nameMatch ? nameMatch[1] : 'Untitled Artifact';

  return {
    title,
    dependencies: Array.from(dependencies),
    lines,
    sizeKB,
    snippet: code.substring(0, 150).replace(/\n/g, ' ') + '...' // For Meta description
  };
};
