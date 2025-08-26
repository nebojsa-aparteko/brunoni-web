// ESLint v9 flat config for React + TypeScript (Vite)
// CommonJS format to avoid Node ESM warning without setting "type": "module".

const js = require('@eslint/js');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  // Ignored paths (replaces .eslintignore)
  {
    ignores: [
      'node_modules',
      'build',
      'dist',
      'coverage',
      'public',
      'public.*',
      '.yarn',
      '.idea',
      '.DS_Store',
    ],
  },

  // Base JS recommended
  js.configs.recommended,

  // Global rule adjustments
  {
    rules: {
      // Disable core rule everywhere; TS version is used below
      'no-unused-vars': 'off',
      // TS handles undefined names; this rule misfires on types and DOM globals
      'no-undef': 'off',
      // Downgrade to warnings for gradual adoption
      'no-unsafe-optional-chaining': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },

  // Project files: TS/JS + React
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        $crisp: 'readonly',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
    },
    rules: {
      // Disable core rule in favor of TS-aware version to prevent crashes
      'no-unused-vars': 'off',

      // React 17+/18
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',

      // Hooks best practices
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // TypeScript ergonomics
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // A11y
      'jsx-a11y/no-autofocus': 'off',

      // Imports
      'import/no-unresolved': 'off', // handled by TS, avoids alias false-positives
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // General hygiene
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
    },
  },
];
