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
  build: {
    rollupOptions: {
      onwarn(warning) {
        // Suppress unresolved import warnings for path aliases (handled by vite alias resolution)
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.source?.includes('@/')) {
          return;
        }
        // Log other warnings
        console.warn(warning.message || warning);
      },
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
  },
})