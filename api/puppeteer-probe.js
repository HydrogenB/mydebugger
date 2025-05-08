// Puppeteer-based deep link probe API endpoint
// Provides enhanced detection of client-side JavaScript redirections

const { URL } = require('url');
const PQueue = require('p-queue');
const deviceProfiles = require('./probe-engine/deviceProfiles');
const { runMultipleScenarios } = require('./probe-engine/runScenario');

// Queue for managing concurrent Puppeteer instances
const queue = new PQueue({
  concurrency: 2, // Max 2 concurrent Puppeteer instances to avoid resource exhaustion
  timeout: 120000  // 2 minute timeout for the entire operation
});

// Rate limiting - Simple in-memory solution
const RATE_LIMIT = 10; // 10 requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute window
const ipRequestCounts = new Map();

module.exports = async function handler(req, res) {
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
    emulate = Object.keys(deviceProfiles), // By default, probe all scenarios
    iosAppId = '',
    androidPackage = '',
    deepLinkScheme = ''
  } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  // Validate URL format and normalize
  let startUrl;
  try {
    startUrl = new URL(url);
    // Only allow HTTP(S) URLs
    if (!['http:', 'https:'].includes(startUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are supported');
    }
  } catch (e) {
    // Try adding https:// if not present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      try {
        startUrl = new URL(`https://${url}`);
      } catch (error) {
        return res.status(400).json({ error: `Invalid URL format: ${e.message}` });
      }
    } else {
      return res.status(400).json({ error: `Invalid URL format: ${e.message}` });
    }
  }
  
  // Validate that emulate is an array
  if (!Array.isArray(emulate)) {
    return res.status(400).json({ 
      error: 'The "emulate" parameter must be an array of scenario IDs' 
    });
  }
  
  // Filter to only valid scenario IDs
  const validScenarios = emulate.filter(id => deviceProfiles[id]);
  if (validScenarios.length === 0) {
    return res.status(400).json({ 
      error: 'No valid scenarios specified',
      availableScenarios: Object.keys(deviceProfiles)
    });
  }
  
  // Start time for entire operation
  const startTime = process.hrtime();
  
  try {
    // Set up options for probing
    const options = {
      appScheme: deepLinkScheme || 'trueapp://' // Default scheme if not provided
    };
    
    // Custom configuration for platform-specific scenarios
    if (validScenarios.includes('ios_noapp') && iosAppId) {
      deviceProfiles.ios_noapp.expectedPattern = new RegExp(`^https:\/\/apps\.apple\.com\/.*${iosAppId}`);
    }
    
    if (validScenarios.includes('android_noapp') && androidPackage) {
      deviceProfiles.android_noapp.expectedPattern = new RegExp(`^https:\/\/play\.google\.com\/.*${androidPackage}`);
    }
    
    // Use our runScenario module within the queue for managing concurrency
    const probeResults = await queue.add(() => 
      runMultipleScenarios(startUrl.href, validScenarios, options)
    );
    
    // Calculate overall processing time
    const endTime = process.hrtime(startTime);
    const overallTimeMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));
    
    // Format the response
    const response = {
      url: startUrl.href,
      overallTimeMs,
      results: probeResults
    };
    
    // Cache results for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Puppeteer probe error:', error);
    return res.status(500).json({ 
      error: `Error probing URL: ${error.message}`, 
      url: startUrl.href 
    });
  }
}