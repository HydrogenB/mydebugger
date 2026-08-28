module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@design-system$': '<rootDir>/src/design-system/index.ts',
    '^@design-system/(.*)$': '<rootDir>/src/design-system/$1',
  },
  transformIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFiles: ['<rootDir>/jest.polyfills.js'],
};


