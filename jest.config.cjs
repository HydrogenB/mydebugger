/**
 * © 2025 MyDebugger Contributors – MIT License
 */
module.exports = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/jest.comprehensive.setup.ts',
    '@testing-library/jest-dom'
  ],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts', 
    '<rootDir>/__tests__/**/*.test.tsx',
    '<rootDir>/**/*.test.ts',
    '<rootDir>/**/*.test.tsx'
  ],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { 
      useESM: true,
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },
  // Enhanced module mapping for world-class testing
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@model/(.*)$': '<rootDir>/model/$1',
    '^@viewmodel/(.*)$': '<rootDir>/viewmodel/$1',
    '^@view/(.*)$': '<rootDir>/view/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@design-system/(.*)$': '<rootDir>/src/design-system/$1',
    '^@tools/(.*)$': '<rootDir>/src/tools/$1',
    '^@api/(.*)$': '<rootDir>/api/$1',
    // CSS and asset mocking
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  // Comprehensive coverage configuration for world-class standards
  collectCoverageFrom: [
    'model/**/*.{ts,tsx}',
    'viewmodel/**/*.{ts,tsx}',
    'view/**/*.{tsx}',
    'src/**/*.{ts,tsx}',
    'api/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.test.{ts,tsx,js}',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/__tests__/**',
    '!**/src/types/**'
  ],
  coverageThreshold: {
    global: {
      branches: 75, // Start with achievable goals
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  coverageReporters: [
    'text',
    'lcov', 
    'html',
    'json-summary'
  ],
  // Performance optimizations
  testTimeout: 10000,
  maxWorkers: '50%',
  // Enhanced error reporting
  verbose: true,
  errorOnDeprecated: false, // Don't fail on React Router warnings for now
  // Mock configurations for external dependencies
  setupFiles: ['<rootDir>/src/setupTests.minimal.ts'],
  // Ignore patterns for faster testing
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/'
  ]
};
