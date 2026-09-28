/**
 * © 2026 MyDebugger Contributors – MIT License
 */
const mockDecompressFrames = jest.fn();
const mockLoadUpng = jest.fn();
const mockLoadWebp = jest.fn();
jest.mock('../src/tools/image-compressor/lib/codecs', () => ({
  loadGifuct: () =>
    Promise.resolve({
      parseGIF: () => ({ lsd: { width: 1000, height: 1000 }, frames: new Array(101) }),
      decompressFrames: mockDecompressFrames,
    }),
  loadUpng: () => mockLoadUpng(),
  loadWebp: () => mockLoadWebp(),
}));

// eslint-disable-next-line import/first
import {
  assertWithinLimits, decode, decodeApngOrPng, decodeGif, isAnimatedWebp, pngHeader, sniff, TooBigError, webpSize,
} from '../src/tools/image-compressor/lib/decode';

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
    expect(() => assertWithinLimits(1000, 1000, 100)).not.toThrow();
    expect(() => assertWithinLimits(1000, 1000, 101)).toThrow('limit 100 MP across all frames');
  });
});

describe('decodeGif', () => {
  it('checks size limits from header metadata before decompressing any frame', async () => {
    await expect(decodeGif(new Uint8Array(4))).rejects.toThrow(TooBigError);
    expect(mockDecompressFrames).not.toHaveBeenCalled();
  });
});

const u32be = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const chunk = (type: string, data: number[]) => [...u32be(data.length), ...Array.from(type, (c) => c.charCodeAt(0)), ...data, 0, 0, 0, 0];
const png = (w: number, h: number, extra: number[] = []) => Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10,
  ...chunk('IHDR', [...u32be(w), ...u32be(h), 8, 6, 0, 0, 0]),
  ...extra,
  ...chunk('IDAT', [0]),
  ...chunk('IEND', []),
]);

describe('pngHeader', () => {
  it('reads IHDR size and the APNG frame count', () => {
    expect(pngHeader(png(640, 480))).toEqual({ width: 640, height: 480, frames: 1 });
    expect(pngHeader(png(300, 200, chunk('acTL', [...u32be(12), ...u32be(0)])))).toEqual({ width: 300, height: 200, frames: 12 });
  });
  it('ignores an acTL after the first IDAT', () => {
    const p = png(10, 10);
    const late = Uint8Array.from([...p.subarray(0, p.length - 12), ...chunk('acTL', [...u32be(9), ...u32be(0)]), ...p.subarray(p.length - 12)]);
    expect(pngHeader(late).frames).toBe(1);
  });
});

describe('webpSize', () => {
  const riff = (fourcc: string, data: number[]) => bytes('RIFF', [0, 0, 0, 0], 'WEBP', fourcc, [data.length, 0, 0, 0], data);
  it('reads VP8, VP8L and VP8X dimensions', () => {
    // VP8: frame tag (3), start code 9d 01 2a, then 14-bit LE width/height (top 2 bits = scale).
    expect(webpSize(riff('VP8 ', [0, 0, 0, 0x9d, 0x01, 0x2a, 0x80, 0xc2, 0xe0, 0x41]))).toEqual({ width: 640, height: 480 });
    // VP8L: 0x2f, then (w-1) in bits 0-13, (h-1) in bits 14-27. 640x480 -> 639 | 479 << 14.
    const v = 639 | (479 << 14);
    expect(webpSize(riff('VP8L', [0x2f, v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255]))).toEqual({ width: 640, height: 480 });
    // VP8X: flags (4), then 24-bit LE (w-1), (h-1).
    expect(webpSize(riff('VP8X', [0, 0, 0, 0, 0x0f, 0x27, 0x00, 0x9f, 0x0f, 0x00]))).toEqual({ width: 10000, height: 4000 });
    expect(webpSize(riff('ABCD', [0]))).toBeNull();
  });
});

describe('header guards', () => {
  it('refuses an oversized PNG before UPNG inflates it', async () => {
    await expect(decodeApngOrPng(png(10000, 10000))).rejects.toThrow(TooBigError);
    expect(mockLoadUpng).not.toHaveBeenCalled();
  });
  it('refuses an oversized static WebP before decoding it', async () => {
    const big = bytes('RIFF', [0, 0, 0, 0], 'WEBP', 'VP8X', [10, 0, 0, 0], [0, 0, 0, 0, 0x0f, 0x27, 0x00, 0x0f, 0x27, 0x00]);
    await expect(decode(big)).rejects.toThrow(TooBigError);
    expect(mockLoadWebp).not.toHaveBeenCalled();
  });
});
