/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Crypto Lab - Hashing Library
 * Implements SHA-256, SHA-512, and MD5 (legacy)
 */

import type { HashAlgorithm, HashResult } from '../types';
import { bytesToBase64, bytesToHex } from './aes';

// ============================================
// Cross-environment WebCrypto access
// ============================================

const getCryptoApi = (): Crypto => {
  const anyGlobal = globalThis as unknown as { crypto?: Crypto & { subtle?: SubtleCrypto } };
  if (anyGlobal.crypto?.subtle) return anyGlobal.crypto as Crypto;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { webcrypto } = require('crypto');
    return webcrypto as Crypto;
  } catch {
    throw new Error('WebCrypto API is not available in this environment');
  }
};

const cryptoApi = getCryptoApi();

// ============================================
// MD5 Implementation (Pure JS)
// MD5 is NOT secure for cryptographic purposes
// Included only for educational/legacy study
// ============================================

/**
 * MD5 hash implementation in pure JavaScript
 * Based on RFC 1321
 * DO NOT use MD5 for security purposes!
 */
const md5 = (input: string): Uint8Array => {
  // Helper functions
  const rotateLeft = (x: number, n: number): number => (x << n) | (x >>> (32 - n));

  const addUnsigned = (x: number, y: number): number => {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  };

  const F = (x: number, y: number, z: number): number => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number): number => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number): number => x ^ y ^ z;
  const I = (x: number, y: number, z: number): number => y ^ (x | ~z);

  const FF = (a: number, b: number, c: number, d: number, x: number, s: number, t: number): number =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, F(b, c, d)), addUnsigned(x, t)), s), b);
  const GG = (a: number, b: number, c: number, d: number, x: number, s: number, t: number): number =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, G(b, c, d)), addUnsigned(x, t)), s), b);
  const HH = (a: number, b: number, c: number, d: number, x: number, s: number, t: number): number =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, H(b, c, d)), addUnsigned(x, t)), s), b);
  const II = (a: number, b: number, c: number, d: number, x: number, s: number, t: number): number =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, I(b, c, d)), addUnsigned(x, t)), s), b);

  // Convert string to byte array
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);

  // Pre-processing: adding padding bits
  const bitLength = bytes.length * 8;
  const paddingLength = ((bytes.length + 8) % 64 === 0)
    ? 64 - (bytes.length % 64)
    : 64 - ((bytes.length + 8) % 64) + 64 - 8;

  const paddedLength = bytes.length + paddingLength + 8;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  // Append original length in bits as 64-bit little-endian
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, bitLength, true);
  view.setUint32(paddedLength - 4, 0, true);

  // Initialize hash values
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  // Process each 64-byte block
  for (let i = 0; i < paddedLength; i += 64) {
    const M: number[] = [];
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(i + j * 4, true);
    }

    let a = a0, b = b0, c = c0, d = d0;

    // Round 1
    a = FF(a, b, c, d, M[0], 7, 0xd76aa478);
    d = FF(d, a, b, c, M[1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, M[2], 17, 0x242070db);
    b = FF(b, c, d, a, M[3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, M[4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, M[5], 12, 0x4787c62a);
    c = FF(c, d, a, b, M[6], 17, 0xa8304613);
    b = FF(b, c, d, a, M[7], 22, 0xfd469501);
    a = FF(a, b, c, d, M[8], 7, 0x698098d8);
    d = FF(d, a, b, c, M[9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, M[10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, M[11], 22, 0x895cd7be);
    a = FF(a, b, c, d, M[12], 7, 0x6b901122);
    d = FF(d, a, b, c, M[13], 12, 0xfd987193);
    c = FF(c, d, a, b, M[14], 17, 0xa679438e);
    b = FF(b, c, d, a, M[15], 22, 0x49b40821);

    // Round 2
    a = GG(a, b, c, d, M[1], 5, 0xf61e2562);
    d = GG(d, a, b, c, M[6], 9, 0xc040b340);
    c = GG(c, d, a, b, M[11], 14, 0x265e5a51);
    b = GG(b, c, d, a, M[0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, M[5], 5, 0xd62f105d);
    d = GG(d, a, b, c, M[10], 9, 0x02441453);
    c = GG(c, d, a, b, M[15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, M[4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, M[9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, M[14], 9, 0xc33707d6);
    c = GG(c, d, a, b, M[3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, M[8], 20, 0x455a14ed);
    a = GG(a, b, c, d, M[13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, M[2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, M[7], 14, 0x676f02d9);
    b = GG(b, c, d, a, M[12], 20, 0x8d2a4c8a);

    // Round 3
    a = HH(a, b, c, d, M[5], 4, 0xfffa3942);
    d = HH(d, a, b, c, M[8], 11, 0x8771f681);
    c = HH(c, d, a, b, M[11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, M[14], 23, 0xfde5380c);
    a = HH(a, b, c, d, M[1], 4, 0xa4beea44);
    d = HH(d, a, b, c, M[4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, M[7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, M[10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, M[13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, M[0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, M[3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, M[6], 23, 0x04881d05);
    a = HH(a, b, c, d, M[9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, M[12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, M[15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, M[2], 23, 0xc4ac5665);

    // Round 4
    a = II(a, b, c, d, M[0], 6, 0xf4292244);
    d = II(d, a, b, c, M[7], 10, 0x432aff97);
    c = II(c, d, a, b, M[14], 15, 0xab9423a7);
    b = II(b, c, d, a, M[5], 21, 0xfc93a039);
    a = II(a, b, c, d, M[12], 6, 0x655b59c3);
    d = II(d, a, b, c, M[3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, M[10], 15, 0xffeff47d);
    b = II(b, c, d, a, M[1], 21, 0x85845dd1);
    a = II(a, b, c, d, M[8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, M[15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, M[6], 15, 0xa3014314);
    b = II(b, c, d, a, M[13], 21, 0x4e0811a1);
    a = II(a, b, c, d, M[4], 6, 0xf7537e82);
    d = II(d, a, b, c, M[11], 10, 0xbd3af235);
    c = II(c, d, a, b, M[2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, M[9], 21, 0xeb86d391);

    a0 = addUnsigned(a0, a);
    b0 = addUnsigned(b0, b);
    c0 = addUnsigned(c0, c);
    d0 = addUnsigned(d0, d);
  }

  // Convert to bytes (little-endian)
  const result = new Uint8Array(16);
  const resultView = new DataView(result.buffer);
  resultView.setUint32(0, a0, true);
  resultView.setUint32(4, b0, true);
  resultView.setUint32(8, c0, true);
  resultView.setUint32(12, d0, true);

  return result;
};

// ============================================
// SHA Hash Functions (via Web Crypto API)
// ============================================

/**
 * Compute SHA-256 hash
 */
export const sha256Hash = async (data: string | Uint8Array): Promise<Uint8Array> => {
  const input = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const digest = await cryptoApi.subtle.digest('SHA-256', input);
  return new Uint8Array(digest);
};

/**
 * Compute SHA-512 hash
 */
export const sha512Hash = async (data: string | Uint8Array): Promise<Uint8Array> => {
  const input = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const digest = await cryptoApi.subtle.digest('SHA-512', input);
  return new Uint8Array(digest);
};

/**
 * Compute MD5 hash (legacy, not secure)
 */
export const md5Hash = (data: string | Uint8Array): Uint8Array => {
  const input = typeof data === 'string' ? data : new TextDecoder().decode(data);
  return md5(input);
};

// ============================================
// Unified Hash Function
// ============================================

/**
 * Compute hash using specified algorithm
 * Returns hex, base64, and raw bytes
 */
export const computeHash = async (
  data: string | Uint8Array,
  algorithm: HashAlgorithm
): Promise<HashResult> => {
  let bytes: Uint8Array;

  switch (algorithm) {
    case 'sha-256':
      bytes = await sha256Hash(data);
      break;
    case 'sha-512':
      bytes = await sha512Hash(data);
      break;
    case 'md5':
      bytes = md5Hash(data);
      break;
    default:
      throw new Error(`Unsupported hash algorithm: ${algorithm}`);
  }

  return {
    hex: bytesToHex(bytes),
    base64: bytesToBase64(bytes),
    bytes,
    algorithm,
  };
};

// ============================================
// Hash Algorithm Information
// ============================================

export interface HashAlgorithmInfo {
  name: string;
  outputBits: number;
  outputBytes: number;
  secure: boolean;
  description: string;
  useCase: string;
}

export const HASH_ALGORITHM_INFO: Record<HashAlgorithm, HashAlgorithmInfo> = {
  'sha-256': {
    name: 'SHA-256',
    outputBits: 256,
    outputBytes: 32,
    secure: true,
    description: 'Secure Hash Algorithm 2 with 256-bit output',
    useCase: 'Digital signatures, integrity verification, password storage (with salt)',
  },
  'sha-512': {
    name: 'SHA-512',
    outputBits: 512,
    outputBytes: 64,
    secure: true,
    description: 'Secure Hash Algorithm 2 with 512-bit output',
    useCase: 'High-security applications, digital signatures, larger hash space',
  },
  'md5': {
    name: 'MD5',
    outputBits: 128,
    outputBytes: 16,
    secure: false,
    description: 'Message Digest 5 - DEPRECATED for security use',
    useCase: 'Legacy compatibility only, checksums for non-security purposes',
  },
};

// ============================================
// Test Vectors (for verification)
// ============================================

export const HASH_TEST_VECTORS = {
  'sha-256': {
    input: 'hello',
    expected: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
  },
  'sha-512': {
    input: 'hello',
    expected: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043',
  },
  'md5': {
    input: 'hello',
    expected: '5d41402abc4b2a76b9719d911017c592',
  },
};

/**
 * Verify hash implementation against test vectors
 */
export const verifyHashImplementation = async (): Promise<Record<HashAlgorithm, boolean>> => {
  const results: Partial<Record<HashAlgorithm, boolean>> = {};

  for (const [algo, vector] of Object.entries(HASH_TEST_VECTORS)) {
    const result = await computeHash(vector.input, algo as HashAlgorithm);
    results[algo as HashAlgorithm] = result.hex === vector.expected;
  }

  return results as Record<HashAlgorithm, boolean>;
};
