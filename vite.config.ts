import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'mui-core': ['@mui/material', '@mui/icons-material'],
          'mui-emotion': ['@emotion/react', '@emotion/styled'],
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom']
        }
      }
    }
  }
})
