import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js ships in its own lazy-loaded intro chunk (~150 KB gzipped).
    chunkSizeWarningLimit: 650,
  },
})
