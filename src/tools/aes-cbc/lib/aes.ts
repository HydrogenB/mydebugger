/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Crypto Lab - Educational Cryptography Library
 * Implements AES-256-CBC/GCM with PBKDF2 key derivation
 * Exposes internal mechanics for educational purposes
 */

import type { EncryptionResult, DecryptionResult } from '../types';

// ============================================
// Constants
// ============================================

export const DEFAULT_ITERATIONS = 100000;
export const AES_IV_BYTES = 16;
export const GCM_IV_BYTES = 12;
export const SALT_BYTES = 16;
export const AES_KEY_BYTES = 32;

// OpenSSL "Salted__" magic header
const OPENSSL_MAGIC = new Uint8Array([0x53, 0x61, 0x6c, 0x74, 0x65, 0x64, 0x5f, 0x5f]); // "Salted__"

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
// Utility Functions
// ============================================

// Convert base64 strings to Uint8Array
export const base64ToBytes = (base64: string): Uint8Array => {
  try {
    if (typeof atob === 'function') {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    return new Uint8Array(Buffer.from(base64, 'base64'));
  } catch {
    throw new Error('Invalid base64 input');
  }
};

// Convert Uint8Array to base64 string
export const bytesToBase64 = (bytes: Uint8Array): string => {
  if (typeof btoa === 'function') {
    let binary = '';
    bytes.forEach(b => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  }
  return Buffer.from(bytes).toString('base64');
};

// Convert Uint8Array to hex string
export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Convert hex string to Uint8Array
export const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.replace(/\s/g, '').toLowerCase();
  if (!/^[0-9a-f]*$/.test(cleanHex)) {
    throw new Error('Invalid hexadecimal string');
  }
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
};

// Generate random bytes
export const generateRandomBytes = (length: number): Uint8Array => {
  return cryptoApi.getRandomValues(new Uint8Array(length));
};

// Generate random hex string
export const generateRandomHex = (byteLength: number): string => {
  return bytesToHex(generateRandomBytes(byteLength));
};

// ============================================
// PBKDF2 Key Derivation (Educational)
// ============================================

export interface PBKDF2Result {
  key: CryptoKey;
  keyBytes: Uint8Array;
  keyHex: string;
  salt: Uint8Array;
  saltHex: string;
  iterations: number;
}

/**
 * Derive a 256-bit AES key from a passphrase using PBKDF2
 * This exposes the internals for educational purposes
 */
export const deriveKeyPBKDF2 = async (
  passphrase: string,
  salt?: Uint8Array,
  iterations: number = DEFAULT_ITERATIONS,
  algo: 'AES-CBC' | 'AES-GCM' = 'AES-CBC'
): Promise<PBKDF2Result> => {
  if (!passphrase) throw new Error('Passphrase must not be empty');

  // Generate random salt if not provided
  const actualSalt = salt ?? generateRandomBytes(SALT_BYTES);

  // Import passphrase as key material for PBKDF2
  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive the actual AES key using PBKDF2
  const derivedKey = await cryptoApi.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: actualSalt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: algo, length: 256 },
    true, // extractable for educational display
    ['encrypt', 'decrypt']
  );

  // Export key bytes for display
  const keyBytes = new Uint8Array(await cryptoApi.subtle.exportKey('raw', derivedKey));

  return {
    key: derivedKey,
    keyBytes,
    keyHex: bytesToHex(keyBytes),
    salt: actualSalt,
    saltHex: bytesToHex(actualSalt),
    iterations,
  };
};

// ============================================
// Legacy Key Derivation (SHA-256 hash)
// Kept for backward compatibility
// ============================================

const sha256 = async (data: Uint8Array): Promise<Uint8Array> => {
  const digest = await cryptoApi.subtle.digest('SHA-256', data);
  return new Uint8Array(digest);
};

