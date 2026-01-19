/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Crypto Lab - OpenSSL Format Utilities
 * Handles OpenSSL-compatible encryption formats
 */

import type { OutputAnatomy, OutputSection, CryptoAlgorithm } from '../types';
import { bytesToBase64, base64ToBytes, bytesToHex } from './aes';

// ============================================
// Constants
// ============================================

// OpenSSL "Salted__" magic header bytes
export const OPENSSL_MAGIC = new Uint8Array([0x53, 0x61, 0x6c, 0x74, 0x65, 0x64, 0x5f, 0x5f]);
export const OPENSSL_MAGIC_STRING = 'Salted__';
export const OPENSSL_MAGIC_BASE64 = 'U2FsdGVkX18='; // First 12 chars when base64 encoded

export const OPENSSL_SALT_LENGTH = 16; // 16 bytes for PBKDF2
export const AES_IV_LENGTH = 16;
export const GCM_IV_LENGTH = 12;

// ============================================
// OpenSSL Format Detection
// ============================================

/**
 * Check if data starts with OpenSSL "Salted__" magic header
 */
export const hasOpenSSLHeader = (data: Uint8Array): boolean => {
  if (data.length < OPENSSL_MAGIC.length) return false;
  return data.slice(0, 8).every((byte, i) => byte === OPENSSL_MAGIC[i]);
};

/**
 * Check if base64 string is OpenSSL format
 */
export const isOpenSSLBase64 = (base64: string): boolean => {
  try {
    const bytes = base64ToBytes(base64);
    return hasOpenSSLHeader(bytes);
  } catch {
    return false;
  }
};

// ============================================
// OpenSSL Format Encoding/Decoding
// ============================================

export interface OpenSSLEncodedData {
  salt: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
}

/**
 * Encode data in OpenSSL format: "Salted__" + salt + IV + ciphertext
 */
export const toOpenSSLFormat = (
  salt: Uint8Array,
  iv: Uint8Array,
  ciphertext: Uint8Array
): Uint8Array => {
  const result = new Uint8Array(OPENSSL_MAGIC.length + salt.length + iv.length + ciphertext.length);
  let offset = 0;

  result.set(OPENSSL_MAGIC, offset);
  offset += OPENSSL_MAGIC.length;

  result.set(salt, offset);
  offset += salt.length;

  result.set(iv, offset);
  offset += iv.length;

  result.set(ciphertext, offset);

  return result;
};

/**
 * Encode to OpenSSL-compatible Base64 string
 */
export const toOpenSSLBase64 = (
  salt: Uint8Array,
  iv: Uint8Array,
  ciphertext: Uint8Array
): string => {
  return bytesToBase64(toOpenSSLFormat(salt, iv, ciphertext));
};

/**
 * Parse OpenSSL format data
 */
export const fromOpenSSLFormat = (
  data: Uint8Array,
  ivLength: number = AES_IV_LENGTH
): OpenSSLEncodedData => {
  if (!hasOpenSSLHeader(data)) {
    throw new Error('Data does not have OpenSSL "Salted__" header');
  }

  const minLength = OPENSSL_MAGIC.length + OPENSSL_SALT_LENGTH + ivLength + 1;
  if (data.length < minLength) {
    throw new Error(`Data too short for OpenSSL format. Expected at least ${minLength} bytes.`);
  }

  let offset = OPENSSL_MAGIC.length;

  const salt = data.slice(offset, offset + OPENSSL_SALT_LENGTH);
  offset += OPENSSL_SALT_LENGTH;

  const iv = data.slice(offset, offset + ivLength);
  offset += ivLength;

  const ciphertext = data.slice(offset);

  return { salt, iv, ciphertext };
};

/**
 * Parse OpenSSL-compatible Base64 string
 */
export const fromOpenSSLBase64 = (
  base64: string,
  ivLength: number = AES_IV_LENGTH
): OpenSSLEncodedData => {
  const data = base64ToBytes(base64);
  return fromOpenSSLFormat(data, ivLength);
};

// ============================================
// Output Anatomy Analysis
// ============================================

/**
 * Analyze encrypted output and break it down into visual sections
 * for educational display
 */
