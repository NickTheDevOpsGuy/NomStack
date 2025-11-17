// eslint.config.ts
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  // Ignore build + deps
  {
    ignores: ['dist', 'node_modules', 'coverage'],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript base rules (non type-aware: no parserOptions.project)
  ...tseslint.configs.recommended,

  // React / app-specific config
  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      // NOTE: no parserOptions.project here on purpose,
      // to avoid "file was not found in any of the provided project(s)" errors.
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
    },

    settings: {
      react: {
        version: 'detect',
      },
      // Optional: helps eslint-plugin-import resolve TS paths
      'import/resolver': {
        typescript: true,
      },
    },

    rules: {
      // --- React ---
      'react/react-in-jsx-scope': 'off', // React 17+ / Vite / TSX
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'warn',

      // --- Hooks ---
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // --- JSX a11y (you can tighten later if you want) ---
      'jsx-a11y/no-autofocus': 'off',

      // --- Imports ---
      'import/order': 'off',

      // --- TypeScript / general ---
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off', // let TS rule handle it

      // You can add more rules here as you go
    },
  },
];
