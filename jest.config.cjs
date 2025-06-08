/**
 * © 2025 MyDebugger Contributors – MIT License
 */
module.exports = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/types/jest-dom.d.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts', '<rootDir>/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@model/(.*)$': '<rootDir>/model/$1',
    '^@viewmodel/(.*)$': '<rootDir>/viewmodel/$1',
    '^@view/(.*)$': '<rootDir>/view/$1'
  },
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { useESM: true }]
  }
};
