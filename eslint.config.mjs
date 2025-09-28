// eslint.config.mjs — flat config (ESM)
import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import globals from "globals";

import vuePlugin from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import stylistic from "@stylistic/eslint-plugin";

import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

// paths/env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === "production";

export default [
  // 0) Ignores
  {
    ignores: [
      "dist/",
      "node_modules/",
      ".nuxt/",
      ".output/",
      ".husky/",
      ".git/",
      "babel.config.js",
      "embed.js",
    ],
  },

  // 1) Base globals
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // 2) Base JS (like eslint:recommended)
  js.configs.recommended,

  // 3) .vue SFCs — Vue parser + TS inside <script lang="ts">
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      vue: vuePlugin,
      "@typescript-eslint": tsPlugin,
      // The `prettierPlugin` is no longer needed here as the recommended preset handles it
    },
    rules: {
      "vue/no-mutating-props": "error",
      "vue/no-unused-vars": "warn",
      "no-console": isProd ? "warn" : "off",
      "no-debugger": isProd ? "warn" : "off",
    },
  },

  // 4) TS/JS files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      // Disable the base rule as it can report incorrect errors
      "no-unused-vars": "off",
      ...(tsPlugin.configs.recommendedTypeChecked?.rules ?? {}),
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": isProd ? "warn" : "off",
      "no-debugger": isProd ? "warn" : "off",
    },
  },

  // 5) JavaScript files — typed linting OFF (no parserOptions.project)
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // using the default parser (espree) avoids TS project checks
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": isProd ? "warn" : "off",
      "no-debugger": isProd ? "warn" : "off",
    },
  },

  // 6) Disable ALL @stylistic/* rules, last wins
  {
    files: ["**/*"],
    rules: Object.fromEntries(
      Object.keys(stylistic.rules).map((key) => [`@stylistic/${key}`, "off"]),
    ),
  },

  // 7) Prettier integration (must be last to override other formatting rules)
  // This automatically sets up eslint-plugin-prettier and eslint-config-prettier
  eslintPluginPrettierRecommended,
];
