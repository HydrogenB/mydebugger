/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { Pixels } from './types';

export const hasAlpha = ({ data }: Pixels): boolean => {
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
  return false;
};

/** Composite over white and make fully opaque (what a JPEG can represent). */
export const flattenOnWhite = ({ data, width, height }: Pixels): Pixels => {
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    out[i] = data[i] * a + 255 * (1 - a);
    out[i + 1] = data[i + 1] * a + 255 * (1 - a);
    out[i + 2] = data[i + 2] * a + 255 * (1 - a);
    out[i + 3] = 255;
  }
  return { data: out, width, height };
};

/** Expand palette indices (palette entries are [r, g, b, a]) into RGBA pixels. */
export const paletteToRgba = (
  indices: Uint8Array,
  palette: number[][],
  width: number,
  height: number,
): Pixels => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let k = 0; k < indices.length; k += 1) data.set(palette[indices[k]], k * 4);
  return { data, width, height };
};
