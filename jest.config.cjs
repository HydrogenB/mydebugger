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
    // Mirror the `@design-system` aliases from tsconfig.json and vite.config.ts,
    // so component tests can mount anything importing through them.
    '^@design-system$': '<rootDir>/src/design-system/index.ts',
    '^@design-system/(.*)$': '<rootDir>/src/design-system/$1',
  },
  transformIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFiles: ['<rootDir>/jest.polyfills.js'],
};


