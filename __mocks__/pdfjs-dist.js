/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * Jest auto-mock for the real `pdfjs-dist` package. Its published build is
 * ESM-only and isn't transformed under Jest's CJS test runtime, so any test
 * that merely imports a module which imports `pdfjs-dist` (without directly
 * exercising PDF rendering) needs this stub instead of the real package.
 */
module.exports = {
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({
    promise: Promise.reject(new Error('pdfjs-dist is mocked in tests')),
  }),
};
