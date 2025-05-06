// Dynamic-Link Behavior Probe API - simulates different device contexts for OneLink/AppFlyer URLs
import fetch from 'node-fetch';
import { URL } from 'url';

// Device simulation configurations
const DEVICE_SCENARIOS = {
  ios_app: {
    name: 'iOS + App Installed',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    headers: { 'X-AF-Force': 'deeplink' },
    expectedPattern: /^trueapp:\/\//,
    addDeeplinkParam: true
  },
  ios_noapp: {
    name: 'iOS + No App',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    headers: {},
    expectedPattern: /^https:\/\/apps\.apple\.com\//
  },
  and_app: {
    name: 'Android + App Installed',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
    headers: { 'X-AF-Force': 'deeplink' },
    expectedPattern: /(^intent:\/\/)|(^trueapp:\/\/)/,
    addDeeplinkParam: true
  },
  and_noapp: {
    name: 'Android + No App',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
    headers: {},
    expectedPattern: /^https:\/\/play\.google\.com\//
  },
  desktop: {
    name: 'Desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    headers: {},
    expectedPattern: /^https:\/\/(www\.)?true\.th\//
  }
};

// Rate limiting - Simple in-memory solution (would use KV store in production)
const RATE_LIMIT = 30; // 30 requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute window
const ipRequestCounts = new Map();

export default async function handler(req, res) {
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

  // Apply rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  
  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, { count: 0, resetAt: Date.now() + RATE_WINDOW });
  }
  
  let ipData = ipRequestCounts.get(ip);
  
  // Reset counter if window expired
  if (Date.now() > ipData.resetAt) {
    ipData = { count: 0, resetAt: Date.now() + RATE_WINDOW };
    ipRequestCounts.set(ip, ipData);
  }
  
  // Check rate limit
  if (ipData.count >= RATE_LIMIT) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded', 
      limit: RATE_LIMIT,
      windowMs: RATE_WINDOW,
      retryAfter: Math.ceil((ipData.resetAt - Date.now()) / 1000)
    });
  }
  
  // Increment counter
  ipData.count++;
  ipRequestCounts.set(ip, ipData);
  
  // Get request parameters
  const { 
    url, 
    maxHops = 20, 
    iosAppId = '', 
    androidPackage = '',
    deepLinkScheme = ''
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
    
    // Start time for entire operation
    const startTime = process.hrtime();
    
    // Create device scenarios with app parameters
    const deviceScenarios = createDeviceScenarios(iosAppId, androidPackage, deepLinkScheme);
    
    // Run all device scenarios in parallel
    const scenarios = Object.entries(deviceScenarios);
    const results = await Promise.all(
      scenarios.map(([id, scenario]) => 
        traceDeviceScenario(startUrl.href, id, scenario, maxHops)
      )
    );
    
    // Calculate overall processing time
    const endTime = process.hrtime(startTime);
    const overallTimeMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));
    
    // Format and return response
    const response = {
      url: startUrl.href,
      overallTimeMs,
      results
    };
    
    // Cache results for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Device trace error:', error);
    return res.status(500).json({ 
      error: `Error tracing dynamic link: ${error.message}`, 
      url 
    });
  }
}

/**
 * Trace a single device scenario
 * @param {string} url - The URL to trace
 * @param {string} scenarioId - Identifier for the scenario
 * @param {object} config - Configuration for the device scenario
 * @param {number} maxHops - Maximum number of redirects to follow
 * @returns {object} Scenario trace results
 */
