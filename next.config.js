/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure SWC (Speedy Web Compiler)
  compiler: {
    emotion: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
