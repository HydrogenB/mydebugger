/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { assertWithinLimits, isAnimatedWebp, sniff, TooBigError } from '../src/tools/image-compressor/lib/decode';

const bytes = (...parts: (string | number[])[]) =>
  Uint8Array.from(parts.flatMap((p) => (typeof p === 'string' ? Array.from(p, (c) => c.charCodeAt(0)) : p)));

describe('sniff', () => {
  it('recognises each supported format by magic bytes', () => {
    expect(sniff(bytes([0x89], 'PNG', [13, 10, 26, 10]))).toBe('png');
    expect(sniff(bytes([0xff, 0xd8, 0xff]))).toBe('jpg');
    expect(sniff(bytes('GIF89a'))).toBe('gif');
    expect(sniff(bytes('RIFF', [0, 0, 0, 0], 'WEBP'))).toBe('webp');
    expect(sniff(bytes('BM', [0, 0]))).toBe('bmp');
    expect(sniff(bytes([0, 0, 0, 0x18], 'ftypheic'))).toBe('unknown');
  });
});

describe('isAnimatedWebp', () => {
  it('reads the VP8X animation flag', () => {
    const vp8x = (flags: number) => bytes('RIFF', [0, 0, 0, 0], 'WEBP', 'VP8X', [10, 0, 0, 0, flags]);
    expect(isAnimatedWebp(vp8x(0x02))).toBe(true);
    expect(isAnimatedWebp(vp8x(0x10))).toBe(false);
    expect(isAnimatedWebp(bytes('RIFF', [0, 0, 0, 0], 'WEBP', 'VP8L'))).toBe(false);
  });
});

describe('assertWithinLimits', () => {
  it('allows normal images and refuses huge ones', () => {
    expect(() => assertWithinLimits(4000, 3000, 1)).not.toThrow();
    expect(() => assertWithinLimits(8000, 6000, 1)).toThrow(TooBigError);
    expect(() => assertWithinLimits(1000, 1000, 401)).toThrow(TooBigError);
  });
});