const deriveKey = async (
  key: string,
  usages: KeyUsage[],
  algo: 'AES-CBC' | 'AES-GCM' = 'AES-CBC'
): Promise<CryptoKey> => {
  if (!key) throw new Error('Key must not be empty');
  const enc = new TextEncoder();
  const hash = await sha256(enc.encode(key));
  const keyBytes = hash.slice(0, 32);
  return cryptoApi.subtle.importKey('raw', keyBytes, { name: algo }, false, usages);
};

// ============================================
// AES-256-CBC with PBKDF2 (Educational Version)
// ============================================

export interface EncryptOptions {
  salt?: Uint8Array;
  iv?: Uint8Array;
  iterations?: number;
}

/**
 * AES-256-CBC encryption with PBKDF2 key derivation
 * Returns all internals for educational display
 */
export const aes256CbcEncryptWithInternals = async (
  passphrase: string,
  plaintext: string,
  options: EncryptOptions = {}
): Promise<EncryptionResult> => {
  if (!plaintext) throw new Error('Plaintext is empty');

  const { salt, iv, iterations = DEFAULT_ITERATIONS } = options;

  // Derive key using PBKDF2
  const pbkdf2Result = await deriveKeyPBKDF2(passphrase, salt, iterations, 'AES-CBC');

  // Generate or use provided IV
  const actualIV = iv ?? generateRandomBytes(AES_IV_BYTES);

  // Encrypt the data
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await cryptoApi.subtle.encrypt(
    { name: 'AES-CBC', iv: actualIV },
    pbkdf2Result.key,
    data
  );

  // Combine: IV + Ciphertext
  const ciphertextBytes = new Uint8Array(encrypted);
  const combined = new Uint8Array(actualIV.length + ciphertextBytes.length);
  combined.set(actualIV);
  combined.set(ciphertextBytes, actualIV.length);

  // Create OpenSSL-compatible format: "Salted__" + salt + ciphertext
  const opensslData = new Uint8Array(OPENSSL_MAGIC.length + pbkdf2Result.salt.length + combined.length);
  opensslData.set(OPENSSL_MAGIC);
  opensslData.set(pbkdf2Result.salt, OPENSSL_MAGIC.length);
  opensslData.set(combined, OPENSSL_MAGIC.length + pbkdf2Result.salt.length);

  // Generate OpenSSL command for verification
  const opensslCommand = `echo -n "${plaintext}" | openssl enc -aes-256-cbc -pbkdf2 -iter ${iterations} -S ${pbkdf2Result.saltHex} -iv ${bytesToHex(actualIV)} -K ${pbkdf2Result.keyHex} -base64`;

  return {
    ciphertext: bytesToBase64(combined),
    salt: pbkdf2Result.salt,
    saltHex: pbkdf2Result.saltHex,
    iv: actualIV,
    ivHex: bytesToHex(actualIV),
    derivedKey: pbkdf2Result.keyBytes,
    derivedKeyHex: pbkdf2Result.keyHex,
    opensslFormat: bytesToBase64(opensslData),
    opensslCommand,
  };
};

/**
 * AES-256-CBC decryption with PBKDF2 key derivation
 * Returns all internals for educational display
 */
