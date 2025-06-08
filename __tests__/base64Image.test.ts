import { formatBytes, extractImageFormat } from '../model/base64Image';

describe('formatBytes', () => {
  it('formats 1024 bytes to 1 KB', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });
});

describe('extractImageFormat', () => {
  it('returns PNG for valid data URL', () => {
    expect(extractImageFormat('data:image/png;base64,aaa')).toBe('PNG');
  });
  it('returns Unknown for invalid input', () => {
    expect(extractImageFormat('invalid')).toBe('Unknown');
  });
});
