import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/reverse-geocode": {
        target: "https://proxy-gmys.onrender.com", // URL del backend
        changeOrigin: true,
        secure: false, // Evita problemas con HTTPS no confiable
      },
    },
  },
})
