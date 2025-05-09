/**
 * JWT Crypto Worker
 * 
 * Handles all JWT cryptographic operations using Web Crypto API with fallbacks
 * All heavy crypto operations run in a separate thread when supported
 * Enhanced with support for edge cases, key format detection, and better error handling
 */

// Define types that were previously imported from JwtContext
export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

export interface JwtPayload {
  [key: string]: any;
}

export interface DecodedJwt {
  header: JwtHeader | null;
  payload: JwtPayload | null;
  signature: string | null;
  isValid: boolean;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
  error?: string;
  parsingWarnings?: string[];
}

export interface SecurityIssue {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'info';
}

// Check if we can use Web Workers in this environment
const supportsWorkers = typeof Worker !== 'undefined';

/**
 * Base64Url encoding/decoding utilities with enhanced error handling
 */
export const base64UrlEncode = (str: string): string => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const base64UrlDecode = (str: string): string => {
  // Add padding if needed
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (str.length % 4) {
    case 0: break;
    case 2: str += '=='; break;
    case 3: str += '='; break;
    default: throw new Error('Invalid base64url string');
  }
  
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    // Handle binary data that can't be decoded as UTF-8
    try {
      return atob(str);
    } catch (e2) {
      throw new Error('Invalid base64 content');
    }
  }
};

/**
 * Check if a string is likely PEM format
 */
const isPemFormat = (str: string): boolean => {
  return /^-----BEGIN ([A-Z\s]+)-----/.test(str) && /-----END ([A-Z\s]+)-----$/.test(str);
};

/**
 * Extract raw base64 from PEM format
 */
const extractPemContent = (pem: string): string => {
  const matches = pem.match(/^-----BEGIN [^-]+-----\s*([A-Za-z0-9+\/=\s]+)-----END [^-]+-----$/s);
  if (!matches || !matches[1]) {
    throw new Error('Invalid PEM format');
  }
  return matches[1].replace(/[\n\r\s]/g, '');
};

/**
 * Detect key type and format to help with proper import
 */
const detectKeyTypeAndFormat = (key: string): { 
  format: string, 
  isBase64: boolean,
  isPem: boolean,
  keyType: string
} => {
  // Check for PEM format first
  if (isPemFormat(key)) {
    // Determine key type from header
    const isPrivate = key.includes('PRIVATE KEY');
    const isPublic = key.includes('PUBLIC KEY');
    const isRSA = key.includes('RSA');
    const isEC = key.includes('EC') || key.includes('ECDSA');
    
    return {
      format: isPrivate ? 'pkcs8' : 'spki',
      isBase64: false,
      isPem: true,
      keyType: isRSA ? 'RSA' : isEC ? 'EC' : 'unknown'
    };
  }
  
  // Check for likely base64 format (might be DER-encoded key)
  const isLikelyBase64 = /^[A-Za-z0-9+/=]+$/.test(key.trim());
  
  // Try to heuristically determine if this is a raw secret or encoded key
  return {
    format: 'raw', // Default to raw, we'll try other formats if this fails
    isBase64: isLikelyBase64,
    isPem: false,
    keyType: key.length > 100 ? 'RSA' : 'HMAC' // Rough heuristic
  };
};

/**
 * Try to normalize a token, handling common edge cases
 * - Trim whitespace
 * - Remove "Bearer " prefix
 * - Handle tokens with escaped newlines
 * - Handle tokens with actual newlines
 * - Fix padding issues
 */
