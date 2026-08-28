/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Thin module that constructs the bundled QR decode worker. Isolated from
 * scannerController so tests can stub it (import.meta.url is only valid in
 * ESM contexts and breaks Jest's CJS loader).
 */
export const createDefaultQrWorker = (): Worker =>
  new Worker(new URL('./qr.worker.ts', import.meta.url), { type: 'module' });
