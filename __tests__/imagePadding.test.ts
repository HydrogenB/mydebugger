import { expandImageWithJunk } from '../src/tools/ImagePaddingUtils';

test('expandImageWithJunk pads blob to requested size', () => {
  const data = new Uint8Array(10);
  const blob = new Blob([data], { type: 'image/png' });
  const padded = expandImageWithJunk(blob, 0.001); // ~1KB
  expect(padded.size).toBe(1048);
  expect(padded.type).toBe('image/png');
});
