/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { binaryAlpha } from '../src/tools/image-compressor/lib/pixels';

describe('binaryAlpha', () => {
  it('makes alpha < 128 fully transparent black and everything else opaque', () => {
    const src = { data: Uint8ClampedArray.from([10, 20, 30, 0, 40, 50, 60, 127, 70, 80, 90, 128, 1, 2, 3, 255]), width: 4, height: 1 };
    const out = binaryAlpha(src);
    expect(Array.from(out.data)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 70, 80, 90, 255, 1, 2, 3, 255]);
    expect(out).toMatchObject({ width: 4, height: 1 });
    expect(src.data[7]).toBe(127); // input untouched
  });
});
