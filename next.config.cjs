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

  // Type checking settings
  typescript: {
    // Don't fail build if there are type errors in production
    ignoreBuildErrors: true,
  },
  
  // Module resolution
  webpack: (config, options) => {
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

  // Trailing slash for better URL handling
  trailingSlash: true,
  
  // Webpack configuration for custom file handling
  webpack: (config, { dev, isServer }) => {
    // Handle SVGs and other file types
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    return config;
  },
}

module.exports = nextConfig;
