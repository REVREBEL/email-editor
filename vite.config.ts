// vite.config.ts — LIB mode
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'vite-plugin-vue-mcp'
import path from 'node:path'

export default defineConfig({
  plugins: [vue(), VueMcp()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  server: { host: true }
})


