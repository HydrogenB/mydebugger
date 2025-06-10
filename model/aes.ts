/**
 * © 2025 MyDebugger Contributors – MIT License
 */

// Utility to convert base64 strings to Uint8Array
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

// Utility to convert Uint8Array to base64 string
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

const sha256 = async (data: Uint8Array): Promise<Uint8Array> => {
  const digest = await crypto.subtle.digest('SHA-256', data);
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
  const keyBytes = hash.slice(0, Math.min(32, key.length));
  return crypto.subtle.importKey('raw', keyBytes, { name: algo }, false, usages);

};

export const aes256CbcEncryptRandomIV = async (
  key: string,
  plaintext: string
): Promise<string> => {
  if (!plaintext) throw new Error('Plaintext is empty');
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const cryptoKey = await deriveKey(key, ['encrypt']);
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, data);
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
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, data);
  return new TextDecoder().decode(decrypted);
};

export const generateAesKey = (length = 32): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return bytesToBase64(bytes);
};

export const aes256GcmEncryptRandomIV = async (
  key: string,
  plaintext: string
): Promise<string> => {
  if (!plaintext) throw new Error('Plaintext is empty');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await deriveKey(key, ['encrypt'], 'AES-GCM');
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
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
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
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
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
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
  const key = await crypto.subtle.importKey(
    'spki',
    keyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, data);
  return bytesToBase64(new Uint8Array(encrypted));
};

export const rsaOaepDecrypt = async (
  privateKeyPem: string,
  encrypted: string
): Promise<string> => {
  if (!encrypted) throw new Error('Encrypted text is empty');
  const keyBuffer = pemToArrayBuffer(privateKeyPem);
  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
  const data = base64ToBytes(encrypted);
  const decrypted = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, data);
  return new TextDecoder().decode(decrypted);
};

export default aes256CbcDecryptRandomIV;
