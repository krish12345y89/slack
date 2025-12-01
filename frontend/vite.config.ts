import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Add this for proper routing
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Set base if needed
  base: '/',
})