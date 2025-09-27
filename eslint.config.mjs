// eslint.config.mjs  (ESM)
import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

const isProd = process.env.NODE_ENV === 'production';

export default [
  // ignore patterns
  { ignores: ['dist', 'node_modules', '.nuxt', '.output', '**/*.d.ts', 'embed.js'] },

  // Base JS rules
  js.configs.recommended,

  // Optionally include Vue flat preset (pick one, or skip both and keep your hand-picked rules)
  // vue.configs['flat/essential'],
  // vue.configs['flat/recommended'],

  // Config files (.js, .mjs) — Node globals
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Vue SFCs
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        // Use TS parser for <script lang="ts">
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        unlayer: 'readonly',
      },
    },
    plugins: {
      vue,
      '@typescript-eslint': tsPlugin, // 🔧 correct binding (no tseslint)
    },
    rules: {
      // Approximate Vue "essential" (remove if you enable vue flat preset above)
      'vue/no-mutating-props': 'error',
      'vue/no-unused-vars': 'warn',
      'vue/no-dupe-keys': 'error',
      'vue/no-parsing-error': 'error',
      'vue/no-reserved-keys': 'error',
      'vue/no-setup-props-destructure': 'warn',
      'vue/no-side-effects-in-computed-properties': 'error',
      'vue/no-use-v-if-with-v-for': 'error',
      'vue/valid-template-root': 'error',
      // In the **Vue SFC** block (files: ['**/*.vue'])
      'no-unused-vars': 'off', // ⬅️ turn off base rule for .vue
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      // env-sensitive
      'no-console': isProd ? 'warn' : 'off',
      'no-debugger': isProd ? 'warn' : 'off',
    },
  },

  // TS/JS source files
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      // If you prefer not to parse JS with ts-parser, split into two blocks.
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        unlayer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin, // 🔧 correct binding
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': isProd ? 'warn' : 'off',
      'no-debugger': isProd ? 'warn' : 'off',
    },
  },
];
