import React, { createContext, useContext, useState, useReducer, ReactNode } from 'react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

// Types for JWT parts
export interface JwtParts {
  header: any;
  payload: any;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  }
}

// Types for the history item
export interface HistoryItem {
  id: string;
  token: string;
  timestamp: number;
  label: string;
}

// Interface for the context state
interface JwtState {
  token: string;
  decoded: JwtParts | null;
  isVerified: boolean | null;
  verificationKey: string;
  error: string | null;
  history: HistoryItem[];
  securityIssues: SecurityIssue[];
  parsingWarnings: string[];
}

// Interface for security findings
export interface SecurityIssue {
  id: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
}

// Actions for the reducer
type JwtAction = 
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'SET_DECODED'; payload: JwtParts | null }
  | { type: 'SET_VERIFIED'; payload: boolean | null }
  | { type: 'SET_VERIFICATION_KEY'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_HISTORY_ITEM'; payload: HistoryItem }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'REMOVE_HISTORY_ITEM'; payload: string }
  | { type: 'SET_SECURITY_ISSUES'; payload: SecurityIssue[] }
  | { type: 'SET_PARSING_WARNINGS'; payload: string[] }
  | { type: 'RESET' };

// Initial state
const initialState: JwtState = {
  token: '',
  decoded: null,
  isVerified: null,
  verificationKey: '',
  error: null,
  history: [],
  securityIssues: [],
  parsingWarnings: [],
};

// State reducer
function jwtReducer(state: JwtState, action: JwtAction): JwtState {
  switch (action.type) {
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_DECODED':
      return { ...state, decoded: action.payload };
    case 'SET_VERIFIED':
      return { ...state, isVerified: action.payload };
    case 'SET_VERIFICATION_KEY':
      return { ...state, verificationKey: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_HISTORY_ITEM':
      // Add and maintain most recent first, limit to 10 items
      return { 
        ...state, 
        history: [action.payload, ...state.history.filter(item => item.id !== action.payload.id)].slice(0, 10) 
      };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'REMOVE_HISTORY_ITEM':
      return { 
        ...state, 
        history: state.history.filter(item => item.id !== action.payload) 
      };
    case 'SET_SECURITY_ISSUES':
      return { ...state, securityIssues: action.payload };
    case 'SET_PARSING_WARNINGS':
      return { ...state, parsingWarnings: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Create the context
type JwtContextType = {
  state: JwtState;
  dispatch: React.Dispatch<JwtAction>;
  // Helper functions
  decodeToken: (token: string) => Promise<void>;
  verifySignature: (algorithm: string, key: string) => Promise<void>;
  analyzeToken: (token: string) => void;
  shareToken: () => string;
  loadFromHash: () => Promise<boolean>;
};

const JwtContext = createContext<JwtContextType | undefined>(undefined);

// Provider component
export const JwtProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(jwtReducer, initialState);

  // Initialize from URL hash if present
  React.useEffect(() => {
    loadFromHash();
  }, []);

  // Save history to local storage
  React.useEffect(() => {
    try {
      localStorage.setItem('jwt.history', JSON.stringify(state.history));
    } catch (e) {
      console.error('Failed to save JWT history:', e);
    }
  }, [state.history]);

  // Load history from local storage on mount
  React.useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('jwt.history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory) as HistoryItem[];
        history.forEach(item => {
          dispatch({ type: 'ADD_HISTORY_ITEM', payload: item });
        });
      }
    } catch (e) {
      console.error('Failed to load JWT history:', e);
    }
  }, []);

  // Helper to decode a JWT token
  const decodeToken = async (token: string): Promise<void> => {
    if (!token) {
      dispatch({ type: 'SET_DECODED', payload: null });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_VERIFIED', payload: null });
      dispatch({ type: 'SET_PARSING_WARNINGS', payload: [] });
      return;
    }
    
    try {
      // Clean up the token - handle "Bearer" prefix and whitespace
      token = token.trim();
      if (token.toLowerCase().startsWith('bearer ')) {
        token = token.substring(7).trim();
      }
      
      // Try to import the worker if available
      const cryptoWorker = await import('../workers/cryptoWorker');
      const decoded = await cryptoWorker.decode(token);
      
      // Track warnings that are not fatal errors
      const warnings: string[] = [];
      if (decoded.error) {
        warnings.push(decoded.error);
      }
      
      // Convert DecodedJwt to JwtParts
      if (decoded.header && decoded.payload && decoded.signature) {
        const jwtParts: JwtParts = {
          header: decoded.header,
          payload: decoded.payload,
          signature: decoded.signature,
          raw: decoded.raw
        };
        
        dispatch({ type: 'SET_TOKEN', payload: token });
        dispatch({ type: 'SET_DECODED', payload: jwtParts });
        dispatch({ type: 'SET_ERROR', payload: null });
        dispatch({ type: 'SET_PARSING_WARNINGS', payload: warnings });
        
        // Reset verification status when token changes
        dispatch({ type: 'SET_VERIFIED', payload: null });
        
        // Add to history with null checks for payload
        const label = decoded.payload?.sub || decoded.payload?.name || 
          `Token ${new Date().toLocaleDateString()}`;
        
        dispatch({
          type: 'ADD_HISTORY_ITEM',
          payload: {
            id: Math.random().toString(36).substring(2, 9),
            token,
            timestamp: Date.now(),
            label
          }
        });
        
        // Analyze token for security issues
        analyzeToken(token);
      } else {
        throw new Error('Failed to decode JWT: Invalid token structure');
      }
    } catch (err) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: err instanceof Error ? err.message : 'Failed to decode JWT'
      });
      dispatch({ type: 'SET_DECODED', payload: null });
      dispatch({ type: 'SET_VERIFIED', payload: null });
      dispatch({ type: 'SET_PARSING_WARNINGS', payload: [] });
    }
  };

  // Helper to verify the signature
  const verifySignature = async (algorithm: string, key: string): Promise<void> => {
    if (!state.token || !key) {
      dispatch({ type: 'SET_VERIFIED', payload: null });
      return;
    }
    
    try {
      // Try to import the worker if available
      const cryptoWorker = await import('../workers/cryptoWorker');
      
      // The cryptoWorker now has enhanced key format detection
      // so we can directly pass the key as is
      const isValid = await cryptoWorker.verify(
        state.token,
        key,
        (algorithm || state.decoded?.header?.alg || 'HS256'), // Simplified the complex OR for now
      );
      
      dispatch({ type: 'SET_VERIFICATION_KEY', payload: key });
      dispatch({ type: 'SET_VERIFIED', payload: isValid });
      
      // If verification failed, check if algorithm mismatch
      if (!isValid && state.decoded && algorithm && state.decoded.header.alg !== algorithm) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `Algorithm mismatch: Token uses ${state.decoded.header.alg} but ${algorithm} was specified for verification`
        });
      } else if (!isValid) {
        dispatch({ type: 'SET_ERROR', payload: 'Signature verification failed' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: null });
      }
    } catch (err) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: err instanceof Error ? err.message : 'Failed to verify signature'
      });
      dispatch({ type: 'SET_VERIFIED', payload: false });
    }
  };

  // Find the verify method and correct the parameter issue
  const verify = async (key: string, algorithm?: string) => {
    try {
      if (!state.decoded || !state.token) {
        throw new Error('No token to verify');
      }
  
      // Import crypto worker if not already imported
      const cryptoWorker = await import('../workers/cryptoWorker');
      
      const alg = algorithm || state.decoded?.header?.alg || 'HS256';
      
      // Pass the correct number of arguments
      const isValid = await cryptoWorker.verify(
        state.token,
        key,
        alg
      );
      
      dispatch({ type: 'SET_VERIFICATION_KEY', payload: key });
      dispatch({ type: 'SET_VERIFIED', payload: isValid });
      
      // If verification failed, check if algorithm mismatch
      if (!isValid && state.decoded && algorithm && state.decoded.header.alg !== algorithm) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `Algorithm mismatch: Token uses ${state.decoded.header.alg} but ${algorithm} was specified for verification`
        });
      } else if (!isValid) {
        dispatch({ type: 'SET_ERROR', payload: 'Signature verification failed' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: null });
      }
    } catch (err) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: err instanceof Error ? err.message : 'Failed to verify signature'
      });
      dispatch({ type: 'SET_VERIFIED', payload: false });
    }
  };

  // Analyze a token for potential security issues
  const analyzeToken = (token: string) => {
    if (!state.decoded) return;
    
    const issues: SecurityIssue[] = [];
    
    // Check for algorithm none
    if (state.decoded.header.alg === 'none') {
      issues.push({
        id: 'alg-none',
        severity: 'high',
        title: 'UNSIGNED TOKEN',
        description: 'The token uses algorithm "none" and has no signature. Do not accept in production.'
      });
    }
    
    // Check for expiration
    if (state.decoded.payload.exp) {
      const expiration = state.decoded.payload.exp * 1000; // Convert to milliseconds
      
      if (Date.now() > expiration) {
        issues.push({
          id: 'token-expired',
          severity: 'medium',
          title: 'Token Expired',
          description: `Token expired on ${new Date(expiration).toLocaleString()}.`
        });
      }
      
      // Check if token expires within 24 hours
      const dayMs = 24 * 60 * 60 * 1000;
      if (expiration - Date.now() < dayMs && Date.now() < expiration) {
        issues.push({
          id: 'token-expiring',
          severity: 'low',
          title: 'Token Expiring Soon',
          description: `Token will expire on ${new Date(expiration).toLocaleString()}.`
        });
      }
    } else {
      // No expiration time specified
      issues.push({
        id: 'no-expiration',
        severity: 'medium',
        title: 'No Expiration Time',
        description: 'This token has no expiration time (exp claim), which is not recommended.'
      });
    }
    
    // Check for weak algorithm
    if (state.decoded.header.alg) {
      if (!['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 
             'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512'].includes(state.decoded.header.alg)) {
        issues.push({
          id: 'unsupported-algorithm',
          severity: 'high',
          title: 'Unsupported Algorithm',
          description: `Algorithm ${state.decoded.header.alg} is not among the standard supported JWT algorithms.`
        });
      }
      else if (['HS256', 'RS256'].includes(state.decoded.header.alg)) {
        issues.push({
          id: 'weak-algorithm',
          severity: 'info',
          title: 'Consider Stronger Algorithm',
          description: `Algorithm ${state.decoded.header.alg} is widely used but consider stronger alternatives like ES256 or PS256 for better security.`
        });
      }
    }
    
    // Check for missing key ID in asymmetric algorithms
    if (state.decoded.header.alg && 
        !state.decoded.header.alg.startsWith('HS') && 
        !state.decoded.header.kid) {
      issues.push({
        id: 'missing-kid',
        severity: 'low',
        title: 'Missing Key Identifier',
        description: 'This token uses an asymmetric algorithm but has no "kid" (key ID) claim in the header.'
      });
    }
    
    // Check for proper values in standard claims
    if (state.decoded.payload.iat && typeof state.decoded.payload.iat !== 'number') {
      issues.push({
        id: 'invalid-iat',
        severity: 'medium',
        title: 'Invalid Issued At Claim',
        description: 'The "iat" claim should be a numeric timestamp.'
      });
    }
    
    if (state.decoded.payload.nbf) {
      const nbfTime = state.decoded.payload.nbf * 1000;
      if (nbfTime > Date.now()) {
        issues.push({
          id: 'future-nbf',
          severity: 'medium',
          title: 'Token Not Yet Valid',
          description: `This token is not valid until ${new Date(nbfTime).toLocaleString()}.`
        });
      }
    }
    
    dispatch({ type: 'SET_SECURITY_ISSUES', payload: issues });
  };

  // Generate a shareable URL with the token compressed in the hash
  const shareToken = (): string => {
    if (!state.token) return window.location.href.split('#')[0];
    
    const compressedToken = compressToEncodedURIComponent(state.token);
    const url = `${window.location.href.split('#')[0]}#${compressedToken}`;
    return url;
  };

  // Load token from URL hash
  const loadFromHash = async (): Promise<boolean> => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      try {
        const decompressedToken = decompressFromEncodedURIComponent(hash);
        if (decompressedToken) {
          await decodeToken(decompressedToken);
          return true;
        }
      } catch (e) {
        console.error('Failed to load token from URL hash:', e);
      }
    }
    return false;
  };

  return (
    <JwtContext.Provider 
      value={{ 
        state, 
        dispatch,
        decodeToken,
        verifySignature,
        analyzeToken,
        shareToken,
        loadFromHash
      }}
    >
      {children}
    </JwtContext.Provider>
  );
};

// Custom hook to use the JWT context
export const useJwt = () => {
  const context = useContext(JwtContext);
  if (context === undefined) {
    throw new Error('useJwt must be used within a JwtProvider');
  }
  return context;
};

// Legacy simplified provider for backward compatibility
export const JwtContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Implementation using the enhanced JwtProvider
  const jwtContext = useJwt();
  
  return <>{children}</>;
};

export const useJwtContext = () => {
  return useJwt();
};