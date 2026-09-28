/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { encodeBmp, exactPalette } from '../src/tools/image-compressor/lib/bmp';
import type { Pixels } from '../src/tools/image-compressor/lib/types';

const stripes = (w: number, h: number, colours: number): Pixels => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let k = 0; k < w * h; k += 1) {
    const c = Math.floor((k % w) / Math.ceil(w / colours));
    data.set([c * 10, c * 20, c * 30, 255], k * 4);
  }
  return { data, width: w, height: h };
};

const view = (b: Uint8Array) => new DataView(b.buffer, b.byteOffset, b.byteLength);

// Minimal RLE8/RLE4 decoder (encoded runs only — what our writer emits). Returns top-down indices.
const decodeRle = (b: Uint8Array, w: number, h: number, bits: 4 | 8): number[] => {
  const v = view(b);
  const rows: number[][] = [];
  let row: number[] = [];
  let o = v.getUint32(10, true);
  while (o < b.length) {
    const n = b[o];
    const val = b[o + 1];
    o += 2;
    if (n > 0) {
      for (let i = 0; i < n; i += 1) row.push(bits === 8 ? val : i % 2 === 0 ? val >> 4 : val & 15);
    } else if (val === 0 || val === 1) {
      rows.push(row);
      row = [];
      if (val === 1) break;
    } else {
      throw new Error(`unexpected escape ${val}`);
    }
  }
  expect(rows).toHaveLength(h);
  rows.forEach((r) => expect(r).toHaveLength(w));
  return rows.reverse().flat();
};

describe('exactPalette', () => {
  it('builds a palette and indices', () => {
    const pal = exactPalette(stripes(6, 2, 3), 256);
    expect(pal?.palette).toHaveLength(3);
    expect(Array.from(pal!.indices.slice(0, 6))).toEqual([0, 0, 1, 1, 2, 2]);
  });

  it('returns null past the limit', () => {
    expect(exactPalette(stripes(40, 1, 20), 16)).toBeNull();
  });
});

describe('encodeBmp', () => {
  it('writes a 24-bit BMP with padded rows', () => {
    const b = encodeBmp(stripes(3, 2, 3), 'rgb24');
    const v = view(b);
    expect(String.fromCharCode(b[0], b[1])).toBe('BM');
    expect(v.getUint32(2, true)).toBe(b.length);
    expect(v.getUint32(10, true)).toBe(54);
    expect(v.getInt32(18, true)).toBe(3);
    expect(v.getInt32(22, true)).toBe(2);
    expect(v.getUint16(28, true)).toBe(24);
    expect(b.length).toBe(54 + 12 * 2); // 3 px * 3 B = 9 -> padded to 12
    expect([b[54], b[55], b[56]]).toEqual([0, 0, 0]); // BGR of first pixel, bottom row
  });

  it('writes a 32-bit BMP with bitfields and alpha', () => {
    const p = stripes(2, 1, 2);
    p.data[3] = 7;
    const b = encodeBmp(p, 'rgba32');
    const v = view(b);
    expect(v.getUint32(14, true)).toBe(108);
    expect(v.getUint32(30, true)).toBe(3);
    expect(v.getUint32(54, true)).toBe(0x00ff0000);
    expect(v.getUint32(66, true)).toBe(0xff000000);
    expect(b[14 + 108 + 3]).toBe(7);
  });

  it('round-trips RLE8', () => {
    const p = stripes(10, 3, 4);
    const b = encodeBmp(p, 'rle8');
    expect(view(b).getUint32(30, true)).toBe(1);
    const pal = exactPalette(p, 256)!;
    expect(decodeRle(b, 10, 3, 8)).toEqual(Array.from(pal.indices));
  });

  it('round-trips RLE4', () => {
    const p = stripes(10, 3, 4);
    const b = encodeBmp(p, 'rle4');
    expect(view(b).getUint16(28, true)).toBe(4);
    expect(view(b).getUint32(30, true)).toBe(2);
    expect(decodeRle(b, 10, 3, 4)).toEqual(Array.from(exactPalette(p, 16)!.indices));
  });

  it('makes RLE smaller than raw for flat images', () => {
    const p = stripes(200, 50, 2);
    expect(encodeBmp(p, 'rle8').length).toBeLessThan(encodeBmp(p, 'pal8').length);
  });

  it('refuses palettes that are too large', () => {
    expect(() => encodeBmp(stripes(40, 1, 20), 'rle4')).toThrow('Too many colours for rle4');
  });
});
