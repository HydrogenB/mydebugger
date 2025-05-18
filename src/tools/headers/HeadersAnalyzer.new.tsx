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
  const pageDescription = "Analyze HTTP headers from any website to understand their security configurations and functionality.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>
      
      <ToolLayout tool={tool!}>
        <div className="space-y-6">
          <Card isElevated>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                HTTP Headers Analyzer
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-blue-600 dark:text-blue-400 flex items-center"
                >
                  <span className="mr-1">
                    {showHistory ? 'Hide History' : 'Show History'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-sm text-blue-600 dark:text-blue-400 flex items-center"
                >
                  <span className="mr-1">
                    {showHelp ? 'Hide Help' : 'Help'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {showHistory && (
              <div className="mb-6">
                <HistoryList
                  history={history}
                  onSelect={selectHistoryItem}
                  onClear={clearHistoryEntries}
                />
              </div>
            )}
            
            {showHelp && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">
                  About HTTP Headers
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                  HTTP headers provide important information about requests and responses, including security settings,
                  caching directives, content information, and more.
                </p>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Key security headers to look for:</span>
                  <ul className="list-disc list-inside mt-1 ml-2">
                    <li>Strict-Transport-Security (HSTS)</li>
                    <li>Content-Security-Policy (CSP)</li>
                    <li>X-Frame-Options</li>
                    <li>X-Content-Type-Options</li>
                    <li>Permissions-Policy / Feature-Policy</li>
                  </ul>
                </div>
              </div>
            )}
            
            <UrlForm
              url={url}
              onUrlChange={setUrl}
              onSubmit={analyzeHeaders}
              isLoading={loading}
            />
            
            {error && (
              <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                      Error
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {loading && (
              <div className="flex justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              </div>
            )}
            
            {result && !loading && (
              <HeadersDisplay result={result} />
            )}
          </Card>
          
          <Card title="About HTTP Headers" isElevated>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                HTTP headers are key-value pairs sent in requests and responses between clients and servers.
                They provide important metadata about the communication and help control various aspects of web security and behavior.
              </p>
              
              <h3>Security Headers</h3>
              <p>
                Security headers help protect websites from common attacks like XSS, clickjacking, and information leakage:
              </p>
              <ul>
                <li>
                  <strong>Strict-Transport-Security (HSTS)</strong>: Forces browsers to use HTTPS for future requests
                </li>
                <li>
                  <strong>Content-Security-Policy (CSP)</strong>: Controls which resources can be loaded and executed
                </li>
                <li>
                  <strong>X-Frame-Options</strong>: Prevents your site from being embedded in frames (anti-clickjacking)
                </li>
                <li>
                  <strong>X-Content-Type-Options</strong>: Prevents MIME-type sniffing attacks
                </li>
                <li>
                  <strong>Permissions-Policy</strong>: Controls access to browser features like camera, microphone, etc.
                </li>
              </ul>
              
              <h3>Caching Headers</h3>
              <p>
                Caching headers control how responses are stored and reused:
              </p>
              <ul>
                <li>
                  <strong>Cache-Control</strong>: Directs browsers and CDNs how to cache content
                </li>
                <li>
                  <strong>ETag</strong>: Provides a version identifier for cached resources
                </li>
                <li>
                  <strong>Last-Modified</strong>: Indicates when the resource was last changed
                </li>
              </ul>
              
              <h3>CORS Headers</h3>
              <p>
                Cross-Origin Resource Sharing headers control how resources can be accessed from different domains:
              </p>
              <ul>
                <li>
                  <strong>Access-Control-Allow-Origin</strong>: Specifies which origins can access the resource
                </li>
                <li>
                  <strong>Access-Control-Allow-Methods</strong>: Indicates which HTTP methods are allowed
                </li>
                <li>
                  <strong>Access-Control-Allow-Headers</strong>: Lists permitted request headers
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default HeadersAnalyzer;
