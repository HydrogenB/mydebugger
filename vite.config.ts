import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Ensures all assets are loaded from the correct base path
  plugins: [react()],
  server: {
    port: 3000,
    // Add historyApiFallback for local development SPA routing
    historyApiFallback: true,
    // Ensure proper MIME types for JavaScript modules
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'
    }
  },
  build: {
    minify: 'esbuild', 
    sourcemap: true, // Enable sourcemaps to help debug issues
    outDir: 'dist',
    chunkSizeWarningLimit: 800, // Increased from default 500kb
    rollupOptions: {
      output: {
        // Ensure asset filenames include content hash to avoid caching issues
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          // More granular chunking strategy
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['react-helmet'],
          
          // Split by feature rather than technology
          jwt: ['./src/features/jwt'],
          urlEncoder: ['./src/features/url-encoder'],
          sequenceDiagram: ['./src/features/sequence-diagram'],
          
          // Shared modules
          designSystem: ['./src/shared/design-system']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@core': path.resolve(__dirname, './src/core'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@api': path.resolve(__dirname, './api'),
      '@config': path.resolve(__dirname, './config'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
})