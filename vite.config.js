import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   define: {
    global: 'window',
  },
  server: {
    host: true,
    allowedHosts: ['a28f-102-159-159-66.ngrok-free.app'],
  },
})
