/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * Jest (CJS) can't parse import.meta.url. Hook tests inject their own worker factory.
 */
export const createCompressWorker = (): Worker => {
  throw new Error('createCompressWorker is not available in tests; inject a fake worker.');
};
