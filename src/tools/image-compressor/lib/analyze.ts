/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { hasAlpha } from './pixels';
import { COLOR_CAP, type Analysis, type DecodedImage, type ImageClass, type Pixels } from './types';

export const countColors = ({ data }: Pixels, cap = COLOR_CAP): number => {
  const seen = new Set<number>();
  for (let i = 0; i < data.length; i += 4) {
    // >>> 0 keeps the packed RGBA value unsigned.
    seen.add(((data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]) >>> 0);
    if (seen.size > cap) return cap + 1;
  }
  return seen.size;
};

/** Share of pixels identical to their right-hand neighbour (screenshots score high). */
export const flatRatio = ({ data, width, height }: Pixels): number => {
  if (width < 2) return 1;
  let same = 0;
  for (let y = 0; y < height; y += 1) {
    const row = y * width * 4;
    for (let x = 0; x < width - 1; x += 1) {
      const i = row + x * 4;
      if (
        data[i] === data[i + 4] &&
        data[i + 1] === data[i + 5] &&
        data[i + 2] === data[i + 6] &&
        data[i + 3] === data[i + 7]
      ) {
        same += 1;
      }
    }
  }
  return same / (height * (width - 1));
};

export const classify = (colorCount: number, flat: number): ImageClass => {
  if (colorCount <= 256) return 'flat';
  return flat >= 0.5 ? 'ui' : 'photo';
};

// ponytail: class comes from the first frame only; per-frame classification if animations misclassify.
export const analyze = (img: DecodedImage): Analysis => {
  const first = img.frames[0].data;
  const colorCount = countColors(first);
  const flat = flatRatio(first);
  return {
    hasAlpha: img.frames.some((f) => hasAlpha(f.data)),
    animated: img.frames.length > 1,
    colorCount,
    flatRatio: flat,
    cls: classify(colorCount, flat),
  };
};
