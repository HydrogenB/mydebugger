import React, { useState, useEffect } from 'react';
import { TextArea } from '../../../design-system/components/inputs/TextArea';
import { Button } from '../../../design-system/components/inputs/Button';
import { SelectInput } from '../../../design-system/components/inputs/Select';
import { Card } from '../../../design-system/components/layout/Card';
import { Alert } from '../../../design-system/components/feedback/Alert';
import { DecodedJwt } from '../types';

interface VerificationPanelProps {
  decoded: DecodedJwt | null;
  verificationKey: string;
  onVerify: (key: string) => void;
  isVerified: boolean | null;
  error: string | null;
}

/**
 * Component for JWT token verification
 * Handles user input for verification key and verification process
 */
export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  decoded,
  verificationKey,
  onVerify,
  isVerified,
  error
}) => {
  const [key, setKey] = useState<string>(verificationKey);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');
  
  // Update algorithm selection based on token header
  useEffect(() => {
    if (decoded?.header?.alg) {
      setSelectedAlgorithm(decoded.header.alg);
    }
  }, [decoded]);
  
  // Synchronize key with prop
  useEffect(() => {
    setKey(verificationKey);
  }, [verificationKey]);
  
  // Handle verification
  const handleVerify = () => {
    onVerify(key);
  };
  
  // Get default placeholder based on algorithm
  const getPlaceholder = (): string => {
    if (!selectedAlgorithm) return 'Enter your verification key...';
    
    if (selectedAlgorithm.startsWith('HS')) {
      return 'Enter your secret key...';
    }
    
    if (selectedAlgorithm.startsWith('RS') || selectedAlgorithm.startsWith('ES') || selectedAlgorithm.startsWith('PS')) {
      return 'Enter public key (PEM format)...';
    }
    
    return 'Enter your verification key...';
  };
  
  // Generate key helper text
  const getKeyHelperText = (): string => {
    if (!selectedAlgorithm) return '';
    
    if (selectedAlgorithm === 'none') {
      return 'Warning: Algorithm "none" provides no security!';
    }
    
    if (selectedAlgorithm.startsWith('HS')) {
      return 'For HMAC algorithms, enter the shared secret key';
    }
    
    if (selectedAlgorithm.startsWith('RS') || selectedAlgorithm.startsWith('ES') || selectedAlgorithm.startsWith('PS')) {
      return 'For asymmetric algorithms, enter the public key in PEM format';
    }
    
    return '';
  };
  
  return (
    <Card className="p-4 mt-4">
      <h3 className="text-lg font-medium mb-3">Signature Verification</h3>
      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Algorithm
        </label>
        <SelectInput
          value={selectedAlgorithm}
          onChange={(e) => setSelectedAlgorithm(e.target.value)}
          disabled={true}
          options={[
            { label: 'Select algorithm', value: '' },
            { label: 'HS256 - HMAC with SHA-256', value: 'HS256' },
            { label: 'HS384 - HMAC with SHA-384', value: 'HS384' },
            { label: 'HS512 - HMAC with SHA-512', value: 'HS512' },
            { label: 'RS256 - RSA with SHA-256', value: 'RS256' },
            { label: 'RS384 - RSA with SHA-384', value: 'RS384' },
            { label: 'RS512 - RSA with SHA-512', value: 'RS512' },
            { label: 'ES256 - ECDSA with SHA-256', value: 'ES256' },
            { label: 'ES384 - ECDSA with SHA-384', value: 'ES384' },
            { label: 'ES512 - ECDSA with SHA-512', value: 'ES512' },
            { label: 'none - No signature', value: 'none' },
          ]}
          className="w-full"
        />
        
        {getKeyHelperText() && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {getKeyHelperText()}
          </p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Secret Key / Public Key
        </label>
        <TextArea
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={getPlaceholder()}
          rows={5}
          className="font-mono text-sm w-full"
        />
      </div>
      
      <Button
        variant="primary"
        onClick={handleVerify}
        disabled={!decoded || selectedAlgorithm === 'none'}
        className="w-full"
      >
        Verify Signature
      </Button>
      
      {isVerified !== null && !error && (
        <Alert
          variant={isVerified ? 'success' : 'error'}
          className="mt-3"
        >
          {isVerified 
            ? 'Signature verified successfully!'
            : 'Signature verification failed!'}
        </Alert>
      )}
      
      {error && (
        <Alert
          variant="error"
          className="mt-3"
        >
          {error}
        </Alert>
      )}
    </Card>
  );
};
