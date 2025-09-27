// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true,
    lib: {
      entry: './src/vue-email-editor.ts',
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
