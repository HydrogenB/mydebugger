/**
 * Next.js configuration
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable server-side features for static export
  images: {
    unoptimized: true,
  },
  
  // Base path when deployed
  basePath: '',  
  
  // Type checking settings - Don't fail build if there are issues
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint settings - Don't fail build for ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Suppress build errors for production deployment
  swcMinify: true, 
  productionBrowserSourceMaps: false,
  
  // Skip static generation and use dynamic mode instead
  staticPageGenerationTimeout: 1000,
  
  // Configure export options
  experimental: {
    outputFileTracingRoot: "c:\\Jirad-python\\mydebugger",
  },
  
  // Handle source maps for production
  productionBrowserSourceMaps: false,
  
  // Enable React strict mode for better practice
  reactStrictMode: true,
  
  // Trailing slash for better URL handling
  trailingSlash: true,
  
  // Webpack configuration for custom file handling
  webpack: (config, { dev, isServer }) => {
    // Handle SVGs and other file types
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    // Handle module not found errors
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      os: false,
      crypto: false,
    };
    
    return config;
  },
}

module.exports = nextConfig;
