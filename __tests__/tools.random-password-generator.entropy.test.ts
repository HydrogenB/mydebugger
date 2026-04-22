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
} from '../src/tools/random-password-generator/lib/generators';

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
