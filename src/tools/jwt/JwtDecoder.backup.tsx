import React from 'react';
import { Card } from '../../design-system/components/layout';
import { TokenInput } from './components/TokenInput';
import { TokenDisplay } from './components/TokenDisplay';
import { VerificationPanel } from './components/VerificationPanel';
import { SecuritySummary } from './components/SecuritySummary';
import { useJwt } from './context/JwtContext';

/**
 * JWT Decoder Component
 * Main component for decoding, displaying and verifying JWT tokens
 */
const JwtDecoder: React.FC = () => {
  // Use the context for state management and operations
  const { state, decodeToken, verifySignature } = useJwt();
  const { token, decoded, error, isVerified, verificationKey, securityIssues } = state;
  
  // Clear the token
  const handleClear = () => {
    decodeToken('');
  };
  
  // Calculate security score based on issues
  const calculateSecurityScore = (): number => {
    if (!decoded || !securityIssues?.length) return 100;
    
    // Start with perfect score and deduct based on issues
    let score = 100;
    
    securityIssues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 25;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
        default:
          break;
      }
    });
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  };
  
  const securityScore = calculateSecurityScore();
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">JWT Decoder & Verifier</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* Token Input Section */}
          <TokenInput
            value={token}
            onChange={decodeToken}
            onClear={handleClear}
            error={error}
          />
          
          {/* Token Display Section */}
          {decoded && (
            <TokenDisplay 
              decoded={decoded}
              isVerified={isVerified}
            />
          )}
        </div>
        
        <div className="lg:col-span-1 space-y-4">
          {/* Verification Panel */}
          {decoded && (
            <VerificationPanel
              decoded={decoded}
              verificationKey={verificationKey}
              onVerify={(key) => verifySignature(key)}
              isVerified={isVerified}
              error={error}
            />
          )}
          
          {/* Security Summary */}
          {decoded && securityIssues && (
            <SecuritySummary 
              issues={securityIssues}
              score={securityScore}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default JwtDecoder;
