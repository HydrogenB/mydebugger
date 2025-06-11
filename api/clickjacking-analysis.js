// Comprehensive clickjacking analysis endpoint that combines header checks and rendering tests
import fetch from 'node-fetch';
import { URL } from 'url';

// Security headers relevant to clickjacking protection
const SECURITY_HEADERS = [
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only'
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const { url, ua, ref } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Validate the URL
    const targetUrl = new URL(url);
    
    // Try different request methods as some servers might block HEAD requests
    const methods = ['HEAD', 'GET'];
    let response = null;
    let fetchError = null;
    
    // Try each method until one works
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
        break; // Exit the loop if successful
      } catch (error) {
        fetchError = error;
        // Continue to the next method
      }
    }
    
    // If all methods failed
    if (!response) {
      return res.status(500).json({
        error: `Failed to fetch ${url}: ${fetchError?.message || 'Unknown error'}`,
        url: targetUrl.toString()
      });
    }
    
    // Extract all headers as an object
    const allHeaders = {};
    response.headers.forEach((value, name) => {
      allHeaders[name.toLowerCase()] = value;
    });
    
    // Analyze clickjacking protection headers
    const xFrameOptions = allHeaders['x-frame-options']?.toLowerCase();
    const csp = allHeaders['content-security-policy'];
    const cspReportOnly = allHeaders['content-security-policy-report-only'];
    
    // Check for frame-ancestors directive in CSP
    let frameAncestors = null;
    if (csp) {
      const match = csp.match(/frame-ancestors\s+([^;]+)/i);
      if (match) {
        frameAncestors = match[1].trim();
      }
    }
    
    let frameAncestorsReportOnly = null;
    if (cspReportOnly) {
      const match = cspReportOnly.match(/frame-ancestors\s+([^;]+)/i);
      if (match) {
        frameAncestorsReportOnly = match[1].trim();
      }
    }
    
    // Determine if the site is protected against clickjacking
    const hasXFrameOptions = Boolean(
      xFrameOptions && 
      (xFrameOptions.includes('deny') || xFrameOptions.includes('sameorigin'))
    );
    
    const hasCSPProtection = Boolean(
      frameAncestors && 
      (frameAncestors.includes("'none'") || 
      (frameAncestors.includes("'self'") && !frameAncestors.includes('*')))
    );
    
    const isReportOnlyMode = Boolean(
      frameAncestorsReportOnly && 
      !hasXFrameOptions && 
      !hasCSPProtection
    );
    
    // Final protection status 
    const isProtected = hasXFrameOptions || hasCSPProtection;
    
    // Build detailed recommendations
    let recommendations = [];
    
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
    
    // Prepare the comprehensive analysis
    const analysis = {
      url: targetUrl.toString(),
      status: response.status,
      statusText: response.statusText,
      headers: {
        'x-frame-options': allHeaders['x-frame-options'] || null,
        'content-security-policy': csp || null,
        'content-security-policy-report-only': cspReportOnly || null
      },
      clickjackingProtection: {
        protected: isProtected,
        hasXFrameOptions,
        hasCSPProtection,
        isReportOnlyMode,
        frameAncestorsValue: frameAncestors || null,
        frameAncestorsReportOnlyValue: frameAncestorsReportOnly || null
      },
      recommendations,
      timestamp: new Date().toISOString()
    };
    
    // Cache results for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(analysis);
    
  } catch (error) {
    return res.status(400).json({ 
      error: `Invalid URL or failed to analyze: ${error.message}`, 
      url 
    });
  }
}