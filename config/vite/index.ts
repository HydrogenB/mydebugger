import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',   
  plugins: [react({
    // Add this option to properly handle inline CSS
    include: ["**/*.tsx", "**/*.jsx", "**/*.html"],
  })],
  server: {
    port: 3000,
  },
  build: {
    minify: 'esbuild', 
    sourcemap: true,
    outDir: 'dist',
    chunkSizeWarningLimit: 1000, // Increased limit to reduce warnings
    rollupOptions: {
      input: {
        main: resolve(__dirname, '../../index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          // Split vendor code
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-helmet'],
          // Split tools by category for better loading performance
          'jwt': ['../../src/tools/jwt/index.ts'],
          'qrcode': ['../../src/tools/qrcode/index.ts'],
          'base64-image': ['../../src/tools/base64-image/index.ts'],
        }
      }
    }
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, '../../src/app'),
      '@tools': path.resolve(__dirname, '../../src/tools'),
      '@design-system': path.resolve(__dirname, '../../src/design-system'),
      '@layout': path.resolve(__dirname, '../../src/layout'),
      '@pages': path.resolve(__dirname, '../../src/pages'),
      '@components': path.resolve(__dirname, '../../src/components'),
      '@services': path.resolve(__dirname, '../../src/services'),
      '@types': path.resolve(__dirname, '../../src/types'),
      '@shared': path.resolve(__dirname, '../../src/shared'),
      '@features': path.resolve(__dirname, '../../src/features'),
      '@api': path.resolve(__dirname, '../../api')
    }
  },
  optimizeDeps: {
    exclude: ['@prisma/client']
  }
})
