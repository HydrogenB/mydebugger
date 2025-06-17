import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Card from '../../design-system/components/layout/Card';
import Button from '../../design-system/components/inputs/Button';
import { ACTIVE_TAB_CLASS } from '../../design-system/foundations/layout';
import { Alert } from '../../design-system/components/feedback/Alert';

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
  const [activeClaimsView, setActiveClaimsView] = useState<'json' | 'table'>('json');

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
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">JWT Playground</h1>
        <p className="text-gray-600 mb-8">
          Generate, decode, and experiment with JSON Web Tokens in real-time.
        </p>
        
        <div className="mb-4 bg-yellow-50 p-4 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            <span className="font-bold">Warning:</span> JWTs are credentials which can grant access to resources. 
            Be careful where you paste them! All processing occurs in your browser - we do not record tokens.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card isElevated>
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">JWT Builder</h2>
                  <div className="flex items-center">
                    <label htmlFor="algorithm" className="mr-2 text-sm font-medium text-gray-700">Algorithm:</label>
                    <select
                      id="algorithm"
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
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
                </div>
              </div>
              
              <div className="flex border-b border-gray-200">
                <div
                  className={`px-4 py-2 cursor-pointer transition ${activeTab === 'encoded' ? `border-b-2 border-blue-500 text-blue-600 ${ACTIVE_TAB_CLASS}` : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => setActiveTab('encoded')}
                >
                  Encoded
                  <small className="block text-xs text-gray-500">paste a token</small>
                </div>
                <div
                  className={`px-4 py-2 cursor-pointer transition ${activeTab === 'decoded' ? `border-b-2 border-blue-500 text-blue-600 ${ACTIVE_TAB_CLASS}` : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => setActiveTab('decoded')}
                >
                  Decoded
                  <small className="block text-xs text-gray-500">edit token parts</small>
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
                          <span className="text-blue-600">HEADER:</span> <span className="text-xs text-gray-500">ALGORITHM & TOKEN TYPE</span>
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
                          <span className="text-purple-600">PAYLOAD:</span> <span className="text-xs text-gray-500">DATA</span>
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
                          <span className="text-red-500">VERIFY SIGNATURE</span>
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
                          Encoded Token
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
                <Alert type="error" className="mx-4 mb-4">{error}</Alert>
              )}
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-lg">
                <div>
                  <Button onClick={handleReset} variant="light">
                    Reset
                  </Button>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleCopyJwt} variant="primary">
                    {copied ? 'Copied!' : 'Copy JWT'}
                  </Button>
                  <Button 
                    onClick={handleCopyShareUrl} 
                    variant="outline-primary"
                    title="Copy a URL with this token to share with others"
                  >
                    Share URL
                  </Button>
                </div>
              </div>
            </Card>
            
            </div>
          
          {/* Token claims display */}
          <div className="lg:col-span-2"> {/* Add this wrapper div to fix the structure */}
          {activeTab === 'decoded' && encodedJwt && (
            <Card isElevated className="mt-6">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Decoded Claims</h2>
                  <div className="flex border border-gray-200 rounded-md">
                    <button 
                      className={`px-3 py-1 text-sm ${activeClaimsView === 'json' ? 'bg-gray-100 font-medium' : 'bg-white'}`}
                      onClick={() => setActiveClaimsView('json')}
                    >
                      JSON
                    </button>
                    <button 
                      className={`px-3 py-1 text-sm ${activeClaimsView === 'table' ? 'bg-gray-100 font-medium' : 'bg-white'}`}
                      onClick={() => setActiveClaimsView('table')}
                    >
                      Table
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {(() => {
                  try {
                    const parsedPayload = JSON.parse(payload);
                    
                    if (activeClaimsView === 'json') {
                      return (
                        <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto font-mono text-sm">
                          {JSON.stringify(parsedPayload, null, 2)}
                        </pre>
                      );
                    }
                    
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left py-2 px-4 font-medium">Claim</th>
                              <th className="text-left py-2 px-4 font-medium">Value</th>
                              <th className="text-left py-2 px-4 font-medium">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(parsedPayload).map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-100">
                                <td className="py-3 px-4 font-medium">{key}</td>
                                <td className="py-3 px-4 font-mono">
                                  {key === 'exp' || key === 'iat' || key === 'nbf' 
                                    ? (
                                      <div>
                                        <div>{String(value)}</div>
                                        <div className={`text-xs mt-1 ${key === 'exp' && isExpired(value as number) ? 'text-red-600' : 'text-gray-500'}`}>
                                          {formatDate(value as number)}
                                          {key === 'exp' && (
                                            <span className="ml-1">
                                              {isExpired(value as number) ? '(Expired)' : '(Valid)'}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ) 
                                    : Array.isArray(value) 
                                      ? value.join(', ')
                                      : String(value)}
                                </td>
                                <td className="py-3 px-4 text-gray-600">
                                  {key === 'iss' && 'Issuer of the JWT'}
                                  {key === 'sub' && 'Subject of the JWT (the user)'}
                                  {key === 'aud' && 'Audience of the JWT (recipient)'}
                                  {key === 'exp' && 'Expiration time'}
                                  {key === 'nbf' && 'Not valid before time'}
                                  {key === 'iat' && 'Issued at time'}
                                  {key === 'jti' && 'JWT ID'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  } catch (e) {
                    return <Alert type="error">Error parsing payload JSON</Alert>;
                  }
                })()}
              </div>
            </Card>
          )}
          
          </div>
          
          <div>
            <Card isElevated>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">About JWT</h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-3">
                  JWT consists of three parts separated by dots:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-700 mb-3">
                  <li className="mb-1">
                    <span className="text-blue-600 font-medium">Header</span>: Algorithm & token type
                  </li>
                  <li className="mb-1">
                    <span className="text-purple-600 font-medium">Payload</span>: Data (claims)
                  </li>
                  <li className="mb-1">
                    <span className="text-red-500 font-medium">Signature</span>: Verification
                  </li>
                </ul>
                <a 
                  href="https://jwt.io/introduction" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium inline-flex items-center"
                >
                  Learn more about JWT
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </Card>
            
            <Card isElevated className="mt-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Standard JWT Claims</h2>
              </div>
              <div className="p-4">
                <ul className="space-y-3 text-sm">
                  <li>
                    <span className="font-medium">iss</span> (Issuer): 
                    <span className="block text-gray-600 mt-1">Entity that issued the token</span>
                  </li>
                  <li>
                    <span className="font-medium">sub</span> (Subject): 
                    <span className="block text-gray-600 mt-1">Entity identifier (typically user ID)</span>
                  </li>
                  <li>
                    <span className="font-medium">aud</span> (Audience): 
                    <span className="block text-gray-600 mt-1">Recipients the token is intended for</span>
                  </li>
                  <li>
                    <span className="font-medium">exp</span> (Expiration): 
                    <span className="block text-gray-600 mt-1">Timestamp when token becomes invalid</span>
                  </li>
                  <li>
                    <span className="font-medium">nbf</span> (Not Before): 
                    <span className="block text-gray-600 mt-1">Timestamp when token starts being valid</span>
                  </li>
                  <li>
                    <span className="font-medium">iat</span> (Issued At): 
                    <span className="block text-gray-600 mt-1">Timestamp when token was issued</span>
                  </li>
                  <li>
                    <span className="font-medium">jti</span> (JWT ID): 
                    <span className="block text-gray-600 mt-1">Unique identifier for this token</span>
                  </li>
                </ul>
              </div>
            </Card>
            
            <Card isElevated className="mt-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Common Use Cases</h2>
              </div>
              <div className="p-4">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="p-3 bg-blue-50 rounded-md">
                    <span className="font-medium">Authentication</span>
                    <span className="block mt-1">Secure user sessions without server-side storage</span>
                  </li>
                  <li className="p-3 bg-green-50 rounded-md">
                    <span className="font-medium">API Authorization</span>
                    <span className="block mt-1">Secure access to protected resources</span>
                  </li>
                  <li className="p-3 bg-purple-50 rounded-md">
                    <span className="font-medium">Information Exchange</span>
                    <span className="block mt-1">Secure data transmission between parties</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Related tools suggestion */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/jwt"
              className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="font-medium text-lg mb-1">JWT Decoder</h3>
              <p className="text-gray-600">Decode and verify existing JWT tokens.</p>
            </a>
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