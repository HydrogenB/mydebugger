/**
 * JWT Crypto Worker
 * 
 * Handles all JWT cryptographic operations using Web Crypto API with fallbacks
 * All heavy crypto operations run in a separate thread when supported
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
}

// Check if we can use Web Workers in this environment
const supportsWorkers = typeof Worker !== 'undefined';

/**
 * Base64Url encoding/decoding utilities
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
    return atob(str);
  }
};

/**
 * Safely decode a JWT token without verifying signature
 */
export const decodeSafely = async (token: string): Promise<DecodedJwt> => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format: expected 3 parts');
    }

    const [headerBase64, payloadBase64, signatureBase64] = parts;
    
    // Handle potential decoding errors for each part separately
    let header: JwtHeader | null = null;
    let payload: JwtPayload | null = null;
    let error: string | undefined;
    
    try {
      const headerJson = base64UrlDecode(headerBase64);
      header = JSON.parse(headerJson);
    } catch (e) {
      error = 'Invalid JWT header: failed to parse';
    }
    
    try {
      const payloadJson = base64UrlDecode(payloadBase64);
      payload = JSON.parse(payloadJson);
    } catch (e) {
      error = error || 'Invalid JWT payload: failed to parse';
    }
    
    // Return decoded structure with parsing results
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
      error
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
 * Helper to convert string keys to ArrayBuffer for Web Crypto API
 */
const keyToArrayBuffer = (key: string, isBase64: boolean = false): ArrayBuffer => {
  if (isBase64) {
    // Handle base64 encoded key
    const binaryStr = atob(key);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes.buffer;
  } else {
    // Handle plain text key
    const encoder = new TextEncoder();
    return encoder.encode(key).buffer;
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
 * Verify a JWT token signature
 */
export const verifyToken = async (
  token: string, 
  key: string,
  algorithm?: string
): Promise<boolean> => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const [headerBase64, payloadBase64, signatureBase64] = parts;
    const signedData = `${headerBase64}.${payloadBase64}`;
    
    // Decode the header to get the algorithm if not provided
    let alg = algorithm;
    if (!alg) {
      try {
        const headerJson = base64UrlDecode(headerBase64);
        const header = JSON.parse(headerJson);
        alg = header.alg;
      } catch (e) {
        throw new Error('Failed to parse JWT header');
      }
    }

    // Handle 'none' algorithm
    if (alg === 'none') {
      return false; // Always consider 'none' algorithm as invalid
    }

    // Convert the signature from base64url to ArrayBuffer
    const signature = Uint8Array.from(
      atob(signatureBase64.replace(/-/g, '+').replace(/_/g, '/')), 
      c => c.charCodeAt(0)
    );

    // Convert the signed data to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(signedData);

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

    // Import the key
    const keyData = keyToArrayBuffer(key, false);
    const cryptoKey = await window.crypto.subtle.importKey(
      isHmac ? 'raw' : 'spki',
      keyData,
      cryptoAlg,
      false,
      ['verify']
    );

    // Verify the signature
    return await window.crypto.subtle.verify(
      cryptoAlg,
      cryptoKey,
      signature,
      data
    );
  } catch (error) {
    console.error('JWT verification error:', error);
    return false;
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
    
    // Import the key
    const keyData = keyToArrayBuffer(key, false);
    const cryptoKey = await window.crypto.subtle.importKey(
      isHmac ? 'raw' : (alg.startsWith('RS') ? 'pkcs8' : 'raw'),
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