const normalizeToken = (token: string): { token: string; warnings: string[] } => {
  const warnings: string[] = [];
  let normalizedToken = token;
  
  // Check original format to detect issues
  if (token !== token.trim()) {
    warnings.push('Token contains extra whitespace that was removed');
  }
  
  // Trim whitespace
  normalizedToken = normalizedToken.trim();
  
  // Handle Bearer prefix
  if (normalizedToken.toLowerCase().startsWith('bearer ')) {
    normalizedToken = normalizedToken.substring(7).trim();
    warnings.push('Bearer prefix was removed from token');
  }
  
  // Handle escaped newlines
  if (normalizedToken.includes('\\n')) {
    normalizedToken = normalizedToken.replace(/\\n/g, '');
    warnings.push('Escaped newlines were removed from token');
  }
  
  // Handle actual newlines
  if (normalizedToken.includes('\n')) {
    normalizedToken = normalizedToken.replace(/\n/g, '');
    warnings.push('Newlines were removed from token');
  }
  
  return { token: normalizedToken, warnings };
};

/**
 * Safely decode a JWT token without verifying signature
 * Enhanced with better error handling and warning detection
 */
export const decodeSafely = async (token: string): Promise<DecodedJwt> => {
  try {
    // Normalize the token and collect any warnings
    const { token: normalizedToken, warnings } = normalizeToken(token);
    token = normalizedToken;
    
    // Handle empty token
    if (!token) {
      return {
        header: null,
        payload: null,
        signature: null,
        isValid: false,
        raw: {
          header: '',
          payload: '',
          signature: ''
        },
        error: 'Empty token',
        parsingWarnings: warnings
      };
    }
    
    const parts = token.split('.');
    
    // Handle malformed token with wrong number of parts
    if (parts.length !== 3) {
      warnings.push(`Token has ${parts.length} parts instead of the expected 3 parts`);
      
      // Try to extract what we can
      return {
        header: parts.length > 0 ? tryParseJson(parts[0]) : null,
        payload: parts.length > 1 ? tryParseJson(parts[1]) : null,
        signature: parts.length > 2 ? parts[2] : null,
        isValid: false,
        raw: {
          header: parts.length > 0 ? parts[0] : '',
          payload: parts.length > 1 ? parts[1] : '',
          signature: parts.length > 2 ? parts[2] : ''
        },
        error: 'Invalid JWT format: expected 3 parts',
        parsingWarnings: warnings
      };
    }

    const [headerBase64, payloadBase64, signatureBase64] = parts;
    
    // Handle potential decoding errors for each part separately
    let header: JwtHeader | null = null;
    let payload: JwtPayload | null = null;
    let error: string | undefined;
    
    // Try to decode the header
    try {
      const headerJson = base64UrlDecode(headerBase64);
      header = JSON.parse(headerJson);
      
      // Check required fields
      if (header && !header.alg) {
        warnings.push('Token header is missing the "alg" field');
      }
      
      if (header && !header.typ && warnings.indexOf('Token header is missing the "typ" field') === -1) {
        warnings.push('Token header is missing the "typ" field');
      }
    } catch (e) {
      warnings.push('Failed to decode header as JSON');
      error = 'Invalid JWT header: failed to parse';
    }
    
    // Try to decode the payload
    try {
      const payloadJson = base64UrlDecode(payloadBase64);
      payload = JSON.parse(payloadJson);
      
      // Check for timestamps and validate them
      if (payload) {
        if (typeof payload.exp !== 'undefined') {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          if (expDate < now) {
            warnings.push(`Token is expired (exp: ${expDate.toISOString()}, now: ${now.toISOString()})`);
          }
        } else {
          warnings.push('Token payload is missing the "exp" field');
        }
        
        if (typeof payload.nbf !== 'undefined') {
          const nbfDate = new Date(payload.nbf * 1000);
          const now = new Date();
          if (nbfDate > now) {
            warnings.push(`Token is not yet valid (nbf: ${nbfDate.toISOString()}, now: ${now.toISOString()})`);
          }
        }
        
        if (typeof payload.iat === 'undefined') {
          warnings.push('Token payload is missing the "iat" field');
        }
      }
    } catch (e) {
      warnings.push('Failed to decode payload as JSON');
      error = error || 'Invalid JWT payload: failed to parse';
    }
    
    // Return decoded structure with parsing results and warnings
    return {
      header,
      payload,
      signature: signatureBase64,
      isValid: false, // Signature not verified yet
      raw: {
        header: headerBase64,
        payload: payloadBase64,
        signature: signatureBase64
      },
      error,
      parsingWarnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (err) {
    return {
      header: null,
      payload: null,
      signature: null,
      isValid: false,
      raw: {
        header: '',
        payload: '',
        signature: ''
      },
      error: err instanceof Error ? err.message : 'Unknown error decoding token'
    };
  }
};

/**
 * Helper to try parsing JSON with better error handling
 */
function tryParseJson(base64Str: string): any {
  try {
    const json = base64UrlDecode(base64Str);
    return JSON.parse(json);
  } catch (e) {
    // Return null on parse failure
    return null;
  }
}

/**
 * Helper to convert string keys to ArrayBuffer for Web Crypto API
 * Supports multiple formats: raw string, base64, PEM
 * With enhanced error handling and format detection
 */
const keyToArrayBuffer = (key: string, isBase64: boolean = false): ArrayBuffer => {
  // Handle PEM format first
  if (isPemFormat(key)) {
    try {
      const pemContent = extractPemContent(key);
      const binaryStr = atob(pemContent);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return bytes.buffer as ArrayBuffer;
    } catch (e) {
      console.error('PEM parsing failed:', e);
      throw new Error('Invalid PEM format key');
    }
  }
  
  if (isBase64) {
    // Handle base64 encoded key
    try {
      const binaryStr = atob(key);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return bytes.buffer as ArrayBuffer;
    } catch (e) {
      console.error('Base64 parsing failed:', e);
      throw new Error('Invalid base64 encoded key');
    }
  } else {
    // Handle plain text key
    const encoder = new TextEncoder();
    return encoder.encode(key).buffer as ArrayBuffer;
  }
};

// Add proper typing for algorithm parameters
interface HmacAlgorithm extends Algorithm {
  name: string;
  hash: string | Algorithm;
}

interface RsaAlgorithm extends Algorithm {
  name: string;
  hash: string | Algorithm;
}

interface EcdsaAlgorithm extends Algorithm {
  name: string;
  hash: string | Algorithm;
  namedCurve?: string;
}

type JwtAlgorithm = HmacAlgorithm | RsaAlgorithm | EcdsaAlgorithm;

/**
 * Try multiple key formats for verification
 * Attempts different formats to find one that works
 */
const tryMultipleKeyFormats = async (
  token: string,
  key: string,
  alg: string,
  cryptoAlg: JwtAlgorithm,
  signedData: string,
  signature: Uint8Array,
  isHmac: boolean
): Promise<boolean> => {
  // First, detect the key type and format
  const { format, isBase64, isPem, keyType } = detectKeyTypeAndFormat(key);
  
  // Different formats to try based on algorithm type
  const formats = [
    // Start with detected format
    { isBase64: isBase64, keyFormat: format },
    // Then try standard formats
    { isBase64: false, keyFormat: isHmac ? 'raw' : 'spki' },
    { isBase64: true, keyFormat: isHmac ? 'raw' : 'spki' }
  ];
  
  // For HMAC, also try UTF-8 and base64 decoded regardless of what we detected
  if (isHmac) {
    // Add additional formats specific to HMAC
    formats.push(
      { isBase64: false, keyFormat: 'raw' }, // UTF-8 encoded raw key
      { isBase64: true, keyFormat: 'raw' }  // base64 decoded key
    );
  } else if (alg.startsWith('RS') || alg.startsWith('PS')) {
    // For RSA, try both SPKI and PKCS8 formats
    formats.push(
      { isBase64: false, keyFormat: 'spki' },
      { isBase64: isPem, keyFormat: 'spki' }
    );
  } else if (alg.startsWith('ES')) {
    // For ECDSA, try both SPKI and raw formats
    formats.push(
      { isBase64: false, keyFormat: 'spki' },
      { isBase64: isPem, keyFormat: 'spki' }
    );
  }
  
  for (const format of formats) {
    try {
      const keyData = keyToArrayBuffer(key, format.isBase64);
      const cryptoKey = await window.crypto.subtle.importKey(
        format.keyFormat as any,
        keyData,
        cryptoAlg,
        false,
        ['verify']
      );
      
      const encoder = new TextEncoder();
      const data = encoder.encode(signedData);
      
      const isValid = await window.crypto.subtle.verify(
        cryptoAlg,
        cryptoKey,
        signature,
        data
      );
      
      if (isValid) {
        return true;
      }
    } catch (e) {
      // Continue trying other formats
      console.log(`Key format ${format.keyFormat} (base64: ${format.isBase64}) failed:`, e);
    }
  }
  
  return false;
};

/**
 * Verify a JWT token signature
 */
export const verifyToken = async (token: string, key: string): Promise<boolean> => {
  try {
    // Handle empty token
    if (!token || token.trim() === '') {
      throw new Error('Token is empty');
    }

    // Handle malformed tokens (not 3 parts)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format (should have 3 parts)');
    }

    const [headerBase64, payloadBase64, signatureBase64] = parts;

    // Handle empty signature
    if (!signatureBase64 || signatureBase64.trim() === '') {
      return false; // Consider unsigned tokens as invalid
    }

    // Attempt to parse header JSON
    let header;
    try {
      header = tryParseJson(headerBase64);
    } catch (e) {
      throw new Error('Invalid token header (not valid base64 or JSON)');
    }

    // Handle missing algorithm
    if (!header || !header.alg) {
      throw new Error('Token header missing algorithm (alg)');
    }

    const alg = header.alg;
    
    // Handle 'none' algorithm securely
    if (alg === 'none') {
      return false; // Always consider 'none' algorithm as invalid for security reasons
    }

    // Convert the signature from base64url to ArrayBuffer
    const signature = Uint8Array.from(
      atob(signatureBase64.replace(/-/g, '+').replace(/_/g, '/')), 
      c => c.charCodeAt(0)
    );

    // Use the appropriate algorithm
    let cryptoAlg: JwtAlgorithm;
    let isHmac = false;

    switch (alg) {
      case 'HS256':
        cryptoAlg = { name: 'HMAC', hash: 'SHA-256' };
        isHmac = true;
        break;
      case 'HS384':
        cryptoAlg = { name: 'HMAC', hash: 'SHA-384' };
        isHmac = true;
        break;
      case 'HS512':
        cryptoAlg = { name: 'HMAC', hash: 'SHA-512' };
        isHmac = true;
        break;
      case 'RS256':
        cryptoAlg = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
        break;
      case 'RS384':
        cryptoAlg = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' };
        break;
      case 'RS512':
        cryptoAlg = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' };
        break;
      case 'PS256':
        cryptoAlg = { name: 'RSA-PSS', hash: 'SHA-256' };
        break;
      case 'PS384':
        cryptoAlg = { name: 'RSA-PSS', hash: 'SHA-384' };
        break;
      case 'PS512':
        cryptoAlg = { name: 'RSA-PSS', hash: 'SHA-512' };
        break;
      case 'ES256':
        cryptoAlg = { name: 'ECDSA', hash: 'SHA-256', namedCurve: 'P-256' };
        break;
      case 'ES384':
        cryptoAlg = { name: 'ECDSA', hash: 'SHA-384', namedCurve: 'P-384' };
        break;
      case 'ES512':
        cryptoAlg = { name: 'ECDSA', hash: 'SHA-512', namedCurve: 'P-521' };
        break;
      default:
        throw new Error(`Unsupported algorithm: ${alg}`);
    }

    // Try multiple key formats for verification
    return await tryMultipleKeyFormats(
      token,
      key,
      alg,
      cryptoAlg,
      `${headerBase64}.${payloadBase64}`,
      signature,
      isHmac
    );
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
};

/**
 * Sign a JWT token
 */
export const signToken = async (
  header: JwtHeader,
  payload: JwtPayload,
  key: string
): Promise<string> => {
  try {
    // Ensure header has alg and typ
    const finalHeader = {
      typ: 'JWT',
      ...header
    };
    
    const alg = finalHeader.alg;
    if (!alg) {
      throw new Error('Algorithm is required in header');
    }
    
    // Encode header and payload
    const headerBase64 = base64UrlEncode(JSON.stringify(finalHeader));
    const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
    const signedData = `${headerBase64}.${payloadBase64}`;
    
    // Handle 'none' algorithm
    if (alg === 'none') {
      return `${signedData}.`;
    }
    
    // Prepare algorithm parameters
    let cryptoAlg: JwtAlgorithm;
    let isHmac = false;
    
    switch (alg) {
      case 'HS256':
        cryptoAlg = { name: 'HMAC', hash: 'SHA-256' };
        isHmac = true;
        break;
      case 'HS384':
        cryptoAlg = { name: 'HMAC', hash: 'SHA-384' };
        isHmac = true;
        break;
      case 'HS512':
        cryptoAlg = { name: 'HMAC', hash: 'SHA-512' };
        isHmac = true;
        break;
      case 'RS256':
        cryptoAlg = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
        break;
      case 'RS384':
        cryptoAlg = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' };
        break;
      case 'RS512':
        cryptoAlg = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' };
        break;
      case 'PS256':
        cryptoAlg = { name: 'RSA-PSS', hash: 'SHA-256' };
        break;
      case 'PS384':
        cryptoAlg = { name: 'RSA-PSS', hash: 'SHA-384' };
        break;
      case 'PS512':
        cryptoAlg = { name: 'RSA-PSS', hash: 'SHA-512' };
        break;
      case 'ES256':
        cryptoAlg = { name: 'ECDSA', hash: 'SHA-256', namedCurve: 'P-256' };
        break;
      case 'ES384':
        cryptoAlg = { name: 'ECDSA', hash: 'SHA-384', namedCurve: 'P-384' };
        break;
      case 'ES512':
        cryptoAlg = { name: 'ECDSA', hash: 'SHA-512', namedCurve: 'P-521' };
        break;
      default:
        throw new Error(`Unsupported algorithm: ${alg}`);
    }
    
    // Handle potential PEM encoded keys for RSA and ECDSA algorithms
    const { format: keyFormat, isBase64, isPem } = detectKeyTypeAndFormat(key);
    let keyData: ArrayBuffer;
    
    if (isPem) {
      keyData = keyToArrayBuffer(key, false);
    } else {
      keyData = keyToArrayBuffer(key, isBase64);
    }
    
    // Import the key
    const cryptoKey = await window.crypto.subtle.importKey(
      keyFormat as any,
      keyData,
      cryptoAlg,
      false,
      ['sign']
    );
    
    // Sign the data
    const encoder = new TextEncoder();
    const data = encoder.encode(signedData);
    const signature = await window.crypto.subtle.sign(
      cryptoAlg,
      cryptoKey,
      data
    );
    
    // Convert the signature to base64url
    const signatureArray = new Uint8Array(signature);
    let signatureBase64 = '';
    for (let i = 0; i < signatureArray.length; i++) {
      signatureBase64 += String.fromCharCode(signatureArray[i]);
    }
    signatureBase64 = base64UrlEncode(signatureBase64);
    
    // Return the complete JWT
    return `${signedData}.${signatureBase64}`;
  } catch (error) {
    console.error('JWT signing error:', error);
    throw error;
  }
};

/**
 * Generates a new RSA or EC key pair.
 * @param {string} algorithm - The algorithm (e.g., 'RS256', 'ES256').
 * @param {number} keySize - The key size (for RSA, e.g., 2048).
 * @returns {Promise<{publicKey: string, privateKey: string}>} PEM-encoded keys.
 */
export const generateKeyPair = async (algorithm: any, keySize = 2048) => {
  let keyGenParams: RsaHashedKeyGenParams | EcKeyGenParams;
  let keyExportFormat: KeyFormat = 'pkcs8'; // For private key
  let pubKeyExportFormat: KeyFormat = 'spki'; // For public key

  if (algorithm.startsWith('RS')) {
    keyGenParams = {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: algorithm.replace('RS', 'SHA-') },
    } as RsaHashedKeyGenParams;
  } else if (algorithm.startsWith('ES')) {
    let namedCurve = 'P-256'; // Default for ES256
    if (algorithm === 'ES384') namedCurve = 'P-384';
    if (algorithm === 'ES512') namedCurve = 'P-521'; // Note: P-521, not P-512
    keyGenParams = {
      name: 'ECDSA',
      namedCurve,
    } as EcKeyGenParams;
  } else {
    throw new Error(`Unsupported algorithm for key generation: ${algorithm}`);
  }

  const { publicKey, privateKey } = await window.crypto.subtle.generateKey(
    keyGenParams,
    true,
    ['sign', 'verify']
  );

  const publicKeyBuffer = await window.crypto.subtle.exportKey(pubKeyExportFormat, publicKey);
  const privateKeyBuffer = await window.crypto.subtle.exportKey(keyExportFormat, privateKey);

  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));
  const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));

  return {
    publicKey: `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----`
  };
};

