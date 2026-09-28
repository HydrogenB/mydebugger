/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { compositeGifFrames, type GifPatch } from '../src/tools/image-compressor/lib/gifFrames';

const solid = (w: number, h: number, rgba: number[]) => {
  const p = new Uint8ClampedArray(w * h * 4);
  for (let k = 0; k < w * h; k += 1) p.set(rgba, k * 4);
  return p;
};
const patch = (left: number, top: number, w: number, h: number, rgba: number[], disposalType = 1): GifPatch => ({
  dims: { left, top, width: w, height: h }, delay: 100, disposalType, patch: solid(w, h, rgba),
});
const px = (f: { data: { data: Uint8ClampedArray; width: number } }, x: number, y: number) =>
  Array.from(f.data.data.subarray((y * f.data.width + x) * 4, (y * f.data.width + x) * 4 + 4));

const RED = [255, 0, 0, 255];
const BLUE = [0, 0, 255, 255];
const CLEAR = [0, 0, 0, 0];

describe('compositeGifFrames', () => {
  it('draws patches on top of the previous frame (disposal 1)', () => {
    const f = compositeGifFrames([patch(0, 0, 2, 2, RED), patch(1, 1, 1, 1, BLUE)], 2, 2);
    expect(f).toHaveLength(2);
    expect(px(f[1], 0, 0)).toEqual(RED);
    expect(px(f[1], 1, 1)).toEqual(BLUE);
    expect(f[1].delayMs).toBe(100);
  });

  it('clears the patch area after the frame (disposal 2)', () => {
    const f = compositeGifFrames([patch(0, 0, 2, 2, RED, 2), patch(1, 1, 1, 1, BLUE)], 2, 2);
    expect(px(f[0], 0, 0)).toEqual(RED);
    expect(px(f[1], 0, 0)).toEqual(CLEAR);
  });

  it('restores the previous canvas after the frame (disposal 3)', () => {
    const f = compositeGifFrames(
      [patch(0, 0, 2, 2, RED), patch(0, 0, 1, 1, BLUE, 3), patch(1, 1, 1, 1, BLUE)],
      2,
      2,
    );
    expect(px(f[1], 0, 0)).toEqual(BLUE);
    expect(px(f[2], 0, 0)).toEqual(RED);
  });

  it('does not overwrite with transparent patch pixels', () => {
    const f = compositeGifFrames([patch(0, 0, 2, 2, RED), patch(0, 0, 2, 2, CLEAR)], 2, 2);
    expect(px(f[1], 0, 0)).toEqual(RED);
  });

  it('clips patches that overflow the canvas', () => {
    const f = compositeGifFrames([patch(1, 1, 3, 3, RED)], 2, 2);
    expect(px(f[0], 1, 1)).toEqual(RED);
    expect(px(f[0], 0, 0)).toEqual(CLEAR);
  });
});
