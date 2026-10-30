import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Development only: preserve /api once; EC2 address is documented in the backend deploy/README.md.
  server: { proxy: { '/api': { target: 'http://46.51.222.230', changeOrigin: true } } },
})
