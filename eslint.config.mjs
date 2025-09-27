// eslint.config.js  (ESM since package.json has "type":"module")
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

const isProd = process.env.NODE_ENV === 'production'

// Vue 3 "essential" ruleset (like 'plugin:vue/vue3-essential')
const vue3Essential = vue.configs['vue3-essential']?.rules ?? {}

export default [
  // Ignore stuff
  { ignores: ['dist', 'node_modules', '.nuxt', '.output'] },

  // Base JS ('eslint:recommended')
  js.configs.recommended,

  // Vue SFCs
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,            // for <script lang="ts">
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: { vue, '@typescript-eslint': ts },
    rules: {
      ...vue3Essential,
      'no-console': isProd ? 'warn' : 'off',
      'no-debugger': isProd ? 'warn' : 'off',
    },
  },

  // TS/JS files
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': ts },
    // Equivalent to '@typescript-eslint/recommended'
    ...ts.configs.recommended,
    rules: {
      'no-console': isProd ? 'warn' : 'off',
      'no-debugger': isProd ? 'warn' : 'off',
    },
  },
]
