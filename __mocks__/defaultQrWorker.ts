/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Jest stub for defaultQrWorker. Real implementation uses `import.meta.url`
 * which the Jest CJS loader cannot parse. Tests always inject their own
 * workerFactory, so this stub just throws if invoked accidentally.
 */
export const createDefaultQrWorker = (): Worker => {
  throw new Error('createDefaultQrWorker must be stubbed in tests');
};
