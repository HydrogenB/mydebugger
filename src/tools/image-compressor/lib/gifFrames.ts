/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { Frame } from './types';

export interface GifPatch {
  dims: { top: number; left: number; width: number; height: number };
  delay: number;
  disposalType: number;
  patch: Uint8ClampedArray;
}

/** Turn gifuct-js patches into full RGBA frames, honouring disposal methods 1–3. */
export const compositeGifFrames = (patches: GifPatch[], width: number, height: number): Frame[] => {
  const canvas = new Uint8ClampedArray(width * height * 4);
  return patches.map((f) => {
    const { left, top, width: pw, height: ph } = f.dims;
    const before = f.disposalType === 3 ? canvas.slice() : null;
    for (let y = 0; y < ph; y += 1) {
      const cy = top + y;
      if (cy < 0 || cy >= height) continue;
      for (let x = 0; x < pw; x += 1) {
        const cx = left + x;
        if (cx < 0 || cx >= width) continue;
        const s = (y * pw + x) * 4;
        if (f.patch[s + 3] === 0) continue;
        canvas.set(f.patch.subarray(s, s + 4), (cy * width + cx) * 4);
      }
    }
    const frame: Frame = { data: { data: canvas.slice(), width, height }, delayMs: f.delay };
    if (f.disposalType === 2) {
      for (let y = Math.max(0, top); y < Math.min(height, top + ph); y += 1) {
        canvas.fill(0, (y * width + Math.max(0, left)) * 4, (y * width + Math.min(width, left + pw)) * 4);
      }
    } else if (before) {
      canvas.set(before);
    }
    return frame;
  });
};
