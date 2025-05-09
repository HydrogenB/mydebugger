import React, { useState, useEffect } from 'react';
import { useJwt, SecurityIssue } from '../context/JwtContext';
import { 
  Card, 
  Button, 
  Alert,
  Badge,
  TabGroup,
  Tab,
  TabPanel,
  TextInput,
  Tooltip
} from '../../../design-system';

/**
 * JWT Inspector component - handles token decoding, verification, and security analysis
 */
export const InspectorPane: React.FC = () => {
  const { state, dispatch, decodeToken, verifySignature, analyzeToken } = useJwt();
  const { token, decoded, isVerified, error, securityIssues } = state;
  
  const [secretKey, setSecretKey] = useState('');
  const [activeTab, setActiveTab] = useState<'json' | 'claims'>('json');
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [securityScore, setSecurityScore] = useState<number | null>(null);
  
  // Reset the copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
        setCopiedSection(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  // Calculate security score when security issues change
  useEffect(() => {
    if (securityIssues.length > 0 && decoded) {
      // Calculate a security score from 0-100 based on issues
      const highIssues = securityIssues.filter(issue => issue.severity === 'high').length;
      const mediumIssues = securityIssues.filter(issue => issue.severity === 'medium').length;
      const lowIssues = securityIssues.filter(issue => issue.severity === 'low').length;
      
      // More serious issues have bigger impact on score
      const score = Math.max(0, 100 - (highIssues * 25 + mediumIssues * 10 + lowIssues * 5));
      setSecurityScore(score);
    } else {
      setSecurityScore(null);
    }
  }, [securityIssues, decoded]);
  
  // Get security score text based on score value
  const getSecurityScoreText = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Moderate";
    if (score >= 40) return "Poor";
    return "Critical";
  };

  // Get security score color based on score value
  const getSecurityScoreColor = (score: number): string => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-green-50 text-green-600";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    if (score >= 40) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };
  
  // Security Score Visualization Component
  interface SecurityScoreDisplayProps { // Renamed from SecurityScoreGaugeProps
    score: number;
  }

  const SecurityScoreDisplay: React.FC<SecurityScoreDisplayProps> = ({ score }) => { // Updated to use SecurityScoreDisplayProps
    const scoreText = getSecurityScoreText(score);
    const colorClass = getSecurityScoreColor(score);
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="10" 
            />
            
            {/* Progress arc - calculate stroke-dasharray based on score */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke={score >= 90 ? "#10b981" : 
                     score >= 80 ? "#34d399" :
                     score >= 60 ? "#fbbf24" :
                     score >= 40 ? "#f97316" : "#ef4444"}
              strokeWidth="10" 
              strokeDasharray={`${score * 2.83} 283`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}</span>
            <span className="text-sm opacity-80">/100</span>
          </div>
        </div>
        <div className={`mt-2 px-3 py-1 rounded-full font-medium ${colorClass}`}>
          {scoreText}
        </div>
      </div>
    );
  };

  // Handle token input change
  const handleTokenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newToken = e.target.value.trim();
    if (newToken !== token) {
      decodeToken(newToken);
      if (newToken) {
        analyzeToken(newToken);
      }
    }
  };
  
  // Generate a demo token for testing
  const handleGenerateDemo = () => {
    // Create demo token with security issues for demonstration
    const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsInJvbGUiOiJhZG1pbiJ9.8TT2jkQV3a9lQfNSJz7USP9vgKzlhWPMnDxCQfFgj3w';
    decodeToken(demoToken);
    analyzeToken(demoToken);
  };
  
  // Reset the inspector
  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setSecretKey('');
    setSecurityScore(null);
  };
  
  // Copy content to clipboard
  const handleCopy = (content: string, section: string = 'token') => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setCopiedSection(section);
  };
  
  // Handle signature verification
  const handleVerify = () => {
    if (!decoded || !secretKey) return;
    verifySignature(decoded.header.alg, secretKey);
  };
  
  // Format JWT dates (exp, iat, nbf)
  const formatDate = (timestamp: number): string => {
    try {
      return new Date(timestamp * 1000).toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Check if token is expired
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
  
  // Get severity badge color based on severity level
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'light';
    }
  };
  
  // Get severity icon based on severity level
  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'high': return '⚠️';
      case 'medium': return '⚠';
      case 'low': return 'ℹ️';
      default: return 'ℹ️';
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
  
  // Render security issues alerts
  const renderSecurityIssues = () => {
    if (!securityIssues || securityIssues.length === 0) return null;
    
    // Group issues by severity for better organization
    const highIssues = securityIssues.filter(issue => issue.severity === 'high');
    const mediumIssues = securityIssues.filter(issue => issue.severity === 'medium');
    const lowIssues = securityIssues.filter(issue => issue.severity === 'low');
    const infoIssues = securityIssues.filter(issue => issue.severity === 'info');
    
    return (
      <Card className="mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold flex items-center">
            Security Analysis
            {securityScore !== null && (
              <div className="ml-auto flex items-center">
                <div className="text-sm mr-2">Security Score:</div>
                <div className={`rounded-full w-10 h-10 flex items-center justify-center ${getSecurityScoreColor(securityScore)}`}>
                  {securityScore}
                </div>
                <div className="ml-2 text-sm font-medium">
                  {getSecurityScoreText(securityScore)}
                </div>
              </div>
            )}
          </h3>
        </div>
        <div className="p-4">
          {highIssues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">Critical Issues</h4>
              {highIssues.map((issue) => (
                <Alert 
                  key={issue.id}
                  type="error"
                  className="mb-2"
                >
                  <div className="flex items-start">
                    <span className="mr-2 mt-0.5">{getSeverityIcon(issue.severity)}</span>
                    <div>
                      <div className="font-medium">{issue.title}</div>
                      <div className="text-sm">{issue.description}</div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
          
          {mediumIssues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-yellow-600 dark:text-yellow-400 font-medium mb-2">Warning Issues</h4>
              {mediumIssues.map((issue) => (
                <Alert 
                  key={issue.id}
                  type="warning"
                  className="mb-2"
                >
                  <div className="flex items-start">
                    <span className="mr-2 mt-0.5">{getSeverityIcon(issue.severity)}</span>
                    <div>
                      <div className="font-medium">{issue.title}</div>
                      <div className="text-sm">{issue.description}</div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
          
          {(lowIssues.length > 0 || infoIssues.length > 0) && (
            <div>
              <h4 className="text-blue-600 dark:text-blue-400 font-medium mb-2">Informational</h4>
              {[...lowIssues, ...infoIssues].map((issue) => (
                <Alert 
                  key={issue.id}
                  type="info"
                  className="mb-2"
                >
                  <div className="flex items-start">
                    <span className="mr-2 mt-0.5">{getSeverityIcon(issue.severity)}</span>
                    <div>
                      <div className="font-medium">{issue.title}</div>
                      <div className="text-sm">{issue.description}</div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };
  
  return (
    <>
      <div className="flex justify-center">
        <div className="w-full max-w-5xl px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">JWT Token Inspector</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Decode, verify, and analyze JSON Web Tokens with advanced security analysis.
            </p>
          </div>
          
          <Card className="mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold">JWT Token</h3>
              <Button onClick={handleGenerateDemo} size="sm" variant="light">
                Generate Demo
              </Button>
            </div>
            
            <div className="p-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm flex items-center">
                  <span className="mr-2">🔒</span>
                  All JWT processing happens locally in your browser. Your tokens are never sent to a server.
                </p>
              </div>
              
              <textarea
                className="w-full font-mono text-sm p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 h-28 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={token}
                onChange={handleTokenChange}
                placeholder="Paste your JWT token here..."
                spellCheck="false"
              />
              
              {error && (
                <Alert type="error" className="mt-4">{error}</Alert>
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
                <Button onClick={() => handleCopy(token)} variant="primary">
                  {copied && copiedSection === 'token' ? 'Copied!' : 'Copy Token'}
                </Button>
              </div>
            </div>
          </Card>
          
          {renderSecurityIssues()}
          
          {decoded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <TabGroup>
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <Tab 
                          id="tab-json"
                          isActive={activeTab === 'json'} 
                          onClick={() => setActiveTab('json')}
                        >
                          JSON
                        </Tab>
                        <Tab 
                          id="tab-claims"
                          isActive={activeTab === 'claims'} 
                          onClick={() => setActiveTab('claims')}
                        >
                          Claims Table
                        </Tab>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                          <span className={getTokenPartColor('header')}>HEADER</span>
                          <Button 
                            onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), 'header')} 
                            variant="light" 
                            size="xs" 
                            className="ml-2"
                          >
                            {copied && copiedSection === 'header' ? 'Copied!' : 'Copy'}
                          </Button>
                        </h3>
                        
                        <TabPanel id="panel-json-header" isActive={activeTab === 'json'}>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto mb-4">
                            <pre className="text-sm">{JSON.stringify(decoded.header, null, 2)}</pre>
                          </div>
                        </TabPanel>
                        
                        <TabPanel id="panel-claims-header" isActive={activeTab === 'claims'}>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto mb-4">
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
                                      <Tooltip content={key === 'alg' ? `Algorithm used to sign the token` : key === 'typ' ? 'Token type' : key === 'kid' ? 'Key identifier' : `Header claim: ${key}`}>
                                        <span className="cursor-help border-b border-dotted border-gray-400">{String(value)}</span>
                                      </Tooltip>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </TabPanel>
                        
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                          <span className={getTokenPartColor('payload')}>PAYLOAD</span>
                          <Button 
                            onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), 'payload')} 
                            variant="light" 
                            size="xs" 
                            className="ml-2"
                          >
                            {copied && copiedSection === 'payload' ? 'Copied!' : 'Copy'}
                          </Button>
                        </h3>
                        
                        <TabPanel id="panel-json-payload" isActive={activeTab === 'json'}>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                            <pre className="text-sm">{JSON.stringify(decoded.payload, null, 2)}</pre>
                          </div>
                        </TabPanel>
                        
                        <TabPanel id="panel-claims-payload" isActive={activeTab === 'claims'}>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
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
                        </TabPanel>
                      </div>
                    </TabGroup>
                  </Card>
                </div>
                
                <div>
                  <Card className="mb-6">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold">Signature Verification</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Verify the signature using your secret key. Algorithm: {decoded.header.alg || 'unknown'}
                      </p>
                      
                      <div className="mt-2">
                        <label htmlFor="secret-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Secret/Public Key
                        </label>
                        <TextInput
                          id="secret-key"
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          placeholder="Enter secret key or paste public key..."
                          className="font-mono"
                        />
                      </div>
                      
                      <Button 
                        onClick={handleVerify}
                        variant="primary"
                        className="w-full mt-3"
                        disabled={!secretKey}
                      >
                        Verify Signature
                      </Button>
                      
                      {isVerified !== null && (
                        <div className={`mt-4 p-3 rounded-md ${
                          isVerified 
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        }`}>
                          <div className="flex items-center">
                            <span className="mr-2">
                              {isVerified ? '✅' : '❌'}
                            </span>
                            <span className="font-medium">
                              {isVerified ? 'Signature Verified' : 'Invalid Signature'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                  
                  {decoded.payload.exp && (
                    <Card>
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold">Token Status</h3>
                      </div>
                      <div className="p-4">
                        <div className={`p-3 rounded-md ${
                          isExpired(decoded.payload.exp as number) 
                            ? 'bg-red-50 dark:bg-red-900/20' 
                            : 'bg-green-50 dark:bg-green-900/20'
                        }`}>
                          <div className="font-medium">
                            {isExpired(decoded.payload.exp as number) ? '🕒 Expired' : '✅ Valid'}
                          </div>
                          <div className="text-sm mt-1">
                            {formatDate(decoded.payload.exp as number)}
                          </div>
                        </div>
                        
                        {decoded.payload.iat && (
                          <div className="mt-3">
                            <div className="font-medium text-gray-700 dark:text-gray-300">Issued at:</div>
                            <div className="text-sm">{formatDate(decoded.payload.iat as number)}</div>
                          </div>
                        )}
                        
                        {decoded.payload.nbf && (
                          <div className="mt-3">
                            <div className="font-medium text-gray-700 dark:text-gray-300">Not valid before:</div>
                            <div className="text-sm">{formatDate(decoded.payload.nbf as number)}</div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </>
          )}
          
          <div className="mt-8">
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">JWT Security Best Practices</h2>
              </div>
              <div className="p-4 text-sm">
                <ul className="space-y-3">
                  <li className="flex">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span>Use short-lived tokens with expiration times (exp claim)</span>
                  </li>
                  <li className="flex">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span>Prefer asymmetric algorithms (RS256, ES256) over symmetric ones (HS256) for public clients</span>
                  </li>
                  <li className="flex">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span>Include audience (aud) and issuer (iss) claims to prevent token misuse</span>
                  </li>
                  <li className="flex">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span>Use strong, unique keys for signing tokens</span>
                  </li>
                  <li className="flex">
                    <span className="text-red-600 dark:text-red-400 mr-2">✗</span>
                    <span>Never store sensitive data like passwords or API keys in tokens</span>
                  </li>
                  <li className="flex">
                    <span className="text-red-600 dark:text-red-400 mr-2">✗</span>
                    <span>Never use the 'none' algorithm in production</span>
                  </li>
                  <li className="flex">
                    <span className="text-red-600 dark:text-red-400 mr-2">✗</span>
                    <span>Avoid very long-lived tokens (&gt; 24 hours) for sensitive operations</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};