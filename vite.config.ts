import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/spotify": {
        target: "https://api.spotify.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/spotify/, ""),
      },
      "/api/auth": {
        target: "https://accounts.spotify.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/auth/, ""),
      },
    },
  },
})
