import { followRedirectChainRemote, followRedirectChain, fetchOpenGraph } from '../src/tools/deep-link-chain/lib/deepLinkChain';

describe('Deep Link Chain network paths (mocked)', () => {
  const originalFetch = global.fetch as any;
  afterEach(() => { global.fetch = originalFetch; });

  test('followRedirectChainRemote handles error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as any;
    const hops = await followRedirectChainRemote('https://x');
    expect(hops[0].error).toBe('network');
  });

  test('followRedirectChain single hop', async () => {
    const headers = new Map<string, string>();
    global.fetch = jest.fn().mockResolvedValue({ status: 200, headers: { get: (n: string) => null, forEach: (cb: any) => {} } }) as any;
    const hops = await followRedirectChain('https://x');
    expect(hops[0].status).toBe(200);
  });

  test('fetchOpenGraph parses title', async () => {
    global.fetch = jest.fn().mockResolvedValue({ text: async () => '<html><head><title>Hi</title></head></html>' }) as any;
    const og = await fetchOpenGraph('https://x');
    expect(og?.title).toBe('Hi');
  });
});


