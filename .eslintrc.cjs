// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';
import vueEslintPlugin from 'eslint-plugin-vue';
import vueEslintParser from 'vue-eslint-parser';

const isProd = process.env.NODE_ENV === 'production';

export default [
  // Ignore files and directories
  {
    ignores: ['dist', 'node_modules', '.nuxt', '.output'],
  },

  // Base JS configuration
  js.configs.recommended,

  // Vue SFC files
  {
    files: ['**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: vueEslintParser,
      parserOptions: {
        parser: tsEslintParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      vue: vueEslintPlugin,
      '@typescript-eslint': tsEslintPlugin,
    },
    // Use the official Vue flat config presets
    ...vueEslintPlugin.configs['flat/recommended'],
    rules: {
      'no-console': isProd ? 'warn' : 'off',
      'no-debugger': isProd ? 'warn' : 'off',
    },
  },

  // TypeScript and JavaScript files
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
    },
    // Use the official TypeScript flat config presets
    ...tsEslintPlugin.configs.recommended,
    rules: {
      'no-console': isProd ? 'warn' : 'off',
      'no-debugger': isProd ? 'warn' : 'off',
    },
  },
];