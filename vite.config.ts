// vite.config.ts
import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import path from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Tell the dev server to use the 'play' directory as the root
  root: 'play',
  build: {
    sourcemap: true,
    // The output directory is relative to the project root, not the 'play' directory
    // We use '../dist' to go up one level from 'play' and then into 'dist'
    outDir: '../dist',
    lib: {
      entry: path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/vue-email-editor.ts'),
      name: 'VueEmailEditor',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `vue-email-editor.${format}.js`,
    },
    rollupOptions: {
      // Don’t bundle these
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
      },
    },
    // keep CSS separate; helpful for libs
    cssCodeSplit: true,
    // safer defaults for libs
    minify: 'esbuild',
    target: 'es2019',
  },
})
