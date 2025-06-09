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

const deriveKey = async (key: string, usages: KeyUsage[]): Promise<CryptoKey> => {
  if (!key) throw new Error('Key must not be empty');
  const enc = new TextEncoder();
  const hash = await sha256(enc.encode(key));
  const keyBytes = hash.slice(0, Math.min(32, key.length));
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, usages);
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

export default aes256CbcDecryptRandomIV;
