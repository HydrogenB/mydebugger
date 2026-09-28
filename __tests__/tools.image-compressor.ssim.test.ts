/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { compareFrames } from '../src/tools/image-compressor/lib/ssim';
import type { Frame, Pixels } from '../src/tools/image-compressor/lib/types';

const grad = (w: number, h: number, jitter = 0, alpha = 255): Pixels => {
  const data = new Uint8ClampedArray(w * h * 4);
  let s = 7;
  for (let k = 0; k < w * h; k += 1) {
    s = (s * 48271) % 2147483647; // Park–Miller: stays below 2^53, so no float precision loss
    const n = jitter ? ((s % (2 * jitter + 1)) - jitter) : 0;
    const v = ((k % w) * 255) / w + n;
    data.set([v, v, v, alpha], k * 4);
  }
  return { data, width: w, height: h };
};
const f = (p: Pixels): Frame[] => [{ data: p, delayMs: 0 }];

describe('compareFrames', () => {
  it('scores identical images 1', () => {
    const s = compareFrames(f(grad(32, 32)), f(grad(32, 32)));
    expect(s.luma).toBeCloseTo(1, 6);
    expect(s.alpha).toBeCloseTo(1, 6);
  });

  it('drops monotonically with more noise', () => {
    const ref = f(grad(64, 64));
    const a = compareFrames(ref, f(grad(64, 64, 4))).luma;
    const b = compareFrames(ref, f(grad(64, 64, 20))).luma;
    const c = compareFrames(ref, f(grad(64, 64, 60))).luma;
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
    expect(a).toBeLessThan(1);
  });

  it('ignores colour under fully transparent pixels', () => {
    const clear = (v: number): Pixels => {
      const p = grad(16, 16, 0, 0);
      p.data.forEach((_, i) => { if (i % 4 !== 3) p.data[i] = v; });
      return p;
    };
    expect(compareFrames(f(clear(0)), f(clear(200))).luma).toBeCloseTo(1, 6);
  });

  it('scores alpha changes on the alpha plane', () => {
    const ref = f(grad(16, 16, 0, 255));
    const s = compareFrames(ref, f(grad(16, 16, 0, 40)));
    expect(s.alpha).toBeLessThan(0.99);
  });

  it('fails mismatched frame counts or sizes', () => {
    expect(compareFrames(f(grad(8, 8)), []).luma).toBe(0);
    expect(compareFrames(f(grad(8, 8)), f(grad(9, 8))).luma).toBe(0);
  });

  it('uses the worst frame of an animation', () => {
    const ref = [...f(grad(32, 32)), ...f(grad(32, 32))];
    const out = [...f(grad(32, 32)), ...f(grad(32, 32, 60))];
    expect(compareFrames(ref, out).luma).toBeLessThan(0.9);
  });
});
