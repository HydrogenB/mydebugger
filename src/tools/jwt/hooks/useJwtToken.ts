import { useState, useCallback, useEffect } from 'react';
import { DecodedJwt, SecurityIssue, JwtHeader, JwtPayload } from '../types';
import { analyzeTokenSecurity } from '../utils/analyzer';

/**
 * Custom hook for JWT token operations
 * Centralizes business logic for decoding, verifying and analyzing JWT tokens
 */
export const useJwtToken = () => {
  const [token, setToken] = useState<string>('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [verificationKey, setVerificationKey] = useState<string>('');
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const [parsingWarnings, setParsingWarnings] = useState<string[]>([]);
  const [history, setHistory] = useState<{id: string; token: string; timestamp: number; label: string}[]>([]);
  
  /**
   * Decode a JWT token
   * @param inputToken The JWT token to decode
   */
  const decodeToken = useCallback((inputToken: string): void => {
    try {
      setError(null);
      setToken(inputToken);
      
      // Clean the token
      const cleanedToken = inputToken.trim();
      
      if (!cleanedToken) {
        setDecoded(null);
        return;
      }
      
      // Split the token into parts
      const parts = cleanedToken.split('.');
      
      if (parts.length !== 3) {
        setError('Invalid token format. JWT tokens should have three parts separated by dots.');
        setDecoded(null);
        return;
      }
      
      // Decode each part
      const getJsonSafely = (base64String: string) => {
        try {
          // Handle padding for base64url format
          const standardBase64 = base64String.replace(/-/g, '+').replace(/_/g, '/');
          const padding = '='.repeat((4 - standardBase64.length % 4) % 4);
          const decodedString = atob(standardBase64 + padding);
          return JSON.parse(decodedString);
        } catch (e) {
          setParsingWarnings(prev => [...prev, `Failed to parse ${base64String}: ${e.message}`]);
          return null;
        }
      };
      
      const header = getJsonSafely(parts[0]);
      const payload = getJsonSafely(parts[1]);
      
      const decodedToken: DecodedJwt = {
        header,
        payload,
        signature: parts[2],
        raw: {
          header: parts[0],
          payload: parts[1],
          signature: parts[2]
        }
      };
      
      setDecoded(decodedToken);
      
      // Run security analysis on token
      analyzeToken(decodedToken);
    } catch (err) {
      setError(`Failed to decode token: ${err.message}`);
      setDecoded(null);
    }
  }, []);

  /**
   * Verify the JWT signature
   * @param key Secret key or public key for verification
   */
  const verifySignature = useCallback(async (key: string): Promise<void> => {
    if (!decoded || !token) {
      setError('No token to verify');
      setIsVerified(null);
      return;
    }
    
    setVerificationKey(key);
    
    try {
      // This is a placeholder - actual verification would use jsonwebtoken 
      // or Web Crypto API in a worker for better performance
      
      // For now, simulate verification
      const isValid = token.length > 0 && key.length > 0;
      setIsVerified(isValid);
      
    } catch (err) {
      setError(`Verification failed: ${err.message}`);
      setIsVerified(false);
    }
  }, [decoded, token]);

  /**
   * Analyze token for security issues
   * @param decodedToken Decoded JWT token to analyze
   */
  const analyzeToken = useCallback((decodedToken: DecodedJwt | null): void => {
    if (!decodedToken) {
      setSecurityIssues([]);
      return;
    }
    
    // Use the analyzer utility to check for security issues
    const issues = analyzeTokenSecurity(decodedToken);
    setSecurityIssues(issues);
  }, []);

  /**
   * Add token to history
   */
  const addToHistory = useCallback((tokenToSave: string, label: string = 'Untitled Token') => {
    const newHistoryItem = {
      id: Date.now().toString(),
      token: tokenToSave,
      timestamp: Date.now(),
      label
    };
    
    setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep only the last 10 items
  }, []);

  /**
   * Clear all state
   */
  const clearState = useCallback(() => {
    setToken('');
    setDecoded(null);
    setError(null);
    setIsVerified(null);
    setSecurityIssues([]);
    setParsingWarnings([]);
  }, []);

  return {
    // State
    token,
    decoded,
    error,
    isVerified,
    verificationKey,
    securityIssues,
    parsingWarnings,
    history,
    
    // Actions
    setToken,
    decodeToken,
    verifySignature,
    analyzeToken,
    addToHistory,
    clearState,
    setVerificationKey
  };
};
