// vite.config.ts — LIB mode
import { defineConfig, createLogger, type LogOptions, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { viteMcpPlugin } from 'vite-plugin-mcp-client-tools'
import { readConsoleTool } from './src/mcp/tools/readConsole'
import { takeScreenshot } from './src/mcp/tools/takeScreenshot'

const logger = createLogger()
const warn = logger.warn.bind(logger)
logger.warn = (msg, o) => {
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  warn(msg, o)
}

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return defineConfig({
    plugins: [
      vue(),
      viteMcpPlugin({
        tools: [readConsoleTool, takeScreenshot],
      }),
    ],
    define: {
      'import.meta.env.VITE_API_BASE': JSON.stringify(env.VITE_API_BASE)
    },
    customLogger: logger,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'revrebel-fonts': path.resolve(__dirname, '../fonts')
      }
    },
    server: {
      port: 9022,
      host: true,
      allowedHosts: ['.rebel.camp', 'revrebel.io', 'localhost'],
      hmr: {
        protocol: 'wss',
        host: 'unlayer.rebel.camp'
      },
      headers: {
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'emailEditor',
        fileName: (format) => `emailEditor.${format}.js`,
        formats: ['es', 'cjs', 'umd'],
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: { vue: 'Vue' },
        },
      },
      sourcemap: true,
      target: 'es2020',
    },
  })
}