import { useState, useCallback } from 'react';
import { DecodedJwt } from '../types';

/**
 * Custom hook for decoding JWT tokens
 */
export const useJwtDecoder = () => {
  const [decodedToken, setDecodedToken] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Decode a JWT token
   * @param token The JWT token to decode
   * @returns The decoded token or null if invalid
   */
  const decodeToken = useCallback((token: string): DecodedJwt | null => {
    try {
      setError(null);
      
      // Clean the token
      const cleanedToken = token.trim();
      
      if (!cleanedToken) {
        setError('Token is empty');
        return null;
      }
      
      // Split the token into parts
      const parts = cleanedToken.split('.');
      
      if (parts.length !== 3) {
        setError('Invalid token format. JWT tokens should have three parts separated by dots.');
        return null;
      }
      
      // Decode each part
      const decodedHeader = JSON.parse(atob(parts[0]));
      
      // Handle padding for base64url format
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - payloadBase64.length % 4) % 4);
      const decodedPayload = JSON.parse(atob(payloadBase64 + padding));
      
      const decoded: DecodedJwt = {
        header: decodedHeader,
        payload: decodedPayload,
        signature: parts[2],
        raw: {
          header: parts[0],
          payload: parts[1],
          signature: parts[2]
        }
      };
      
      setDecodedToken(decoded);
      return decoded;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decode token';
      setError(errorMessage);
      setDecodedToken(null);
      return null;
    }
  }, []);

  return {
    decodedToken,
    error,
    decodeToken,
    clearToken: () => setDecodedToken(null)
  };
};
