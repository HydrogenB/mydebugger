import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import { Card } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import { LoadingSpinner } from '../../design-system/components/feedback';

interface ValidationResult {
  url: string;
  headers: {
    'x-frame-options'?: string;
    'content-security-policy'?: string;
    'frame-ancestors'?: string;
  };
  canBeFramed: boolean;
  frameLoaded: boolean;
  statusCode?: number;
  statusText?: string;
  message?: string;
  timestamp: Date;
}

const ClickJackingValidator: React.FC = () => {
  const tool = getToolByRoute('/clickjacking');
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ValidationResult | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [iframeError, setIframeError] = useState<boolean>(false);
  
  // SEO metadata
  const pageTitle = "Click Jacking Validator | MyDebugger";
  const pageDescription = "Test if a website is vulnerable to click jacking attacks by examining headers and framing capability.";

  // Helper function to check if URL is valid
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Add protocol if missing
  const formatUrl = (urlString: string): string => {
    if (!urlString) return '';
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      return `https://${urlString}`;
    }
    return urlString;
  };

  // Validate the website for click jacking vulnerabilities
  const validateWebsite = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setIframeLoaded(false);
    setIframeError(false);

    const formattedUrl = formatUrl(url);
    
    if (!isValidUrl(formattedUrl)) {
      setError('Please enter a valid URL');
      setLoading(false);
      return;
    }

    try {
      // Use our serverless API endpoint to check for clickjacking protections
      const apiUrl = `/api/clickjacking-analysis?url=${encodeURIComponent(formattedUrl)}`;
      
      // Initialize result object
      const result: ValidationResult = {
        url: formattedUrl,
        headers: {},
        canBeFramed: true, // Default to true, will be updated based on API response
        frameLoaded: false,
        timestamp: new Date()
      };
      
      // Call the API to get proper server-side header analysis
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }
      
      const analysis = await response.json();
      
      // Update the result with the server's analysis
      result.statusCode = analysis.status;
      result.statusText = analysis.statusText;
      
      // Extract security headers from analysis
      if (analysis.headers['x-frame-options']) {
        result.headers['x-frame-options'] = analysis.headers['x-frame-options'];
      }
      
      if (analysis.headers['content-security-policy']) {
        result.headers['content-security-policy'] = analysis.headers['content-security-policy'];
      }
      
      // Extract frame-ancestors directive if available
      if (analysis.clickjackingProtection && analysis.clickjackingProtection.frameAncestorsValue) {
        result.headers['frame-ancestors'] = analysis.clickjackingProtection.frameAncestorsValue;
      }
      
      // Update protection status based on the server-side analysis
      result.canBeFramed = !analysis.clickjackingProtection.protected;
      
      // Update message with details about the protection mechanism
      if (!result.canBeFramed) {
        if (analysis.clickjackingProtection.hasXFrameOptions) {
          result.message = `X-Frame-Options header is set to ${analysis.headers['x-frame-options']}`;
        } else if (analysis.clickjackingProtection.hasCSPProtection) {
          result.message = `Content-Security-Policy header restricts framing with: ${analysis.clickjackingProtection.frameAncestorsValue}`;
        } else {
          result.message = 'Site is protected against clickjacking';
        }
      } else if (analysis.recommendations && analysis.recommendations.length) {
        result.message = `Recommendations: ${analysis.recommendations.join('; ')}`;
      }
      
      setResults(result);
    } catch (error) {
      setError(`Error validating website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    if (results) {
      setResults({
        ...results,
        frameLoaded: true
      });
    }
  };

  // Handle iframe error event
  const handleIframeError = () => {
    setIframeError(true);
    if (results) {
      // If the iframe fails to load, it indicates clickjacking protection
      setResults({
        ...results,
        frameLoaded: false,
        canBeFramed: false, // Update to show as protected when iframe fails to load
        message: results.message || 'Website refused to load in iframe. This indicates clickjacking protection is in place.'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateWebsite();
    }
  };
  
  const reset = () => {
    setUrl('');
    setResults(null);
    setError(null);
    setIframeLoaded(false);
    setIframeError(false);
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/clickjacking" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href="https://mydebugger.vercel.app/clickjacking" />
      </Helmet>
      
      <ToolLayout tool={tool!}>
        <div className="space-y-6">
          <Card isElevated>
            <div className="space-y-4">
              <div>
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enter website URL to check for click jacking vulnerabilities
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
                    onClick={validateWebsite}
                    isLoading={loading}
                    disabled={loading || !url}
                    className="rounded-l-none"
                  >
                    Check
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter a URL to check if it's vulnerable to click jacking attacks
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
              
              {results && !loading && (
                <div className="animate-fade-in space-y-6">
                  {/* Results Summary */}
                  <div className="p-4 rounded-md border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-lg mb-3 text-gray-800 dark:text-gray-200">Summary</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">URL</span>
                          <a 
                            href={results.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 text-sm"
                          >
                            Visit Site ↗
                          </a>
                        </div>
                        <div className="mt-1 text-sm break-all">{results.url}</div>
                      </div>
                      
                      <div className={`p-3 rounded-md ${results.canBeFramed ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                        <div className="flex items-center">
                          <span className="font-medium">Click Jacking Protection</span>
                          {results.canBeFramed ? (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full">
                              Vulnerable
                            </span>
                          ) : (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                              Protected
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm">
                          {results.canBeFramed ? 
                            'This site may be vulnerable to click jacking attacks' : 
                            'This site is protected against click jacking'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Headers Information */}
                    <div className="mt-4">
                      <h4 className="font-medium text-md mb-2 text-gray-800 dark:text-gray-200">Security Headers</h4>
                      
                      <div className="space-y-3">
                        {/* X-Frame-Options Header */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">X-Frame-Options</span>
                            {results.headers['x-frame-options'] ? (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                                Present
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
                                Missing
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm">
                            {results.headers['x-frame-options'] || 'Not specified'}
                            {!results.headers['x-frame-options'] && (
                              <p className="text-xs mt-1 text-yellow-600 dark:text-yellow-400">
                                Recommendation: Add X-Frame-Options header with value "DENY" or "SAMEORIGIN"
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Content-Security-Policy / frame-ancestors */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">CSP frame-ancestors</span>
                            {results.headers['frame-ancestors'] ? (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                                Present
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
                                Missing
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm">
                            {results.headers['frame-ancestors'] || 'Not specified'}
                            {!results.headers['frame-ancestors'] && (
                              <p className="text-xs mt-1 text-yellow-600 dark:text-yellow-400">
                                Recommendation: Add Content-Security-Policy header with frame-ancestors directive set to "'none'" or "'self'"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* iframe Test */}
                  <div className="p-4 rounded-md border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-lg mb-3 text-gray-800 dark:text-gray-200">iframe Test</h3>
                    
                    <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      This test attempts to load the website in an iframe. If the website has click jacking protection, the iframe should not display content.
                    </div>
                    
                    <div className="relative rounded-md overflow-hidden border border-gray-300 dark:border-gray-600" style={{height: '400px'}}>
                      {loading ? (
                        <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800">
                          <LoadingSpinner />
                        </div>
                      ) : (
                        <>
                          <iframe
                            ref={iframeRef}
                            src={results.url}
                            className="w-full h-full"
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            sandbox="allow-same-origin allow-scripts"
                            title="Click Jacking Test"
                          />
                          {iframeError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 dark:bg-gray-800/90">
                              <div className="text-center p-4">
                                <div className="text-red-500 dark:text-red-400 mb-2">
                                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Failed to load content</h4>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  The website could not be loaded in an iframe, which may indicate click jacking protection.
                                </p>
                              </div>
                            </div>
                          )}
                          {!iframeError && iframeLoaded && (
                            <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-sm">
                              This website can be embedded in iframes (potentially vulnerable to click jacking)
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {results && (
                <div className="flex justify-center pt-2">
                  <Button onClick={reset} variant="light">Test Another Site</Button>
                </div>
              )}
            </div>
          </Card>
          
          <Card title="About Click Jacking" isElevated>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                Click jacking is a malicious technique where an attacker tricks a user into clicking something different from what they perceive, potentially causing them to perform unintended actions.
              </p>
              
              <h3>How Click Jacking Works</h3>
              <p>
                In a typical click jacking attack, the attacker loads the target website in a transparent iframe and overlays it with their own content. When users think they are clicking on the visible content, they are actually clicking on elements in the invisible, target website.
              </p>
              
              <h3>Protection Methods</h3>
              <ul>
                <li>
                  <strong>X-Frame-Options Header:</strong> Prevents a webpage from being displayed in a frame. Values include:
                  <ul>
                    <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">DENY</code> - prevents any domain from framing the content</li>
                    <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">SAMEORIGIN</code> - allows framing by the same site</li>
                    <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">ALLOW-FROM uri</code> - permits specified origins to frame</li>
                  </ul>
                </li>
                <li>
                  <strong>Content Security Policy (frame-ancestors):</strong> Modern alternative to X-Frame-Options that provides more flexibility. Examples:
                  <ul>
                    <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">frame-ancestors 'none'</code> - prevents any framing</li>
                    <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">frame-ancestors 'self'</code> - allows same-origin framing only</li>
                  </ul>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default ClickJackingValidator;