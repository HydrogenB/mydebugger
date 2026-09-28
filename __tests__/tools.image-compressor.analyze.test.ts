/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import {
  analyze,
  classify,
  countColors,
  flatRatio,
} from '../src/tools/image-compressor/lib/analyze';
import {
  flattenOnWhite,
  hasAlpha,
  paletteToRgba,
} from '../src/tools/image-compressor/lib/pixels';
import type { DecodedImage, Pixels } from '../src/tools/image-compressor/lib/types';

type Rgba = [number, number, number, number];

const makePixels = (w: number, h: number, fn: (x: number, y: number) => Rgba): Pixels => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      data.set(fn(x, y), (y * w + x) * 4);
    }
  }
  return { data, width: w, height: h };
};

// Deterministic pseudo-random noise, every pixel (almost surely) unique.
const noise = (w: number, h: number): Pixels => {
  let s = 1;
  const rnd = () => {
    s = (s * 48271) % 2147483647; // Park–Miller: stays below 2^53, so no float precision loss
    return s % 256;
  };
  return makePixels(w, h, () => [rnd(), rnd(), rnd(), 255]);
};

const img = (p: Pixels, frames = 1): DecodedImage => ({
  frames: Array.from({ length: frames }, () => ({ data: p, delayMs: 100 })),
  width: p.width,
  height: p.height,
  source: 'png',
  warnings: [],
});

describe('pixels', () => {
  it('detects alpha', () => {
    expect(hasAlpha(makePixels(2, 2, () => [0, 0, 0, 255]))).toBe(false);
    expect(hasAlpha(makePixels(2, 2, (x) => [0, 0, 0, x ? 255 : 10]))).toBe(true);
  });

  it('flattens transparent pixels onto white', () => {
    const out = flattenOnWhite(makePixels(1, 1, () => [0, 0, 0, 0]));
    expect(Array.from(out.data)).toEqual([255, 255, 255, 255]);
    const half = flattenOnWhite(makePixels(1, 1, () => [0, 0, 0, 128]));
    expect(half.data[0]).toBe(127);
    expect(half.data[3]).toBe(255);
  });

  it('expands palette indices to RGBA', () => {
    const out = paletteToRgba(new Uint8Array([1, 0]), [[1, 2, 3, 4], [5, 6, 7, 8]], 2, 1);
    expect(Array.from(out.data)).toEqual([5, 6, 7, 8, 1, 2, 3, 4]);
  });
});

describe('analyze', () => {
  it('counts exact colours', () => {
    expect(countColors(makePixels(9, 9, (x) => [x % 3, 0, 0, 255]))).toBe(3);
  });

  it('caps the colour count', () => {
    expect(countColors(noise(100, 100))).toBe(4097);
  });

  it('measures the flat ratio', () => {
    expect(flatRatio(makePixels(4, 4, () => [1, 1, 1, 255]))).toBe(1);
    expect(flatRatio(noise(10, 10))).toBeLessThan(0.05);
  });

  it('classifies flat / ui / photo', () => {
    expect(classify(3, 0.1)).toBe('flat');
    expect(classify(5000, 0.6)).toBe('ui');
    expect(classify(5000, 0.2)).toBe('photo');
  });

  it('analyzes a screenshot-like image as ui', () => {
    const n = noise(100, 100);
    const shot = makePixels(200, 100, (x, y) => {
      if (x < 150) return [255, 255, 255, 255];
      const i = (y * 100 + (x - 100)) * 4;
      return [n.data[i], n.data[i + 1], n.data[i + 2], 255];
    });
    const a = analyze(img(shot));
    expect(a.cls).toBe('ui');
    expect(a.hasAlpha).toBe(false);
    expect(a.animated).toBe(false);
  });

  it('flags animation and photos', () => {
    const a = analyze(img(noise(64, 64), 3));
    expect(a.animated).toBe(true);
    expect(a.cls).toBe('photo');
  });
});
