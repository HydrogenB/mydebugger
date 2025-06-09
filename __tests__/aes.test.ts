import { aes256CbcEncryptRandomIV, aes256CbcDecryptRandomIV } from '../model/aes';
// Polyfill TextEncoder/TextDecoder for Jest
// eslint-disable-next-line @typescript-eslint/no-var-requires
const util = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = util.TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = util.TextDecoder;
}
// Ensure Web Crypto is available in the test environment
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webcrypto = require('crypto').webcrypto;
if (typeof global.crypto === 'undefined') {
  global.crypto = webcrypto;
} else {
  if (!global.crypto.subtle) global.crypto.subtle = webcrypto.subtle;
  if (!global.crypto.getRandomValues) global.crypto.getRandomValues = webcrypto.getRandomValues.bind(webcrypto);
}

test('encrypt and decrypt roundtrip with 32 byte key', async () => {
  const key = '12345678901234567890123456789012';
  const plaintext = 'hello world';
  const encrypted = await aes256CbcEncryptRandomIV(key, plaintext);
  const decrypted = await aes256CbcDecryptRandomIV(key, encrypted);
  expect(decrypted).toBe(plaintext);
});

test('encrypt and decrypt roundtrip with 16 byte key', async () => {
  const key = '1234567890abcdef';
  const plaintext = 'test data';
  const encrypted = await aes256CbcEncryptRandomIV(key, plaintext);
  const decrypted = await aes256CbcDecryptRandomIV(key, encrypted);
  expect(decrypted).toBe(plaintext);
});

test('throws on empty key', async () => {
  await expect(aes256CbcEncryptRandomIV('', 'data')).rejects.toThrow('Key must not be empty');
});

test('throws on invalid base64 input', async () => {
  const key = '1234567890abcdef1234567890abcdef';
  await expect(aes256CbcDecryptRandomIV(key, 'not-base64')).rejects.toThrow('Invalid base64 input');
});

test('throws on short ciphertext', async () => {
  const key = '12345678901234567890123456789012';
  await expect(aes256CbcDecryptRandomIV(key, 'AA==')).rejects.toThrow('Ciphertext too short');
});

test('base64 helpers use DOM APIs when available', async () => {
  (global as any).atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
  (global as any).btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
  const key = '1234567890abcdef1234567890abcdef';
  const plaintext = 'abc';
  const encrypted = await aes256CbcEncryptRandomIV(key, plaintext);
  const decrypted = await aes256CbcDecryptRandomIV(key, encrypted);
  expect(decrypted).toBe(plaintext);
  delete (global as any).atob;
  delete (global as any).btoa;
});
