/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { Pixels } from './types';

export type BmpMode = 'rgb24' | 'rgba32' | 'pal8' | 'rle8' | 'rle4';

const FILE_HEADER = 14;
const INFO_HEADER = 40;
const V4_HEADER = 108;
const PPM = 2835; // 72 DPI

const stride = (bits: number, width: number) => Math.ceil((bits * width) / 32) * 4;

export const exactPalette = (
  { data, width, height }: Pixels,
  max: number,
): { palette: number[]; indices: Uint8Array } | null => {
  const map = new Map<number, number>();
  const palette: number[] = [];
  const indices = new Uint8Array(width * height);
  for (let k = 0; k < indices.length; k += 1) {
    const i = k * 4;
    const c = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    let idx = map.get(c);
    if (idx === undefined) {
      if (palette.length >= max) return null;
      idx = palette.length;
      map.set(c, idx);
      palette.push(c);
    }
    indices[k] = idx;
  }
  return { palette, indices };
};

interface Header {
  width: number;
  height: number;
  bits: number;
  compression: number;
  imageSize: number;
  colors: number;
  dibSize: number;
}

const writeHeaders = (v: DataView, fileSize: number, dataOffset: number, h: Header) => {
  v.setUint8(0, 0x42);
  v.setUint8(1, 0x4d);
  v.setUint32(2, fileSize, true);
  v.setUint32(10, dataOffset, true);
  v.setUint32(14, h.dibSize, true);
  v.setInt32(18, h.width, true);
  v.setInt32(22, h.height, true); // positive = bottom-up rows
  v.setUint16(26, 1, true);
  v.setUint16(28, h.bits, true);
  v.setUint32(30, h.compression, true);
  v.setUint32(34, h.imageSize, true);
  v.setInt32(38, PPM, true);
  v.setInt32(42, PPM, true);
  v.setUint32(46, h.colors, true);
  v.setUint32(50, 0, true);
};

const encodeTrueColor = ({ data, width, height }: Pixels, alpha: boolean): Uint8Array => {
  const bits = alpha ? 32 : 24;
  const dibSize = alpha ? V4_HEADER : INFO_HEADER;
  const rowBytes = stride(bits, width);
  const offset = FILE_HEADER + dibSize;
  const out = new Uint8Array(offset + rowBytes * height);
  const v = new DataView(out.buffer);
  writeHeaders(v, out.length, offset, {
    width, height, bits, compression: alpha ? 3 : 0, imageSize: rowBytes * height, colors: 0, dibSize,
  });
  if (alpha) {
    v.setUint32(54, 0x00ff0000, true);
    v.setUint32(58, 0x0000ff00, true);
    v.setUint32(62, 0x000000ff, true);
    v.setUint32(66, 0xff000000, true);
    v.setUint32(70, 0x73524742, true); // 'sRGB'
  }
  const px = bits / 8;
  for (let y = 0; y < height; y += 1) {
    const dst = offset + (height - 1 - y) * rowBytes;
    for (let x = 0; x < width; x += 1) {
      const s = (y * width + x) * 4;
      const d = dst + x * px;
      out[d] = data[s + 2];
      out[d + 1] = data[s + 1];
      out[d + 2] = data[s];
      if (alpha) out[d + 3] = data[s + 3];
    }
  }
  return out;
};

const packPal8 = (indices: Uint8Array, width: number, height: number): Uint8Array => {
  const rowBytes = stride(8, width);
  const out = new Uint8Array(rowBytes * height);
  for (let y = 0; y < height; y += 1) {
    out.set(indices.subarray(y * width, (y + 1) * width), (height - 1 - y) * rowBytes);
  }
  return out;
};

// ponytail: encoded runs only (no RLE "absolute mode"), so noisy rows are larger than raw; selection picks raw then.
const rle = (indices: Uint8Array, width: number, height: number, bits: 4 | 8): Uint8Array => {
  const out: number[] = [];
  for (let y = height - 1; y >= 0; y -= 1) {
    const row = indices.subarray(y * width, (y + 1) * width);
    let x = 0;
    while (x < width) {
      let run = 1;
      while (x + run < width && run < 255 && row[x + run] === row[x]) run += 1;
      out.push(run, bits === 8 ? row[x] : (row[x] << 4) | row[x]);
      x += run;
    }
    out.push(0, y === 0 ? 1 : 0); // end of line, or end of bitmap after the last row
  }
  return Uint8Array.from(out);
};

export const encodeBmp = (p: Pixels, mode: BmpMode): Uint8Array => {
  if (mode === 'rgb24' || mode === 'rgba32') return encodeTrueColor(p, mode === 'rgba32');
  const pal = exactPalette(p, mode === 'rle4' ? 16 : 256);
  if (!pal) throw new Error(`Too many colours for ${mode}`);
  const { width, height } = p;
  const bits = mode === 'rle4' ? 4 : 8;
  let pixels: Uint8Array;
  let compression: number;
  if (mode === 'pal8') {
    pixels = packPal8(pal.indices, width, height);
    compression = 0;
  } else {
    pixels = rle(pal.indices, width, height, bits);
    compression = mode === 'rle8' ? 1 : 2;
  }
  const offset = FILE_HEADER + INFO_HEADER + pal.palette.length * 4;
  const out = new Uint8Array(offset + pixels.length);
  writeHeaders(new DataView(out.buffer), out.length, offset, {
    width, height, bits, compression, imageSize: pixels.length, colors: pal.palette.length, dibSize: INFO_HEADER,
  });
  pal.palette.forEach((c, k) => {
    const o = FILE_HEADER + INFO_HEADER + k * 4;
    out[o] = c & 0xff;
    out[o + 1] = (c >> 8) & 0xff;
    out[o + 2] = (c >> 16) & 0xff;
  });
  out.set(pixels, offset);
  return out;
};
