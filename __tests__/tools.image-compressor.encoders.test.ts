/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { OXIPNG_FAST_ABOVE_PIXELS, oxipngLevel } from '../src/tools/image-compressor/lib/encoders';

describe('oxipngLevel', () => {
  it('stays at level 4 at and under the threshold', () => {
    expect(oxipngLevel(OXIPNG_FAST_ABOVE_PIXELS)).toBe(4);
    expect(oxipngLevel(1_000)).toBe(4);
  });

  it('drops to level 2 above the threshold', () => {
    expect(oxipngLevel(OXIPNG_FAST_ABOVE_PIXELS + 1)).toBe(2);
    expect(oxipngLevel(40_000_000)).toBe(2);
  });
});
