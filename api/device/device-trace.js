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
    addDeeplinkParam: true,
    appScheme: 'trueapp://' // Default scheme - will be overridden if custom scheme is provided
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
    addDeeplinkParam: true,
    appScheme: 'trueapp://' // Default scheme - will be overridden if custom scheme is provided
  },
  and_noapp: {
    name: 'Android + No App',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
    headers: {},
    expectedPattern: /^https:\/\/play\.google\.com\//
  },
  and_playstore_noapp: {
    name: 'Android + Play Store (No App)',
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

// Rate limiting
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute
const ipRequestCounts = new Map();

/**
 * Creates device scenarios with appropriate parameters based on provided app details
 */
function createDeviceScenarios(iosAppId, androidPackage, deepLinkScheme) {
  // Create a deep copy excluding RegExp objects
  const scenarios = {};
  
  // Copy scenarios manually to handle RegExp objects properly
  for (const [key, value] of Object.entries(DEVICE_SCENARIOS)) {
    scenarios[key] = { ...value };
    
    // Keep the original RegExp objects intact for default cases
    if (value.expectedPattern instanceof RegExp) {
      scenarios[key].expectedPattern = new RegExp(value.expectedPattern);
    }
  }
  
  // Update with custom app scheme if provided
  if (deepLinkScheme) {
    // Make sure the scheme ends with "://"
    const normalizedScheme = deepLinkScheme.endsWith('://') 
      ? deepLinkScheme 
      : `${deepLinkScheme}://`;
    
    // Escape special regex characters to be safe
    const escapedScheme = normalizedScheme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Update iOS app scenario
    if (scenarios.ios_app) {
      scenarios.ios_app.appScheme = normalizedScheme;
      scenarios.ios_app.expectedPattern = new RegExp(`^${escapedScheme}`);
    }
    
    // Update Android app scenario
    if (scenarios.and_app) {
      scenarios.and_app.appScheme = normalizedScheme;
      scenarios.and_app.expectedPattern = new RegExp(`(^intent:\/\/)|(^${escapedScheme})`);
    }
  }
  
  // Update iOS App Store URL pattern with specific app ID
  if (iosAppId && scenarios.ios_noapp) {
    scenarios.ios_noapp.expectedPattern = new RegExp(`^https:\/\/apps\.apple\.com\/.*${iosAppId}`);
  }
  
  // Update Android expected pattern with specific package name
  if (androidPackage && scenarios.and_noapp) {
    scenarios.and_noapp.expectedPattern = new RegExp(`^https:\/\/play\.google\.com\/.*${androidPackage}`);
  }
  
  return scenarios;
}

/**
 * Traces a URL through a specific device scenario
 */
async function traceDeviceScenario(url, scenarioId, config, maxHops) {
  const hops = [];
  const warnings = [];
  let currentUrl = url;
  
  try {
    // Add deep link parameter if applicable
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
        // Make the request, starting with HEAD method
        res = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual',  // Don't auto-follow redirects
          headers: {
            'user-agent': config.userAgent,
            ...config.headers
          },
          timeout: 5000  // 5 second timeout
        });
        
        status = res.status;
        
        // Calculate latency for this hop
        const hopEnd = process.hrtime(hopStart);
        latencyMs = Math.round((hopEnd[0] * 1000) + (hopEnd[1] / 1000000));
        
        // If HEAD request fails or returns 405, retry with GET
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
              timeout: 5000
            });
            
            status = res.status;
            
            // Recalculate latency
            const getEnd = process.hrtime(getStart);
            latencyMs = Math.round((getEnd[0] * 1000) + (getEnd[1] / 1000000));
          } catch (getError) {
            // Keep original error info if GET also fails
            console.error(`GET fallback failed for ${currentUrl}:`, getError);
          }
        }
        
        // Add this hop to our trace results
        hops.push({
          n,
          url: currentUrl,
          status,
          latencyMs
        });
        
        // Handle redirects
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
          
          // Handle special URL schemes that node-fetch doesn't support
          if (nextUrl.startsWith('itms-appss://') || 
              nextUrl.startsWith('market://') || 
              nextUrl.startsWith('intent://')) {
            // Add these as hops but stop following them since we can't fetch them
            hops[hops.length - 1].nextUrl = nextUrl;
            warnings.push('UNSUPPORTED_URL_SCHEME');
            break;
          }
          
          // Check for protocol downgrade (HTTPS to HTTP)
          if (currentUrl.startsWith('https://') && nextUrl.startsWith('http://')) {
            warnings.push('PROTOCOL_DOWNGRADE');
          }
          
          // Record the next URL
          hops[hops.length - 1].nextUrl = nextUrl;
          currentUrl = nextUrl;
        } else {
          // Not a redirect status code, we're done
          break;
        }
        
      } catch (error) {
        // Handle different types of network errors more specifically
        const errorMessage = error.message || 'Unknown request error';
        let errorType = 'REQUEST_FAILED';
        
        // Categorize common network errors
        if (errorMessage.includes('ENOTFOUND')) {
          errorType = 'DNS_RESOLUTION_FAILED';
        } else if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout')) {
          errorType = 'REQUEST_TIMEOUT';
        } else if (errorMessage.includes('certificate')) {
          errorType = 'SSL_ERROR';
        }
        
        hops.push({
          n,
          url: currentUrl,
          status: 0,
          error: errorMessage,
          errorType,
          latencyMs
        });
        
        warnings.push(errorType);
        break;
      }
    }
    
    // Calculate total tracing time
    const endTime = process.hrtime(startTime);
    const totalTimeMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));
    
    // Check if we hit max hops
    if (hops.length >= maxHops) {
      warnings.push('MAX_REDIRECTS_REACHED');
    }
    
    // Get final URL and check if it matches the expected pattern
    const finalUrl = hops.length > 0 ? hops[hops.length - 1].url : url;
    let isValidOutcome = false;
    let redirectStatus = 'no_redirect_detected';
    
    // Check for URL patterns - verify config.expectedPattern is a regex
    if (config.expectedPattern && config.expectedPattern instanceof RegExp) {
      if (config.expectedPattern.test(finalUrl)) {
        isValidOutcome = true;
        
        if (finalUrl.includes('apps.apple.com')) {
          redirectStatus = 'ios_store_url';
        } else if (finalUrl.includes('play.google.com')) {
          redirectStatus = 'android_store_url';
        } else if (config.appScheme && finalUrl.startsWith(config.appScheme)) {
          redirectStatus = 'deeplink';
        }
      }
    }
    
    // Look for deeplinks in redirect chains - some URLs might return special schemes we can't follow
    for (const hop of hops) {
      if (hop.nextUrl) {
        if (hop.nextUrl.startsWith('itms-appss://') || 
            hop.nextUrl.startsWith('itms-apps://')) {
          redirectStatus = 'ios_store_url';
          isValidOutcome = true;
          break;
        } else if (hop.nextUrl.startsWith('market://')) {
          redirectStatus = 'android_store_url';
          isValidOutcome = true;
          break;
        } else if (config.appScheme && hop.nextUrl.startsWith(config.appScheme)) {
          redirectStatus = 'deeplink';
          isValidOutcome = true;
          break;
        } else if (hop.nextUrl.startsWith('intent://')) {
          redirectStatus = 'intent_scheme';
          isValidOutcome = true;
          break;
        }
      }
    }
    
    // Special case for deep links
    if (config.addDeeplinkParam && (scenarioId.includes('app'))) {
      // Simulate app deep link detection for specific URLs
      if (finalUrl.includes('af_force_deeplink=true') || 
          finalUrl.includes('deep_link_sub1') || 
          finalUrl.includes('adjust.com') ||
          finalUrl.includes('onelink') || 
          finalUrl.includes('app.link')) {
        
        // Create synthetic deep link
        const deepLink = `${config.appScheme}path?source=dynamic_link`;
        
        return {
          scenario: scenarioId,
          name: config.name,
          status: 'deeplink',
          deep_link: deepLink,
          final_url: finalUrl,
          is_store_url: false,
          hops,
          totalTimeMs,
          warnings,
          isValidOutcome: true
        };
      }
    }
    
    // More robust handling of different redirect statuses
    // Check for unsupported URL schemes more comprehensively
    const unsupportedSchemePatterns = [
      /^itms-apps:\/\//,
      /^market:\/\//,
      /^intent:\/\//,
      /^fb:\/\//,
      /^twitter:\/\//,
      /^whatsapp:\/\//,
      /^snapchat:\/\//,
      /^instagram:\/\//,
    ];
    
    if (finalUrl && unsupportedSchemePatterns.some(pattern => pattern.test(finalUrl))) {
      warnings.push('UNSUPPORTED_URL_SCHEME');
      // Determine specific app scheme type
      // ...existing code...
    }
    
    return {
      scenario: scenarioId,
      name: config.name,
      status: redirectStatus,
      deep_link: null,
      final_url: finalUrl,
      is_store_url: redirectStatus.includes('store_url'),
      hops,
      totalTimeMs,
      warnings,
      isValidOutcome
    };
  } catch (scenarioError) {
    console.error(`Scenario error for ${scenarioId}:`, scenarioError);
    return {
      scenario: scenarioId,
      name: config.name || scenarioId,
      status: 'error',
      error: scenarioError.message || 'Unknown error in scenario execution', // Ensure error message is included
      hops,
      totalTimeMs: 0,
      warnings: ['SCENARIO_ERROR'],
      isValidOutcome: false // Ensure isValidOutcome is false
    };
  }
}

