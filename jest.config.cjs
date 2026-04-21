module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    // Jest (CJS) cannot parse `import.meta.url` used by the bundled worker
    // factory. Stub it out — controller tests inject their own workerFactory.
    '(.*/)?defaultQrWorker$': '<rootDir>/__mocks__/defaultQrWorker.ts',
  },
  transformIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFiles: ['<rootDir>/jest.polyfills.js'],
};


