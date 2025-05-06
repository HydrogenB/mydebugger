import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

type EncodingMode = 'encode' | 'decode';

const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<EncodingMode>('encode');
  const [copied, setCopied] = useState<boolean>(false);
  
  // Process input when mode or input changes
  React.useEffect(() => {
    processInput();
  }, [input, mode]);
  
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
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`);
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
  const pageTitle = "URL Encoder/Decoder | MyDebugger";
  const pageDescription = "Encode or decode URL components and query parameters safely.";
  
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
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Input Section */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="input" className="block font-medium text-gray-700">
                Input
              </label>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Mode:</span>
                <button
                  onClick={toggleMode}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm transition flex items-center"
                >
                  {mode === 'encode' ? (
                    <>Encode <span className="ml-1">→</span></>
                  ) : (
                    <>Decode <span className="ml-1">→</span></>
                  )}
                </button>
              </div>
            </div>
            <textarea
              id="input"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-40"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' 
                ? 'Enter text to encode...' 
                : 'Enter URL encoded text to decode...'}
              autoFocus
            />
          </div>
          
          {/* Output Section */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="output" className="block font-medium text-gray-700">
                Output
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyOutput}
                  disabled={!output}
                  className={`px-3 py-1 rounded-md text-sm transition ${
                    output
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={!input && !output}
                  className={`px-3 py-1 rounded-md text-sm transition ${
                    input || output
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Reset
                </button>
              </div>
            </div>
            <textarea
              id="output"
              className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm h-40"
              value={output}
              readOnly
              placeholder="Result will appear here..."
            />
          </div>
        </div>
        
        {/* Examples */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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