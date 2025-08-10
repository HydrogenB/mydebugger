import { parseUtmParams } from '../src/tools/deep-link-chain/lib/deepLinkChain';

describe('Deep Link Chain utils', () => {
  test('parseUtmParams extracts known params', () => {
    const params = parseUtmParams('https://a?utm_source=x&utm_medium=y&utm_campaign=z&foo=bar');
    expect(params.utm_source).toBe('x');
    expect(params.foo).toBeUndefined();
  });
});


