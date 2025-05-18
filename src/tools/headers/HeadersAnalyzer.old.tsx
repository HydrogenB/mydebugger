import React from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import { Card } from '../../design-system/components/layout';
import { useHeadersAnalyzer } from './hooks';
import { UrlForm, HeadersDisplay, HistoryList } from './components';

/**
 * HTTP Headers Analyzer Tool
 * Analyzes HTTP headers from websites and provides information about their security and functionality
 */
const HeadersAnalyzer: React.FC = () => {
  const tool = getToolByRoute('/headers');
  
  // Use our custom hook for all functionality
  const {
    url,
    setUrl,
    loading,
    result,
    error,
    history,
    showHistory,
    showHelp,
    analyzeHeaders,
    clearResults,
    clearHistoryEntries,
    selectHistoryItem,
    setShowHistory,
    setShowHelp
  } = useHeadersAnalyzer();
  
  // SEO metadata
  const pageTitle = "HTTP Headers Analyzer | MyDebugger";
  const pageDescription = "Analyze and understand HTTP request/response headers.";
  
  // Header categories for grouping
  const headerCategories = {
    'caching': 'Caching',
    'security': 'Security',
    'content': 'Content',
    'cors': 'CORS',
    'authentication': 'Authentication',
    'other': 'Other'
  };
  
  // Header descriptions for common headers
  const headerDescriptions: Record<string, { description: string, category: string }> = {
    'content-type': { 
      description: 'Indicates the media type of the resource', 
      category: 'content' 
    },
    'content-length': { 
      description: 'Indicates the size of the entity-body in bytes', 
      category: 'content' 
    },
    'cache-control': { 
      description: 'Directives for caching mechanisms in both requests and responses', 
      category: 'caching' 
    },
    'expires': { 
      description: 'Date/time after which the response is considered stale', 
      category: 'caching' 
    },
    'etag': { 
      description: 'Identifier for a specific version of a resource', 
      category: 'caching' 
    },
    'server': { 
      description: 'Information about the software used by the origin server', 
      category: 'other' 
    },
    'strict-transport-security': { 
      description: 'Force communication over HTTPS instead of HTTP', 
      category: 'security' 
    },
    'x-content-type-options': { 
      description: 'Prevents MIME type sniffing', 
      category: 'security' 
    },
    'x-frame-options': { 
      description: 'Indicates whether a browser should be allowed to render a page in a frame/iframe', 
      category: 'security' 
    },
    'access-control-allow-origin': { 
      description: 'Indicates whether the response can be shared with resources with the given origin', 
      category: 'cors' 
    },
    'access-control-allow-methods': { 
      description: 'Specifies the methods allowed when accessing the resource', 
      category: 'cors' 
    },
    'authorization': { 
      description: 'Authentication credentials for HTTP authentication', 
      category: 'authentication' 
    }
  };

  const analyzeHeaders = async () => {
    if (!url) {
      setError('Please enter a URL to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setHeaders(null);

    try {
      // Add protocol if missing
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = 'https://' + url;
      }

      // Use a CORS proxy to avoid CORS issues
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${formattedUrl}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      const parsedHeaders: ParsedHeaders = {
        request: [],
        response: []
      };
      
      // Parse response headers
      response.headers.forEach((value, name) => {
        const lowerName = name.toLowerCase();
        const headerInfo = headerDescriptions[lowerName] || { 
          description: 'No description available', 
          category: 'other' 
        };
        
        parsedHeaders.response.push({
          name,
          value,
          description: headerInfo.description,
          category: headerInfo.category,
          source: 'response'
        });
      });
      
      // Since we can't directly access the request headers in the browser,
      // we'll add some common ones for demonstration
      const commonRequestHeaders = [
        { name: 'Accept', value: '*/*', category: 'content' },
        { name: 'Accept-Encoding', value: 'gzip, deflate, br', category: 'content' },
        { name: 'Accept-Language', value: 'en-US,en;q=0.9', category: 'content' },
        { name: 'User-Agent', value: 'MyDebugger Headers Tool', category: 'other' },
        { name: 'X-Requested-With', value: 'XMLHttpRequest', category: 'other' }
      ];
      
      commonRequestHeaders.forEach(header => {
        parsedHeaders.request.push({
          name: header.name,
          value: header.value,
          description: headerDescriptions[header.name.toLowerCase()]?.description || 'No description available',
          category: header.category,
          source: 'request'
        });
      });
      
      setHeaders(parsedHeaders);
    } catch (err) {
      setError(`Error fetching headers: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      analyzeHeaders();
    }
  };

  // Filter headers based on search input
  const filteredHeaders = headers ? 
    headers[activeTab].filter(header => 
      header.name.toLowerCase().includes(filter.toLowerCase()) || 
      header.value.toLowerCase().includes(filter.toLowerCase())
    ) : [];
  
  // Group headers by category
  const groupedHeaders: Record<string, HeaderData[]> = {};
  
  filteredHeaders.forEach(header => {
    const category = header.category;
    if (!groupedHeaders[category]) {
      groupedHeaders[category] = [];
    }
    groupedHeaders[category].push(header);
  });

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/headers" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href="https://mydebugger.vercel.app/headers" />
      </Helmet>
      <ToolLayout tool={tool!}>
        <div className="space-y-6">
          <Card isElevated className="transition-all duration-200">
            <div className="space-y-4">
              <div>
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enter URL to analyze headers
                </label>
                <div className="flex">
                  <input
                    id="url-input"
                    type="text"
                    className="flex-grow rounded-l-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                    placeholder="example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                  <Button
                    onClick={analyzeHeaders}
                    isLoading={loading}
                    disabled={loading || !url}
                    className="rounded-l-none"
                  >
                    Analyze
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter a URL to fetch and analyze its HTTP headers
                </p>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {loading && (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              )}
              
              {headers && !loading && (
                <div className="animate-fade-in">
                  <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <div className="flex">
                      <button
                        className={`py-2 px-4 border-b-2 font-medium text-sm focus:outline-none ${
                          activeTab === 'response'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('response')}
                      >
                        Response Headers ({headers.response.length})
                      </button>
                      <button
                        className={`py-2 px-4 border-b-2 font-medium text-sm focus:outline-none ${
                          activeTab === 'request'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('request')}
                      >
                        Request Headers ({headers.request.length})
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                      placeholder="Filter headers..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>
                  
                  {filteredHeaders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No headers found {filter ? `matching "${filter}"` : ''}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedHeaders).map(([category, headers]) => (
                        <div key={category}>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                            {headerCategories[category as keyof typeof headerCategories] || 'Other'}
                          </h3>
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4">
                                    Header
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Value
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {headers.map((header, index) => (
                                  <tr 
                                    key={index}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                      <div>{header.name}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{header.description}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono break-all">
                                      {header.value}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
          
          <Card title="About HTTP Headers" isElevated>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                HTTP headers let clients and servers pass additional information with requests or responses. 
                They consist of name-value pairs separated by colons.
              </p>
              <h3>Common Response Headers</h3>
              <ul>
                <li><strong>Content-Type</strong>: Indicates the media type of the resource</li>
                <li><strong>Content-Length</strong>: Indicates the size of the entity-body in bytes</li>
                <li><strong>Cache-Control</strong>: Directives for caching mechanisms</li>
                <li><strong>Set-Cookie</strong>: Send cookies from the server to the user agent</li>
              </ul>
              <h3>Common Request Headers</h3>
              <ul>
                <li><strong>Accept</strong>: Media types the client can process</li>
                <li><strong>User-Agent</strong>: Application type, OS, software vendor, or version</li>
                <li><strong>Authorization</strong>: Authentication credentials for HTTP authentication</li>
                <li><strong>Cookie</strong>: Previously set cookies by the server with Set-Cookie</li>
              </ul>
            </div>
          </Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default HeadersAnalyzer;