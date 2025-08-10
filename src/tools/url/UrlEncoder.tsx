import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { TOOL_PANEL_CLASS } from '@design-system';
import { Tooltip } from '@design-system';

const clsx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(' ');

type EncodingMode = 'encode' | 'decode';
type EncodingMethod = 'encodeURIComponent' | 'encodeURI' | 'escape';

const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<EncodingMode>('encode');
  const [copied, setCopied] = useState<boolean>(false);
  const [method, setMethod] = useState<EncodingMethod>('encodeURIComponent');
  const [batchMode, setBatchMode] = useState<boolean>(false);
  
  // Process input when dependencies change with a small debounce for UX
  useEffect(() => {
    const t = setTimeout(() => {
      processInput();
    }, 250);
    return () => clearTimeout(t);
  }, [input, mode, method, batchMode]);
  
  // Reset copied state after 2 seconds
  React.useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  const processInput = () => {
    if (!input) {
      setOutput('');
      return;
    }
    
    try {
      if (mode === 'encode') {
        if (batchMode) {
          // Process each line separately
          const lines = input.split('\n');
          const encodedLines = lines.map(line => encodeByMethod(line, method));
          setOutput(encodedLines.join('\n'));
        } else {
          setOutput(encodeByMethod(input, method));
        }
      } else {
        if (batchMode) {
          // Process each line separately
          const lines = input.split('\n');
          const decodedLines = lines.map(line => decodeByMethod(line, method));
          setOutput(decodedLines.join('\n'));
        } else {
          setOutput(decodeByMethod(input, method));
        }
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`);
    }
  };
  
  const encodeByMethod = (text: string, method: EncodingMethod): string => {
    switch (method) {
      case 'encodeURIComponent':
        return encodeURIComponent(text);
      case 'encodeURI':
        return encodeURI(text);
      case 'escape':
        return escape(text);
      default:
        return encodeURIComponent(text);
    }
  };
  
  const decodeByMethod = (text: string, method: EncodingMethod): string => {
    try {
      switch (method) {
        case 'encodeURIComponent':
          return decodeURIComponent(text);
        case 'encodeURI':
          return decodeURI(text);
        case 'escape':
          return unescape(text);
        default:
          return decodeURIComponent(text);
      }
    } catch (error) {
      throw new Error(`Failed to decode "${text}". Please check if it's properly encoded.`);
    }
  };
  
  const handleCopyOutput = () => {
    if (!output) return;
    
    navigator.clipboard.writeText(output);
    setCopied(true);
  };
  
  const handleReset = () => {
    setInput('');
    setOutput('');
  };
  
  const toggleMode = () => {
    setMode(prev => prev === 'encode' ? 'decode' : 'encode');
  };
  
  // SEO metadata
  const pageTitle = 'URL Encoder / Decoder – Safe encodeURIComponent for URLs';
  const pageDescription =
    'Free online URL encoder and decoder. Encode special characters using encodeURIComponent or decode query parameters.';
  
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/url-encoder" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href="https://mydebugger.vercel.app/url-encoder" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">URL Encoder/Decoder</h1>
        <p className="text-gray-600 mb-8">
          Safely encode or decode URL components and query parameters.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Input Section */}
          <div className={`${TOOL_PANEL_CLASS} space-y-3`}>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex rounded-md overflow-hidden" role="tablist">
                <button
                  type="button"
                  onClick={() => setMode('encode')}
                  className={clsx(
                    'px-3 py-1 text-sm',
                    mode === 'encode'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
                  )}
                  role="tab"
                  aria-selected={mode === 'encode'}
                >
                  Encode
                </button>
                <button
                  type="button"
                  onClick={() => setMode('decode')}
                  className={clsx(
                    'px-3 py-1 text-sm',
                    mode === 'decode'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
                  )}
                  role="tab"
                  aria-selected={mode === 'decode'}
                >
                  Decode
                </button>
              </div>

              <div className="flex-1 min-w-[10rem]">
                <label htmlFor="method" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  <span className="flex items-center gap-1">
                    Encoding Method
                    <Tooltip content="encodeURIComponent for query values. encodeURI for full URLs. escape is legacy." className="ml-1">
                      <span className="cursor-help">ℹ️</span>
                    </Tooltip>
                  </span>
                </label>
                <select
                  id="method"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as EncodingMethod)}
                >
                  <option value="encodeURIComponent">encodeURIComponent</option>
                  <option value="encodeURI">encodeURI</option>
                  <option value="escape">escape</option>
                </select>
              </div>

              <label className="inline-flex items-center text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-500"
                  checked={batchMode}
                  onChange={(e) => setBatchMode(e.target.checked)}
                />
                <span className="ml-2 flex items-center gap-1">
                  Batch Mode
                  <Tooltip content="Process each line separately" className="ml-1">
                    <span className="cursor-help">ℹ️</span>
                  </Tooltip>
                </span>
              </label>
            </div>

            <textarea
              id="input"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-40"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'encode' ? 'Enter text to encode...' : 'Enter encoded text to decode...'
              }
              autoFocus
            />
            <div className="text-right text-xs text-gray-500">Length: {input.length}</div>
          </div>

          {/* Output Section */}
          <div className={`${TOOL_PANEL_CLASS} space-y-3`}>
            <div className="flex justify-between items-center">
              <h2 className="font-medium">Output</h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCopyOutput}
                  disabled={!output}
                  className={clsx(
                    'px-3 py-1 rounded-md text-sm transition',
                    output
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  )}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!input && !output}
                  className={clsx(
                    'px-3 py-1 rounded-md text-sm transition',
                    input || output
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  )}
                >
                  Reset
                </button>
              </div>
            </div>
            <textarea
              id="output"
              className="w-full rounded-md border-gray-300 bg-gray-50 dark:bg-gray-900 shadow-sm h-40 font-mono"
              value={output}
              readOnly
              placeholder="Result will appear here..."
            />
            <div className="text-right text-xs text-gray-500">Length: {output.length}</div>
          </div>
        </div>
        
        {/* Examples */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="font-medium mb-2">Common URL Characters to Encode</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Character</th>
                    <th className="text-left py-2">Encoded Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Space</td>
                    <td className="py-2 font-mono">%20</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">&</td>
                    <td className="py-2 font-mono">%26</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">=</td>
                    <td className="py-2 font-mono">%3D</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">?</td>
                    <td className="py-2 font-mono">%3F</td>
                  </tr>
                  <tr>
                    <td className="py-2">#</td>
                    <td className="py-2 font-mono">%23</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="font-medium mb-2">Sample URL Parameters</h3>
              <div className="mb-4">
                <p className="text-sm mb-1 font-medium">Original:</p>
                <div className="bg-gray-50 p-2 rounded text-sm font-mono break-all">
                  name=John Doe&query=search term&lang=en-US
                </div>
              </div>
              <div>
                <p className="text-sm mb-1 font-medium">Encoded:</p>
                <div className="bg-gray-50 p-2 rounded text-sm font-mono break-all">
                  name%3DJohn%20Doe%26query%3Dsearch%20term%26lang%3Den-US
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="font-medium mb-2">Try It</h3>
              <ul className="space-y-2 text-sm">
                {[
                  'https://example.com/search?q=hello world',
                  'name=John Doe&lang=en-US',
                  'path/to/page?param=one&x=2',
                ].map((ex) => (
                  <li key={ex}>
                    <button
                      type="button"
                      className="underline text-blue-600 hover:text-blue-800"
                      onClick={() => setInput(ex)}
                    >
                      {ex}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Methods Comparison */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Encoding Methods Compared</h2>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Method</th>
                  <th className="text-left py-2">Usage</th>
                  <th className="text-left py-2">Characters Preserved</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-mono">encodeURIComponent</td>
                  <td className="py-2">For encoding URL parameters and query values</td>
                  <td className="py-2">A-Z a-z 0-9 - _ . ! ~ * ' ( )</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">encodeURI</td>
                  <td className="py-2">For encoding a complete URL</td>
                  <td className="py-2">A-Z a-z 0-9 - _ . ! ~ * ' ( ) ; / ? : @ & = + $ , #</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono">escape</td>
                  <td className="py-2">Legacy method, not recommended</td>
                  <td className="py-2">A-Z a-z 0-9 * @ - _ + . /</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Learn More Section */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Learn More</h2>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <p className="mb-2">
              URL encoding converts characters into a format that can be safely transmitted over the Internet.
              Characters not allowed in URLs are replaced with a '%' followed by two hexadecimal digits.
            </p>
            <p className="mb-2">
              When to use URL encoding:
            </p>
            <ul className="list-disc pl-5 text-gray-700">
              <li className="mb-1">Query parameters in URLs</li>
              <li className="mb-1">Form submissions with special characters</li>
              <li className="mb-1">Storing data that may contain reserved characters</li>
            </ul>
            <a 
              href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center mt-3"
            >
              Read more about URL encoding on MDN
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Related Tools */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/jwt"
              className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="font-medium text-lg mb-1">JWT Decoder</h3>
              <p className="text-gray-600">Decode and verify JSON Web Tokens (JWT) instantly.</p>
            </a>
            <a
              href="/headers"
              className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="font-medium text-lg mb-1">HTTP Headers Analyzer</h3>
              <p className="text-gray-600">Analyze and understand HTTP request/response headers.</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default UrlEncoder;
