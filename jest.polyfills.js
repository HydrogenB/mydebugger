// Ensure WebCrypto in Node test env
{
  const { webcrypto } = require('crypto');
  if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
    globalThis.crypto = webcrypto;
  }
}

if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}