async function traceDeviceScenario(url, scenarioId, config, maxHops) {
  const hops = [];
  const warnings = [];
  let currentUrl = url;
  
  // Add deep link parameter if specified
  if (config.addDeeplinkParam && !currentUrl.includes('af_force_deeplink=')) {
    const urlObj = new URL(currentUrl);
    urlObj.searchParams.set('af_force_deeplink', 'true');
    currentUrl = urlObj.toString();
  }
  
  const startTime = process.hrtime();
  
  // Follow redirects manually up to maxHops
  for (let n = 1; n <= maxHops; n++) {
    const hopStart = process.hrtime();
    let res;
    let status = 0;
    let latencyMs = 0;
    let nextUrl = null;
    
    try {
      // Make the request with manual redirect handling
      res = await fetch(currentUrl, {
        method: 'HEAD', // Start with HEAD for efficiency
        redirect: 'manual', // Don't auto-follow redirects
        headers: {
          'user-agent': config.userAgent,
          ...config.headers
        },
        timeout: 7000 // 7 second timeout per hop
      });
      
      status = res.status;
      
      // Calculate latency for this hop
      const hopEnd = process.hrtime(hopStart);
      latencyMs = Math.round((hopEnd[0] * 1000) + (hopEnd[1] / 1000000));
      
      // If HEAD request fails or returns 404/405, retry with GET
      if (status === 405 || status === 404 || status === 0) {
        try {
          const getStart = process.hrtime();
          res = await fetch(currentUrl, {
            method: 'GET',
            redirect: 'manual',
            headers: {
              'user-agent': config.userAgent,
              ...config.headers
            },
            timeout: 7000
          });
          
          status = res.status;
          
          // Recalculate latency for GET request
          const getEnd = process.hrtime(getStart);
          latencyMs = Math.round((getEnd[0] * 1000) + (getEnd[1] / 1000000));
        } catch (getError) {
          // Keep the original error info if GET also fails
          console.error(`GET fallback also failed for ${currentUrl}:`, getError);
        }
      }
      
      // Add this hop to our trace results
      hops.push({
        n,
        url: currentUrl,
        status,
        latencyMs
      });
      
      // If we got a redirect response, prepare for next hop
      if ([301, 302, 303, 307, 308].includes(status)) {
        nextUrl = res.headers.get('location');
        
        if (!nextUrl) {
          warnings.push('MISSING_LOCATION_HEADER');
          break;
        }
        
        // Handle relative URLs
        try {
          nextUrl = new URL(nextUrl, currentUrl).href;
        } catch (e) {
          warnings.push('INVALID_REDIRECT_URL');
          break;
        }
        
        currentUrl = nextUrl;
      } else {
        // Not a redirect status code, we've reached the end
        break;
      }
      
    } catch (error) {
      // Handle network errors
      console.error(`Error in hop ${n} for ${scenarioId}:`, error);
      
      hops.push({
        n,
        url: currentUrl,
        status: 0,
        error: error.message,
        latencyMs
      });
      
      warnings.push('REQUEST_FAILED');
      break;
    }
  }
  
  // Calculate total tracing time
  const endTime = process.hrtime(startTime);
  const totalTimeMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));
  
  // Check if we hit the max hops limit
  if (hops.length >= maxHops) {
    warnings.push('MAX_REDIRECTS_REACHED');
  }
  
  // Get final URL and validate against expected pattern
  const finalUrl = hops.length > 0 ? hops[hops.length - 1].url : url;
  const isValidOutcome = config.expectedPattern.test(finalUrl);
  
  if (!isValidOutcome) {
    warnings.push('UNEXPECTED_DESTINATION');
  }
  
  return {
    scenario: scenarioId,
    name: config.name,
    hops,
    totalTimeMs,
    finalUrl,
    warnings,
    isValidOutcome
  };
}

/**
 * Creates device scenarios with appropriate parameters based on provided app details
 */
function createDeviceScenarios(iosAppId, androidPackage, deepLinkScheme) {
  // Create a copy of the base scenarios
  const customScenarios = { ...DEVICE_SCENARIOS };
  
  // Use the provided app scheme if available
  const appScheme = deepLinkScheme || 'trueapp://';
  
  // Update iOS expected pattern if iOS App ID provided
  if (iosAppId) {
    customScenarios.ios_noapp.expectedPattern = new RegExp(`^https:\/\/apps\.apple\.com\/.*${iosAppId}`);
  }
  
  // Update Android expected pattern if Android package name provided
  if (androidPackage) {
    customScenarios.and_noapp.expectedPattern = new RegExp(`^https:\/\/play\.google\.com\/.*${androidPackage}`);
  }
  
  // Update deep link scheme for app installed scenarios
  customScenarios.ios_app.expectedPattern = new RegExp(`^${appScheme}`);
  customScenarios.and_app.expectedPattern = new RegExp(`(^intent:\/\/)|(^${appScheme})`);
  
  return customScenarios;
}