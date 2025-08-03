/**
 * © 2025 MyDebugger Contributors – MIT License
 */
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  transform: {
    '^.+\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setupTests.ts'],
};