/**
 * Analyze a token for security issues
 */
export const analyzeToken = async (token: string): Promise<SecurityIssue[]> => {
  const issues: SecurityIssue[] = [];
  
  try {
    const decoded = await decodeSafely(token);
    if (!decoded.header) {
      issues.push({
        id: 'malformed-token',
        title: 'Malformed Token',
        description: 'The token could not be parsed correctly.',
        severity: 'high'
      });
      return issues;
    }
    
    // Check algorithm security
    const alg = decoded.header.alg;
    if (!alg) {
      issues.push({
        id: 'missing-alg',
        title: 'Missing Algorithm',
        description: 'The token header is missing the required "alg" field.',
        severity: 'high'
      });
    } else {
      // Check for insecure algorithms
      if (alg === 'none') {
        issues.push({
          id: 'alg-none',
          title: 'Insecure "none" Algorithm',
          description: 'The token uses the "none" algorithm which is insecure and vulnerable to signature bypass attacks.',
          severity: 'high'
        });
      }
      
      if (alg === 'HS256') {
        issues.push({
          id: 'weak-hs256',
          title: 'Consider Stronger Algorithm',
          description: 'While acceptable, HS256 offers lower security than HS384 or HS512. Consider using a stronger algorithm for sensitive applications.',
          severity: 'info'
        });
      }
    }
    
    // Check signature presence
    if (!decoded.signature || decoded.signature.length === 0) {
      issues.push({
        id: 'missing-signature',
        title: 'Missing Signature',
        description: 'The token has no signature, making it unverifiable and insecure.',
        severity: 'high'
      });
    }
    
    // Check payload claims
    if (decoded.payload) {
      // Check expiration
      if (!decoded.payload.exp) {
        issues.push({
          id: 'no-exp',
          title: 'No Expiration',
          description: 'The token does not have an expiration time (exp claim) which is a security risk.',
          severity: 'medium'
        });
      } else {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.payload.exp < now) {
          issues.push({
            id: 'token-expired',
            title: 'Token Expired',
            description: `The token expired on ${new Date(decoded.payload.exp * 1000).toLocaleString()}.`,
            severity: 'medium'
          });
        }
      }
      
      // Check issuance time
      if (!decoded.payload.iat) {
        issues.push({
          id: 'no-iat',
          title: 'No Issuance Time',
          description: 'The token does not have an issuance time (iat claim). This makes token revocation more difficult.',
          severity: 'low'
        });
      }
      
      // Check audience
      if (!decoded.payload.aud) {
        issues.push({
          id: 'no-aud',
          title: 'No Audience',
          description: 'The token does not specify an audience (aud claim). This could lead to token misuse across different services.',
          severity: 'low'
        });
      }
      
      // Check issuer
      if (!decoded.payload.iss) {
        issues.push({
          id: 'no-iss',
          title: 'No Issuer',
          description: 'The token does not specify an issuer (iss claim). This could lead to confusion about token origin.',
          severity: 'low'
        });
      }
      
      // Check not before
      if (!decoded.payload.nbf) {
        issues.push({
          id: 'no-nbf',
          title: 'No "Not Before" Time',
          description: 'The token does not specify a "not before" time (nbf claim). While not critical, this helps prevent token use before intended.',
          severity: 'info'
        });
      } else {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.payload.nbf > now) {
          issues.push({
            id: 'not-valid-yet',
            title: 'Token Not Valid Yet',
            description: `The token becomes valid on ${new Date(decoded.payload.nbf * 1000).toLocaleString()}.`,
            severity: 'medium'
          });
        }
      }
      
      // Check JWT ID
      if (!decoded.payload.jti) {
        issues.push({
          id: 'no-jti',
          title: 'No JWT ID',
          description: 'The token does not have a JWT ID (jti claim). This makes token revocation and tracking more difficult.',
          severity: 'info'
        });
      }
    }
    
    // Check for missing type
    if (!decoded.header.typ) {
      issues.push({
        id: 'no-typ',
        title: 'No Token Type',
        description: 'The token does not specify a type (typ claim) in the header. This is recommended for interoperability.',
        severity: 'info'
      });
    } else if (decoded.header.typ !== 'JWT') {
      issues.push({
        id: 'unusual-typ',
        title: 'Unusual Token Type',
        description: `The token specifies an unusual type: "${decoded.header.typ}" instead of the standard "JWT".`,
        severity: 'info'
      });
    }
    
    // Check for kid (key id)
    if (!decoded.header.kid) {
      issues.push({
        id: 'no-kid',
        title: 'No Key ID',
        description: 'The token does not specify a key ID (kid header). This is recommended when multiple keys are used.',
        severity: 'info'
      });
    }
  } catch (error) {
    issues.push({
      id: 'parse-error',
      title: 'Token Parse Error',
      description: error instanceof Error ? error.message : 'Unknown error parsing token',
      severity: 'high'
    });
  }
  
  return issues;
};

