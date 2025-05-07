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
  TextInput
} from '../../../design-system';

/**
 * JWT Inspector component - handles token decoding, verification, and security analysis
 */
export const InspectorPane: React.FC = () => {
  const { state, dispatch, decodeToken, verifySignature } = useJwt();
  const { token, decoded, isVerified, error, securityIssues } = state;
  
  const [secretKey, setSecretKey] = useState('');
  const [activeTab, setActiveTab] = useState<'json' | 'claims'>('json');
  const [copied, setCopied] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  
  // Reset the copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  // Handle token input change
  const handleTokenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newToken = e.target.value.trim();
    if (newToken !== token) {
      decodeToken(newToken);
    }
  };
  
  // Generate a demo token for testing
  const handleGenerateDemo = () => {
    const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsInJvbGUiOiJhZG1pbiJ9.8TT2jkQV3a9lQfNSJz7USP9vgKzlhWPMnDxCQfFgj3w';
    decodeToken(demoToken);
  };
  
  // Reset the inspector
  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setSecretKey('');
  };
  
  // Copy token to clipboard
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
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
  
  // Get severity badge color based on severity level
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'neutral';
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
  
  // Render security issues alerts
  const renderSecurityIssues = () => {
    if (securityIssues.length === 0) return null;
    
    return (
      <div className="mb-4">
        {securityIssues.map((issue) => (
          <Alert 
            key={issue.id}
            type={getSeverityColor(issue.severity) as any}
            className="mb-2"
          >
            <div className="flex items-center">
              <span className="mr-2">{getSeverityIcon(issue.severity)}</span>
              <div>
                <div className="font-medium">{issue.title}</div>
                <div className="text-sm">{issue.description}</div>
              </div>
            </div>
          </Alert>
        ))}
      </div>
    );
  };
  
  return (
    <>
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
            <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 font-mono text-sm overflow-x-auto whitespace-nowrap">
              <span className="text-blue-600 dark:text-blue-400">{decoded.raw.header}</span>
              <span className="text-gray-500 dark:text-gray-400">.</span>
              <span className="text-purple-600 dark:text-purple-400">{decoded.raw.payload}</span>
              <span className="text-gray-500 dark:text-gray-400">.</span>
              <span className="text-red-500 dark:text-red-400">{decoded.raw.signature}</span>
            </div>
          )}
          
          <div className="mt-4 flex justify-between">
            <div>
              <Button onClick={handleReset} variant="light">Reset</Button>
            </div>
            <Button onClick={() => handleCopy(token)} variant="primary">
              {copied ? 'Copied!' : 'Copy Token'}
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
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">HEADER</h3>
                    
                    <TabPanel id="panel-json-header" isActive={activeTab === 'json'}>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                        <pre className="text-sm">{JSON.stringify(decoded.header, null, 2)}</pre>
                      </div>
                    </TabPanel>
                    
                    <TabPanel id="panel-claims-header" isActive={activeTab === 'claims'}>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
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
                                <td className="py-2 px-3">{String(value)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabPanel>
                    
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mt-6 mb-2">PAYLOAD</h3>
                    
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
                                  {key === 'exp' || key === 'iat' || key === 'nbf' 
                                    ? `${String(value)} (${formatDate(value as number)})` 
                                    : String(value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabPanel>
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={() => handleCopy(JSON.stringify({
                          header: decoded.header,
                          payload: decoded.payload
                        }, null, 2))} 
                        variant="primary"
                      >
                        {copied ? 'Copied!' : 'Copy JSON'}
                      </Button>
                    </div>
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
                  </div>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};