import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@services': '/src/services',
      '@types': '/src/types',
      '@utils': '/src/utils',
      '@assets': '/src/assets'
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'react-dnd', 'react-dnd-html5-backend'],
          canvas: ['konva', 'react-konva'],
          utils: ['uuid', 'date-fns', 'file-saver', 'jszip']
        }
      }
    }
  }
})