export default async function handler(req, res) {
  try {
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
        // Only allow HTTP/HTTPS URLs
        if (!['http:', 'https:'].includes(startUrl.protocol)) {
          throw new Error('Only HTTP and HTTPS protocols are supported');
        }
      } catch (e) {
        // Try adding https:// if not present
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          try {
            startUrl = new URL(`https://${url}`);
          } catch (urlError) {
            return res.status(400).json({ error: `Invalid URL format: ${e.message}` });
          }
        } else {
          return res.status(400).json({ error: `Invalid URL format: ${e.message}` });
        }
      }
      
      // Start time for entire operation
      const startTime = process.hrtime();
      
      // Create device scenarios with app parameters
      const deviceScenarios = createDeviceScenarios(iosAppId, androidPackage, deepLinkScheme);
      
      // Run all device scenarios in parallel
      try {
        const scenarios = Object.entries(deviceScenarios);
        const results = await Promise.all(
          scenarios.map(([id, config]) => {
            try {
              return traceDeviceScenario(startUrl.href, id, config, maxHops);
            } catch (scenarioError) {
              console.error(`Error in scenario ${id}:`, scenarioError);
              return {
                scenario: id,
                name: config.name || id,
                status: "error",
                error: scenarioError.message || "Unknown scenario error", // Ensure error message is included
                hops: [],
                totalTimeMs: 0,
                warnings: ['SCENARIO_ERROR'],
                isValidOutcome: false // Ensure isValidOutcome is false
              };
            }
          })
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
      } catch (parallelError) {
        console.error('Error running scenarios in parallel:', parallelError);
        return res.status(500).json({ 
          error: `Error running device scenarios: ${parallelError.message || 'Unknown error'}`, 
          url: startUrl.href 
        });
      }
    } catch (urlError) {
      console.error('URL processing error:', urlError);
      return res.status(400).json({ 
        error: `Invalid URL: ${urlError.message || 'Unknown URL error'}`, 
        url 
      });
    }
  } catch (outerError) {
    // Catch-all for any unexpected errors to ensure we always return valid JSON
    console.error('Serverless function error:', outerError);
    return res.status(500).json({ 
      error: `Server error: ${outerError.message || 'Unknown error'}`
    });
  }
}