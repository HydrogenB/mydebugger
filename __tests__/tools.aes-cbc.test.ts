import {
  aes256CbcEncryptRandomIV,
  aes256CbcDecryptRandomIV,
  aes256GcmEncryptRandomIV,
  aes256GcmDecryptRandomIV,
  bytesToBase64,
  base64ToBytes,
  generateRsaKeyPair,
  rsaOaepEncrypt,
  rsaOaepDecrypt,
} from '../src/tools/aes-cbc/lib/aes';

describe('Crypto Lab primitives', () => {
  beforeAll(() => {
    // Ensure WebCrypto for Node 18+
    if (typeof globalThis.crypto === 'undefined' || !(globalThis.crypto as any).subtle) {
      const { webcrypto } = require('crypto');
      // @ts-ignore
      globalThis.crypto = webcrypto as Crypto;
    }
  });
  test('aes-cbc encrypt/decrypt roundtrip', async () => {
    const key = 'my-secret-key';
    const text = 'hello world';
    const enc = await aes256CbcEncryptRandomIV(key, text);
    expect(typeof enc).toBe('string');
    const dec = await aes256CbcDecryptRandomIV(key, enc);
    expect(dec).toBe(text);
  });

  test('aes-gcm encrypt/decrypt roundtrip', async () => {
    const key = 'another-key-123';
    const text = 'sample text';
    const enc = await aes256GcmEncryptRandomIV(key, text);
    const dec = await aes256GcmDecryptRandomIV(key, enc);
    expect(dec).toBe(text);
  });

  test('base64 encode/decode utility', () => {
    const bytes = new Uint8Array([1, 2, 3, 254, 255]);
    const b64 = bytesToBase64(bytes);
    const round = base64ToBytes(b64);
    expect(Array.from(round)).toEqual(Array.from(bytes));
  });

  test('rsa-oaep encrypt/decrypt roundtrip', async () => {
    const { publicKey, privateKey } = await generateRsaKeyPair();
    const msg = 'secret message';
    const encrypted = await rsaOaepEncrypt(publicKey, msg);
    const decrypted = await rsaOaepDecrypt(privateKey, encrypted);
    expect(decrypted).toBe(msg);
  }, 30000);

  test('aes-cbc decrypt invalid input throws', async () => {
    await expect(aes256CbcDecryptRandomIV('k', 'invalid-base64')).rejects.toThrow();
  });
});


