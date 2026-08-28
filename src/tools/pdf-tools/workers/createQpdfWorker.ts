/**
 * © 2026 MyDebugger Contributors – MIT License
 */
export const createQpdfWorker = (): Worker =>
  new Worker(new URL('./qpdfWorker.ts', import.meta.url), { type: 'module' });
