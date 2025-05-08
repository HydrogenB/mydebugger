// Deep link detection and capture module for Puppeteer
// Monitors and captures client-side redirections, including JavaScript redirects and meta refreshes

const puppeteer = require('puppeteer');
const { URL } = require('url');

/**
 * Extract browser fallback URL from an intent:// URI
 * @param {string} intentUrl - The intent:// URL to parse
 * @returns {string|null} Extracted fallback URL or null if not found
 */
function extractIntentFallbackUrl(intentUrl) {
  try {
    const fallbackMatch = intentUrl.match(/browser_fallback_url=([^#&;]+)/i);
    if (fallbackMatch && fallbackMatch[1]) {
      return decodeURIComponent(fallbackMatch[1]);
    }
    return null;
  } catch (error) {
    console.error('Error extracting fallback URL:', error);
    return null;
  }
}

/**
 * Probe a URL using Puppeteer with a specific device profile
 * @param {string} url - The URL to probe
 * @param {string} scenarioId - ID of the scenario being tested
 * @param {Object} profile - Device profile configuration
 * @param {Object} options - Additional options (appScheme, etc.)
 * @returns {Object} Probe results including found redirects and deep links
 */
async function probeUrl(url, scenarioId, profile, options = {}) {
  // Override the app scheme if provided in options
  if (options.appScheme && profile.appScheme) {
    profile.appScheme = options.appScheme;
  }

  // Start timing
  const startTime = process.hrtime();
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: "new", // Use new headless mode
    args: [
      '--disable-extensions',
      '--disable-default-apps',
      '--no-sandbox', // Required in some environments
      '--disable-setuid-sandbox'
    ]
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Configure viewport and user agent
    await page.setViewport(profile.viewport);
    await page.setUserAgent(profile.userAgent);
    
    // Set extra headers if needed
    if (profile.headers) {
      await page.setExtraHTTPHeaders(profile.headers);
    }
    
    // Collection of navigation events
    const navigationEvents = [];
    const hops = [];
    const warnings = [];
    
    // Store the initial URL
    let startUrl = url;
    let currentUrl = url;
    let hopCounter = 1;
    let deepLinkFound = null;
    let finalUrl = null;
    let redirectStatus = "no_redirect_detected";
    let isFinalUrlStoreUrl = false;
    
    // Track redirects that happened via HTTP headers (not JavaScript)
    page.on('response', (response) => {
      const status = response.status();
      const responseUrl = response.url();
      const chain = response.request().redirectChain();
      
      // Only process if it's a main frame navigation
      if (response.request().isNavigationRequest() && response.request().frame() === page.mainFrame()) {
        if ([301, 302, 303, 307, 308].includes(status)) {
          const location = response.headers()['location'];
          if (location) {
            try {
              const fullRedirectUrl = new URL(location, responseUrl).toString();
              hops.push({
                n: hopCounter++,
                url: responseUrl,
                type: "http_redirect",
                status,
                nextUrl: fullRedirectUrl
              });
              currentUrl = fullRedirectUrl;
            } catch (e) {
              warnings.push(`INVALID_REDIRECT_URL@hop${hopCounter-1}`);
            }
          } else {
            warnings.push(`MISSING_LOCATION_HEADER@hop${hopCounter-1}`);
          }
        }
      }
    });

    // Monitor all requests to detect app scheme and intent:// URLs
    page.on('request', (request) => {
      const url = request.url();
      const isAppSchemeUrl = profile.appScheme && url.startsWith(profile.appScheme);
      const isIntentUrl = profile.intentScheme && url.startsWith('intent://');
      
      if (isAppSchemeUrl) {
        // Found native app deep link
        deepLinkFound = url;
        redirectStatus = "deeplink_detected";
        hops.push({
          n: hopCounter++,
          url: currentUrl,
          type: "app_scheme",
          nextUrl: url
        });
      } else if (isIntentUrl) {
        // Found Android intent:// URL
        deepLinkFound = url;
        redirectStatus = "intent_scheme_detected";
        
        // Extract fallback URL if present
        const fallbackUrl = extractIntentFallbackUrl(url);
        
        hops.push({
          n: hopCounter++,
          url: currentUrl,
          type: "intent_scheme",
          nextUrl: url,
          fallbackUrl
        });
      }
    });

    // Listen for client-side redirections via window.location changes
    await page.evaluateOnNewDocument(() => {
      // Store original methods
      const originalAssign = window.location.assign;
      const originalReplace = window.location.replace;
      const originalOpen = window.open;
      
      // Create custom event for redirection
      const notifyRedirect = (url, method) => {
        window.dispatchEvent(new CustomEvent('locationchange', { 
          detail: { url, method }
        }));
      };
      
      // Override location.href setter
      const originalHrefDescriptor = Object.getOwnPropertyDescriptor(window.location, 'href');
      Object.defineProperty(window.location, 'href', {
        set(value) {
          notifyRedirect(value, 'location.href');
          return originalHrefDescriptor.set.call(this, value);
        },
        get: originalHrefDescriptor.get
      });
      
      // Override location.assign
      window.location.assign = function(url) {
        notifyRedirect(url, 'location.assign');
        return originalAssign.call(this, url);
      };
      
      // Override location.replace
      window.location.replace = function(url) {
        notifyRedirect(url, 'location.replace');
        return originalReplace.call(this, url);
      };
      
      // Override window.open to catch redirects to app schemes
      window.open = function(url, ...args) {
        notifyRedirect(url, 'window.open');
        // Check for app scheme and don't actually call window.open for it
        if (url && (url.startsWith('intent:') || 
                   /^[a-zA-Z0-9.+-]+:\/\//.test(url) && 
                   !url.startsWith('http'))) {
          return null;
        }
        return originalOpen.call(this, url, ...args);
      };
    });
    
    // Listen for our custom location change events
    await page.exposeFunction('reportLocationChange', (detail) => {
      if (!detail || !detail.url) return;
      
      const url = detail.url;
      const method = detail.method || 'unknown';
      
      // Check if this is a deep link
      if (url.startsWith(profile.appScheme) || 
          (profile.intentScheme && url.startsWith('intent://'))) {
        deepLinkFound = url;
        redirectStatus = url.startsWith('intent://') ? 
          "intent_scheme_detected" : "deeplink_detected";
      }
      
      // Record the navigation
      navigationEvents.push({
        url,
        method,
        timestamp: Date.now()
      });
      
      // Update hops tracking
      hops.push({
        n: hopCounter++,
        url: currentUrl,
        type: "js_redirect",
        method,
        nextUrl: url
      });
      
      currentUrl = url;
    });
    
    // Add handler in the page
    await page.evaluateOnNewDocument(() => {
      window.addEventListener('locationchange', (e) => {
        window.reportLocationChange(e.detail);
      });
    });
    
    // Monitor for meta refresh redirects
    await page.evaluateOnNewDocument(() => {
      // Function to check meta refresh tags
      const checkMetaRefresh = () => {
        const metaTags = document.querySelectorAll('meta[http-equiv="refresh"]');
        metaTags.forEach(tag => {
          const content = tag.getAttribute('content');
          if (content) {
            const match = content.match(/\d+;\s*URL=(['"]?)([^'"]+)\1/i);
            if (match && match[2]) {
              const url = match[2];
              window.reportLocationChange({
                url,
                method: 'meta-refresh'
              });
            }
          }
        });
      };
      
      // Check after DOM is fully loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkMetaRefresh);
      } else {
        checkMetaRefresh();
      }
      
      // Also check after the window is fully loaded (for delayed inserts)
      window.addEventListener('load', checkMetaRefresh);
    });
    
    // Track page lifecycle for debugging
    page.on('console', (msg) => {
      if (process.env.DEBUG) {
        console.log(`Page console [${msg.type()}]: ${msg.text()}`);
      }
    });
    
    // Track any page errors
    page.on('pageerror', (err) => {
      warnings.push(`PAGE_JS_ERROR: ${err.message}`);
    });
    
    // Navigate to the URL and wait for network idle
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 15000 // 15 second timeout
    }).catch(e => {
      // If navigation fails, let's still continue because we might have caught redirects
      warnings.push(`NAVIGATION_ERROR: ${e.message}`);
    });
    
    // Additional waiting time to catch delayed redirects (common in dynamic links)
    await page.waitForTimeout(2000);
    
    // Get the final URL
    finalUrl = await page.url();
    
    // If no deep link was found, set the finalUrl as the result
    if (!deepLinkFound) {
      // Check if it's a store URL
      if (profile.expectedPattern && profile.expectedPattern.test(finalUrl)) {
        redirectStatus = "store_url_detected";
        isFinalUrlStoreUrl = true;
      }
    }
    
    // Calculate total duration
    const endTime = process.hrtime(startTime);
    const latencyMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));
    
    // Close the browser
    await browser.close();
    
    return {
      scenario: scenarioId,
      name: profile.name,
      status: redirectStatus,
      deep_link: deepLinkFound,
      final_url: finalUrl,
      is_store_url: isFinalUrlStoreUrl,
      hops: hops,
      latencyMs,
      warnings
    };
  } catch (error) {
    console.error(`Error in probeUrl for ${scenarioId}:`, error);
    
    // Make sure to close browser even if there's an error
    try {
      await browser.close();
    } catch (closeError) {
      console.error('Error closing browser:', closeError);
    }
    
    // Return error result
    return {
      scenario: scenarioId,
      name: profile.name,
      status: "error",
      error: error.message,
      hops: [],
      latencyMs: 0,
      warnings: ["PROBE_ERROR"]
    };
  }
}

module.exports = { probeUrl };