export const aes256CbcDecryptWithInternals = async (
  passphrase: string,
  encrypted: string,
  options: { salt?: Uint8Array; iterations?: number } = {}
): Promise<DecryptionResult> => {
  if (!encrypted) throw new Error('Encrypted text is empty');

  let encryptedBytes: Uint8Array;
  let actualSalt: Uint8Array;

  try {
    encryptedBytes = base64ToBytes(encrypted);
  } catch {
    throw new Error('Invalid ciphertext format - not valid Base64');
  }

  // Check for OpenSSL format
  const hasOpenSSLHeader = encryptedBytes.length >= 16 &&
    encryptedBytes[0] === 0x53 && encryptedBytes[1] === 0x61 &&
    encryptedBytes[2] === 0x6c && encryptedBytes[3] === 0x74 &&
    encryptedBytes[4] === 0x65 && encryptedBytes[5] === 0x64 &&
    encryptedBytes[6] === 0x5f && encryptedBytes[7] === 0x5f;

  if (hasOpenSSLHeader) {
    // Parse OpenSSL format: "Salted__" + 8-byte salt + IV + ciphertext
    actualSalt = encryptedBytes.slice(8, 24);
    encryptedBytes = encryptedBytes.slice(24);
  } else if (options.salt) {
    actualSalt = options.salt;
  } else {
    throw new Error('Salt required for decryption. Either use OpenSSL format or provide salt manually.');
  }

  const { iterations = DEFAULT_ITERATIONS } = options;

  if (encryptedBytes.length <= AES_IV_BYTES) {
    throw new Error('Ciphertext too short - must contain at least IV + encrypted data');
  }

  // Extract IV and ciphertext
  const iv = encryptedBytes.slice(0, AES_IV_BYTES);
  const ciphertext = encryptedBytes.slice(AES_IV_BYTES);

  // Derive key using PBKDF2 with the extracted/provided salt
  const pbkdf2Result = await deriveKeyPBKDF2(passphrase, actualSalt, iterations, 'AES-CBC');

  // Decrypt
  let decrypted: ArrayBuffer;
  try {
    decrypted = await cryptoApi.subtle.decrypt(
      { name: 'AES-CBC', iv },
      pbkdf2Result.key,
      ciphertext
    );
  } catch {
    throw new Error('Decryption failed - incorrect passphrase, corrupted data, or wrong algorithm');
  }

  return {
    plaintext: new TextDecoder().decode(decrypted),
    salt: pbkdf2Result.salt,
    saltHex: pbkdf2Result.saltHex,
    iv,
    ivHex: bytesToHex(iv),
    derivedKey: pbkdf2Result.keyBytes,
    derivedKeyHex: pbkdf2Result.keyHex,
  };
};

// ============================================
// AES-256-GCM with PBKDF2 (Educational Version)
// ============================================

/**
 * AES-256-GCM encryption with PBKDF2 key derivation
 * GCM provides authenticated encryption (integrity + confidentiality)
 */
export const aes256GcmEncryptWithInternals = async (
  passphrase: string,
  plaintext: string,
  options: EncryptOptions = {}
): Promise<EncryptionResult> => {
  if (!plaintext) throw new Error('Plaintext is empty');

  const { salt, iv, iterations = DEFAULT_ITERATIONS } = options;

  // Derive key using PBKDF2
  const pbkdf2Result = await deriveKeyPBKDF2(passphrase, salt, iterations, 'AES-GCM');

  // Generate or use provided IV (12 bytes for GCM)
  const actualIV = iv ?? generateRandomBytes(GCM_IV_BYTES);

  // Encrypt the data
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await cryptoApi.subtle.encrypt(
    { name: 'AES-GCM', iv: actualIV },
    pbkdf2Result.key,
    data
  );

  // Combine: IV + Ciphertext (includes auth tag)
  const ciphertextBytes = new Uint8Array(encrypted);
  const combined = new Uint8Array(actualIV.length + ciphertextBytes.length);
  combined.set(actualIV);
  combined.set(ciphertextBytes, actualIV.length);

  // Create OpenSSL-compatible format
  const opensslData = new Uint8Array(OPENSSL_MAGIC.length + pbkdf2Result.salt.length + combined.length);
  opensslData.set(OPENSSL_MAGIC);
  opensslData.set(pbkdf2Result.salt, OPENSSL_MAGIC.length);
  opensslData.set(combined, OPENSSL_MAGIC.length + pbkdf2Result.salt.length);

  const opensslCommand = `openssl enc -aes-256-gcm -pbkdf2 -iter ${iterations} -S ${pbkdf2Result.saltHex} -iv ${bytesToHex(actualIV)} -K ${pbkdf2Result.keyHex} -base64`;

  return {
    ciphertext: bytesToBase64(combined),
    salt: pbkdf2Result.salt,
    saltHex: pbkdf2Result.saltHex,
    iv: actualIV,
    ivHex: bytesToHex(actualIV),
    derivedKey: pbkdf2Result.keyBytes,
    derivedKeyHex: pbkdf2Result.keyHex,
    opensslFormat: bytesToBase64(opensslData),
    opensslCommand,
  };
};

