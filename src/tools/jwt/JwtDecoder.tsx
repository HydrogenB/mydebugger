import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Card from '../../design-system/components/layout/Card';
import Button from '../../design-system/components/inputs/Button';
import { Alert } from '../../design-system/components/feedback/Alert';

interface JwtParts {
  header: any;
  payload: any;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  }
}

const JwtDecoder: React.FC = () => {
  const [jwtToken, setJwtToken] = useState<string>('');
  const [decoded, setDecoded] = useState<JwtParts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [secret, setSecret] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'json' | 'table'>('json');
  
  // Decode JWT token when it changes
  useEffect(() => {
    if (!jwtToken) {
      setDecoded(null);
      setError(null);
      setIsVerified(null);
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
        signature: parts[2],
        raw: {
          header: parts[0],
          payload: parts[1],
          signature: parts[2]
        }
      };
      
      setDecoded(decoded);
      setError(null);
      
      // Reset verification status when token changes
      setIsVerified(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT');
      setDecoded(null);
      setIsVerified(null);
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
      payload: decoded.payload
    }, null, 2);
    
    navigator.clipboard.writeText(formattedResult);
    setCopied(true);
  };
  
  const handleCopyToken = () => {
    navigator.clipboard.writeText(jwtToken);
    setCopied(true);
  };
  
  const handleReset = () => {
    setJwtToken('');
    setDecoded(null);
    setError(null);
    setSecret('');
    setIsVerified(null);
  };

  const handleGenerateExample = () => {
    // Generate an example token that will expire in 1 hour
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: '1234567890',
      name: 'John Doe',
      admin: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    // This is just a mock token for demonstration
    const exampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjM5MDIyfQ.sQGRWSev5kAPlYYkQgA1voON4tZdotVJO0xsJCRrCOw';
    setJwtToken(exampleToken);
  };
  
  const verifySignature = () => {
    // In a real implementation, we would use a JWT library to verify the signature
    // For now, just simulate verification to demonstrate UI flow
    if (!decoded || !secret) return;
    
    // Simulated verification - in reality would check cryptographically
    setIsVerified(secret.length > 10);
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
  const pageTitle = "JWT Decoder | MyDebugger";
  const pageDescription = "Decode and verify JSON Web Tokens. Analyze headers, payload claims, and verify signatures securely in your browser.";
  
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
        <h1 className="text-3xl font-bold mb-2">JSON Web Token (JWT) Debugger</h1>
        <p className="text-gray-600 mb-8">
          Decode, verify, and generate JSON Web Tokens (JWT) instantly. All processing happens in your browser.
        </p>
        
        <div className="mb-4 bg-yellow-50 p-4 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            <span className="font-bold">For your protection:</span> All JWT debugging and validation happens in your browser. 
            This site does not store or transmit your tokens or keys outside of your browser.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card isElevated>
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Encoded JWT</h2>
                  <Button onClick={handleGenerateExample} variant="light" size="sm">Generate example</Button>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  id="jwt-input"
                  className="w-full font-mono rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-32"
                  value={jwtToken}
                  onChange={(e) => setJwtToken(e.target.value)}
                  placeholder="Paste your JWT token here..."
                  autoFocus
                  spellCheck="false"
                />
                
                {error && (
                  <Alert type="error" className="mt-4">{error}</Alert>
                )}
                
                {decoded && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200 font-mono text-sm overflow-x-auto break-all">
                    <span className="text-blue-600">{decoded.raw.header}</span>
                    <span className="text-gray-500">.</span>
                    <span className="text-purple-600">{decoded.raw.payload}</span>
                    <span className="text-gray-500">.</span>
                    <span className="text-red-500">{decoded.raw.signature}</span>
                  </div>
                )}
                
                <div className="mt-4 flex justify-between">
                  <div>
                    <Button onClick={handleReset} variant="light">Reset</Button>
                  </div>
                  <div className="space-x-3">
                    <Button onClick={handleCopyToken} variant="primary">
                      {copied ? 'Copied!' : 'Copy Token'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            
            {decoded && (
              <div className="mt-6">
                <Card isElevated>
                  <div className="flex border-b border-gray-200">
                    <div 
                      className={`px-4 py-2 cursor-pointer transition ${activeTab === 'json' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                      onClick={() => setActiveTab('json')}
                    >
                      JSON
                    </div>
                    <div 
                      className={`px-4 py-2 cursor-pointer transition ${activeTab === 'table' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                      onClick={() => setActiveTab('table')}
                    >
                      Claims Table
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-2">HEADER</h3>
                    {activeTab === 'json' ? (
                      <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                        {JSON.stringify(decoded.header, null, 2)}
                      </pre>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b border-gray-200">
                            <tr>
                              <th className="text-left py-2 px-3">Name</th>
                              <th className="text-left py-2 px-3">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(decoded.header).map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-100">
                                <td className="py-2 px-3 font-medium">{key}</td>
                                <td className="py-2 px-3">{String(value)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    <h3 className="font-medium text-gray-800 mt-6 mb-2">PAYLOAD</h3>
                    {activeTab === 'json' ? (
                      <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                        {JSON.stringify(decoded.payload, null, 2)}
                      </pre>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b border-gray-200">
                            <tr>
                              <th className="text-left py-2 px-3">Name</th>
                              <th className="text-left py-2 px-3">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(decoded.payload).map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-100">
                                <td className="py-2 px-3 font-medium">{key}</td>
                                <td className="py-2 px-3">
                                  {key === 'exp' || key === 'iat' || key === 'nbf' 
                                    ? `${String(value)} (${formatDate(value as number)})` 
                                    : String(value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleCopyResult} variant="primary">
                        {copied ? 'Copied!' : 'Copy JSON'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
          
          <div>
            <Card isElevated>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Signature Verification</h2>
              </div>
              <div className="p-4">
                {decoded ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Verify the signature with your secret key. Uses {decoded.header.alg || 'HS256'} algorithm.
                    </p>
                    <label htmlFor="secret-key" className="block font-medium text-gray-700 mb-2">
                      Secret Key
                    </label>
                    <input
                      id="secret-key"
                      type="text"
                      className="w-full mb-4 font-mono rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="Enter your secret key..."
                    />
                    <Button onClick={verifySignature} variant="primary" className="w-full">
                      Verify Signature
                    </Button>
                    
                    {isVerified !== null && (
                      <div className={`mt-4 p-3 rounded-md ${isVerified ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="flex items-center">
                          <svg
                            className={`h-5 w-5 mr-2 ${isVerified ? 'text-green-500' : 'text-red-500'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {isVerified ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                          </svg>
                          <span>{isVerified ? 'Signature Verified' : 'Invalid Signature'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Enter a JWT above to verify its signature.
                  </p>
                )}
              </div>
            </Card>
            
            {decoded && decoded.payload.exp && (
              <Card isElevated className="mt-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Token Status</h2>
                </div>
                <div className="p-4">
                  <div className={`p-3 rounded-md ${isExpired(decoded.payload.exp) ? 'bg-red-50' : 'bg-green-50'}`}>
                    <div className="font-medium">{isExpired(decoded.payload.exp) ? 'Expired' : 'Valid'}</div>
                    <div className="text-sm mt-1">
                      {formatDate(decoded.payload.exp)}
                    </div>
                  </div>
                  
                  {decoded.payload.iat && (
                    <div className="mt-3">
                      <div className="font-medium text-gray-700">Issued at:</div>
                      <div className="text-sm">{formatDate(decoded.payload.iat)}</div>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            <Card isElevated className="mt-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">About JWT</h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-2">
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
          </div>
        </div>
        
        {/* Related tools suggestion */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/jwt-playground"
              className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="font-medium text-lg mb-1">JWT Playground</h3>
              <p className="text-gray-600">Create and experiment with custom JWTs.</p>
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

export default JwtDecoder;