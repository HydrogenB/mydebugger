/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import {
  EntropyPool,
  ENTROPY_POOL_SIZE,
  ENTROPY_PROGRESS_TARGET,
  pointerEntropyValues,
} from '../src/tools/random-password-generator/lib/entropy';
import {
  generateKey,
  generatePassword,
  generateUUIDv4,
  estimateStrength,
  PasswordOptions,
} from '../src/tools/random-password-generator/lib/generators';
import { WORDLIST } from '../src/tools/random-password-generator/lib/wordlist';

describe('EntropyPool', () => {
  test('pool is seeded and reports the expected size', () => {
    const pool = new EntropyPool();
    expect(pool.snapshot()).toHaveLength(ENTROPY_POOL_SIZE);
  });

  test('absorb mutates the pool without growing it', () => {
    const pool = new EntropyPool();
    const before = pool.snapshot();
    for (let i = 0; i < 20; i += 1) {
      pool.absorb(pointerEntropyValues(i * 17, i * 31, Date.now() + i, 0.5));
    }
    const after = pool.snapshot();
    expect(after).toHaveLength(ENTROPY_POOL_SIZE);
    expect(Array.from(before)).not.toEqual(Array.from(after));
    expect(pool.events).toBe(20);
  });

  test('progress saturates at 100% and resets to zero', () => {
    const pool = new EntropyPool();
    for (let i = 0; i <= ENTROPY_PROGRESS_TARGET + 10; i += 1) {
      pool.absorb([i & 0xff]);
    }
    expect(pool.progress).toBe(1);
    pool.reset();
    expect(pool.progress).toBe(0);
    expect(pool.events).toBe(0);
  });

  test('snapshot returns a detached copy', () => {
    const pool = new EntropyPool();
    const a = pool.snapshot();
    a[0] = (a[0] + 1) & 0xff;
    const b = pool.snapshot();
    expect(a[0]).not.toBe(b[0]);
  });
});

describe('seeded generators', () => {
  const basePwOpts = {
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: false,
    excludeAmbiguous: false,
  } as const;

  test('generatePassword with entropy still produces the requested length', () => {
    const pool = new EntropyPool();
    for (let i = 0; i < 40; i += 1) pool.absorb([i, i * 2, i * 3]);
    const pwd = generatePassword(basePwOpts, pool.snapshot());
    expect(pwd).toHaveLength(16);
  });

  test('generatePassword without entropy behaves as before', () => {
    const pwd = generatePassword(basePwOpts);
    expect(pwd).toHaveLength(16);
  });

  test('generateUUIDv4 with entropy still yields a valid v4 UUID', () => {
    const pool = new EntropyPool();
    for (let i = 0; i < 16; i += 1) pool.absorb([i * 7]);
    const id = generateUUIDv4(pool.snapshot());
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test('generateKey with entropy stays in the requested encoding', () => {
    const pool = new EntropyPool();
    for (let i = 0; i < 8; i += 1) pool.absorb([i, 255 - i]);
    const hex = generateKey({ bits: 128, format: 'hex' }, pool.snapshot());
    expect(hex).toMatch(/^[0-9a-f]+$/);
    expect(hex).toHaveLength(32);
    const b64 = generateKey({ bits: 256, format: 'base64' }, pool.snapshot());
    expect(typeof b64).toBe('string');
    expect(b64.length).toBeGreaterThan(0);
  });

  test('empty entropy buffer is treated as no entropy', () => {
    const pwd = generatePassword(basePwOpts, new Uint8Array(0));
    expect(pwd).toHaveLength(16);
  });
});

describe('estimateStrength', () => {
  const reproOpts: PasswordOptions = {
    length: 32,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: true,
  };

  test('regression: length-32 all-classes password never under-reports as weak (200 samples)', () => {
    const iterations = 200;
    for (let i = 0; i < iterations; i += 1) {
      const pwd = generatePassword(reproOpts);
      const { entropy, label } = estimateStrength(reproOpts, pwd);
      expect(entropy).toBeGreaterThan(100);
      expect(['Strong', 'Very strong']).toContain(label);
    }
  });

  test('a password containing "-" and "." is never classified as a passphrase', () => {
    // Longer than 20 chars and full of the separators that used to trigger the
    // passphrase heuristic — but the caller declares PasswordOptions, so the
    // passphrase branch (small wordCount-based entropy) must never be taken.
    const dashDotPassword = 'a-b.c-d.e-f.g-h.i-j.k-l.m-n.o-p';
    expect(dashDotPassword.length).toBeGreaterThan(20);
    const { entropy } = estimateStrength(reproOpts, dashDotPassword);
    const poolSize = 26 + 26 + 10 + 27 - 15; // upper+lower+digits+symbols, minus ambiguous overlap
    expect(entropy).toBeCloseTo(Math.log2(poolSize) * dashDotPassword.length, 5);
  });

  test('entropy scales with length', () => {
    const short = estimateStrength(reproOpts, 'a'.repeat(8));
    const long = estimateStrength(reproOpts, 'a'.repeat(32));
    expect(long.entropy).toBeGreaterThan(short.entropy);
  });

  test('entropy scales with the number of enabled character classes', () => {
    const onlyLower: PasswordOptions = {
      length: 20,
      includeUppercase: false,
      includeLowercase: true,
      includeNumbers: false,
      includeSymbols: false,
      excludeAmbiguous: false,
    };
    const allClasses: PasswordOptions = { ...onlyLower, includeUppercase: true, includeNumbers: true, includeSymbols: true };
    const sample = 'a'.repeat(20);
    const fewer = estimateStrength(onlyLower, sample);
    const more = estimateStrength(allClasses, sample);
    expect(more.entropy).toBeGreaterThan(fewer.entropy);
  });

  test('excludeAmbiguous true yields a smaller pool and slightly lower entropy per character', () => {
    const withFilter: PasswordOptions = { ...reproOpts, excludeAmbiguous: true };
    const withoutFilter: PasswordOptions = { ...reproOpts, excludeAmbiguous: false };
    const sample = 'a'.repeat(32);
    const filtered = estimateStrength(withFilter, sample);
    const unfiltered = estimateStrength(withoutFilter, sample);
    expect(filtered.entropy).toBeLessThan(unfiltered.entropy);
  });

  test('options === null falls back to observed character classes without throwing', () => {
    expect(() => estimateStrength(null, 'aB3!aB3!aB3!')).not.toThrow();
    const { entropy, label } = estimateStrength(null, 'aB3!aB3!aB3!');
    expect(entropy).toBeGreaterThan(0);
    expect(label).toBeDefined();
  });

  test('passphrase entropy derives bits-per-word from WORDLIST.length, not a hardcoded value', () => {
    const passphraseOpts = { wordCount: 6, separator: '-', capitalize: false, includeNumber: false };
    const { entropy } = estimateStrength(passphraseOpts, 'six-random-words-joined-by-dashes');
    const expectedBitsPerWord = Math.log2(WORDLIST.length);
    expect(expectedBitsPerWord).not.toBeCloseTo(11, 1);
    expect(entropy).toBeCloseTo(6 * expectedBitsPerWord, 5);
  });
});
