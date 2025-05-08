import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  TextInput,
  Alert,
  Badge,
  LoadingSpinner
} from '../../../design-system';
import { useJwt } from '../context/JwtContext';

interface JwkData {
  kty: string;
  kid?: string;
  alg?: string;
  use?: string;
  key_ops?: string[];
  n?: string;
  e?: string;
  x?: string;
  y?: string;
  crv?: string;
}

interface OidcConfig {
  issuer?: string;
  jwks_uri?: string;
  token_endpoint?: string;
  authorization_endpoint?: string;
  [key: string]: any;
}

/**
 * JWKS Probe component - fetches and displays JWKS information
 */
export const JwksProbe: React.FC = () => {
  const { state } = useJwt();
  const { decoded } = state;
  
  const [url, setUrl] = useState<string>('');
  const [urlType, setUrlType] = useState<'jwks' | 'oidc'>('jwks');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jwksList, setJwksList] = useState<JwkData[]>([]);
  const [oidcConfig, setOidcConfig] = useState<OidcConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchedKey, setMatchedKey] = useState<JwkData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  
  // Try to extract the issuer from the token if available
  useEffect(() => {
    if (decoded?.payload?.iss && !url) {
      // Common formats for discovery endpoints
      const issuer = decoded.payload.iss as string;
      if (issuer.endsWith('/')) {
        setUrl(`${issuer}.well-known/openid-configuration`);
      } else {
        setUrl(`${issuer}/.well-known/openid-configuration`);
      }
      setUrlType('oidc');
    }
  }, [decoded]);

  // Reset the copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
        setCopiedItem(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Try to match the token with a key from the JWKS
  useEffect(() => {
    if (decoded?.header?.kid && jwksList.length > 0) {
      const keyId = decoded.header.kid;
      const matchingKey = jwksList.find(key => key.kid === keyId);
      setMatchedKey(matchingKey || null);
    } else {
      setMatchedKey(null);
    }
  }, [decoded, jwksList]);
  
  // Fetch JWKS directly
  const fetchJwks = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    setJwksList([]);
    setOidcConfig(null);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store in session storage for later use
      try {
        sessionStorage.setItem(`jwks_${url}`, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to cache JWKS in sessionStorage:', e);
      }
      
      if (data.keys) {
        setJwksList(data.keys);
      } else {
        throw new Error('No keys found in the JWKS response');
      }
    } catch (err) {
      setError(`Failed to fetch JWKS: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch OIDC config and then JWKS
  const fetchOidcConfig = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    setJwksList([]);
    setOidcConfig(null);
    
    try {
      // First, fetch the OIDC config
      const configResponse = await fetch(url);
      
      if (!configResponse.ok) {
        throw new Error(`HTTP error: ${configResponse.status} ${configResponse.statusText}`);
      }
      
      const config = await configResponse.json();
      setOidcConfig(config);
      
      // Store in session storage
      try {
        sessionStorage.setItem(`oidc_${url}`, JSON.stringify(config));
      } catch (e) {
        console.warn('Failed to cache OIDC config in sessionStorage:', e);
      }
      
      if (!config.jwks_uri) {
        throw new Error('No JWKS URI found in the OIDC configuration');
      }
      
      // Now fetch the JWKS from the URI in the config
      const jwksResponse = await fetch(config.jwks_uri);
      
      if (!jwksResponse.ok) {
        throw new Error(`HTTP error fetching JWKS: ${jwksResponse.status} ${jwksResponse.statusText}`);
      }
      
      const jwksData = await jwksResponse.json();
      
      // Store in session storage
      try {
        sessionStorage.setItem(`jwks_${config.jwks_uri}`, JSON.stringify(jwksData));
      } catch (e) {
        console.warn('Failed to cache JWKS in sessionStorage:', e);
      }
      
      if (jwksData.keys) {
        setJwksList(jwksData.keys);
      } else {
        throw new Error('No keys found in the JWKS response');
      }
    } catch (err) {
      setError(`Failed to fetch OIDC configuration or JWKS: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle the fetch button click
  const handleFetch = () => {
    if (urlType === 'jwks') {
      fetchJwks();
    } else {
      fetchOidcConfig();
    }
  };

  // Handle copy to clipboard
  const handleCopy = (content: string, item: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setCopiedItem(item);
  };
  
  // Try loading from cached data first
  const tryLoadFromCache = () => {
    try {
      if (urlType === 'jwks') {
        const cachedJwks = sessionStorage.getItem(`jwks_${url}`);
        if (cachedJwks) {
          const data = JSON.parse(cachedJwks);
          if (data.keys) {
            setJwksList(data.keys);
            return true;
          }
        }
      } else {
        const cachedOidcConfig = sessionStorage.getItem(`oidc_${url}`);
        if (cachedOidcConfig) {
          const config = JSON.parse(cachedOidcConfig);
          setOidcConfig(config);
          
          const cachedJwks = sessionStorage.getItem(`jwks_${config.jwks_uri}`);
          if (cachedJwks) {
            const jwksData = JSON.parse(cachedJwks);
            if (jwksData.keys) {
              setJwksList(jwksData.keys);
              return true;
            }
          }
        }
      }
    } catch (e) {
      console.error('Error loading from cache:', e);
    }
    return false;
  };
  
  // Get a sample URL for the selected URL type
  const getSampleUrl = () => {
    if (urlType === 'jwks') {
      setUrl('https://www.googleapis.com/oauth2/v3/certs');
    } else {
      setUrl('https://accounts.google.com/.well-known/openid-configuration');
    }
  };
  
  // Render a key information card
  const renderKeyCard = (key: JwkData, index: number) => {
    const isMatched = decoded?.header?.kid && key.kid === decoded.header.kid;
    const keyJson = JSON.stringify(key, null, 2);
    
    return (
      <Card key={key.kid || index} className={`mb-4 ${isMatched ? 'border-green-500 dark:border-green-500' : ''}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h4 className="font-semibold flex items-center">
            {isMatched && <span className="mr-2 text-green-500">✓ </span>}
            Key {key.kid ? `ID: ${key.kid}` : index + 1}
          </h4>
          <div className="flex gap-2">
            {key.alg && <Badge color="primary">{key.alg}</Badge>}
            <Badge color="info">{key.kty}</Badge>
            {key.use && <Badge color="success">{key.use}</Badge>}
          </div>
        </div>
        <div className="p-4">
          <div className="mb-2">
            <span className="font-medium">Type:</span> {key.kty}
          </div>
          
          {key.alg && (
            <div className="mb-2">
              <span className="font-medium">Algorithm:</span> {key.alg}
            </div>
          )}
          
          {key.use && (
            <div className="mb-2">
              <span className="font-medium">Use:</span> {key.use}
            </div>
          )}
          
          {key.key_ops && (
            <div className="mb-2">
              <span className="font-medium">Operations:</span> {key.key_ops.join(', ')}
            </div>
          )}
          
          {/* RSA specific fields */}
          {key.kty === 'RSA' && key.n && (
            <div className="mb-2">
              <span className="font-medium">Modulus (n):</span>
              <div className="mt-1 font-mono text-xs bg-gray-50 dark:bg-gray-800 p-1 rounded-md break-all">
                {key.n}
              </div>
            </div>
          )}
          
          {key.kty === 'RSA' && key.e && (
            <div className="mb-2">
              <span className="font-medium">Exponent (e):</span> {key.e}
            </div>
          )}
          
          {/* EC specific fields */}
          {key.kty === 'EC' && (
            <>
              {key.crv && (
                <div className="mb-2">
                  <span className="font-medium">Curve:</span> {key.crv}
                </div>
              )}
              {key.x && (
                <div className="mb-2">
                  <span className="font-medium">X:</span>
                  <div className="mt-1 font-mono text-xs bg-gray-50 dark:bg-gray-800 p-1 rounded-md break-all">
                    {key.x}
                  </div>
                </div>
              )}
              {key.y && (
                <div className="mb-2">
                  <span className="font-medium">Y:</span>
                  <div className="mt-1 font-mono text-xs bg-gray-50 dark:bg-gray-800 p-1 rounded-md break-all">
                    {key.y}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="light" 
              size="sm"
              onClick={() => handleCopy(keyJson, `key_${index}`)}
            >
              {copied && copiedItem === `key_${index}` ? 'Copied!' : 'Copy Key JSON'}
            </Button>
          </div>
        </div>
      </Card>
    );
  };
  
  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">JWKS Probe</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and explore JSON Web Key Sets (JWKS) to verify JWT signatures.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800 mb-6">
          <div className="flex items-start">
            <div className="mr-3 text-blue-600 dark:text-blue-400 text-lg">ℹ️</div>
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">What is JWKS?</h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                A JSON Web Key Set is a JSON document that represents a set of public keys as a JSON object. 
                JWKS endpoints are used to publish the public keys needed to verify JWT signatures.
                This tool helps you retrieve and inspect these keys.
              </p>
            </div>
          </div>
        </div>
        
        <Card className="mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">JWKS Endpoint Configuration</h3>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL Type
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="jwks"
                    checked={urlType === 'jwks'}
                    onChange={() => setUrlType('jwks')}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">JWKS Endpoint</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="oidc"
                    checked={urlType === 'oidc'}
                    onChange={() => setUrlType('oidc')}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">OIDC Discovery</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="jwks-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {urlType === 'jwks' ? 'JWKS URL' : 'OIDC Discovery URL'}
              </label>
              <div className="flex">
                <TextInput
                  id="jwks-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={
                    urlType === 'jwks' 
                      ? 'https://example.com/.well-known/jwks.json' 
                      : 'https://example.com/.well-known/openid-configuration'
                  }
                  className="flex-grow"
                />
                <Button
                  onClick={getSampleUrl}
                  variant="light"
                  className="ml-2"
                >
                  Sample
                </Button>
              </div>
              
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {urlType === 'jwks' 
                  ? 'Direct URL to a JWKS endpoint containing public keys' 
                  : 'URL to an OpenID Connect discovery document'}
              </p>
              
              {decoded?.payload?.iss && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded-md">
                  Token issuer detected: <span className="font-medium">{decoded.payload.iss}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleFetch}
                variant="primary"
                disabled={!url || isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Fetching...
                  </>
                ) : (
                  'Fetch Keys'
                )}
              </Button>
            </div>
          </div>
        </Card>
        
        {error && (
          <Alert type="error" className="mb-6">{error}</Alert>
        )}
        
        {oidcConfig && (
          <Card className="mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold">OIDC Configuration</h3>
              <Button 
                variant="light"
                size="sm"
                onClick={() => {
                  const configJson = JSON.stringify(oidcConfig, null, 2);
                  handleCopy(configJson, 'oidc_config');
                }}
              >
                {copied && copiedItem === 'oidc_config' ? 'Copied!' : 'Copy Full Config'}
              </Button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {oidcConfig.issuer && (
                  <div>
                    <span className="font-medium">Issuer:</span> {oidcConfig.issuer}
                  </div>
                )}
                {oidcConfig.jwks_uri && (
                  <div>
                    <span className="font-medium">JWKS URI:</span> {oidcConfig.jwks_uri}
                  </div>
                )}
                {oidcConfig.token_endpoint && (
                  <div>
                    <span className="font-medium">Token Endpoint:</span> {oidcConfig.token_endpoint}
                  </div>
                )}
                {oidcConfig.authorization_endpoint && (
                  <div>
                    <span className="font-medium">Authorization Endpoint:</span> {oidcConfig.authorization_endpoint}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium mb-2">Available Scopes:</h4>
                <div className="flex flex-wrap gap-2">
                  {oidcConfig.scopes_supported?.slice(0, 8).map((scope: string) => (
                    <Badge key={scope} color="info">{scope}</Badge>
                  ))}
                  {oidcConfig.scopes_supported?.length > 8 && (
                    <Badge color="light">+{oidcConfig.scopes_supported.length - 8} more</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {jwksList.length > 0 && (
          <div className="mb-6">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Keys Found ({jwksList.length})</h3>
              {matchedKey && decoded?.header?.kid && (
                <Badge color="success">
                  Found matching key for KID: {decoded.header.kid}
                </Badge>
              )}
            </div>
            
            {decoded?.header?.kid && !matchedKey && jwksList.length > 0 && (
              <Alert type="warning" className="mb-4">
                No key matching the token's kid "{decoded.header.kid}" was found in the JWKS.
              </Alert>
            )}
            
            {jwksList.map((key, index) => renderKeyCard(key, index))}
          </div>
        )}
        
        {jwksList.length > 0 && (
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">JWKS Usage Guide</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <h4 className="font-medium">How to use a JWKS to verify a JWT:</h4>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>Decode the JWT to extract the header and identify the key ID (kid)</li>
                  <li>Find the matching key in the JWKS with the same kid</li>
                  <li>Extract the public key components from the JWK (modulus, exponent for RSA)</li>
                  <li>Use the public key to verify the JWT signature with the algorithm specified in the header</li>
                </ol>
                
                <h4 className="font-medium mt-4">Security Best Practices:</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Always validate the signature of JWTs using the public keys from the JWKS</li>
                  <li>Check that the key's intended use (if specified) matches your use case</li>
                  <li>Consider caching the JWKS to improve performance, but refresh regularly</li>
                  <li>Always use HTTPS when fetching JWKS endpoints</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};