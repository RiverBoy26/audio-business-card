import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/audio-cards': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/public/audio-cards': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
