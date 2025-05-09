import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  TextInput,
  TabGroup,
  Tab,
  TabPanel,
  Badge
} from '../../../design-system';
import * as cryptoWorker from '../workers/cryptoWorker';

type AlgorithmType = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512' | 'none';

interface ClaimValue {
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

/**
 * JWT Builder component - handles step-by-step JWT creation
 */
export const BuilderWizard: React.FC = () => {
  // Wizard states
  const [activeStep, setActiveStep] = useState<'header' | 'payload' | 'signature'>('header');
  
  // Header configuration
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('HS256');
  const [keyId, setKeyId] = useState<string>('');
  const [type, setType] = useState<string>('JWT');
  
  // Payload configuration
  const [claims, setClaims] = useState<ClaimValue[]>([
    { name: 'sub', value: '1234567890', type: 'string' },
    { name: 'name', value: 'John Doe', type: 'string' },
    { name: 'iat', value: String(Math.floor(Date.now() / 1000)), type: 'number' }
  ]);
  const [newClaimName, setNewClaimName] = useState<string>('');
  const [newClaimValue, setNewClaimValue] = useState<string>('');
  const [newClaimType, setNewClaimType] = useState<'string' | 'number' | 'boolean' | 'json'>('string');
  
  // Signature configuration
  const [privateKey, setPrivateKey] = useState<string>('your-256-bit-secret');
  
  // Result
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [tokenSizeBytes, setTokenSizeBytes] = useState<number>(0);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Reset the copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  // Update example token when anything changes
  useEffect(() => {
    updatePreview();
  }, [algorithm, keyId, type, claims]);
  
  const updatePreview = async () => {
    try {
      // Prepare header
      const header: Record<string, any> = { 
        alg: algorithm, 
        typ: type 
      };
      
      if (keyId) {
        header.kid = keyId;
      }
      
      // Prepare payload
      const payload: Record<string, any> = {};
      for (const claim of claims) {
        try {
          // Convert claim values to the appropriate type
          switch(claim.type) {
            case 'string':
              payload[claim.name] = claim.value;
              break;
            case 'number':
              payload[claim.name] = Number(claim.value);
              break;
            case 'boolean':
              payload[claim.name] = claim.value.toLowerCase() === 'true';
              break;
            case 'json':
              payload[claim.name] = JSON.parse(claim.value);
              break;
          }
        } catch (e) {
          // If parsing fails, just use the raw value
          payload[claim.name] = claim.value;
        }
      }
      
      // Generate a preview token with a dummy signature (not cryptographically valid)
      const headerBase64 = cryptoWorker.base64UrlEncode(JSON.stringify(header));
      const payloadBase64 = cryptoWorker.base64UrlEncode(JSON.stringify(payload));
      
      const previewToken = `${headerBase64}.${payloadBase64}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
      setGeneratedToken(previewToken);
      setTokenSizeBytes(new TextEncoder().encode(previewToken).length);
    } catch (e) {
      console.error('Error generating token preview:', e);
    }
  };
  
  const addClaim = () => {
    if (!newClaimName || !newClaimName.trim()) return;
    
    setClaims([
      ...claims,
      {
        name: newClaimName.trim(),
        value: newClaimValue,
        type: newClaimType
      }
    ]);
    
    setNewClaimName('');
    setNewClaimValue('');
  };
  
  const removeClaim = (index: number) => {
    const updatedClaims = [...claims];
    updatedClaims.splice(index, 1);
    setClaims(updatedClaims);
  };
  
  const handleClaimChange = (index: number, field: keyof ClaimValue, value: string) => {
    const updatedClaims = [...claims];
    if (field === 'type') {
      updatedClaims[index][field] = value as 'string' | 'number' | 'boolean' | 'json';
    } else {
      updatedClaims[index][field] = value;
    }
    setClaims(updatedClaims);
  };
  
  const handleSignToken = async () => {
    setIsSigning(true);
    setSignError(null);
    
    try {
      // Prepare header as JwtHeader type with required alg property
      const header: cryptoWorker.JwtHeader = { 
        alg: algorithm, 
        typ: type 
      };
      
      if (keyId) {
        header.kid = keyId;
      }
      
      // Prepare payload
      const payload: Record<string, any> = {};
      for (const claim of claims) {
        try {
          switch(claim.type) {
            case 'string':
              payload[claim.name] = claim.value;
              break;
            case 'number':
              payload[claim.name] = Number(claim.value);
              break;
            case 'boolean':
              payload[claim.name] = claim.value.toLowerCase() === 'true';
              break;
            case 'json':
              payload[claim.name] = JSON.parse(claim.value);
              break;
          }
        } catch (e) {
          payload[claim.name] = claim.value;
        }
      }
      
      // Sign the token
      const token = await cryptoWorker.sign(header, payload, privateKey);
      setGeneratedToken(token);
      setTokenSizeBytes(new TextEncoder().encode(token).length);
    } catch (e) {
      setSignError(`Error signing token: ${e instanceof Error ? e.message : String(e)}`);
    }
    
    setIsSigning(false);
  };
  
  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
  };

  const handleGenerateKeyPair = async () => {
    try {
      setIsGeneratingKeys(true);
      
      // Dynamically import the cryptoWorker module
      const cryptoWorker = await import('../workers/cryptoWorker');
      
      // Generate the key pair
      const { publicKey, privateKey } = await cryptoWorker.generateKeyPair(
        signatureConfig.algorithm,
        signatureConfig.keySize || 2048
      );
      
      setSignatureConfig({
        ...signatureConfig,
        publicKey,
        privateKey
      });
    } catch (error) {
      console.error('Error generating key pair:', error);
      setKeyError(String(error));
    } finally {
      setIsGeneratingKeys(false);
    }
  };
  
  // Render header configuration step
  const renderHeaderStep = () => (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Algorithm (alg)
          </label>
          <select 
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <optgroup label="HMAC">
              <option value="HS256">HS256 (HMAC + SHA256)</option>
              <option value="HS384">HS384 (HMAC + SHA384)</option>
              <option value="HS512">HS512 (HMAC + SHA512)</option>
            </optgroup>
            <optgroup label="RSA">
              <option value="RS256">RS256 (RSA + SHA256)</option>
              <option value="RS384">RS384 (RSA + SHA384)</option>
              <option value="RS512">RS512 (RSA + SHA512)</option>
            </optgroup>
            <optgroup label="ECDSA">
              <option value="ES256">ES256 (ECDSA + SHA256)</option>
              <option value="ES384">ES384 (ECDSA + SHA384)</option>
              <option value="ES512">ES512 (ECDSA + SHA512)</option>
            </optgroup>
            <optgroup label="Unsafe">
              <option value="none">none (Unsigned Token)</option>
            </optgroup>
          </select>
          
          {algorithm === 'none' && (
            <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
              Warning: The "none" algorithm creates unsigned tokens which provide no security.
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Token Type (typ)
          </label>
          <TextInput
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="JWT"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Usually "JWT" for JSON Web Token
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Key ID (kid)
        </label>
        <TextInput
          value={keyId}
          onChange={(e) => setKeyId(e.target.value)}
          placeholder="Optional Key ID"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Optional identifier for the key used to sign this token
        </p>
      </div>
      
      <div className="mt-6 flex justify-between">
        <div></div>
        <Button 
          variant="primary"
          onClick={() => setActiveStep('payload')}
        >
          Continue to Payload
        </Button>
      </div>
    </div>
  );
  
  // Render payload configuration step
  const renderPayloadStep = () => (
    <div className="p-4">
      <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Current Claims</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-2 px-3">Claim</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Value</th>
                <th className="text-right py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-3">
                    <TextInput 
                      value={claim.name}
                      onChange={(e) => handleClaimChange(index, 'name', e.target.value)}
                      size="sm"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select 
                      value={claim.type}
                      onChange={(e) => handleClaimChange(index, 'type', e.target.value)}
                      className="p-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="json">JSON</option>
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <TextInput 
                      value={claim.value}
                      onChange={(e) => handleClaimChange(index, 'value', e.target.value)}
                      size="sm"
                    />
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Button 
                      variant="light" 
                      size="sm"
                      onClick={() => removeClaim(index)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Add Claim</h4>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <TextInput 
                value={newClaimName}
                onChange={(e) => setNewClaimName(e.target.value)}
                placeholder="Claim name"
                size="sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select 
                value={newClaimType}
                onChange={(e) => setNewClaimType(e.target.value as 'string' | 'number' | 'boolean' | 'json')}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
              <div className="flex items-center">
                <TextInput 
                  value={newClaimValue}
                  onChange={(e) => setNewClaimValue(e.target.value)}
                  placeholder="Value"
                  size="sm"
                  className="flex-grow"
                />
                <Button 
                  variant="primary"
                  size="sm"
                  className="ml-2"
                  onClick={addClaim}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Common Claims</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="light" 
              size="sm"
              onClick={() => {
                if (!claims.some(c => c.name === 'exp')) {
                  setClaims([
                    ...claims,
                    {
                      name: 'exp',
                      value: String(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
                      type: 'number'
                    }
                  ]);
                }
              }}
            >
              Add exp (Expiry)
            </Button>
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => {
                if (!claims.some(c => c.name === 'iat')) {
                  setClaims([
                    ...claims,
                    {
                      name: 'iat',
                      value: String(Math.floor(Date.now() / 1000)),
                      type: 'number'
                    }
                  ]);
                }
              }}
            >
              Add iat (Issued At)
            </Button>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => {
                if (!claims.some(c => c.name === 'nbf')) {
                  setClaims([
                    ...claims,
                    {
                      name: 'nbf',
                      value: String(Math.floor(Date.now() / 1000)),
                      type: 'number'
                    }
                  ]);
                }
              }}
            >
              Add nbf (Not Before)
            </Button>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => {
                if (!claims.some(c => c.name === 'iss')) {
                  setClaims([
                    ...claims,
                    {
                      name: 'iss',
                      value: 'https://example.com',
                      type: 'string'
                    }
                  ]);
                }
              }}
            >
              Add iss (Issuer)
            </Button>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => {
                if (!claims.some(c => c.name === 'aud')) {
                  setClaims([
                    ...claims,
                    {
                      name: 'aud',
                      value: 'client-id',
                      type: 'string'
                    }
                  ]);
                }
              }}
            >
              Add aud (Audience)
            </Button>
            <Button
              variant="light"
              size="sm"
              onClick={() => {
                if (!claims.some(c => c.name === 'jti')) {
                  setClaims([
                    ...claims,
                    {
                      name: 'jti',
                      value: crypto.randomUUID(),
                      type: 'string'
                    }
                  ]);
                }
              }}
            >
              Add jti (JWT ID)
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <Button 
          variant="light"
          onClick={() => setActiveStep('header')}
        >
          Back to Header
        </Button>
        <Button 
          variant="primary"
          onClick={() => setActiveStep('signature')}
        >
          Continue to Signature
        </Button>
      </div>
    </div>
  );
  
  // Render signature configuration step
  const renderSignatureStep = () => {
    let keyLabel = "Secret Key";
    let keyHelp = "Enter the secret key for HMAC signing";
    
    if (algorithm.startsWith('RS')) {
      keyLabel = "Private Key (PKCS#8)";
      keyHelp = "Enter the PEM-formatted RSA private key";
    } else if (algorithm.startsWith('ES')) {
      keyLabel = "Private Key (PKCS#8)";
      keyHelp = "Enter the PEM-formatted EC private key";
    } else if (algorithm === 'none') {
      keyLabel = "No Key Required";
      keyHelp = "The 'none' algorithm does not use a key";
    }
    
    return (
      <div className="p-4">
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-200 text-sm flex items-center">
            <span className="mr-2">ℹ️</span>
            You're creating a token with algorithm <strong>{algorithm}</strong> and {claims.length} claims.
            {algorithm === 'none' && (
              <span className="text-red-600 dark:text-red-400 ml-1"> (Unsigned Token - Not secure)</span>
            )}
          </p>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {keyLabel}
          </label>
          <textarea
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder={algorithm === 'none' ? 'No key needed for "none" algorithm' : 'Enter key here...'}
            disabled={algorithm === 'none'}
            className="w-full font-mono h-32 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-gray-200"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {keyHelp}
          </p>
        </div>
        
        <div className="mt-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSignToken}
            disabled={isSigning || (algorithm !== 'none' && !privateKey)}
          >
            {isSigning ? 'Signing...' : 'Sign Token'}
          </Button>
        </div>
        
        {signError && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-300 text-sm">{signError}</p>
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <Button 
            variant="light"
            onClick={() => setActiveStep('payload')}
          >
            Back to Payload
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="flex justify-center">
        <div className="w-full max-w-5xl px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">JWT Builder</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and sign custom JSON Web Tokens with our step-by-step wizard.
            </p>
          </div>
      
          <Card className="mb-6">
            <TabGroup>
              <div className="border-b border-gray-200 dark:border-gray-700">
                <Tab 
                  id="header-tab"
                  isActive={activeStep === 'header'} 
                  onClick={() => setActiveStep('header')}
                >
                  1. Header
                </Tab>
                <Tab 
                  id="payload-tab"
                  isActive={activeStep === 'payload'} 
                  onClick={() => setActiveStep('payload')}
                >
                  2. Payload
                </Tab>
                <Tab 
                  id="signature-tab"
                  isActive={activeStep === 'signature'} 
                  onClick={() => setActiveStep('signature')}
                >
                  3. Signature
                </Tab>
              </div>
              
              {activeStep === 'header' && renderHeaderStep()}
              {activeStep === 'payload' && renderPayloadStep()}
              {activeStep === 'signature' && renderSignatureStep()}
            </TabGroup>
          </Card>
          
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Generated Token</h3>
              <Badge color="info">Size: {tokenSizeBytes} bytes</Badge>
            </div>
            
            <div className="p-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 font-mono text-sm overflow-x-auto whitespace-nowrap">
                {generatedToken || 'Your token will appear here...'}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleCopyToken}
                  variant="primary"
                  disabled={!generatedToken}
                >
                  {copied ? 'Copied!' : 'Copy Token'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};