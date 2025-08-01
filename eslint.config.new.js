import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  js.configs.recommended,
  ...compat.config({
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],
    extends: [
      'airbnb',
      'airbnb/hooks',
      'airbnb-typescript',
      'plugin:jsx-a11y/recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'prettier',
    ],
    parserOptions: {
      project: ['./tsconfig.json'],
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    env: {
      browser: true,
      es2020: true,
      jest: true,
      node: true,
    },
    rules: {
      // Enhanced TypeScript rules for world-class standards
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error for gradual improvement
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // React best practices
      'react/function-component-definition': ['error', { namedComponents: 'function-declaration' }],
      'react/jsx-no-leaked-render': 'error',
      'react/no-object-type-as-default-prop': 'error',
      'react/require-default-props': 'off', // Modern React doesn't require this
      
      // Import organization
      'import/order': ['error', {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'pathGroups': [
          {
            'pattern': 'react**',
            'group': 'external',
            'position': 'before'
          },
          {
            'pattern': '@/**',
            'group': 'internal'
          }
        ],
        'pathGroupsExcludedImportTypes': ['react'],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }],
      
      // Code quality
      'complexity': ['warn', { max: 15 }], // Start with higher threshold
      'max-depth': ['warn', { max: 4 }],
      'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
      'max-params': ['warn', { max: 5 }],
      
      // Performance
      'no-nested-ternary': 'warn', // Existing code might have these
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      
      // Accessibility
      'jsx-a11y/no-autofocus': 'off', // Sometimes needed for UX
      'jsx-a11y/mouse-events-have-key-events': 'warn', // Warn instead of error
      'jsx-a11y/label-has-associated-control': 'warn',
      
      // Relaxed rules for existing codebase
      'no-console': 'warn',
      'no-param-reassign': 'warn',
      'no-bitwise': 'warn',
      'consistent-return': 'warn',
      'react/no-array-index-key': 'warn',
      'prefer-template': 'warn',
    },
  }),
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.cache/**',
      'public/**',
      'asset/**',
      '*.config.js',
      'vercel-build.js',
      'pnpm-lock.yaml',
      'package-lock.json',
    ],
  },
  // API files get more relaxed TypeScript rules
  {
    files: ['api/**/*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  // Test files get more relaxed rules
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines-per-function': 'off',
      'complexity': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
];
