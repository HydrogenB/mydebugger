
// This file ensures the API routes are properly detected by Vercel
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    serverTime: new Date().toISOString(),
  });
}
