import { generatePassword, estimateStrength, generateUUIDv4, generateKey } from '../src/tools/random-password-generator/lib/generators';

describe('Random Password Generator - generators', () => {
  test('generates password of exact length', () => {
    const pwd = generatePassword({
      length: 24,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: false,
    });
    expect(pwd).toHaveLength(24);
  });

  test('handles length less than selected sets', () => {
    const pwd = generatePassword({
      length: 2,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: true,
    });
    expect(pwd).toHaveLength(2);
  });

  test('entropy increases with length', () => {
    const opts = {
      length: 12,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeAmbiguous: false,
    } as const;
    const a = generatePassword(opts);
    const b = generatePassword({ ...opts, length: 24 });
    expect(estimateStrength({ ...opts, length: a.length }, a).entropy)
      .toBeLessThan(estimateStrength({ ...opts, length: b.length }, b).entropy);
  });

  test('uuid v4 format', () => {
    const id = generateUUIDv4();
    expect(id).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
  });

  test('key generation hex and base64', () => {
    const hex = generateKey({ bits: 128, format: 'hex' });
    expect(hex).toMatch(/^[0-9a-f]+$/i);
    const b64 = generateKey({ bits: 256, format: 'base64' });
    expect(typeof b64).toBe('string');
  });
});


