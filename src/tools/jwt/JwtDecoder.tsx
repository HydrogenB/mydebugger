import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Card from '../../design-system/components/layout/Card';
import Button from '../../design-system/components/inputs/Button';
import { Alert } from '../../design-system/components/feedback/Alert';
import { Badge } from '../../design-system/components/display';
import { Tooltip } from '../../design-system/components/overlays';
import { ACTIVE_TAB_CLASS } from '../../design-system/foundations/layout';
import { useJwt } from './context/JwtContext';
import { Text } from '../../design-system/components/typography';

const JwtDecoder: React.FC = () => {
  // Use the enhanced context instead of local state
  const { state, decodeToken, verifySignature, analyzeToken } = useJwt();
  const { token, decoded, error, isVerified, verificationKey, securityIssues, parsingWarnings } = state;
  
  const [jwtToken, setJwtToken] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'json' | 'table'>('json');  // Setting default tab to JSON
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');
  const [showIterationTooltip, setShowIterationTooltip] = useState<boolean>(false);
  
  // Update local state from context state
  useEffect(() => {
    setJwtToken(token);
  }, [token]);
  
  useEffect(() => {
    setSecret(verificationKey);
  }, [verificationKey]);

  // Decode JWT token when it changes in the textarea
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (jwtToken !== token) {
        decodeToken(jwtToken);
      }
    }, 300); // Debounce
    
    return () => clearTimeout(timeoutId);
  }, [jwtToken, token, decodeToken]);
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
        setCopiedSection(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Show iteration tooltip when token is successfully decoded
  useEffect(() => {
    if (decoded?.header && decoded?.payload) {
      // Show tooltip with a slight delay for better UX
      const timer = setTimeout(() => {
        setShowIterationTooltip(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowIterationTooltip(false);
    }
  }, [decoded]);
  
  const handleCopyContent = (content: string, section: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setCopiedSection(section);
  };
  
  const handleReset = () => {
    setJwtToken('');
    setSecret('');
    setSelectedAlgorithm('');
  };

  // Get next iteration suggestions based on current token state
  const getIterationSuggestions = (): JSX.Element => {
    const suggestions: JSX.Element[] = [];

    // If token is decoded but not verified
    if (decoded?.header && !isVerified) {
      suggestions.push(
        <li key="verify">Try to verify the token signature with a secret or public key</li>
      );
    }

    // If token uses an algorithm that might be vulnerable
    if (decoded?.header?.alg === 'none' || decoded?.header?.alg === 'HS256') {
      suggestions.push(
        <li key="alg">Test for algorithm confusion attacks by changing the algorithm</li>
      );
    }

    // If token contains an expiration claim
    if (decoded?.payload?.exp) {
      const expTime = decoded.payload.exp as number;
      if (isExpired(expTime)) {
        suggestions.push(
          <li key="exp">Generate a new token with a future expiration time</li>
        );
      } else {
        suggestions.push(
          <li key="exp-test">Test token rejection by using an expired token</li>
        );
      }
    }

    // If token doesn't have certain security claims
    if (!decoded?.payload?.jti) {
      suggestions.push(
        <li key="jti">Add a JWT ID (jti) claim for better security</li>
      );
    }

    // If no specific suggestions, provide general ones
    if (suggestions.length === 0) {
      suggestions.push(
        <li key="general-1">Modify the payload to test how the application handles different claims</li>,
        <li key="general-2">Test token with different signature algorithms</li>
      );
    }

    return (
      <div className="text-sm">
        <Text weight="bold" className="mb-1">Next steps to try:</Text>
        <ul className="list-disc pl-5 space-y-1">
          {suggestions}
        </ul>
      </div>
    );
  };

  const handleGenerateExample = () => {
    // Generate an example token that will expire in 1 hour
    const now = Math.floor(Date.now() / 1000);
    const header = { 
      alg: 'HS256', 
      typ: 'JWT',
      kid: 'example-key-id'
    };
    const payload = {
      // Standard JWT claims
      sub: '1234567890',
      name: 'John Doe',
      email: 'john.doe@example.com',
      iss: 'https://auth.example.com',
      aud: 'client-id-123',
      iat: now,
      exp: now + 3600, // 1 hour from now
      nbf: now,
      jti: crypto.randomUUID().replace(/-/g, ''),
      
      // Additional common claims
      given_name: 'John',
      family_name: 'Doe',
      nickname: 'Johnny',
      preferred_username: 'john.doe',
      picture: 'https://example.com/profile/johndoe.jpg',
      website: 'https://johndoe.example.com',
      gender: 'male',
      birthdate: '1990-01-01',
      phone_number: '+1-202-555-0123',
      address: {
        street_address: '123 Main St',
        locality: 'Anytown',
        region: 'State',
        postal_code: '12345',
        country: 'US'
      },
      roles: ['user', 'admin'],
      scope: 'openid profile email',
      auth_time: now - 300, // 5 minutes ago
      sid: 'session_id_123456',
      amr: ['pwd'], // Authentication Methods References
      azp: 'authorized-party-123', // Authorized party
    };
    
    // This is just a mock token for demonstration
    const exampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImV4YW1wbGUta2V5LWlkIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlzcyI6Imh0dHBzOi8vYXV0aC5leGFtcGxlLmNvbSIsImF1ZCI6ImNsaWVudC1pZC0xMjMiLCJpYXQiOjE2ODMyMDM1MjQsImV4cCI6MTY4MzIwNzEyNCwibmJmIjoxNjgzMjAzNTI0LCJqdGkiOiI4OTg5OGVlOGQ1YjI0ZjdkYjkzM2MwZGFiZDQzMWJjOCIsImdpdmVuX25hbWUiOiJKb2huIiwiZmFtaWx5X25hbWUiOiJEb2UiLCJuaWNrbmFtZSI6IkpvaG5ueSIsInByZWZlcnJlZF91c2VybmFtZSI6ImpvaG4uZG9lIiwicGljdHVyZSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vcHJvZmlsZS9qb2huZG9lLmpwZyIsIndlYnNpdGUiOiJodHRwczovL2pvaG5kb2UuZXhhbXBsZS5jb20iLCJnZW5kZXIiOiJtYWxlIiwiYmlydGhkYXRlIjoiMTk5MC0wMS0wMSIsInBob25lX251bWJlciI6IisxLTIwMi01NTUtMDEyMyIsImFkZHJlc3MiOnsic3RyZWV0X2FkZHJlc3MiOiIxMjMgTWFpbiBTdCIsImxvY2FsaXR5IjoiQW55dG93biIsInJlZ2lvbiI6IlN0YXRlIiwicG9zdGFsX2NvZGUiOiIxMjM0NSIsImNvdW50cnkiOiJVUyJ9LCJyb2xlcyI6WyJ1c2VyIiwiYWRtaW4iXSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImF1dGhfdGltZSI6MTY4MzIwMzIyNCwic2lkIjoic2Vzc2lvbl9pZF8xMjM0NTYiLCJhbXIiOlsicHdkIl0sImF6cCI6ImF1dGhvcml6ZWQtcGFydHktMTIzIn0.xlj7zV5XM7XQg6qNTDxXkpnyb9-4k9JSbzWl6YCGrX4';
    setJwtToken(exampleToken);
  };
  
  const handleVerifySignature = () => {
    verifySignature(selectedAlgorithm, secret);
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
  
  // Get a description for standard JWT claims
  const getClaimDescription = (key: string): string => {
    switch(key) {
      case 'sub': return 'Subject (user) identifier';
      case 'iss': return 'Issuer of the token';
      case 'aud': return 'Audience the token is intended for';
      case 'exp': return 'Expiration time (when token becomes invalid)';
      case 'nbf': return 'Not before time (when token starts being valid)';
      case 'iat': return 'Issued at time (when token was issued)';
      case 'jti': return 'JWT ID (unique identifier for this token)';
      case 'name': return 'User name';
      case 'given_name': return 'User first name';
      case 'family_name': return 'User last name';
      case 'email': return 'User email address';
      case 'roles': return 'User roles/permissions';
      case 'scope': return 'OAuth 2.0 scopes';
      case 'sid': return 'Session ID';
      case 'auth_time': return 'Time when authentication occurred';
      default: return 'Custom claim';
    }
  };
  
  // Get token part colors
  const getTokenPartColor = (part: string): string => {
    switch(part) {
      case 'header': return 'text-blue-600 dark:text-blue-400';
      case 'payload': return 'text-purple-600 dark:text-purple-400';
      case 'signature': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600';
    }
  };

  // Get security issue severity color
  const getSeverityColor = (severity: string): string => {
    switch(severity) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-orange-600 dark:text-orange-400';
      case 'low': return 'text-yellow-600 dark:text-yellow-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
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
    
      <div className="flex justify-center">
        <div className="w-full max-w-5xl px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">JSON Web Token (JWT) Debugger</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Decode, verify, and analyze JSON Web Tokens (JWT) instantly. All processing happens in your browser.
            </p>
          </div>
          
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-yellow-800 dark:text-yellow-200 flex items-center justify-center">
              <span className="mr-2">🔒</span>
              <span className="font-bold">For your protection:</span> All JWT debugging and validation happens entirely in your browser. 
              Your tokens and keys are never sent to any server.
            </p>
          </div>
        
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left panel - Input */}
            <div>
              <Card isElevated className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Encoded JWT</h2>
                  <Button onClick={handleGenerateExample} variant="light" size="sm">Generate example</Button>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <textarea
                    id="jwt-input"
                    className="w-full font-mono text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 flex-1 min-h-[300px]"
                    value={jwtToken}
                    onChange={(e) => setJwtToken(e.target.value)}
                    placeholder="Paste your JWT token here... (supports Bearer tokens and plain JWT)"
                    autoFocus
                    spellCheck="false"
                  />
                  
                  {/* Continue to iterate tooltip */}
                  {showIterationTooltip && decoded && (
                    <div className="mt-4 flex justify-end">
                      <Tooltip
                        content={getIterationSuggestions()}
                        position="bottom"
                        size="lg"
                      >
                        <Badge variant="warning" className="cursor-help flex items-center">
                          <span>👉 Continue to iterate?</span>
                        </Badge>
                      </Tooltip>
                    </div>
                  )}
                  
                  {error && (
                    <Alert type="error" className="mt-4">{error}</Alert>
                  )}

                  {parsingWarnings && parsingWarnings.length > 0 && (
                    <Alert type="warning" className="mt-4">
                      <div className="font-medium mb-1">Parsing Warnings:</div>
                      <ul className="list-disc pl-5 text-sm">
                        {parsingWarnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}
                  
                  {decoded && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 font-mono text-sm overflow-x-auto break-all">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-20 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">Header:</div>
                        <div className={`${getTokenPartColor('header')} flex-1`}>{decoded.raw.header}</div>
                      </div>
                      <div className="flex flex-col sm:flex-row mt-2">
                        <div className="sm:w-20 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">Payload:</div>
                        <div className={`${getTokenPartColor('payload')} flex-1`}>{decoded.raw.payload}</div>
                      </div>
                      <div className="flex flex-col sm:flex-row mt-2">
                        <div className="sm:w-20 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">Signature:</div>
                        <div className={`${getTokenPartColor('signature')} flex-1`}>{decoded.raw.signature}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between">
                    <div>
                      <Button onClick={handleReset} variant="light">Reset</Button>
                    </div>
                    <div>
                      <Button 
                        onClick={() => handleCopyContent(jwtToken, 'token')} 
                        variant="primary"
                        disabled={!jwtToken}
                      >
                        {copied && copiedSection === 'token' ? 'Copied!' : 'Copy Token'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Right panel - Decoded data */}
            <div>
              <Card isElevated className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Decoded Data</h2>
                  <div className="flex border border-gray-200 dark:border-gray-700 rounded">
                    <button
                      className={`px-3 py-1 text-sm rounded-l ${activeTab === 'json' ? `bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ${ACTIVE_TAB_CLASS}` : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                      onClick={() => setActiveTab('json')}
                    >
                      JSON
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-r ${activeTab === 'table' ? `bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ${ACTIVE_TAB_CLASS}` : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                      onClick={() => setActiveTab('table')}
                    >
                      Table
                    </button>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                  {!decoded ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-center p-6">
                      <div>
                        <div className="mb-2">Paste a JWT token on the left to decode it</div>
                        <div className="text-sm">
                          <Button onClick={handleGenerateExample} variant="light" size="sm">
                            Or try an example token
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                          <span className={getTokenPartColor('header')}>HEADER</span>
                          <Button 
                            onClick={() => handleCopyContent(JSON.stringify(decoded.header, null, 2), 'header')} 
                            variant="light" 
                            size="xs" 
                            className="ml-2"
                          >
                            {copied && copiedSection === 'header' ? 'Copied!' : 'Copy'}
                          </Button>
                        </h3>
                        
                        {activeTab === 'json' ? (
                          <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto mb-4 text-sm">
                            {JSON.stringify(decoded.header, null, 2)}
                          </pre>
                        ) : (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-md overflow-x-auto mb-4">
                            <table className="w-full text-sm">
                              <thead className="border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                  <th className="text-left py-2 px-3">Name</th>
                                  <th className="text-left py-2 px-3">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(decoded.header).map(([key, value]) => (
                                  <tr key={key} className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 px-3 font-medium">{key}</td>
                                    <td className="py-2 px-3">
                                      <Tooltip content={key === 'alg' ? `Algorithm used to sign the token` : key === 'typ' ? 'Token type' : `Header claim: ${key}`}>
                                        <span className="cursor-help border-b border-dotted border-gray-400">{String(value)}</span>
                                      </Tooltip>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                          <span className={getTokenPartColor('payload')}>PAYLOAD</span>
                          <Button 
                            onClick={() => handleCopyContent(JSON.stringify(decoded.payload, null, 2), 'payload')} 
                            variant="light" 
                            size="xs" 
                            className="ml-2"
                          >
                            {copied && copiedSection === 'payload' ? 'Copied!' : 'Copy'}
                          </Button>
                        </h3>
                        
                        {activeTab === 'json' ? (
                          <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm">
                            {JSON.stringify(decoded.payload, null, 2)}
                          </pre>
                        ) : (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-md overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                  <th className="text-left py-2 px-3">Claim</th>
                                  <th className="text-left py-2 px-3">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(decoded.payload).map(([key, value]) => (
                                  <tr key={key} className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 px-3 font-medium">{key}</td>
                                    <td className="py-2 px-3">
                                      <Tooltip content={getClaimDescription(key)}>
                                        <span className="cursor-help border-b border-dotted border-gray-400">
                                          {key === 'exp' || key === 'iat' || key === 'nbf' ? (
                                            <div>
                                              <div>{String(value)}</div>
                                              <div className={`text-xs mt-1 ${key === 'exp' && isExpired(value as number) ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {formatDate(value as number)}
                                                {key === 'exp' && (
                                                  <span className="ml-2">
                                                    {isExpired(value as number) 
                                                      ? <Badge color="danger" size="sm">Expired</Badge> 
                                                      : <Badge color="success" size="sm">Valid</Badge>}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          ) : typeof value === 'boolean' ? (
                                            <span className={value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                              {String(value)}
                                            </span>
                                          ) : typeof value === 'object' && value !== null ? (
                                            <details>
                                              <summary className="cursor-pointer">View Object</summary>
                                              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-40">
                                                {JSON.stringify(value, null, 2)}
                                              </pre>
                                            </details>
                                          ) : (
                                            String(value)
                                          )}
                                        </span>
                                      </Tooltip>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                      
                      {/* Continue to iterate tooltip */}
                      {showIterationTooltip && (
                        <div className="relative ml-4">
                          <Button 
                            variant="outline-info" 
                            onClick={() => setShowIterationTooltip(false)}
                            size="sm"
                            className="animate-pulse"
                          >
                            Next steps
                          </Button>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                          <span className={getTokenPartColor('signature')}>SIGNATURE</span>
                          <Badge 
                            color={isVerified === true ? "success" : isVerified === false ? "danger" : "light"}
                            className="ml-2"
                          >
                            {isVerified === true ? "Verified" : isVerified === false ? "Invalid" : "Not verified"}
                          </Badge>
                        </h3>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            Signature algorithm: <span className="font-medium">{decoded.header.alg || 'HS256'}</span>
                          </p>
                          
                          <div className="flex flex-col">
                            <div className="flex-grow mb-2">
                              <label htmlFor="algorithm-select" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Algorithm (optional, override header)
                              </label>
                              <select
                                id="algorithm-select"
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                value={selectedAlgorithm}
                                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                              >
                                <option value="">Use algorithm from header</option>
                                <optgroup label="HMAC">
                                  <option value="HS256">HS256</option>
                                  <option value="HS384">HS384</option>
                                  <option value="HS512">HS512</option>
                                </optgroup>
                                <optgroup label="RSA">
                                  <option value="RS256">RS256</option>
                                  <option value="RS384">RS384</option>
                                  <option value="RS512">RS512</option>
                                </optgroup>
                                <optgroup label="RSA-PSS">
                                  <option value="PS256">PS256</option>
                                  <option value="PS384">PS384</option>
                                  <option value="PS512">PS512</option>
                                </optgroup>
                                <optgroup label="ECDSA">
                                  <option value="ES256">ES256</option>
                                  <option value="ES384">ES384</option>
                                  <option value="ES512">ES512</option>
                                </optgroup>
                              </select>
                            </div>

                            <div className="flex-grow mb-2">
                              <label htmlFor="secret-key" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Secret/Verification key
                              </label>
                              <textarea
                                id="secret-key"
                                rows={3}
                                className="w-full font-mono text-xs rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                placeholder={
                                  decoded.header.alg?.startsWith('HS') 
                                  ? "Enter your secret key... (raw string or base64 encoded)" 
                                  : decoded.header.alg?.startsWith('RS') || decoded.header.alg?.startsWith('PS') 
                                  ? "Enter your RSA public key (PEM format supported)"
                                  : "Enter your verification key..."
                                }
                              />
                            </div>
                            
                            <div className="flex justify-end">
                              <Button 
                                onClick={handleVerifySignature} 
                                variant="primary"
                                size="sm"
                                disabled={!secret}
                              >
                                Verify
                              </Button>
                            </div>
                          </div>
                          
                          {isVerified !== null && (
                            <div className={`mt-3 p-2 rounded-md text-sm ${
                              isVerified 
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                            }`}>
                              <div className="flex items-center">
                                <svg
                                  className="h-4 w-4 mr-2"
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
                                <span>{isVerified ? 'Signature verified successfully' : 'Invalid signature'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Security Issues */}
                      {securityIssues && securityIssues.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                            <span>SECURITY ANALYSIS</span>
                            <Badge 
                              color={securityIssues.some(i => i.severity === 'high') 
                                ? "danger" 
                                : securityIssues.some(i => i.severity === 'medium') 
                                  ? "warning" 
                                  : "info"}
                              className="ml-2"
                            >
                              {securityIssues.length} Issue{securityIssues.length !== 1 ? 's' : ''}
                            </Badge>
                          </h3>

                          <div className="bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                            {securityIssues.map((issue) => (
                              <div 
                                key={issue.id}
                                className="p-3 border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <h4 className={`font-medium ${getSeverityColor(issue.severity)}`}>
                                    {issue.title}
                                  </h4>
                                  <Badge 
                                    color={
                                      issue.severity === 'high' ? "danger" :
                                      issue.severity === 'medium' ? "warning" :
                                      issue.severity === 'low' ? "info" : "info"
                                    }
                                    size="sm"
                                  >
                                    {issue.severity}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {issue.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Continue to iterate tooltip */}
                      {showIterationTooltip && (
                        <div className="relative ml-4">
                          <Button 
                            variant="outline-info" 
                            onClick={() => setShowIterationTooltip(false)}
                            size="sm"
                            className="animate-pulse"
                          >
                            Next steps
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
          
          <div className="mt-8">
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">About JWT</h2>
              </div>
              <div className="p-4 text-sm">
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  JSON Web Tokens (JWTs) are an open, industry standard RFC 7519 method for representing claims securely between two parties.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                    <h3 className={`font-medium mb-1 ${getTokenPartColor('header')}`}>Header</h3>
                    <p className="text-gray-600 dark:text-gray-400">Contains metadata about the token's type and the signing algorithm.</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
                    <h3 className={`font-medium mb-1 ${getTokenPartColor('payload')}`}>Payload</h3>
                    <p className="text-gray-600 dark:text-gray-400">Contains the token claims - statements about the user and additional metadata.</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <h3 className={`font-medium mb-1 ${getTokenPartColor('signature')}`}>Signature</h3>
                    <p className="text-gray-600 dark:text-gray-400">Used to verify that the token wasn't changed along the way and came from an authentic source.</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-3">
                  <a 
                    href="https://jwt.io/introduction" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                  >
                    Learn more about JWT
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default JwtDecoder;