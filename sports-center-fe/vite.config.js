import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Same-origin /api in dev, proxied to the hosted backend (EC2) instead of a local dotnet run.
  server: { proxy: { '/api': { target: 'http://46.51.222.230' } } },
})