/**
 * AES-256-GCM decryption with PBKDF2 key derivation
 */
export const aes256GcmDecryptWithInternals = async (
  passphrase: string,
  encrypted: string,
  options: { salt?: Uint8Array; iterations?: number } = {}
): Promise<DecryptionResult> => {
  if (!encrypted) throw new Error('Encrypted text is empty');

  let encryptedBytes: Uint8Array;
  let actualSalt: Uint8Array;

  try {
    encryptedBytes = base64ToBytes(encrypted);
  } catch {
    throw new Error('Invalid ciphertext format - not valid Base64');
  }

  // Check for OpenSSL format
  const hasOpenSSLHeader = encryptedBytes.length >= 16 &&
    encryptedBytes.slice(0, 8).every((b, i) => b === OPENSSL_MAGIC[i]);

  if (hasOpenSSLHeader) {
    actualSalt = encryptedBytes.slice(8, 24);
    encryptedBytes = encryptedBytes.slice(24);
  } else if (options.salt) {
    actualSalt = options.salt;
  } else {
    throw new Error('Salt required for decryption. Either use OpenSSL format or provide salt manually.');
  }

  const { iterations = DEFAULT_ITERATIONS } = options;

  if (encryptedBytes.length <= GCM_IV_BYTES) {
    throw new Error('Ciphertext too short - must contain at least IV + encrypted data + auth tag');
  }

  // Extract IV and ciphertext
  const iv = encryptedBytes.slice(0, GCM_IV_BYTES);
  const ciphertext = encryptedBytes.slice(GCM_IV_BYTES);

  // Derive key
  const pbkdf2Result = await deriveKeyPBKDF2(passphrase, actualSalt, iterations, 'AES-GCM');

  // Decrypt
  let decrypted: ArrayBuffer;
  try {
    decrypted = await cryptoApi.subtle.decrypt(
      { name: 'AES-GCM', iv },
      pbkdf2Result.key,
      ciphertext
    );
  } catch {
    throw new Error('Decryption failed - authentication failed, incorrect passphrase, or corrupted data');
  }

  return {
    plaintext: new TextDecoder().decode(decrypted),
    salt: pbkdf2Result.salt,
    saltHex: pbkdf2Result.saltHex,
    iv,
    ivHex: bytesToHex(iv),
    derivedKey: pbkdf2Result.keyBytes,
    derivedKeyHex: pbkdf2Result.keyHex,
  };
};

export const aes256CbcEncryptRandomIV = async (
  key: string,
  plaintext: string
): Promise<string> => {
  if (!plaintext) throw new Error('Plaintext is empty');
  const iv = cryptoApi.getRandomValues(new Uint8Array(16));
  const cryptoKey = await deriveKey(key, ['encrypt']);
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await cryptoApi.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, data);
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return bytesToBase64(combined);
};

export const aes256CbcDecryptRandomIV = async (
  key: string,
  encrypted: string
): Promise<string> => {
  if (!encrypted) throw new Error('Encrypted text is empty');
  const encryptedBytes = base64ToBytes(encrypted);
  if (encryptedBytes.length <= 16) throw new Error('Ciphertext too short');
  const iv = encryptedBytes.slice(0, 16);
  const data = encryptedBytes.slice(16);
  const cryptoKey = await deriveKey(key, ['decrypt']);
  const decrypted = await cryptoApi.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, data);
  return new TextDecoder().decode(decrypted);
};

export const generateAesKey = (length = 32): string => {
  const bytes = cryptoApi.getRandomValues(new Uint8Array(length));
  return bytesToBase64(bytes);
};

export const aes256GcmEncryptRandomIV = async (
  key: string,
  plaintext: string
): Promise<string> => {
  if (!plaintext) throw new Error('Plaintext is empty');
  const iv = cryptoApi.getRandomValues(new Uint8Array(12));
  const cryptoKey = await deriveKey(key, ['encrypt'], 'AES-GCM');
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await cryptoApi.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return bytesToBase64(combined);
};

