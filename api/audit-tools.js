/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import fetch from 'node-fetch';
import { URL } from 'url';

const HEADER_SECURITY_HEADERS = [
  'x-frame-options',
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'referrer-policy',
];

async function headerAudit(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  try {
    const targetUrl = new URL(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(targetUrl.toString(), {
        method: 'HEAD',
        headers: { 'User-Agent': 'MyDebugger-HeaderChecker/1.0' },
        redirect: 'manual',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const headers = Object.fromEntries(
        HEADER_SECURITY_HEADERS.map((h) => [h, response.headers.get(h) || null]),
      );
      const xFrameOptions = headers['x-frame-options']?.toLowerCase();
      const csp = headers['content-security-policy'];
      let frameAncestors = null;
      if (csp) {
        const match = csp.match(/frame-ancestors\s+([^;]+)/i);
        if (match) frameAncestors = match[1].trim();
      }
      const isProtected = Boolean(
        (xFrameOptions && (xFrameOptions.includes('deny') || xFrameOptions.includes('sameorigin')))
        || (frameAncestors && (frameAncestors.includes("'none'") || (frameAncestors.includes("'self'") && !frameAncestors.includes('*')))),
      );
      const result = {
        url: targetUrl.toString(),
        status: response.status,
        statusText: response.statusText,
        headers: {
          'x-frame-options': headers['x-frame-options'],
          'content-security-policy': headers['content-security-policy'],
          'frame-ancestors': frameAncestors,
        },
        clickjackingSafe: isProtected,
        message: isProtected
          ? 'Site has clickjacking protection'
          : 'Site may be vulnerable to clickjacking attacks',
      };
      res.setHeader('Cache-Control', 's-maxage=300');
      return res.status(200).json(result);
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: 'Request timed out' });
      }
      return res.status(500).json({ error: `Error fetching URL: ${fetchError.message}`, url });
    }
  } catch (error) {
    return res.status(400).json({ error: `Invalid URL: ${error.message}`, url });
  }
}

async function clickjackingAnalysis(req, res) {
  const { url, ua, ref } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  try {
    const targetUrl = new URL(url);
    const methods = ['HEAD', 'GET'];
    let response = null;
    let fetchError = null;
    for (const method of methods) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        response = await fetch(targetUrl.toString(), {
          method,
          headers: {
            'User-Agent': ua || 'MyDebugger-ClickjackingValidator/1.0',
            ...(ref ? { Referer: ref } : {}),
          },
          redirect: 'manual',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        break;
      } catch (error) {
        fetchError = error;
      }
    }
    if (!response) {
      return res.status(500).json({
        error: `Failed to fetch ${url}: ${fetchError?.message || 'Unknown error'}`,
        url: targetUrl.toString(),
      });
    }
    const allHeaders = {};
    response.headers.forEach((value, name) => { allHeaders[name.toLowerCase()] = value; });
    const xFrameOptions = allHeaders['x-frame-options']?.toLowerCase();
    const csp = allHeaders['content-security-policy'];
    const cspReportOnly = allHeaders['content-security-policy-report-only'];
    let frameAncestors = null;
    if (csp) {
      const match = csp.match(/frame-ancestors\s+([^;]+)/i);
      if (match) frameAncestors = match[1].trim();
    }
    let frameAncestorsReportOnly = null;
    if (cspReportOnly) {
      const match = cspReportOnly.match(/frame-ancestors\s+([^;]+)/i);
      if (match) frameAncestorsReportOnly = match[1].trim();
    }
    const hasXFrameOptions = Boolean(
      xFrameOptions && (xFrameOptions.includes('deny') || xFrameOptions.includes('sameorigin')),
    );
    const hasCSPProtection = Boolean(
      frameAncestors && (frameAncestors.includes("'none'") || (frameAncestors.includes("'self'") && !frameAncestors.includes('*'))),
    );
    const isReportOnlyMode = Boolean(
      frameAncestorsReportOnly && !hasXFrameOptions && !hasCSPProtection,
    );
    const isProtected = hasXFrameOptions || hasCSPProtection;
    const recommendations = [];
    if (!isProtected) {
      if (!xFrameOptions) {
        recommendations.push('Add X-Frame-Options header with value "DENY" or "SAMEORIGIN"');
      }
      if (!frameAncestors) {
        recommendations.push('Add Content-Security-Policy header with frame-ancestors directive set to "\'none\'" or "\'self\'"');
      } else if (frameAncestors.includes('*')) {
        recommendations.push('Remove wildcard (*) from CSP frame-ancestors directive to prevent framing on any domain');
      }
      if (isReportOnlyMode) {
        recommendations.push('Your CSP frame-ancestors directive is in "report-only" mode, which does not provide actual protection');
      }
    }
    const analysis = {
      url: targetUrl.toString(),
      status: response.status,
      statusText: response.statusText,
      headers: {
        'x-frame-options': allHeaders['x-frame-options'] || null,
        'content-security-policy': csp || null,
        'content-security-policy-report-only': cspReportOnly || null,
      },
      clickjackingProtection: {
        protected: isProtected,
        hasXFrameOptions,
        hasCSPProtection,
        isReportOnlyMode,
        frameAncestorsValue: frameAncestors || null,
        frameAncestorsReportOnlyValue: frameAncestorsReportOnly || null,
      },
      recommendations,
      timestamp: new Date().toISOString(),
    };
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(analysis);
  } catch (error) {
    return res.status(400).json({ error: `Invalid URL or failed to analyze: ${error.message}`, url });
  }
}

async function iframeTest(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  try {
    const targetUrl = new URL(url);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>IFrame Test</title>
          <script>
            function handleLoad() { window.parent.postMessage({ success: true }, '*'); }
            function handleError() { window.parent.postMessage({ error: true }, '*'); }
          </script>
        </head>
        <body>
          <iframe src="${targetUrl.toString()}" width="100%" height="300" onload="handleLoad()" onerror="handleError()"></iframe>
        </body>
      </html>`;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    return res.status(400).json({ error: `Invalid URL: ${error.message}`, url });
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
  const { type } = req.query;
  if (type === 'header') return headerAudit(req, res);
  if (type === 'clickjacking') return clickjackingAnalysis(req, res);
  if (type === 'iframe') return iframeTest(req, res);
  return res.status(400).json({ error: 'Invalid type parameter' });
}
