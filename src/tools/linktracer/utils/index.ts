import { TraceResult, Hop, DeviceProfile } from '../types';

/**
 * Trace a URL's redirect chain
 * 
 * @param url The URL to trace
 * @param userAgent User agent string to use for the request
 * @returns A trace result object with hops, total time and warnings
 */
export const traceLink = async (url: string, userAgent: string): Promise<TraceResult> => {
  // This is a mock implementation since we can't actually make network requests
  // In a real implementation, this would call an API or use a service worker
  
  return new Promise((resolve) => {
    // Simulate network request
    setTimeout(() => {
      // Create a mock trace result
      const hops: Hop[] = [
        {
          n: 1,
          url: url,
          status: 302,
          method: 'GET',
          latencyMs: 120,
          type: 'HTTP Redirect',
          nextUrl: url.replace('http://', 'https://'),
        },
        {
          n: 2,
          url: url.replace('http://', 'https://'),
          status: 200,
          method: 'GET',
          latencyMs: 350,
          type: 'Final Destination'
        }
      ];

      resolve({
        hops,
        totalTimeMs: 470, // Sum of all hop latencies
        warnings: ['This is a simulated trace. No actual network requests were made.']
      });
    }, 1500);
  });
};

/**
 * Get available device profiles for tracing
 * 
 * @returns Array of device profiles
 */
export const getDeviceProfiles = async (): Promise<DeviceProfile[]> => {
  // This would normally fetch from an API or configuration
  return [
    {
      id: 'desktop',
      name: 'Desktop Chrome',
      type: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    {
      id: 'mobile',
      name: 'Mobile Safari',
      type: 'Mobile',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    },
    {
      id: 'tablet',
      name: 'iPad',
      type: 'Tablet',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    },
    {
      id: 'googlebot',
      name: 'Google Bot',
      type: 'Bot',
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    },
    {
      id: 'facebookbot',
      name: 'Facebook Bot',
      type: 'Bot',
      userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    }
  ];
};

/**
 * Format a URL for display
 * 
 * @param url URL to format
 * @param maxLength Maximum length before truncating
 * @returns Formatted URL string
 */
export const formatUrl = (url: string, maxLength: number = 60): string => {
  if (!url) return '';
  if (url.length <= maxLength) return url;
  
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  const path = urlObj.pathname;
  
  // If the domain itself is too long, truncate it
  if (domain.length > maxLength - 10) {
    return domain.substring(0, maxLength - 10) + '...' + path.substring(0, 7) + '...';
  }
  
  // Otherwise truncate the path
  const availableSpace = maxLength - domain.length - 5;
  if (availableSpace <= 5) return domain + '...';
  
  const pathStart = path.substring(0, availableSpace / 2);
  const pathEnd = path.substring(path.length - availableSpace / 2);
  
  return domain + pathStart + '...' + pathEnd;
};