/**
 * Run a benchmark for the given algorithm
 */
export const benchmarkAlgorithm = async (algorithm: string): Promise<number> => {
  // For now, this is a simplified benchmark
  // In a real implementation, we would use benchmark.js or a similar library
  const sampleSize = 100; // Number of operations to perform
  const payloadSize = 1024; // Size of the payload in bytes
  
  // Create a random payload
  const payload = {
    sub: '1234567890',
    name: 'John Doe',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    data: Array(payloadSize).fill('a').join('') // Add bulk data
  };
  
  const header = {
    alg: algorithm,
    typ: 'JWT'
  };
  
  // Generate a random key
  const key = Array(32).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  
  // Measure signing time
  const start = performance.now();
  
  for (let i = 0; i < sampleSize; i++) {
    try {
      await signToken(header, { ...payload, nonce: i }, key);
    } catch (e) {
      console.error(`Error benchmarking algorithm ${algorithm}:`, e);
      return 0;
    }
  }
  
  const end = performance.now();
  const totalTime = end - start;
  
  // Return operations per second
  return Math.floor(sampleSize / (totalTime / 1000));
};

// Add missing functions referenced by other files
export const sign = signToken;
export const verify = verifyToken;
export const decode = decodeSafely;
export const bench = benchmarkAlgorithm;
export const analyze = analyzeToken;