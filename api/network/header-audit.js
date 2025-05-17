// Serverless function for validating security headers
import fetch from 'node-fetch';
import { URL } from 'url';

// List of security headers we want to check
const SECURITY_HEADERS = [
  'x-frame-options',
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'referrer-policy',
];

export default async function handler(req, res) {
  // Set CORS headers to allow requests from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Get the target URL from the request
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Validate and normalize the URL
    const targetUrl = new URL(url);
    
    // Make a request to the target URL with a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(targetUrl.toString(), {
        method: 'HEAD', // We only need headers
        headers: {
          'User-Agent': 'MyDebugger-HeaderChecker/1.0',
        },
        redirect: 'manual', // Don't follow redirects
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      // Extract headers we care about
      const headers = Object.fromEntries(
        SECURITY_HEADERS.map(header => [
          header, 
          response.headers.get(header) || null
        ])
      );
      
      // Specifically check X-Frame-Options and CSP for clickjacking protection
      const xFrameOptions = headers['x-frame-options']?.toLowerCase();
      const csp = headers['content-security-policy'];
      
      // Extract frame-ancestors from CSP if present
      let frameAncestors = null;
      if (csp) {
        const frameAncestorsMatch = csp.match(/frame-ancestors\s+([^;]+)/i);
        if (frameAncestorsMatch) {
          frameAncestors = frameAncestorsMatch[1].trim();
        }
      }
      
      // Determine if the site is protected against clickjacking
      const isProtected = Boolean(
        (xFrameOptions && (xFrameOptions.includes('deny') || xFrameOptions.includes('sameorigin'))) ||
        (frameAncestors && (frameAncestors.includes("'none'") || 
                          (frameAncestors.includes("'self'") && !frameAncestors.includes('*'))))
      );
      
      // Prepare the response
      const result = {
        url: targetUrl.toString(),
        status: response.status,
        statusText: response.statusText,
        headers: {
          'x-frame-options': headers['x-frame-options'],
          'content-security-policy': headers['content-security-policy'],
          'frame-ancestors': frameAncestors
        },
        clickjackingSafe: isProtected,
        message: isProtected 
          ? 'Site has clickjacking protection' 
          : 'Site may be vulnerable to clickjacking attacks'
      };
      
      // Cache results for 5 minutes
      res.setHeader('Cache-Control', 's-maxage=300');
      return res.status(200).json(result);
      
    } catch (fetchError) {
      clearTimeout(timeout);
      
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: 'Request timed out' });
      }
      
      return res.status(500).json({ 
        error: `Error fetching URL: ${fetchError.message}`,
        url
      });
    }
  } catch (error) {
    // Handle invalid URLs
    return res.status(400).json({ 
      error: `Invalid URL: ${error.message}`, 
      url 
    });
  }
}