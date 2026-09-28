/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { frameChunks, muxAnimatedWebP } from '../src/tools/image-compressor/lib/webpMux';

const ascii = (s: string) => Array.from(s, (c) => c.charCodeAt(0));
const le32 = (n: number) => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
const chunk = (id: string, payload: number[]) => [
  ...ascii(id), ...le32(payload.length), ...payload, ...(payload.length % 2 ? [0] : []),
];
const riff = (chunks: number[][]) => {
  const body = [...ascii('WEBP'), ...chunks.flat()];
  return Uint8Array.from([...ascii('RIFF'), ...le32(body.length), ...body]);
};
const u24 = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);
const fourcc = (b: Uint8Array, o: number) => String.fromCharCode(...b.subarray(o, o + 4));

const lossless = riff([chunk('VP8L', [1, 2, 3])]);
const withAlpha = riff([chunk('VP8X', new Array(10).fill(0)), chunk('ALPH', [9, 9]), chunk('VP8 ', [4, 5, 6, 7])]);

describe('frameChunks', () => {
  it('keeps image chunks and drops VP8X', () => {
    const out = frameChunks(withAlpha);
    expect(fourcc(out, 0)).toBe('ALPH');
    expect(fourcc(out, 10)).toBe('VP8 ');
    expect(out.length).toBe(10 + 12);
  });

  it('keeps odd-size padding', () => {
    expect(Array.from(frameChunks(lossless))).toEqual(chunk('VP8L', [1, 2, 3]));
  });

  it('rejects non-WebP input', () => {
    expect(() => frameChunks(new Uint8Array(16))).toThrow('Not a WebP file');
  });
});

describe('muxAnimatedWebP', () => {
  const out = muxAnimatedWebP(
    [{ webp: lossless, delayMs: 120 }, { webp: withAlpha, delayMs: 80 }],
    300,
    200,
    true,
  );

  it('writes a valid RIFF header', () => {
    expect(fourcc(out, 0)).toBe('RIFF');
    expect(new DataView(out.buffer).getUint32(4, true)).toBe(out.length - 8);
    expect(fourcc(out, 8)).toBe('WEBP');
  });

  it('writes VP8X with animation + alpha flags and canvas size', () => {
    expect(fourcc(out, 12)).toBe('VP8X');
    expect(out[20]).toBe(0x12);
    expect(u24(out, 24) + 1).toBe(300);
    expect(u24(out, 27) + 1).toBe(200);
  });

  it('writes ANIM then one ANMF per frame with durations', () => {
    expect(fourcc(out, 30)).toBe('ANIM');
    let o = 30 + 8 + 6;
    const durations: number[] = [];
    while (o < out.length) {
      expect(fourcc(out, o)).toBe('ANMF');
      const size = new DataView(out.buffer).getUint32(o + 4, true);
      const p = o + 8;
      expect(u24(out, p + 6) + 1).toBe(300);
      expect(u24(out, p + 9) + 1).toBe(200);
      durations.push(u24(out, p + 12));
      expect(out[p + 15]).toBe(0x02);
      o += 8 + size + (size % 2);
    }
    expect(durations).toEqual([120, 80]);
  });
});
