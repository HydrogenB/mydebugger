/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { Frame, Pixels } from './types';

const C1 = (0.01 * 255) ** 2;
const C2 = (0.03 * 255) ** 2;
const WINDOW = 8;

/** Rec.601 luma of the image composited over white. */
export const lumaOverWhite = ({ data, width, height }: Pixels): Float32Array => {
  const out = new Float32Array(width * height);
  for (let k = 0; k < out.length; k += 1) {
    const i = k * 4;
    const a = data[i + 3] / 255;
    const bg = 255 * (1 - a);
    out[k] = 0.299 * (data[i] * a + bg) + 0.587 * (data[i + 1] * a + bg) + 0.114 * (data[i + 2] * a + bg);
  }
  return out;
};

export const alphaPlane = ({ data, width, height }: Pixels): Float32Array => {
  const out = new Float32Array(width * height);
  for (let k = 0; k < out.length; k += 1) out[k] = data[k * 4 + 3];
  return out;
};

// ponytail: non-overlapping 8x8 windows, no Gaussian weighting; switch to sliding windows if scores prove too coarse.
export const ssimPlane = (a: Float32Array, b: Float32Array, width: number, height: number): number => {
  let total = 0;
  let windows = 0;
  for (let y0 = 0; y0 < height; y0 += WINDOW) {
    for (let x0 = 0; x0 < width; x0 += WINDOW) {
      const y1 = Math.min(y0 + WINDOW, height);
      const x1 = Math.min(x0 + WINDOW, width);
      let sa = 0;
      let sb = 0;
      let saa = 0;
      let sbb = 0;
      let sab = 0;
      let n = 0;
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          const va = a[y * width + x];
          const vb = b[y * width + x];
          sa += va;
          sb += vb;
          saa += va * va;
          sbb += vb * vb;
          sab += va * vb;
          n += 1;
        }
      }
      const ma = sa / n;
      const mb = sb / n;
      const varA = saa / n - ma * ma;
      const varB = sbb / n - mb * mb;
      const cov = sab / n - ma * mb;
      total += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (varA + varB + C2));
      windows += 1;
    }
  }
  return total / windows;
};

export interface Similarity {
  luma: number;
  alpha: number;
}

/** Minimum luma / alpha SSIM across frames; 0 when the shapes don't match. */
export const compareFrames = (ref: Frame[], out: Frame[]): Similarity => {
  if (ref.length === 0 || ref.length !== out.length) return { luma: 0, alpha: 0 };
  let luma = 1;
  let alpha = 1;
  for (let k = 0; k < ref.length; k += 1) {
    const r = ref[k].data;
    const o = out[k].data;
    if (r.width !== o.width || r.height !== o.height) return { luma: 0, alpha: 0 };
    luma = Math.min(luma, ssimPlane(lumaOverWhite(r), lumaOverWhite(o), r.width, r.height));
    alpha = Math.min(alpha, ssimPlane(alphaPlane(r), alphaPlane(o), r.width, r.height));
  }
  return { luma, alpha };
};
