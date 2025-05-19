export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'production',
  });
}
