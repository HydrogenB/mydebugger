/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import fetch from 'node-fetch';

const MAX_REDIRECTS = 20;

async function followRedirectChain(initialUrl, maxHops = MAX_REDIRECTS) {
  const hops = [];
  const visited = new Set();
  let url = initialUrl;
  for (let i = 0; i < maxHops; i += 1) {
    if (visited.has(url)) {
      hops.push({ url, error: 'Redirect loop detected' });
      break;
    }
    visited.add(url);
    try {
      const res = await fetch(url, { redirect: 'manual' });
      const hop = { url, status: res.status, headers: {} };
      res.headers.forEach((value, key) => {
        hop.headers[key] = value;
      });
      hops.push(hop);
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) break;
        const next = new URL(loc, url).toString();
        hop.mixedProtocol = new URL(next).protocol !== new URL(url).protocol;
        url = next;
      } else {
        break;
      }
    } catch (e) {
      hops.push({ url, error: e.message });
      break;
    }
  }
  if (hops.length >= maxHops) {
    hops.push({ url, error: 'Maximum redirects reached' });
  }
  return hops;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url, maxHops } = req.body || {};
  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  try {
    const hops = await followRedirectChain(url, Number(maxHops) || MAX_REDIRECTS);
    res.status(200).json({ hops });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
