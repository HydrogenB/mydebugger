import { encodeUrlQueryParams } from '../src/tools/url/lib/url';

describe('URL helpers', () => {
  test('encodeUrlQueryParams encodes query safely', () => {
    const out = encodeUrlQueryParams('https://a/b?x=1 2&y=ä');
    expect(out).toContain('%20');
  });
});


