/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure SWC (Speedy Web Compiler)
  compiler: {
    emotion: true,
  },
};

module.exports = nextConfig;
