import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy API calls to backend in local dev only
    proxy: command === 'serve' ? {
      '/upload':     'http://localhost:8000',
      '/analyze':    'http://localhost:8000',
      '/chart-data': 'http://localhost:8000',
    } : undefined,
  },
  build: {
    outDir: 'dist',
  },
}))
