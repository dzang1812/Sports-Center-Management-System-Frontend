import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Same-origin /api in dev: no CORS setup, and the API's dev HTTPS cert is not validated by the browser.
  server: { proxy: { '/api': { target: 'https://localhost:7258', secure: false } } },
})
