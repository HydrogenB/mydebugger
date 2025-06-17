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

async function corsPreflightTool(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  const { url, method, headers } = req.body || {};
  if (!url || !method) {
    res.status(400).json({ error: 'Missing url or method' });
    return;
  }
  const requestHeaders = {
    Origin: req.headers.origin || 'https://example.com',
    'Access-Control-Request-Method': method.toUpperCase(),
  };
  const headerNames = headers ? Object.keys(headers) : [];
  if (headerNames.length > 0) {
    requestHeaders['Access-Control-Request-Headers'] = headerNames.join(',');
  }
  try {
    const resp = await fetch(url, { method: 'OPTIONS', headers: requestHeaders });
    const corsHeaders = {
      'access-control-allow-origin': resp.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': resp.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': resp.headers.get('access-control-allow-headers'),
      'access-control-allow-credentials': resp.headers.get('access-control-allow-credentials'),
    };
    res.status(200).json({
      request: { url, method, headers: requestHeaders, actualHeaders: headers || {} },
      response: { status: resp.status, type: 'cors', headers: corsHeaders },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  const { tool } = req.query;
  if (tool === 'cookies') return cookiesTool(req, res);
  if (tool === 'proxy') return fetchProxyTool(req, res);
  if (tool === 'cors-preflight') return corsPreflightTool(req, res);
  return res.status(400).json({ error: 'Invalid tool parameter' });
}
