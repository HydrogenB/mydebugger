import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface JwtParts {
  header: any;
  payload: any;
  signature: string;
}

const JwtDecoder: React.FC = () => {
  const [jwtToken, setJwtToken] = useState<string>('');
  const [decoded, setDecoded] = useState<JwtParts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Decode JWT token when it changes
  useEffect(() => {
    if (!jwtToken) {
      setDecoded(null);
      setError(null);
      return;
    }
    
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected three parts separated by dots.');
      }
      
      const decoded: JwtParts = {
        header: JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))),
        payload: JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))),
        signature: parts[2]
      };
      
      setDecoded(decoded);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT');
      setDecoded(null);
    }
  }, [jwtToken]);
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  const handleCopyResult = () => {
    if (!decoded) return;
    
    const formattedResult = JSON.stringify({
      header: decoded.header,
      payload: decoded.payload,
      signature: decoded.signature
    }, null, 2);
    
    navigator.clipboard.writeText(formattedResult);
    setCopied(true);
  };
  
  const handleReset = () => {
    setJwtToken('');
    setDecoded(null);
    setError(null);
  };
  
  // SEO metadata
  const pageTitle = "JWT Decoder | MyDebugger";
  const pageDescription = "Decode JWT tokens online instantly. Copy result or validate signature.";
  
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/jwt" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href="https://mydebugger.vercel.app/jwt" />
      </Helmet>
    
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">JWT Decoder</h1>
        <p className="text-gray-600 mb-8">
          Decode and verify JSON Web Tokens (JWT) instantly.
        </p>
        
        <div className="mb-6">
          <label htmlFor="jwt-input" className="block font-medium text-gray-700 mb-2">
            Enter JWT Token
          </label>
          <textarea
            id="jwt-input"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-32"
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
            placeholder="Paste your JWT token here..."
            autoFocus
          />
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}
        
        {decoded && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Decoded JWT</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyResult}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Header</h3>
                <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Payload</h3>
                <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2">Signature</h3>
                <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                  <code className="text-sm font-mono break-all">{decoded.signature}</code>
                </div>
              </div>
            </div>
            
            {/* Token expiration information */}
            {decoded.payload.exp && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-medium text-gray-800 mb-1">Expiration</h3>
                <p>
                  {new Date(decoded.payload.exp * 1000).toLocaleString()}
                  {Date.now() > decoded.payload.exp * 1000 ? (
                    <span className="text-red-600 font-medium ml-2">Expired</span>
                  ) : (
                    <span className="text-green-600 font-medium ml-2">Valid</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Learn More</h2>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <p className="mb-2">
              JWT (JSON Web Token) is an open standard (RFC 7519) for securely transmitting information between parties as a JSON object.
            </p>
            <ul className="list-disc pl-5 text-gray-700">
              <li className="mb-1">
                <strong>Header:</strong> Contains the type of token and the signing algorithm
              </li>
              <li className="mb-1">
                <strong>Payload:</strong> Contains the claims (statements about an entity)
              </li>
              <li className="mb-1">
                <strong>Signature:</strong> Used to verify that the sender of the token is who it says it is
              </li>
            </ul>
            <a 
              href="https://jwt.io/introduction" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center mt-3"
            >
              Read more about JWT
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Related tools suggestion */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/url-encoder"
              className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="font-medium text-lg mb-1">URL Encoder/Decoder</h3>
              <p className="text-gray-600">Encode or decode URL components safely.</p>
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

export default JwtDecoder;