export const analyzeOutputAnatomy = (
  base64Output: string,
  algorithm: CryptoAlgorithm
): OutputAnatomy | null => {
  try {
    const bytes = base64ToBytes(base64Output);
    const isOpenSSL = hasOpenSSLHeader(bytes);

    const sections: OutputSection[] = [];
    let offset = 0;

    if (isOpenSSL) {
      // OpenSSL Magic Header
      sections.push({
        label: 'Magic Header',
        start: offset,
        end: offset + 8,
        hex: bytesToHex(bytes.slice(offset, offset + 8)),
        bytes: 8,
        colorClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
        description: '"Salted__" - OpenSSL format identifier',
      });
      offset += 8;

      // Salt
      sections.push({
        label: 'Salt',
        start: offset,
        end: offset + 16,
        hex: bytesToHex(bytes.slice(offset, offset + 16)),
        bytes: 16,
        colorClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
        description: 'Random salt for PBKDF2 key derivation',
      });
      offset += 16;
    }

    // IV length depends on algorithm
    const ivLength = algorithm === 'aes-256-gcm' ? GCM_IV_LENGTH : AES_IV_LENGTH;

    if (offset + ivLength <= bytes.length) {
      sections.push({
        label: 'IV',
        start: offset,
        end: offset + ivLength,
        hex: bytesToHex(bytes.slice(offset, offset + ivLength)),
        bytes: ivLength,
        colorClass: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
        description: `Initialization Vector (${ivLength} bytes)`,
      });
      offset += ivLength;
    }

    // Remaining is ciphertext (+ auth tag for GCM)
    if (offset < bytes.length) {
      const ciphertextBytes = bytes.length - offset;
      let description = 'Encrypted data';

      if (algorithm === 'aes-256-gcm') {
        // GCM has 16-byte auth tag at the end
        description = `Encrypted data (${ciphertextBytes - 16} bytes) + Auth Tag (16 bytes)`;
      }

      sections.push({
        label: 'Ciphertext',
        start: offset,
        end: bytes.length,
        hex: bytesToHex(bytes.slice(offset)),
        bytes: ciphertextBytes,
        colorClass: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
        description,
      });
    }

    return {
      format: isOpenSSL ? 'openssl' : 'raw',
      sections,
      totalBytes: bytes.length,
      opensslCompatible: isOpenSSL,
    };
  } catch {
    return null;
  }
};

// ============================================
// OpenSSL Command Generation
// ============================================

export interface OpenSSLCommandOptions {
  algorithm: 'aes-256-cbc' | 'aes-256-gcm';
  passphrase: string;
  iterations: number;
  salt?: string; // hex
  iv?: string; // hex
  key?: string; // hex (derived key)
  mode: 'encrypt' | 'decrypt';
}

/**
 * Generate OpenSSL CLI command for verification
 */
export const generateOpenSSLCommand = (options: OpenSSLCommandOptions): string => {
  const {
    algorithm,
    passphrase,
    iterations,
    salt,
    iv,
    key,
    mode,
  } = options;

  const algoFlag = algorithm === 'aes-256-gcm' ? '-aes-256-gcm' : '-aes-256-cbc';

  // Escape passphrase for shell
  const escapedPassphrase = passphrase.replace(/'/g, "'\\''");

  let command = `openssl enc ${algoFlag} -pbkdf2 -iter ${iterations}`;

  if (mode === 'decrypt') {
    command += ' -d';
  }

  if (salt) {
    command += ` -S ${salt}`;
  }

  if (iv) {
    command += ` -iv ${iv}`;
  }

  if (key) {
    command += ` -K ${key}`;
  }

  command += ` -k '${escapedPassphrase}'`;
  command += ' -base64';

  if (mode === 'encrypt') {
    return `echo -n "your-plaintext" | ${command}`;
  } else {
    return `echo "your-ciphertext" | ${command}`;
  }
};

/**
 * Generate a complete OpenSSL verification example
 */
export const generateOpenSSLVerificationExample = (
  algorithm: 'aes-256-cbc' | 'aes-256-gcm',
  passphrase: string,
  plaintext: string,
  iterations: number = 100000
): { encryptCommand: string; decryptCommand: string; note: string } => {
  const escapedPassphrase = passphrase.replace(/'/g, "'\\''");
  const escapedPlaintext = plaintext.replace(/'/g, "'\\''");
  const algoFlag = algorithm === 'aes-256-gcm' ? '-aes-256-gcm' : '-aes-256-cbc';

  const encryptCommand = `echo -n '${escapedPlaintext}' | openssl enc ${algoFlag} -pbkdf2 -iter ${iterations} -k '${escapedPassphrase}' -base64`;

  const decryptCommand = `echo '<paste-ciphertext-here>' | openssl enc ${algoFlag} -pbkdf2 -iter ${iterations} -d -k '${escapedPassphrase}' -base64`;

  const note = algorithm === 'aes-256-gcm'
    ? 'Note: OpenSSL GCM support varies by version. Ensure OpenSSL 1.1.1+ for full support.'
    : 'Compatible with OpenSSL 1.1.0+ with PBKDF2 support.';

  return { encryptCommand, decryptCommand, note };
};

// ============================================
// Format Information
// ============================================

export const FORMAT_INFO = {
  openssl: {
    name: 'OpenSSL Format',
    description: 'Standard format used by OpenSSL command line tool',
    structure: [
      { name: 'Magic Header', bytes: 8, description: '"Salted__" identifier' },
      { name: 'Salt', bytes: 16, description: 'Random salt for key derivation' },
      { name: 'IV', bytes: '16 (CBC) / 12 (GCM)', description: 'Initialization Vector' },
      { name: 'Ciphertext', bytes: 'Variable', description: 'Encrypted data' },
    ],
    advantages: [
      'Compatible with OpenSSL CLI',
      'Self-contained (includes salt)',
      'Industry standard format',
    ],
  },
  raw: {
    name: 'Raw Format',
    description: 'Minimal format with just IV and ciphertext',
    structure: [
      { name: 'IV', bytes: '16 (CBC) / 12 (GCM)', description: 'Initialization Vector' },
      { name: 'Ciphertext', bytes: 'Variable', description: 'Encrypted data' },
    ],
    advantages: [
      'Smaller output size',
      'Salt must be stored/transmitted separately',
      'More control over salt management',
    ],
  },
};
