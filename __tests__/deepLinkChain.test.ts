import { followRedirectChain, followRedirectChainRemote, parseUtmParams, fetchOpenGraph } from '../model/deepLinkChain';

describe('parseUtmParams', () => {
  it('extracts utm parameters', () => {
    const url = 'https://ex.com/?utm_source=google&utm_medium=cpc&foo=bar';
    expect(parseUtmParams(url)).toEqual({ utm_source: 'google', utm_medium: 'cpc' });
  });

  it('returns empty object for invalid url', () => {
    expect(parseUtmParams('not a url')).toEqual({});
  });
});

describe('followRedirectChain', () => {
  it('follows redirects', async () => {
    (global.fetch as any) = jest.fn()
      .mockResolvedValueOnce({
        status: 301,
        headers: new Headers({ location: 'https://b.com' })
      })
      .mockResolvedValueOnce({ status: 200, headers: new Headers() });

    const hops = await followRedirectChain('https://a.com');
    expect(hops).toHaveLength(2);
    expect(hops[0].status).toBe(301);
    expect(hops[1].status).toBe(200);
  });

  it('detects redirect loops', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({
      status: 301,
      headers: new Headers({ location: 'https://a.com' }),
    });
    const hops = await followRedirectChain('https://a.com');
    expect(hops[hops.length - 1].error).toContain('loop');
  });

  it('uses fallback when fetch fails', async () => {
    (global.fetch as any) = jest
      .fn()
      .mockRejectedValueOnce(new Error('blocked'))
      .mockResolvedValueOnce({ url: 'https://final.com' });

    const hops = await followRedirectChain('https://a.com');
    expect((global.fetch as any)).toHaveBeenCalledTimes(2);
    expect(hops[hops.length - 1].url).toBe('https://final.com');
  });

  it('handles unreachable fallback', async () => {
    (global.fetch as any) = jest.fn().mockRejectedValue(new Error('x'));
    const hops = await followRedirectChain('https://a.com');
    expect(hops).toHaveLength(1);
    expect(hops[0].error).toBe('x');
  });

  it('stops at max redirects', async () => {
    const mocks = [] as any[];
    for (let i = 0; i < 25; i += 1) {
      mocks.push({
        status: 301,
        headers: new Headers({ location: `https://b${i}.com` }),
      });
    }
    (global.fetch as any) = jest.fn().mockImplementation(() => mocks.shift());

    const hops = await followRedirectChain('https://start.com');
    expect(hops[hops.length - 1].error).toContain('Maximum');
  });

  it('fetches open graph data', async () => {
    const html = `<html><head><title>t</title><meta property="og:image" content="img.png"/></head></html>`;
    (global.fetch as any) = jest.fn().mockResolvedValue({ text: () => Promise.resolve(html) });
    const og = await fetchOpenGraph('https://a.com');
    expect(og?.image).toBe('img.png');
    expect(og?.title).toBe('t');
  });

  it('returns null on open graph error', async () => {
    (global.fetch as any) = jest.fn().mockRejectedValue(new Error('x'));
    const og = await fetchOpenGraph('https://a.com');
    expect(og).toBeNull();
  });

  it('requests redirect chain from API', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ hops: [{ url: 'https://a.com', status: 200 }] }),
    });
    const hops = await followRedirectChainRemote('https://a.com');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/deep-link-chain',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(hops[0].status).toBe(200);
  });
});

