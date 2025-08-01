/**
 * © 2025 MyDebugger Contributors – MIT License
 * Comprehensive JWT Crypto Worker Tests
 */

import {
  base64UrlEncode,
  base64UrlDecode,
  decodeSafely,
  verifyToken,
  type JwtHeader,
  type JwtPayload
} from '../src/tools/jwt/workers/cryptoWorker';

// Setup crypto and text encoding for test environment
const util = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = util.TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = util.TextDecoder;
}

// Mock crypto for tests that need it
const mockCrypto = {
  subtle: {
    importKey: jest.fn(),
    verify: jest.fn(),
    sign: jest.fn(),
    generateKey: jest.fn(),
  },
  getRandomValues: jest.fn(),
};

if (typeof global.crypto === 'undefined') {
  global.crypto = mockCrypto as any;
}

if (typeof global.window === 'undefined') {
  (global as any).window = {
    crypto: mockCrypto,
  };
}

describe('JWT Crypto Worker', () => {
  describe('Base64Url Encoding/Decoding', () => {
    test('should encode string to base64url', () => {
      const input = 'Hello World';
      const encoded = base64UrlEncode(input);
      expect(encoded).toBe('SGVsbG8gV29ybGQ');
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    test('should decode base64url to string', () => {
      const input = 'SGVsbG8gV29ybGQ';
      const decoded = base64UrlDecode(input);
      expect(decoded).toBe('Hello World');
    });

    test('should handle padding correctly', () => {
      const testCases = [
        { input: 'test', encoded: 'dGVzdA' },
        { input: 'test1', encoded: 'dGVzdDE' },
        { input: 'test12', encoded: 'dGVzdDEy' },
      ];

      testCases.forEach(({ input, encoded }) => {
        expect(base64UrlEncode(input)).toBe(encoded);
        expect(base64UrlDecode(encoded)).toBe(input);
      });
    });

    test('should handle empty strings', () => {
      expect(base64UrlEncode('')).toBe('');
      expect(base64UrlDecode('')).toBe('');
    });

    test('should handle special characters', () => {
      const input = '{"typ":"JWT","alg":"HS256"}';
      const encoded = base64UrlEncode(input);
      const decoded = base64UrlDecode(encoded);
      expect(decoded).toBe(input);
    });

    test('should handle Unicode characters', () => {
      const input = 'Hello 世界 🌍';
      const encoded = base64UrlEncode(input);
      const decoded = base64UrlDecode(encoded);
      expect(decoded).toBe(input);
    });

    test('should throw on invalid base64url', () => {
      expect(() => base64UrlDecode('invalid!@#')).toThrow();
    });
  });

  describe('JWT Decoding', () => {
    const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    test('should decode valid JWT', async () => {
      const decoded = await decodeSafely(validJwt);
      
      expect(decoded.header).toEqual({
        alg: 'HS256',
        typ: 'JWT'
      });
      
      expect(decoded.payload).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022
      });
      
      expect(decoded.signature).toBeTruthy();
      expect(decoded.isValid).toBe(false); // Not verified yet
      expect(decoded.raw.header).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(decoded.raw.payload).toBe('eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ');
    });

    test('should handle malformed JWT with wrong number of parts', async () => {
      const malformedJwt = 'invalid.jwt';
      const decoded = await decodeSafely(malformedJwt);
      
      expect(decoded.header).toBeNull();
      expect(decoded.payload).toBeNull();
      expect(decoded.isValid).toBe(false);
      expect(decoded.error).toContain('expected 3 parts');
      expect(decoded.parsingWarnings).toContain('Token has 2 parts instead of the expected 3 parts');
    });

    test('should handle empty token', async () => {
      const decoded = await decodeSafely('');
      
      expect(decoded.header).toBeNull();
      expect(decoded.payload).toBeNull();
      expect(decoded.isValid).toBe(false);
      expect(decoded.error).toBe('Empty token');
    });

    test('should handle Bearer prefix', async () => {
      const tokenWithBearer = `Bearer ${validJwt}`;
      const decoded = await decodeSafely(tokenWithBearer);
      
      expect(decoded.header).toEqual({
        alg: 'HS256',
        typ: 'JWT'
      });
      expect(decoded.parsingWarnings).toContain('Bearer prefix was removed from token');
    });

    test('should detect missing exp claim', async () => {
      const decoded = await decodeSafely(validJwt);
      expect(decoded.parsingWarnings).toContain('Token payload is missing the "exp" field');
    });

    test('should detect missing iat claim when not present', async () => {
      const headerWithoutIat = { alg: 'HS256', typ: 'JWT' };
      const payloadWithoutIat = { sub: '1234567890', name: 'John Doe' };
      
      const token = `${base64UrlEncode(JSON.stringify(headerWithoutIat))}.${base64UrlEncode(JSON.stringify(payloadWithoutIat))}.signature`;
      const decoded = await decodeSafely(token);
      
      expect(decoded.parsingWarnings).toContain('Token payload is missing the "iat" field');
    });

    test('should detect expired token', async () => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const expiredPayload = { 
        sub: '1234567890',
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      };
      
      const token = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(expiredPayload))}.signature`;
      const decoded = await decodeSafely(token);
      
      expect(decoded.parsingWarnings?.some(w => w.includes('Token is expired'))).toBe(true);
    });

    test('should detect not-yet-valid token', async () => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const futurePayload = { 
        sub: '1234567890',
        nbf: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };
      
      const token = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(futurePayload))}.signature`;
      const decoded = await decodeSafely(token);
      
      expect(decoded.parsingWarnings?.some(w => w.includes('Token is not yet valid'))).toBe(true);
    });

    test('should handle invalid JSON in header', async () => {
      const invalidHeader = base64UrlEncode('{invalid json}');
      const validPayload = base64UrlEncode('{"sub":"123"}');
      const token = `${invalidHeader}.${validPayload}.signature`;
      
      const decoded = await decodeSafely(token);
      
      expect(decoded.header).toBeNull();
      expect(decoded.parsingWarnings).toContain('Failed to decode header as JSON');
      expect(decoded.error).toContain('Invalid JWT header');
    });

    test('should handle invalid JSON in payload', async () => {
      const validHeader = base64UrlEncode('{"alg":"HS256","typ":"JWT"}');
      const invalidPayload = base64UrlEncode('{invalid json}');
      const token = `${validHeader}.${invalidPayload}.signature`;
      
      const decoded = await decodeSafely(token);
      
      expect(decoded.payload).toBeNull();
      expect(decoded.parsingWarnings).toContain('Failed to decode payload as JSON');
      expect(decoded.error).toContain('Invalid JWT payload');
    });

    test('should handle missing algorithm in header', async () => {
      const headerWithoutAlg = { typ: 'JWT' };
      const validPayload = { sub: '1234567890' };
      
      const token = `${base64UrlEncode(JSON.stringify(headerWithoutAlg))}.${base64UrlEncode(JSON.stringify(validPayload))}.signature`;
      const decoded = await decodeSafely(token);
      
      expect(decoded.parsingWarnings).toContain('Token header is missing the "alg" field');
    });

    test('should handle missing typ in header', async () => {
      const headerWithoutTyp = { alg: 'HS256' };
      const validPayload = { sub: '1234567890' };
      
      const token = `${base64UrlEncode(JSON.stringify(headerWithoutTyp))}.${base64UrlEncode(JSON.stringify(validPayload))}.signature`;
      const decoded = await decodeSafely(token);
      
      expect(decoded.parsingWarnings).toContain('Token header is missing the "typ" field');
    });
  });

  describe('JWT Verification', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should reject empty token', async () => {
      const isValid = await verifyToken('', 'secret');
      expect(isValid).toBe(false);
    });

    test('should reject token with wrong number of parts', async () => {
      const isValid = await verifyToken('invalid.token', 'secret');
      expect(isValid).toBe(false);
    });

    test('should reject token with empty signature', async () => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = { sub: '1234567890' };
      
      const headerBase64 = base64UrlEncode(JSON.stringify(header));
      const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
      const token = `${headerBase64}.${payloadBase64}.`; // Empty signature
      
      const isValid = await verifyToken(token, 'secret');
      expect(isValid).toBe(false);
    });

    test('should reject token with invalid header JSON', async () => {
      const invalidHeader = base64UrlEncode('{invalid}');
      const validPayload = base64UrlEncode('{"sub":"123"}');
      const token = `${invalidHeader}.${validPayload}.signature`;
      
      const isValid = await verifyToken(token, 'secret');
      expect(isValid).toBe(false);
    });

    test('should reject token without algorithm', async () => {
      const headerWithoutAlg = { typ: 'JWT' }; // Missing alg
      const payload = { sub: '1234567890' };
      
      const headerBase64 = base64UrlEncode(JSON.stringify(headerWithoutAlg));
      const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
      const token = `${headerBase64}.${payloadBase64}.signature`;
      
      const isValid = await verifyToken(token, 'secret');
      expect(isValid).toBe(false);
    });

    test('should handle HMAC verification with mocked crypto', async () => {
      // Mock successful verification
      mockCrypto.subtle.importKey.mockResolvedValue('mock-key');
      mockCrypto.subtle.verify.mockResolvedValue(true);
      
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = { sub: '1234567890' };
      
      const headerBase64 = base64UrlEncode(JSON.stringify(header));
      const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
      const token = `${headerBase64}.${payloadBase64}.valid-signature`;
      
      const isValid = await verifyToken(token, 'secret');
      expect(isValid).toBe(true);
      expect(mockCrypto.subtle.importKey).toHaveBeenCalled();
      expect(mockCrypto.subtle.verify).toHaveBeenCalled();
    });

    test('should handle verification failure with mocked crypto', async () => {
      // Mock failed verification
      mockCrypto.subtle.importKey.mockResolvedValue('mock-key');
      mockCrypto.subtle.verify.mockResolvedValue(false);
      
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = { sub: '1234567890' };
      
      const headerBase64 = base64UrlEncode(JSON.stringify(header));
      const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
      const token = `${headerBase64}.${payloadBase64}.invalid-signature`;
      
      const isValid = await verifyToken(token, 'wrong-secret');
      expect(isValid).toBe(false);
    });

    test('should handle crypto API errors', async () => {
      // Mock crypto API throwing error
      mockCrypto.subtle.importKey.mockRejectedValue(new Error('Crypto error'));
      
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = { sub: '1234567890' };
      
      const headerBase64 = base64UrlEncode(JSON.stringify(header));
      const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
      const token = `${headerBase64}.${payloadBase64}.signature`;
      
      const isValid = await verifyToken(token, 'secret');
      expect(isValid).toBe(false);
    });

    test('should reject none algorithm', async () => {
      const header = { alg: 'none', typ: 'JWT' };
      const payload = { sub: '1234567890' };
      
      const headerBase64 = base64UrlEncode(JSON.stringify(header));
      const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
      const token = `${headerBase64}.${payloadBase64}.`;
      
      const isValid = await verifyToken(token, 'secret');
      expect(isValid).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle very long tokens', async () => {
      const largeData = 'x'.repeat(10000);
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = { sub: '1234567890', data: largeData };
      
      const headerBase64 = base64UrlEncode(JSON.stringify(header));
      const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
      const token = `${headerBase64}.${payloadBase64}.signature`;
      
      const decoded = await decodeSafely(token);
      expect(decoded.payload?.data).toBe(largeData);
    });

    test('should handle Unicode in JWT payload', async () => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = { 
        name: 'José María',
        description: '🔐 Security token',
        unicode: '测试 テスト 테스트'
      };
      
      const headerBase64 = base64UrlEncode(JSON.stringify(header));
      const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
      const token = `${headerBase64}.${payloadBase64}.signature`;
      
      const decoded = await decodeSafely(token);
      expect(decoded.payload).toEqual(payload);
    });

    test('should handle nested objects in payload', async () => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = {
        user: {
          id: 123,
          profile: {
            name: 'John Doe',
            permissions: ['read', 'write'],
            metadata: {
              created: '2023-01-01T00:00:00Z',
              tags: ['admin', 'user']
            }
          }
        }
      };
      
      const headerBase64 = base64UrlEncode(JSON.stringify(header));
      const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
      const token = `${headerBase64}.${payloadBase64}.signature`;
      
      const decoded = await decodeSafely(token);
      expect(decoded.payload).toEqual(payload);
    });

    test('should handle malformed base64 in JWT parts', async () => {
      const malformedHeader = 'invalid-base64!@#$';
      const validPayload = base64UrlEncode('{"sub":"123"}');
      const token = `${malformedHeader}.${validPayload}.signature`;
      
      const decoded = await decodeSafely(token);
      expect(decoded.header).toBeNull();
      expect(decoded.error).toContain('Invalid JWT header');
    });

    test('should handle extremely small tokens', async () => {
      const decoded = await decodeSafely('a.b.c');
      expect(decoded.isValid).toBe(false);
      expect(decoded.error).toContain('Invalid JWT header');
    });

    test('should handle tokens with special characters in signature', async () => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = { sub: '1234567890' };
      
      const headerBase64 = base64UrlEncode(JSON.stringify(header));
      const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
      const specialSig = 'signature-with-special_chars-123';
      const token = `${headerBase64}.${payloadBase64}.${specialSig}`;
      
      const decoded = await decodeSafely(token);
      expect(decoded.signature).toBe(specialSig);
    });
  });
});
