import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Development only: preserve /api once and forward requests to the local ASP.NET backend.
  server: { proxy: { '/api': { target: 'https://localhost:7258', changeOrigin: true, secure: false } } },
})
