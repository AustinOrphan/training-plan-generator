import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Prevent duplicate keys in object literals - this is the main rule we need
      'no-dupe-keys': 'error',
      
      // Basic rules that work well with TypeScript
      'no-unused-vars': 'off', // Use TypeScript version instead
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.config.js',
      'worktrees/',
      'src/__tests__/', // Skip test files for now since they're complex
    ],
  },
];