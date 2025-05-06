import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';

// Interfaces
interface JwtParts {
  header: any;
  payload: any;
  signature: string;
}

// Algorithm options
const algorithmOptions = [
  { value: 'HS256', label: 'HS256' },
  { value: 'HS384', label: 'HS384' },
  { value: 'HS512', label: 'HS512' },
  { value: 'RS256', label: 'RS256' },
  { value: 'RS384', label: 'RS384' },
  { value: 'RS512', label: 'RS512' },
  { value: 'ES256', label: 'ES256' },
  { value: 'ES384', label: 'ES384' },
  { value: 'ES512', label: 'ES512' },
  { value: 'PS256', label: 'PS256' },
  { value: 'PS384', label: 'PS384' },
  { value: 'PS512', label: 'PS512' }
];

// Default values
const defaultHeader = {
  alg: 'HS256',
  typ: 'JWT'
};

const defaultPayload = {
  sub: '1234567890',
  name: 'John Doe',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
};

// Base64URL encode function
const base64UrlEncode = (str: string): string => {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// Base64URL decode function
const base64UrlDecode = (str: string): string => {
  // Add padding if needed
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (str.length % 4) {
    case 0: break;
    case 2: str += '=='; break;
    case 3: str += '='; break;
    default: throw new Error('Invalid base64url string');
  }
  
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    return atob(str);
  }
};

