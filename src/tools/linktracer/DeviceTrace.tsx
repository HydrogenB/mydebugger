import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import ToolLayout from '../components/ToolLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

interface Hop {
  n: number;
  url: string;
  status: number;
  latencyMs: number;
  error?: string;
}

interface ScenarioResult {
  scenario: string;
  name: string;
  hops: Hop[];
  totalTimeMs: number;
  finalUrl: string;
  warnings: string[];
  isValidOutcome: boolean;
}

interface DeviceTraceResult {
  url: string;
  overallTimeMs: number;
  results: ScenarioResult[];
}

const DeviceTrace: React.FC = () => {
  const tool = getToolByRoute('/device-trace');
  const [url, setUrl] = useState<string>('');
  const [traceResults, setTraceResults] = useState<DeviceTraceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  
  // Handle trace submission
  const handleTrace = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setTraceResults(null);

    try {
      // Call the device trace API
      const response = await fetch('/api/device-trace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          maxHops: 20
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setTraceResults(data);
    } catch (err) {
      setError(`Error tracing dynamic link: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
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
    
    // Create CSV header
    let csv = 'Scenario,Final URL,Status,Hops,Latency (ms),Outcome\n';
    
    // Add each result row
    traceResults.results.forEach(result => {
      const finalHop = result.hops[result.hops.length - 1] || { status: 'N/A' };
      csv += `"${result.name}","${result.finalUrl}",${finalHop.status},${result.hops.length},${result.totalTimeMs},"${result.isValidOutcome ? 'PASS' : 'FAIL'}"\n`;
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
  React.useEffect(() => {
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
      default: return warning;
    }
  };

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
                Enter Dynamic Link (App Flyer / OneLink URL)
              </label>
              <div className="flex">
                <input
                  id="url-input"
                  type="text"
                  className="flex-grow rounded-l-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                  placeholder="https://s.true.th/3aCz/s90009500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <Button
                  onClick={handleTrace}
                  isLoading={loading}
                  disabled={loading || !url}
                  className="rounded-l-none"
                >
                  Probe Link
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter any App Flyer dynamic link to test how it behaves across different device contexts.
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
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Outcome
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {traceResults.results.map((result, index) => {
                          const finalHop = result.hops[result.hops.length - 1] || { status: 'N/A' };
                          return (
                            <tr 
                              key={result.scenario} 
                              className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} ${!result.isValidOutcome ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                            >
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {result.name}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300 font-mono break-all max-w-xs">
                                {result.finalUrl}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  (finalHop.status >= 200 && finalHop.status < 300) 
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                    : (finalHop.status >= 300 && finalHop.status < 400)
                                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                      : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                                }`}>
                                  {finalHop.status}
                                </span>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {result.hops.length}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {result.totalTimeMs}ms
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getOutcomeClass(result.isValidOutcome)}`}>
                                  {result.isValidOutcome ? 'PASS' : 'FAIL'}
                                </span>
                                {result.warnings.length > 0 && (
                                  <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                    {result.warnings.map((warning, i) => (
                                      <div key={i} className="flex items-center">
                                        <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        {formatWarning(warning)}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

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

                {/* Export Feedback */}
                {exportFeedback && (
                  <div className="mt-2 flex items-center justify-center p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-400 text-sm">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {exportFeedback}
                  </div>
                )}
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
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default DeviceTrace;