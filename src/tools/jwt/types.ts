/**
 * Type definitions for the JWT toolkit tool
 */

/**
 * JWT header structure
 */
export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

/**
 * Decoded JWT token
 */
export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
}

/**
 * JWT verification result
 */
export interface VerificationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Security score details
 */
export interface SecurityScore {
  score: number;
  maxScore: number;
  details: {
    category: string;
    points: number;
    maxPoints: number;
    description: string;
  }[];
}

/**
 * JWK (JSON Web Key) structure
 */
export interface JsonWebKey {
  kty: string;
  use?: string;
  key_ops?: string[];
  alg?: string;
  kid?: string;
  x5u?: string;
  x5c?: string[];
  x5t?: string;
  'x5t#S256'?: string;
  [key: string]: any;
}

/**
 * JWKS (JSON Web Key Set) structure
 */
export interface JsonWebKeySet {
  keys: JsonWebKey[];
}

/**
 * Benchmark result item
 */
export interface BenchmarkResultItem {
  tokenType: string;
  alg: string;
  operation: 'sign' | 'verify';
  tokensPerSecond: number;
  avgTimeMs: number;
  totalRuns: number;
}
