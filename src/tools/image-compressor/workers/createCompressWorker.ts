/**
 * © 2026 MyDebugger Contributors – MIT License
 */
export const createCompressWorker = (): Worker =>
  new Worker(new URL('./compress.worker.ts', import.meta.url), { type: 'module' });
