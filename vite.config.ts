import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Ensures all assets are loaded from the correct base path
  plugins: [react()],
  server: {
    port: 3000,
    // Add historyApiFallback for local development SPA routing
    historyApiFallback: true
  },
  build: {
    minify: 'esbuild', 
    sourcemap: true, // Enable sourcemaps to help debug issues
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Ensure asset filenames include content hash to avoid caching issues
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['react-helmet'],
        },
      },
    },
  },
  // Add polyfills for Node.js built-ins
  define: {
    'process.env': {},
    global: 'window',
  },
  resolve: {
    alias: {
      // Add any specific polyfills needed for your project
      // Example: path: require.resolve('path-browserify')
    },
  },
})