import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    // Production builds strip debug logging (Arsen 2026-08-23: "how get rid
    // of these console logs from frontend?") — console.warn/error survive so
    // real problems still surface in user consoles.
    esbuild: mode === 'production'
      ? { pure: ['console.log', 'console.info', 'console.debug'] }
      : undefined,
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'http://192.168.1.5:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    }
  }
})