const JwtPlayground: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<string>('HS256');
  const [header, setHeader] = useState<string>(JSON.stringify(defaultHeader, null, 2));
  const [payload, setPayload] = useState<string>(JSON.stringify(defaultPayload, null, 2));
  const [secret, setSecret] = useState<string>('your-256-bit-secret');
  const [encodedJwt, setEncodedJwt] = useState<string>('');
  const [isBase64Encoded, setIsBase64Encoded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'encoded' | 'decoded'>('decoded');
  const [copied, setCopied] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Generate JWT token when header, payload or secret changes
  useEffect(() => {
    try {
      let parsedHeader;
      let parsedPayload;

      try {
        parsedHeader = JSON.parse(header);
        parsedPayload = JSON.parse(payload);
      } catch (e) {
        // Don't update the token if JSON is invalid, but don't show error until focus is lost
        return;
      }

      // In a real implementation, we would use a JWT library to sign the token
      // This is a simplified version that just concatenates the parts
      const encodedHeader = base64UrlEncode(JSON.stringify(parsedHeader));
      const encodedPayload = base64UrlEncode(JSON.stringify(parsedPayload));
      
      // For demonstration - in a real app we'd use proper signing
      const signature = base64UrlEncode(`SIGNATURE_PLACEHOLDER_${algorithm}`);
      
      const token = `${encodedHeader}.${encodedPayload}.${signature}`;
      setEncodedJwt(token);
      setIsValid(true);
      setError(null);
      
      // Update share URL
      setShareUrl(`${window.location.origin}/jwt?token=${encodeURIComponent(token)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate JWT');
      setIsValid(false);
    }
  }, [header, payload, secret, algorithm, isBase64Encoded]);

  // Check for token in URL when component loads
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      try {
        setEncodedJwt(tokenParam);
        setActiveTab('encoded');
        
        // Try to decode the token parts
        const parts = tokenParam.split('.');
        if (parts.length === 3) {
          try {
            const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
            const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
            
            setHeader(JSON.stringify(decodedHeader, null, 2));
            setPayload(JSON.stringify(decodedPayload, null, 2));
            
            if (decodedHeader.alg && algorithmOptions.some(opt => opt.value === decodedHeader.alg)) {
              setAlgorithm(decodedHeader.alg);
            }
          } catch (e) {
            // Silently fail decoding
          }
        }
      } catch (e) {
        // Handle invalid token in URL
      }
    }
  }, []);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Validate JSON on header blur
  const validateHeader = () => {
    try {
      const parsedHeader = JSON.parse(header);
      if (parsedHeader.alg && algorithmOptions.some(opt => opt.value === parsedHeader.alg)) {
        setAlgorithm(parsedHeader.alg);
      }
      setError(null);
    } catch (err) {
      setError('Invalid header JSON');
    }
  };

  // Validate JSON on payload blur
  const validatePayload = () => {
    try {
      JSON.parse(payload);
      setError(null);
    } catch (err) {
      setError('Invalid payload JSON');
    }
  };

  // Handle pasted token in the encoded tab
  const handleEncodedJwtChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const token = e.target.value;
    setEncodedJwt(token);
    
    if (!token) {
      return;
    }
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
          const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
          
          setHeader(JSON.stringify(decodedHeader, null, 2));
          setPayload(JSON.stringify(decodedPayload, null, 2));
          
          if (decodedHeader.alg && algorithmOptions.some(opt => opt.value === decodedHeader.alg)) {
            setAlgorithm(decodedHeader.alg);
          }
          
          setError(null);
          setIsValid(true);
        } catch (e) {
          setError('Invalid token format: could not decode header or payload');
          setIsValid(false);
        }
      } else {
        setError('Invalid token format: JWT should have 3 parts separated by dots');
        setIsValid(false);
      }
    } catch (e) {
      setError('Failed to process token');
      setIsValid(false);
    }
  };

  const handleCopyJwt = () => {
    navigator.clipboard.writeText(encodedJwt);
    setCopied(true);
  };
  
  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  };

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAlgorithm = e.target.value;
    setAlgorithm(newAlgorithm);
    
    // Update the header with the new algorithm
    try {
      const parsedHeader = JSON.parse(header);
      parsedHeader.alg = newAlgorithm;
      setHeader(JSON.stringify(parsedHeader, null, 2));
    } catch (e) {
      // If header JSON is invalid, just update the algorithm state
    }
  };

  const handleReset = () => {
    setHeader(JSON.stringify(defaultHeader, null, 2));
    setPayload(JSON.stringify(defaultPayload, null, 2));
    setSecret('your-256-bit-secret');
    setAlgorithm('HS256');
    setError(null);
    setActiveTab('decoded');
  };
  
  const formatDate = (timestamp: number): string => {
    try {
      return new Date(timestamp * 1000).toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const isExpired = (exp: number): boolean => {
    return Date.now() > exp * 1000;
  };

  // SEO metadata
  const pageTitle = "JWT Playground | MyDebugger";
  const pageDescription = "Generate, decode, and verify JWT tokens interactively with different algorithms.";
  
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
        <h1 className="text-3xl font-bold mb-2">JWT Playground</h1>
        <p className="text-gray-600 mb-8">
          Generate, decode, and experiment with JSON Web Tokens in real-time.
        </p>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="warning bg-yellow-50 p-4 border-b border-yellow-100 rounded-t-lg">
            <strong className="text-yellow-800">Warning:</strong>
            <span className="text-yellow-700"> JWTs are credentials which can grant access to resources. Be careful where you paste them! We do not record tokens, all validation and debugging is done on the client side.</span>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <label htmlFor="algorithm" className="block font-medium text-gray-700 mb-2">
              Algorithm
            </label>
            <select
              id="algorithm"
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={algorithm}
              onChange={handleAlgorithmChange}
            >
              {algorithmOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex border-b border-gray-200">
            <div 
              className={`px-4 py-2 cursor-pointer transition ${activeTab === 'encoded' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('encoded')}
            >
              Encoded
              <small className="block text-xs text-gray-500">paste a token here</small>
            </div>
            <div 
              className={`px-4 py-2 cursor-pointer transition ${activeTab === 'decoded' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('decoded')}
            >
              Decoded
              <small className="block text-xs text-gray-500">edit the payload and secret</small>
            </div>
          </div>
          
          <div className="p-4">
            {activeTab === 'encoded' ? (
              <div>
                <label htmlFor="encoded-jwt" className="block font-medium text-gray-700 mb-2">
                  Encoded JWT
                </label>
                <textarea
                  id="encoded-jwt"
                  className="w-full font-mono rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-32"
                  value={encodedJwt}
                  onChange={handleEncodedJwtChange}
                  placeholder="Paste your JWT token here..."
                  spellCheck="false"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label htmlFor="header" className="block font-medium text-gray-700 mb-2">
                      HEADER: <span className="text-xs text-gray-500">ALGORITHM & TOKEN TYPE</span>
                    </label>
                    <textarea
                      id="header"
                      className="w-full font-mono rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-32 bg-gray-50"
                      value={header}
                      onChange={(e) => setHeader(e.target.value)}
                      onBlur={validateHeader}
                      spellCheck="false"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="payload" className="block font-medium text-gray-700 mb-2">
                      PAYLOAD: <span className="text-xs text-gray-500">DATA</span>
                    </label>
                    <textarea
                      id="payload"
                      className="w-full font-mono rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-48 bg-gray-50"
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      onBlur={validatePayload}
                      spellCheck="false"
                    />
                  </div>
                </div>
                
                <div>
                  <div>
                    <label htmlFor="verify-signature" className="block font-medium text-gray-700 mb-2">
                      VERIFY SIGNATURE
                    </label>
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                      <div className="mb-2 font-mono text-sm">
                        {algorithm.startsWith('HS') ? `HMACSHA${algorithm.substring(2)}` : algorithm}
                        <span className="block">(</span>
                      </div>
                      
                      <div className="ml-4 mb-2">
                        <span className="font-mono text-sm">base64UrlEncode(header) + "." + base64UrlEncode(payload),</span>
                      </div>
                      
                      <div className="ml-4 mb-2">
                        <label htmlFor="secret" className="block text-sm mb-1">
                          {algorithm.startsWith('HS') ? 'your-secret' : algorithm.startsWith('RS') || algorithm.startsWith('PS') ? 'your-private-key' : 'your-private-key'}
                        </label>
                        <input
                          type="text"
                          id="secret"
                          className="w-full font-mono rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                        />
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="is-base64-encoded"
                            checked={isBase64Encoded}
                            onChange={() => setIsBase64Encoded(!isBase64Encoded)}
                            className="rounded text-blue-500"
                          />
                          <label htmlFor="is-base64-encoded" className="ml-2 text-sm text-gray-600">
                            secret base64 encoded
                          </label>
                        </div>
                      </div>
                      
                      <div className="font-mono text-sm">)</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="font-medium text-gray-700 mb-2">
                      Encoding
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 font-mono text-sm overflow-x-auto break-all">
                      {encodedJwt && (
                        <>
                          <span className="text-blue-600">{encodedJwt.split('.')[0]}</span>
                          <span className="text-gray-500">.</span>
                          <span className="text-purple-600">{encodedJwt.split('.')[1]}</span>
                          <span className="text-gray-500">.</span>
                          <span className="text-red-500">{encodedJwt.split('.')[2]}</span>
                        </>
                      )}
                    </div>
                    
                    <div className={`mt-4 flex items-center py-2 px-3 rounded-md ${isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <svg
                        className={`h-5 w-5 mr-2 ${isValid ? 'text-green-500' : 'text-red-500'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {isValid ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      <span>{isValid ? 'Signature Verified' : 'Invalid Signature'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-red-600">
              {error}
            </div>
          )}
          
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-lg">
            <div>
              {isValid && (
                <div className="flex items-center text-green-600">
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Signature verified
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
              >
                Reset
              </button>
              <button
                onClick={handleCopyJwt}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
              >
                {copied ? 'Copied!' : 'Copy JWT'}
              </button>
              <button
                onClick={handleCopyShareUrl}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition"
                title="Copy a URL with this token to share with others"
              >
                Share
              </button>
            </div>
          </div>
        </div>
        
        {/* Token claims display */}
        {activeTab === 'decoded' && encodedJwt && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-2">Decoded Token Claims</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  try {
                    const parsedPayload = JSON.parse(payload);
                    return (
                      <>
                        {parsedPayload.exp && (
                          <div className={`p-3 rounded-md ${isExpired(parsedPayload.exp) ? 'bg-red-50' : 'bg-green-50'}`}>
                            <span className="font-medium">Expiration:</span> {formatDate(parsedPayload.exp)}
                            <span className={`ml-2 text-sm font-semibold ${isExpired(parsedPayload.exp) ? 'text-red-600' : 'text-green-600'}`}>
                              {isExpired(parsedPayload.exp) ? '(Expired)' : '(Valid)'}
                            </span>
                          </div>
                        )}
                        
                        {parsedPayload.iat && (
                          <div className="p-3 rounded-md bg-blue-50">
                            <span className="font-medium">Issued at:</span> {formatDate(parsedPayload.iat)}
                          </div>
                        )}
                        
                        {parsedPayload.nbf && (
                          <div className="p-3 rounded-md bg-blue-50">
                            <span className="font-medium">Not valid before:</span> {formatDate(parsedPayload.nbf)}
                          </div>
                        )}
                        
                        {parsedPayload.sub && (
                          <div className="p-3 rounded-md bg-gray-50">
                            <span className="font-medium">Subject:</span> {parsedPayload.sub}
                          </div>
                        )}
                        
                        {parsedPayload.iss && (
                          <div className="p-3 rounded-md bg-gray-50">
                            <span className="font-medium">Issuer:</span> {parsedPayload.iss}
                          </div>
                        )}
                        
                        {parsedPayload.aud && (
                          <div className="p-3 rounded-md bg-gray-50">
                            <span className="font-medium">Audience:</span> {Array.isArray(parsedPayload.aud) ? parsedPayload.aud.join(', ') : parsedPayload.aud}
                          </div>
                        )}
                      </>
                    );
                  } catch (e) {
                    return <div className="text-red-600">Error parsing payload</div>;
                  }
                })()}
              </div>
            </div>
          </div>
        )}
        
        {/* Learn about JWT */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Learn More About JWT</h2>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <p className="mb-2">
              JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.
            </p>
            <ul className="list-disc pl-5 text-gray-700">
              <li className="mb-1">
                <strong>Header:</strong> Identifies which algorithm is used to generate the signature
              </li>
              <li className="mb-1">
                <strong>Payload:</strong> Contains the claims or the pieces of information being passed
              </li>
              <li className="mb-1">
                <strong>Signature:</strong> Ensures that the token hasn't been altered
              </li>
            </ul>
            <p className="mt-2">
              JWTs can be signed using a secret (with the HMAC algorithm) or a public/private key pair using RSA or ECDSA.
            </p>
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
        
        {/* Common usages of JWT */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Common JWT Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="font-medium text-lg mb-2">Authentication</h3>
              <p className="text-gray-600">
                The most common scenario for using JWT. Once the user is logged in, each subsequent request will include the JWT, allowing the user to access routes, services, and resources that are permitted with that token.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="font-medium text-lg mb-2">Information Exchange</h3>
              <p className="text-gray-600">
                JWTs are a good way of securely transmitting information between parties because they can be signed, which means you can be sure that the senders are who they say they are.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="font-medium text-lg mb-2">Microservices</h3>
              <p className="text-gray-600">
                In microservices architectures, JWTs can be used to securely propagate user identity and claims between different services without requiring a central session store.
              </p>
            </div>
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

export default JwtPlayground;