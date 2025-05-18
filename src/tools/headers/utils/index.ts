import { HeaderData, ParsedHeaders, HeadersAnalysisResult } from '../types';

/**
 * Format a URL by adding protocol if missing
 * @param urlString URL string to format
 * @returns Formatted URL string
 */
export const formatUrl = (urlString: string): string => {
  if (!urlString) return '';
  
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    return `https://${urlString}`;
  }
  
  return urlString;
};

/**
 * Validate if a string is a valid URL
 * @param urlString URL string to validate
 * @returns Boolean indicating if URL is valid
 */
export const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Security header descriptions and categories
 */
const HEADERS_METADATA: Record<string, { description: string, category: string }> = {
  // Security headers
  'strict-transport-security': {
    description: 'Enforces HTTPS connections and prevents downgrade attacks',
    category: 'security'
  },
  'content-security-policy': {
    description: 'Helps prevent XSS attacks by controlling which resources can be loaded',
    category: 'security'
  },
  'x-content-type-options': {
    description: 'Prevents MIME type sniffing attacks',
    category: 'security'
  },
  'x-frame-options': {
    description: 'Controls whether the page can be displayed in frames, helping prevent clickjacking',
    category: 'security'
  },
  'x-xss-protection': {
    description: 'Configures XSS protection in supported browsers',
    category: 'security'
  },
  'referrer-policy': {
    description: 'Controls how much referrer information is included with requests',
    category: 'security'
  },
  'permissions-policy': {
    description: 'Controls which browser features and APIs can be used',
    category: 'security'
  },
  'feature-policy': {
    description: 'Legacy version of Permissions-Policy, controls browser feature access',
    category: 'security'
  },
  
  // Cache and performance headers
  'cache-control': {
    description: 'Directives for caching mechanisms in requests/responses',
    category: 'caching'
  },
  'etag': {
    description: 'Identifier for a specific version of a resource',
    category: 'caching'
  },
  'expires': {
    description: 'Date/time after which the response is considered stale',
    category: 'caching'
  },
  'last-modified': {
    description: 'Date and time when the resource was last modified',
    category: 'caching'
  },
  
  // Content headers
  'content-type': {
    description: 'Media type of the resource',
    category: 'content'
  },
  'content-length': {
    description: 'Size of the resource in bytes',
    category: 'content'
  },
  'content-encoding': {
    description: 'Compression algorithm used on the resource',
    category: 'content'
  },
  
  // Authentication headers
  'www-authenticate': {
    description: 'Authentication method required to access the resource',
    category: 'authentication'
  },
  'authorization': {
    description: 'Credentials for authenticating the client with the server',
    category: 'authentication'
  },
  
  // Standard request headers
  'host': {
    description: 'Domain name of the server',
    category: 'request'
  },
  'user-agent': {
    description: 'Client software identity',
    category: 'request'
  },
  'accept': {
    description: 'Media types that the client can process',
    category: 'request'
  },
  'accept-language': {
    description: 'Natural languages that the client prefers',
    category: 'request'
  },
  'accept-encoding': {
    description: 'Compression algorithms that the client understands',
    category: 'request'
  },
  'cookie': {
    description: 'Stored HTTP cookies previously sent by the server',
    category: 'request'
  },
  
  // CORS headers
  'access-control-allow-origin': {
    description: 'Indicates whether the response can be shared with resources with the given origin',
    category: 'cors'
  },
  'access-control-allow-methods': {
    description: 'Specifies the methods allowed when accessing the resource',
    category: 'cors'
  },
  'access-control-allow-headers': {
    description: 'Indicates which headers can be used during the actual request',
    category: 'cors'
  },
  'access-control-expose-headers': {
    description: 'Indicates which headers can be exposed as part of the response',
    category: 'cors'
  },
  'access-control-max-age': {
    description: 'Indicates how long the results of a preflight request can be cached',
    category: 'cors'
  },
};

/**
 * Enriches a header with metadata (description and category)
 * @param name Header name
 * @param value Header value
 * @param source Either 'request' or 'response'
 * @returns Enriched header data
 */
export const enrichHeader = (
  name: string,
  value: string,
  source: 'request' | 'response'
): HeaderData => {
  const lowerName = name.toLowerCase();
  const metadata = HEADERS_METADATA[lowerName] || {
    description: 'No description available',
    category: 'other'
  };
  
  return {
    name,
    value,
    source,
    ...metadata
  };
};

/**
 * Load previous analysis results from local storage
 * @returns Array of previous analysis results
 */
export const loadAnalysisHistory = (): HeadersAnalysisResult[] => {
  try {
    const history = localStorage.getItem('headers-analysis-history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading analysis history:', error);
    return [];
  }
};

/**
 * Save an analysis result to history
 * @param result Analysis result to save
 * @returns Updated history array
 */
export const saveToHistory = (result: HeadersAnalysisResult): HeadersAnalysisResult[] => {
  try {
    const history = loadAnalysisHistory();
    
    // Avoid duplicates by removing any existing entries for the same URL
    const filteredHistory = history.filter(item => item.url !== result.url);
    
    // Add the new result and limit history to 10 items
    const updatedHistory = [result, ...filteredHistory].slice(0, 10);
    
    localStorage.setItem('headers-analysis-history', JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error('Error saving to history:', error);
    return loadAnalysisHistory();
  }
};

/**
 * Clear all history entries
 * @returns Empty array
 */
export const clearHistory = (): HeadersAnalysisResult[] => {
  try {
    localStorage.removeItem('headers-analysis-history');
    return [];
  } catch (error) {
    console.error('Error clearing history:', error);
    return [];
  }
};

/**
 * Group headers by category for better organization
 * @param headers Array of header data
 * @returns Record with category keys and arrays of headers
 */
export const groupHeadersByCategory = (headers: HeaderData[]): Record<string, HeaderData[]> => {
  return headers.reduce((groups: Record<string, HeaderData[]>, header) => {
    if (!groups[header.category]) {
      groups[header.category] = [];
    }
    
    groups[header.category].push(header);
    return groups;
  }, {});
};
