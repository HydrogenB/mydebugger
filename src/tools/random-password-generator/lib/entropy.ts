/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Entropy pool that absorbs pointer events (mouse move, touch move) and
 * exposes bytes used to XOR-augment crypto.getRandomValues output. The
 * pool is seeded with CSPRNG data, so zero user input still yields a
 * cryptographically secure stream; user input only diffuses additional
 * entropy and provides a visible proof of mixing.
 */

export const ENTROPY_POOL_SIZE = 64;
export const ENTROPY_PROGRESS_TARGET = 256;

export class EntropyPool {
  private readonly pool: Uint8Array;

  private position: number;

  private eventCount: number;

  constructor() {
    this.pool = new Uint8Array(ENTROPY_POOL_SIZE);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(this.pool);
    }
    this.position = 0;
    this.eventCount = 0;
  }

  /**
   * Absorb a sequence of small integers (pointer coordinates, timestamps,
   * pressure) into the pool. Each byte is XORed into a rotating slot and
   * rotated left by one bit to diffuse.
   */
  absorb(values: readonly number[]): void {
    if (values.length === 0) return;
    for (const raw of values) {
      const byte = raw & 0xff;
      const idx = this.position % this.pool.length;
      const current = this.pool[idx];
      const mixed = (current ^ byte) & 0xff;
      this.pool[idx] = ((mixed << 1) | (mixed >> 7)) & 0xff;
      this.position += 1;
    }
    this.eventCount += 1;
  }

  /**
   * Return a detached copy of the pool for use in a generator.
   */
  snapshot(): Uint8Array {
    return this.pool.slice();
  }

  get events(): number {
    return this.eventCount;
  }

  get progress(): number {
    return Math.min(1, this.eventCount / ENTROPY_PROGRESS_TARGET);
  }

  reset(): void {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(this.pool);
    } else {
      for (let i = 0; i < this.pool.length; i += 1) this.pool[i] = 0;
    }
    this.position = 0;
    this.eventCount = 0;
  }
}

/**
 * Build the list of small integers we want to mix from a pointer event.
 */
export const pointerEntropyValues = (
  x: number,
  y: number,
  t: number,
  pressure = 0,
): number[] => [
  x & 0xff,
  (x >> 8) & 0xff,
  y & 0xff,
  (y >> 8) & 0xff,
  t & 0xff,
  (t >> 8) & 0xff,
  (t >> 16) & 0xff,
  (t >> 24) & 0xff,
  Math.round(pressure * 255) & 0xff,
];
