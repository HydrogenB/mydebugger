import { reduceColorDepth, generateFlutterSnippet } from '../model/imageCompressor';

test('reduceColorDepth quantizes pixel data', () => {
  const data = new Uint8ClampedArray([10, 20, 30, 255, 250, 240, 230, 255]);
  reduceColorDepth(data, 4); // 4 bits -> 16 levels
  expect(Array.from(data)).toEqual([0, 16, 16, 255, 240, 240, 224, 255]);
});

test('generateFlutterSnippet outputs width and format', () => {
  const res = {
    blob: new Blob(),
    base64: 'data:image/jpeg;base64,abc',
    base64SizeKB: 1,
    mimeType: 'image/jpeg',
    qualityUsed: 0.8,
    info: { width: 100, height: 80, sizeKB: 10 },
  };
  const code = generateFlutterSnippet(res, { mimeType: 'image/jpeg' });
  expect(code).toContain('minWidth: 100');
  expect(code).toContain('CompressFormat.jpeg');
});
