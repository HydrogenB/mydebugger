import { encodeUrlQueryParams } from '../src/tools/url/lib/url';

describe('URL helpers more cases', () => {
  test('preserves hash and duplicate keys', () => {
    const out = encodeUrlQueryParams('https://a/b?x=1&x=2#frag');
    expect(out).toContain('x=1');
    expect(out).toContain('x=2');
    expect(out.endsWith('#frag')).toBe(true);
  });

  test('handles schemeless URLs and invalid inputs', () => {
    expect(encodeUrlQueryParams('//a/b?x=ä')).toContain('%C3%A4');
    expect(encodeUrlQueryParams('not a url')).toBe('not a url');
  });
});


