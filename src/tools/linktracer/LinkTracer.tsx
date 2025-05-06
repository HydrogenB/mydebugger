import React, { useState, useEffect, useRef } from 'react';
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
  method: string;
  latencyMs: number;
  error?: string;
}

interface TraceResult {
  hops: Hop[];
  totalTimeMs: number;
  warnings: string[];
}

interface UserAgentOption {
  label: string;
  value: string;
}

const LinkTracer: React.FC = () => {
  const tool = getToolByRoute('/link-tracer');
  const [url, setUrl] = useState<string>('');
  const [traceResults, setTraceResults] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('HEAD');
  const [selectedUserAgent, setSelectedUserAgent] = useState<string>('default');
  const [customUserAgent, setCustomUserAgent] = useState<string>('');
  const [maxHops, setMaxHops] = useState<number>(20);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // User agent presets
  const userAgentOptions: UserAgentOption[] = [
    { label: 'Default', value: 'default' },
    { label: 'Chrome (Desktop)', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
    { label: 'Safari (iOS)', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1' },
    { label: 'Firefox', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0' },
    { label: 'Google Bot', value: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
    { label: 'Custom', value: 'custom' }
  ];

  // HTTP methods
  const httpMethods = ['HEAD', 'GET', 'OPTIONS'];

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('linkTracerPrefs');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.method) setSelectedMethod(prefs.method);
        if (prefs.userAgent) setSelectedUserAgent(prefs.userAgent);
        if (prefs.customUserAgent) setCustomUserAgent(prefs.customUserAgent);
        if (prefs.maxHops) setMaxHops(prefs.maxHops);
      }
    } catch (error) {
      console.error('Error loading Link Tracer preferences:', error);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('linkTracerPrefs', JSON.stringify({
        method: selectedMethod,
        userAgent: selectedUserAgent,
        customUserAgent,
        maxHops
      }));
    } catch (error) {
      console.error('Error saving Link Tracer preferences:', error);
    }
  }, [selectedMethod, selectedUserAgent, customUserAgent, maxHops]);

  const handleTrace = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setTraceResults(null);

    try {
      // Get the actual user agent string to use
      let userAgent = 'MyDebugger-LinkTracer/1.0';
      if (selectedUserAgent === 'custom') {
        userAgent = customUserAgent || userAgent;
      } else if (selectedUserAgent !== 'default') {
        userAgent = selectedUserAgent;
      }

      // Call the link trace API
      const response = await fetch('/api/link-trace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          method: selectedMethod,
          userAgent,
          maxHops
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setTraceResults(data);
    } catch (err) {
      setError(`Error tracing URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTrace();
    }
  };

  const handleCopyJSON = () => {
    if (!traceResults) return;
    navigator.clipboard.writeText(JSON.stringify(traceResults, null, 2));
    
    // Show feedback
    showFeedback('JSON copied to clipboard!');
  };

  const handleExportCSV = () => {
    if (!traceResults) return;
    
    // Create CSV content
    let csv = 'Hop,Status,Method,URL,Latency (ms)\n';
    traceResults.hops.forEach(hop => {
      csv += `${hop.n},${hop.status},${hop.method},"${hop.url}",${hop.latencyMs}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'redirect-trace.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Show feedback
    showFeedback('CSV file downloaded!');
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

  const getStatusClass = (status: number): string => {
    if (status >= 200 && status < 300) {
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    } else if (status >= 300 && status < 400) {
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    } else if (status >= 400 && status < 500) {
      return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
    } else if (status >= 500) {
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    } else {
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  // SEO metadata
  const pageTitle = "URL Redirect Checker | MyDebugger";
  const pageDescription = "Trace the complete redirect path of any URL, including status codes, latency and security warnings.";
  
  return (
    <ToolLayout tool={tool!}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/link-tracer" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href="https://mydebugger.vercel.app/link-tracer" />
      </Helmet>
      
      <div className="space-y-6">
        <Card isElevated>
          <div className="space-y-4">
            <div>
              <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter URL to trace redirects
              </label>
              <div className="flex">
                <input
                  id="url-input"
                  type="text"
                  className="flex-grow rounded-l-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                  placeholder="https://bit.ly/example"
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
                  Trace URL
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter any URL to trace its complete redirect path, including shortened URLs.
              </p>
            </div>

            {/* Advanced Options Toggle */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center focus:outline-none"
              >
                <svg 
                  className={`h-4 w-4 mr-1 transition-transform ${showAdvanced ? 'transform rotate-90' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* HTTP Method */}
                    <div>
                      <label htmlFor="http-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        HTTP Method
                      </label>
                      <div className="flex space-x-3">
                        {httpMethods.map(method => (
                          <label key={method} className="flex items-center">
                            <input
                              type="radio"
                              name="http-method"
                              value={method}
                              checked={selectedMethod === method}
                              onChange={() => setSelectedMethod(method)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Max Hops */}
                    <div>
                      <label htmlFor="max-hops" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Redirects: {maxHops}
                      </label>
                      <input
                        id="max-hops"
                        type="range"
                        min="1"
                        max="30"
                        value={maxHops}
                        onChange={(e) => setMaxHops(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* User Agent */}
                    <div className="md:col-span-2">
                      <label htmlFor="user-agent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        User Agent
                      </label>
                      <select
                        id="user-agent"
                        value={selectedUserAgent}
                        onChange={(e) => setSelectedUserAgent(e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 text-sm"
                      >
                        {userAgentOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>

                      {selectedUserAgent === 'custom' && (
                        <input
                          type="text"
                          value={customUserAgent}
                          onChange={(e) => setCustomUserAgent(e.target.value)}
                          placeholder="Enter custom User-Agent string"
                          className="mt-2 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 text-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                    Redirect Trace Results
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Total Time:</span> {traceResults.totalTimeMs}ms | 
                    <span className="font-medium ml-2">Hops:</span> {traceResults.hops.length}
                  </div>
                </div>

                {/* Warnings Section */}
                {traceResults.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Warnings</h3>
                    <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                      {traceResults.warnings.map((warning, index) => (
                        <li key={index}>
                          {warning.includes('PROTOCOL_DOWNGRADE') ? 
                            'HTTPS to HTTP downgrade detected' : warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Results Table */}
                <div className="bg-white dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-md shadow">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Hop
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Method
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            URL
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Latency
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {traceResults.hops.map((hop, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {hop.n}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-xs">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${getStatusClass(hop.status)}`}>
                                {hop.status || 'Error'}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {hop.method}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300 font-mono break-all max-w-md">
                              {hop.url}
                              {hop.error && (
                                <p className="text-xs text-red-500 mt-1">{hop.error}</p>
                              )}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {hop.latencyMs}ms
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Export Options */}
                <div className="flex flex-wrap justify-between items-center mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Export Results</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Download or copy trace data in different formats</p>
                  </div>
                  <div className="flex space-x-2 mt-3 sm:mt-0">
                    <Button
                      onClick={handleCopyJSON}
                      variant="light"
                      size="sm"
                      className="flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V18M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 5V7H16V5M16 10H20M18 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      JSON
                    </Button>
                    <Button
                      onClick={handleExportCSV}
                      variant="light"
                      size="sm"
                      className="flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 10V16M12 16L9 13M12 16L15 13M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H14L19 8V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      CSV
                    </Button>
                    <Button
                      onClick={() => window.open(traceResults.hops[traceResults.hops.length - 1].url, '_blank')}
                      variant="primary"
                      size="sm"
                      className="flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Open URL
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

        <Card title="About URL Redirects" isElevated>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">301 Redirect</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Permanent redirect. The requested resource has been assigned a new permanent URI.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">302 Redirect</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Temporary redirect. The requested resource resides temporarily under a different URI.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">307 Redirect</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Temporary redirect that guarantees the HTTP method won't change in the redirected request.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">308 Redirect</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Permanent redirect that guarantees the HTTP method won't change in the redirected request.</p>
            </div>
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default LinkTracer;