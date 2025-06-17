/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import fetch from 'node-fetch';

async function cookiesTool(req, res) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader
    .split(';')
    .map((c) => {
      const [name, ...rest] = c.trim().split('=');
      return { name, value: rest.join('=') };
    })
    .filter((c) => c.name);
  res.status(200).json({ cookies });
}

async function fetchProxyTool(req, res) {
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  const { tool } = req.query;
  if (tool === 'cookies') return cookiesTool(req, res);
  if (tool === 'proxy') return fetchProxyTool(req, res);
  return res.status(400).json({ error: 'Invalid tool parameter' });
}
