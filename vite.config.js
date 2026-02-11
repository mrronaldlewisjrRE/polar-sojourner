import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
console.log("------------------- VITE CONFIG LOADED -------------------");

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  build: {
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/v2-[name]-[hash].js`,
        chunkFileNames: `assets/v2-[name]-[hash].js`,
        assetFileNames: `assets/v2-[name]-[hash].[ext]`
      }
    }
  }
})
