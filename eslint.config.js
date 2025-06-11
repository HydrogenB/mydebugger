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
      'prettier',
    ],
    parserOptions: {
      project: ['./tsconfig.json'],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    env: {
      browser: true,
      es2020: true,
      jest: true,
    },
  }),
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'api/**',
      'asset/**',
      'public/**',
      'pages/**',
      'scripts/**',
      'src/**',
      'backup/**',
      'types/**',
      '__tests__/**',
      'postcss.config.js',
      'tailwind.config.js',
      'vite.config.ts',
      'vercel-build.js',
      'vercel.json',
      'pnpm-lock.yaml',
      'package-lock.json',
      'coverage/**',
      'index.html',
      'eslint.config.js',
    ],
  },
];
