import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
  // ✅ ADD THIS BASE CONFIGURATION
  base: './', // or '/'
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          form: ['formik', 'yup'],
          utils: ['date-fns', 'socket.io-client', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // ✅ ADD THESE FOR BETTER BUILD
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  // ✅ ADD PREVIEW CONFIG
  preview: {
    port: 5173,
  }
})