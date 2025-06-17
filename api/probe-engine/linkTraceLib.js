// API for the Link Tracer tool - traces URL redirects and captures each hop
import fetch from 'node-fetch';
import { URL } from 'url';

export async function linkTraceHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { 
    url, 
    method = 'HEAD',
    userAgent = 'MyDebugger-LinkTracer/1.0', 
    maxHops = 20,
  } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Validate URL format
    let startUrl;
    try {
      startUrl = new URL(url);
    } catch (e) {
      // Try adding https:// if not present
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        startUrl = new URL(`https://${url}`);
      } else {
        throw new Error('Invalid URL format');
      }
    }
    
    // Perform the redirect tracing
    const traceResult = await traceRedirects(
      startUrl.href,
      method,
      userAgent,
      maxHops
    );
    
    // Cache results for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(traceResult);
    
  } catch (error) {
    return res.status(500).json({ 
      error: `Error tracing redirects: ${error.message}`, 
      url 
    });
  }
}

/**
 * Traces all redirects for a given URL until reaching the final destination or max hops
 * @param {string} url - The URL to trace
 * @param {string} requestMethod - HTTP method to use (HEAD or GET)
 * @param {string} userAgent - User-Agent string to send
 * @param {number} maxHops - Maximum number of redirects to follow
 * @returns {Object} Trace results including hops, total time, and warnings
 */
async function traceRedirects(url, requestMethod, userAgent, maxHops) {
  const hops = [];
  const warnings = [];
  let currentUrl = url;
  const startTime = process.hrtime();
  let totalTimeMs = 0;
  
  for (let n = 1; n <= maxHops; n++) {
    const hopStart = process.hrtime();
    let res;
    let status = 0;
    let latencyMs = 0;
    let nextUrl = null;
    let method = requestMethod;
    
    try {
      // Make the request with manual redirect handling
      res = await fetch(currentUrl, {
        method,
        redirect: 'manual', // Important: don't auto-follow redirects
        headers: {
          'user-agent': userAgent
        },
        timeout: 10000 // 10 second timeout
      });
      
      status = res.status;
      
      // Calculate latency for this hop
      const hopEnd = process.hrtime(hopStart);
      latencyMs = Math.round((hopEnd[0] * 1000) + (hopEnd[1] / 1000000));
      
      // If HEAD request fails, try again with GET
      if (method === 'HEAD' && (status === 405 || status === 404)) {
        method = 'GET';
        const retryStart = process.hrtime();
        res = await fetch(currentUrl, {
          method,
          redirect: 'manual',
          headers: {
            'user-agent': userAgent
          },
          timeout: 10000
        });
        
        status = res.status;
        
        const retryEnd = process.hrtime(retryStart);
        latencyMs = Math.round((retryEnd[0] * 1000) + (retryEnd[1] / 1000000));
      }
      
      // Add this hop to our trace results
      hops.push({
        n,
        url: currentUrl,
        status,
        method,
        latencyMs
      });
      
      // Check for security issues like protocol downgrade
      if (n > 1 && currentUrl.startsWith('https:') && 
         (res.headers.get('location') || '').startsWith('http:')) {
        warnings.push(`PROTOCOL_DOWNGRADE@hop${n}`);
      }
      
      // If we got a redirect response, prepare for next hop
      if ([301, 302, 303, 307, 308].includes(status)) {
        nextUrl = res.headers.get('location');
        
        if (!nextUrl) {
          break; // No location header, end of the trace
        }
        
        // Handle relative URLs
        try {
          nextUrl = new URL(nextUrl, currentUrl).href;
        } catch (e) {
          warnings.push(`INVALID_REDIRECT@hop${n}`);
          break;
        }
        
        currentUrl = nextUrl;
      } else {
        // Not a redirect status code, we've reached the end
        break;
      }
      
    } catch (error) {
      // Handle network errors
      hops.push({
        n,
        url: currentUrl,
        status: 0,
        method,
        error: error.message,
        latencyMs
      });
      
      warnings.push(`REQUEST_FAILED@hop${n}`);
      break;
    }
  }
  
  // Calculate total time
  const totalTime = process.hrtime(startTime);
  totalTimeMs = Math.round((totalTime[0] * 1000) + (totalTime[1] / 1000000));
  
  // Check if we hit the max hops limit
  if (hops.length >= maxHops) {
    warnings.push('MAX_REDIRECTS_REACHED');
  }
  
  return {
    hops,
    totalTimeMs,
    warnings
  };
}