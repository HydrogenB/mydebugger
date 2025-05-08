import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout, Card, Button, LoadingSpinner } from '../../design-system';

interface Hop {
  n: number;
  url: string;
  status: number;
  latencyMs: number;
  error?: string;
  type?: string;
  nextUrl?: string;
  method?: string;
}

interface ScenarioResult {
  scenario: string;
  name: string;
  hops: Hop[];
  totalTimeMs: number;
  finalUrl?: string;
  final_url?: string;
  warnings: string[];
  isValidOutcome?: boolean;
  status?: string;
  deep_link?: string | null;
  is_store_url?: boolean;
}

interface DeviceTraceResult {
  url: string;
  overallTimeMs: number;
  results: ScenarioResult[];
}

// Custom hook for persistent storage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Get stored value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped setter function that persists to localStorage
  const setValue: React.Dispatch<React.SetStateAction<T>> = value => {
    try {
      // Allow function updates (same API as useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

const DeviceTrace: React.FC = () => {
  const tool = getToolByRoute('/device-trace');
  
  // URL and standard state
  const [url, setUrl] = useState<string>('');
  const [showRecentUrls, setShowRecentUrls] = useState<boolean>(false);
  const [traceResults, setTraceResults] = useState<DeviceTraceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  
  // Enhanced mode with Puppeteer
  const [enhancedMode, setEnhancedMode] = useState<boolean>(true);
  
  // Persistent storage for app identifiers and URL history
  const [iosAppId, setIosAppId] = useLocalStorage<string>('probe:lastIosAppId', '');
  const [androidPackage, setAndroidPackage] = useLocalStorage<string>('probe:lastAndroidPkg', '');
  const [deepLinkScheme, setDeepLinkScheme] = useLocalStorage<string>('probe:lastScheme', '');
  const [lastLink, setLastLink] = useLocalStorage<string>('probe:lastLink', '');
  const [recentLinks, setRecentLinks] = useLocalStorage<string[]>('probe:recentLinks', []);
  
  const feedbackTimeoutRef = useRef<number | null>(null);
  const recentDropdownRef = useRef<HTMLDivElement | null>(null);
  
  // Set URL input from last link on mount
  useEffect(() => {
    if (lastLink) {
      setUrl(lastLink);
    }
  }, [lastLink]);
  
  // Close recent URLs dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (recentDropdownRef.current && 
          !recentDropdownRef.current.contains(event.target as Node)) {
        setShowRecentUrls(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // State for selected result to view hop details
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);
  
  // Handle row click to show hop details
  const handleResultRowClick = (index: number) => {
    setSelectedResultIndex(prevIndex => prevIndex === index ? null : index);
  };

  // Handle trace submission
  const handleTrace = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    // Update persistent storage
    updateRecentLinks(url);
    setLastLink(url);

    setLoading(true);
    setError(null);
    setTraceResults(null);

    try {
      let response;
      
      if (enhancedMode) {
        // Call the enhanced Puppeteer-based probe API
        response = await fetch('/api/puppeteer-probe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            emulate: ['ios_app', 'ios_noapp', 'android_app', 'android_noapp', 'desktop'],
            iosAppId,
            androidPackage,
            deepLinkScheme
          }),
        });
      } else {
        // Call the legacy device trace API
        response = await fetch('/api/device-trace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            maxHops: 20,
            iosAppId,
            androidPackage,
            deepLinkScheme
          }),
        });
      }
      
      if (!response.ok) {
        // Check if the response is JSON before trying to parse it
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Request failed with status ${response.status}`);
        } else {
          // Handle non-JSON error response
          const errorText = await response.text();
          throw new Error(`Server error (${response.status}): ${
            errorText.length > 100 ? errorText.substring(0, 100) + '...' : errorText
          }`);
        }
      }
      
      const data = await response.json();
      
      // Transform data if necessary for consistency between APIs
      if (enhancedMode) {
        // Normalize the structure to match the expected format in the UI
        data.results = data.results.map((result: ScenarioResult) => {
          // Make sure we have finalUrl for consistency with old API
          if (result.final_url && !result.finalUrl) {
            result.finalUrl = result.final_url;
          }
          
          // Transform the hops to match the existing format
          result.hops = result.hops.map((hop: any) => {
            return {
              n: hop.n,
              url: hop.url,
              status: hop.status || 200, // Default status for JS redirects
              latencyMs: hop.latencyMs || 0,
              type: hop.type,
              nextUrl: hop.nextUrl
            };
          });
          
          return result;
        });
      }
      
      setTraceResults(data);
    } catch (err) {
      setError(`Error tracing dynamic link: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update recent links list
  const updateRecentLinks = (newUrl: string) => {
    setRecentLinks(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(link => link !== newUrl);
      // Add new URL at the beginning
      const updated = [newUrl, ...filtered];
      // Keep only the last 10 (increased from 3)
      return updated.slice(0, 10);
    });
  };
  
  // Select URL from recent list
  const selectRecentUrl = (selectedUrl: string) => {
    setUrl(selectedUrl);
    setShowRecentUrls(false);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTrace();
    }
  };

  // Export JSON function
  const handleExportJSON = () => {
    if (!traceResults) return;
    
    // Create a downloadable JSON file
    const blob = new Blob([JSON.stringify(traceResults, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'dynamic-link-trace.json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Show feedback
    showFeedback('JSON file downloaded!');
  };

  // Copy table as CSV
  const handleCopyTableCSV = () => {
    if (!traceResults) return;
    
    // Create CSV header - Remove Outcome column
    let csv = 'Scenario,Final URL,Status,Hops,Latency (ms)\n';
    
    // Add each result row - Remove Outcome value
    traceResults.results.forEach(result => {
      const finalHop = result.hops[result.hops.length - 1] || { status: 'N/A' };
      csv += `"${result.name}","${result.finalUrl || result.final_url}",${finalHop.status},${result.hops.length},${result.totalTimeMs}\n`;
    });
    
    // Copy to clipboard
    navigator.clipboard.writeText(csv);
    
    // Show feedback
    showFeedback('Table copied to clipboard as CSV!');
  };

  // Helper to show temporary feedback message
  const showFeedback = (message: string) => {
    setExportFeedback(message);
    
    // Clear any existing timeout
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    
    // Set new timeout to clear message
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setExportFeedback(null);
    }, 3000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Get CSS class for outcome
  const getOutcomeClass = (isValid: boolean): string => {
    return isValid 
      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
  };

  // Format warnings for display
  const formatWarning = (warning: string): string => {
    switch (warning) {
      case 'UNEXPECTED_DESTINATION': return 'Unexpected final URL';
      case 'MAX_REDIRECTS_REACHED': return 'Too many redirects';
      case 'REQUEST_FAILED': return 'Request failed';
      case 'MISSING_LOCATION_HEADER': return 'Missing redirect location';
      case 'INVALID_REDIRECT_URL': return 'Invalid redirect URL';
      case 'NAVIGATION_ERROR': return 'Navigation error';
      case 'PAGE_JS_ERROR': return 'JavaScript error on page';
      default: return warning;
    }
  };

  // Get label for status of puppeteer-based detection
  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'deeplink_detected': return 'App Deep Link';
      case 'intent_scheme_detected': return 'Android Intent Scheme';
      case 'store_url_detected': return 'App Store URL';
      case 'no_redirect_detected': return 'No Redirect Detected';
      case 'error': return 'Error';
      default: return status || 'Unknown';
    }
  };

  // Get color class for status
  const getStatusColorClass = (status?: string): string => {
    switch (status) {
      case 'deeplink_detected':
      case 'intent_scheme_detected':
        return 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200';
      case 'store_url_detected':
        return 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200';
      case 'no_redirect_detected':
        return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  // Handle enhanced mode toggle
  const handleEnhancedModeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnhanced = e.target.checked;
    setEnhancedMode(isEnhanced);
    
    // Store preference in localStorage
    try {
      localStorage.setItem('probe:enhancedMode', JSON.stringify(isEnhanced));
    } catch (e) {
      console.error('Failed to save enhanced mode preference:', e);
    }
  };

  // Load enhanced mode preference from localStorage on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('probe:enhancedMode');
      if (savedMode !== null) {
        setEnhancedMode(JSON.parse(savedMode));
      }
    } catch (e) {
      console.error('Failed to load enhanced mode preference:', e);
    }
  }, []);

  // SEO metadata
  const pageTitle = "Dynamic-Link Behavior Probe | MyDebugger";
  const pageDescription = "Test how App Flyer and OneLink URLs behave across different device contexts and installation states.";
  
  return (
    <ToolLayout tool={tool!}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/device-trace" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href="https://mydebugger.vercel.app/device-trace" />
      </Helmet>
      
      <div className="space-y-6">
        <Card isElevated>
          <div className="space-y-4">
            <div>
              <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dynamic Link URL
              </label>
              <div className="flex relative">
                <div className="flex-grow flex">
                  <input
                    id="url-input"
                    type="text"
                    className="flex-grow rounded-l-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                    placeholder="https://example.onelink.me/abc"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                  {recentLinks.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        className="h-full px-3 border-t border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={() => setShowRecentUrls(!showRecentUrls)}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showRecentUrls && (
                        <div 
                          ref={recentDropdownRef}
                          className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                        >
                          <div className="py-1">
                            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                              Recent URLs
                            </div>
                            {recentLinks.map((link, i) => (
                              <button
                                key={i}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
                                onClick={() => selectRecentUrl(link)}
                              >
                                {link}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={handleTrace}
                  isLoading={loading}
                  disabled={loading || !url}
                  className="rounded-l-none"
                >
                  Probe Link
                </Button>
              </div>
              
              {/* Enhanced Mode Toggle */}
              <div className="mt-2 flex items-center">
                <input
                  id="enhanced-mode"
                  type="checkbox"
                  checked={enhancedMode}
                  onChange={handleEnhancedModeToggle}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded"
                />
                <label htmlFor="enhanced-mode" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Enable Enhanced Mode (detects JavaScript redirects and deep links)
                </label>
              </div>
              
              {/* Additional fields for app identifiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <div>
                  <label htmlFor="ios-app-id" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    iOS App Store ID (optional)
                  </label>
                  <input
                    id="ios-app-id"
                    type="text"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50 text-sm"
                    placeholder="id123456789"
                    value={iosAppId}
                    onChange={(e) => setIosAppId(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="android-pkg" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Android Package Name (optional)
                  </label>
                  <input
                    id="android-pkg"
                    type="text"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50 text-sm"
                    placeholder="com.example.app"
                    value={androidPackage}
                    onChange={(e) => setAndroidPackage(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="deep-link-scheme" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Deep-Link Scheme / Prefix (optional)
                  </label>
                  <input
                    id="deep-link-scheme"
                    type="text"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50 text-sm"
                    placeholder="example://"
                    value={deepLinkScheme}
                    onChange={(e) => setDeepLinkScheme(e.target.value)}
                  />
                </div>
              </div>
              
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter any App Flyer or Firebase dynamic link to test how it behaves across different device contexts.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {traceResults && !loading && (
              <div className="animate-fade-in space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                    Dynamic Link Behavior Results
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Overall processing time: <span className="font-medium">{traceResults.overallTimeMs}ms</span>
                  </div>
                </div>

                {/* Results Matrix */}
                <div className="bg-white dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-md shadow">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Scenario
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Final URL
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Hops
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Latency
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {traceResults.results.map((result, index) => {
                          const finalHop = result.hops[result.hops.length - 1] || { status: 'N/A' };
                          
                          // Determine what to display in the status cell based on API mode
                          const statusDisplay = enhancedMode && result.status ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColorClass(result.status)}`}>
                              {getStatusLabel(result.status)}
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              (finalHop.status >= 200 && finalHop.status < 300) 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                : (finalHop.status >= 300 && finalHop.status < 400)
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                  : (finalHop.status >= 400 && finalHop.status < 500)
                                    ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                              {finalHop.status}
                            </span>
                          );
                          
                          return (
                            <tr 
                              key={result.scenario} 
                              className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer`}
                              onClick={() => handleResultRowClick(index)}
                            >
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {result.name}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300 font-mono break-all max-w-xs">
                                {enhancedMode && result.deep_link ? (
                                  <span className="text-green-600 dark:text-green-400">{result.deep_link}</span>
                                ) : (
                                  result.finalUrl || result.final_url
                                )}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                {statusDisplay}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {result.hops.length}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {result.totalTimeMs}ms
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Hop details panel */}
                {selectedResultIndex !== null && (
                  <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex justify-between items-center">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {traceResults.results[selectedResultIndex].name} - Hop Details
                      </h3>
                      <button 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setSelectedResultIndex(null)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hop</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">URL</th>
                            {enhancedMode && <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>}
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {traceResults.results[selectedResultIndex].hops.map((hop, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {hop.n}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                                {hop.url}
                                {hop.nextUrl && (
                                  <div className="mt-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">→ </span>
                                    <span className="text-xs text-green-600 dark:text-green-400 font-mono">{hop.nextUrl}</span>
                                  </div>
                                )}
                              </td>
                              {enhancedMode && (
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                  {hop.type === 'http_redirect' ? 'HTTP' : 
                                   hop.type === 'js_redirect' ? 'JavaScript' : 
                                   hop.type === 'meta_refresh' ? 'Meta Refresh' : 
                                   hop.type === 'app_scheme' ? 'App Scheme' : 
                                   hop.type === 'intent_scheme' ? 'Intent Scheme' : 
                                   'Unknown'}
                                   {hop.method && <div className="text-xs text-gray-500">{hop.method}</div>}
                                </td>
                              )}
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {hop.status || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {/* Warnings */}
                      {traceResults.results[selectedResultIndex].warnings.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Warnings</h4>
                          <ul className="mt-2 list-disc pl-5 space-y-1">
                            {traceResults.results[selectedResultIndex].warnings.map((warning, i) => (
                              <li key={i} className="text-xs text-yellow-700 dark:text-yellow-400">
                                {formatWarning(warning)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Export Options */}
                <div className="flex flex-wrap justify-between items-center mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Export Results</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Download or copy data in different formats</p>
                  </div>
                  <div className="flex space-x-2 mt-3 sm:mt-0">
                    <Button
                      onClick={handleExportJSON}
                      variant="light"
                      size="sm"
                      className="flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 10V16M12 16L9 13M12 16L15 13M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H14L19 8V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Export JSON
                    </Button>
                    <Button
                      onClick={handleCopyTableCSV}
                      variant="light"
                      size="sm"
                      className="flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V18M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 5V7H16V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Copy Table
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="About Dynamic Link Behavior" isElevated>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dynamic links (like those from App Flyer or Firebase) change their behavior based on the user's device context. This tool simulates how the same link behaves across different scenarios.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">iOS + App Installed</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Opens the app via deep-link (app scheme URL)</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">iOS + No App</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Redirects to the App Store listing</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Android + App Installed</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Opens the app via intent:// URL or app scheme</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Android + No App</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Redirects to Google Play Store</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 sm:col-span-2">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Desktop</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Redirects to a marketing or landing page</p>
              </div>
            </div>
            
            {enhancedMode && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md mt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Enhanced Mode (Puppeteer)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enhanced mode utilizes Puppeteer to detect JavaScript-based redirects that regular HTTP inspection misses. 
                  This is particularly useful for modern dynamic links from services like Appsflyer, Firebase, and Branch.io 
                  which use client-side JavaScript to determine the appropriate redirection.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default DeviceTrace;