export const aes256GcmDecryptRandomIV = async (
  key: string,
  encrypted: string
): Promise<string> => {
  if (!encrypted) throw new Error('Encrypted text is empty');
  const encryptedBytes = base64ToBytes(encrypted);
  if (encryptedBytes.length <= 12) throw new Error('Ciphertext too short');
  const iv = encryptedBytes.slice(0, 12);
  const data = encryptedBytes.slice(12);
  const cryptoKey = await deriveKey(key, ['decrypt'], 'AES-GCM');
  const decrypted = await cryptoApi.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
  return new TextDecoder().decode(decrypted);
};

const pemHeader = (label: string) => `-----BEGIN ${label}-----\n`;
const pemFooter = (label: string) => `-----END ${label}-----`;

const arrayBufferToPem = (buffer: ArrayBuffer, label: string): string => {
  const base64 = bytesToBase64(new Uint8Array(buffer));
  const chunked = base64.match(/.{1,64}/g)?.join('\n') ?? base64;
  return `${pemHeader(label)}${chunked}\n${pemFooter(label)}`;
};

const pemToArrayBuffer = (pem: string): ArrayBuffer => {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  return Buffer.from(b64, 'base64');
};

export const generateRsaKeyPair = async () => {
  const keyPair = await cryptoApi.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  const publicKey = await cryptoApi.subtle.exportKey('spki', keyPair.publicKey);
  const privateKey = await cryptoApi.subtle.exportKey('pkcs8', keyPair.privateKey);
  return {
    publicKey: arrayBufferToPem(publicKey, 'PUBLIC KEY'),
    privateKey: arrayBufferToPem(privateKey, 'PRIVATE KEY'),
  };
};

export const rsaOaepEncrypt = async (
  publicKeyPem: string,
  plaintext: string
): Promise<string> => {
  if (!plaintext) throw new Error('Plaintext is empty');
  const keyBuffer = pemToArrayBuffer(publicKeyPem);
  const key = await cryptoApi.subtle.importKey(
    'spki',
    keyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await cryptoApi.subtle.encrypt({ name: 'RSA-OAEP' }, key, data);
  return bytesToBase64(new Uint8Array(encrypted));
};

export const rsaOaepDecrypt = async (
  privateKeyPem: string,
  encrypted: string
): Promise<string> => {
  if (!encrypted) throw new Error('Encrypted text is empty');
  const keyBuffer = pemToArrayBuffer(privateKeyPem);
  const key = await cryptoApi.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
  const data = base64ToBytes(encrypted);
  const decrypted = await cryptoApi.subtle.decrypt({ name: 'RSA-OAEP' }, key, data);
  return new TextDecoder().decode(decrypted);
};

export const generateGpgKeyPair = async () => {
  const openpgp = await import('openpgp');
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'rsa',
    rsaBits: 2048,
    userIDs: [{ name: 'CryptoLab' }],
  });
  return { publicKey, privateKey };
};

export const gpgEncrypt = async (
  publicKeyArmored: string,
  plaintext: string,
): Promise<string> => {
  if (!plaintext) throw new Error('Plaintext is empty');
  const openpgp = await import('openpgp');
  const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
  const message = await openpgp.createMessage({ text: plaintext });
  return openpgp.encrypt({ message, encryptionKeys: publicKey, format: 'armored' }) as Promise<string>;
};

export const gpgDecrypt = async (
  privateKeyArmored: string,
  encrypted: string,
): Promise<string> => {
  if (!encrypted) throw new Error('Encrypted text is empty');
  const openpgp = await import('openpgp');
  const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
  const message = await openpgp.readMessage({ armoredMessage: encrypted });
  const { data } = await openpgp.decrypt({ message, decryptionKeys: privateKey, format: 'utf8' });
  return data as string;
};

export default aes256CbcDecryptRandomIV;
