import { reduceColorDepth } from '../src/tools/image-compressor/lib/imageCompressor';

test('reduceColorDepth quantizes pixel data', () => {
  const data = new Uint8ClampedArray([10, 20, 30, 255, 250, 240, 230, 255]);
  reduceColorDepth(data, 4); // 4 bits -> 16 levels
  expect(Array.from(data)).toEqual([0, 16, 16, 255, 240, 240, 224, 255]);
});
