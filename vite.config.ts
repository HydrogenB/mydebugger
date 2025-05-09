import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
          
          // Split markdown-related dependencies
          marked: ['marked'],
          prismjs: ['prismjs'],
          dompurify: ['dompurify'],
          
          // Split UI libraries
          'code-editor': ['@uiw/react-textarea-code-editor'],
          
          // Split design system
          'design-system': [
            './src/design-system/index.ts',
            './src/design-system/components/inputs',
            './src/design-system/components/layout',
            './src/design-system/components/feedback',
          ],
          
          // JWT related code
          'jwt-core': [
            './src/tools/jwt/components/BenchResult.tsx',
            './src/tools/jwt/context/JwtContext.tsx',
            './src/tools/jwt/workers/cryptoWorker.ts'
          ],
          
          // For Sequence Diagram Tool
          'sequence-diagram-core': [
            './src/tools/sequence-diagram/utils/compiler.ts',
            './src/tools/sequence-diagram/utils/sequence-diagrams-stub.js'
          ]
        },
      },
    },
    // Ensure the correct MIME type headers are set
    assetsInlineLimit: 4096, // 4kb - files smaller than this will be inlined as base64
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