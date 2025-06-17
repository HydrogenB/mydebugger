/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, ua } = req.query;
  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  try {
    const resp = await fetch(url, { headers: ua ? { 'User-Agent': ua } : undefined });
    const html = await resp.text();
    res.status(200).json({ status: resp.status, html });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
