import { traceLink } from '@/model/linkTracer';

describe('traceLink', () => {
  it('follows redirect chain', async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        status: 301,
        headers: new Headers({ location: 'https://example.com/step2' }),
      } as Response)
      .mockResolvedValueOnce({ status: 200, headers: new Headers() } as Response);
    global.fetch = mockFetch as unknown as typeof fetch;

    const steps = await traceLink('https://example.com');

    expect(steps).toEqual([
      { url: 'https://example.com', status: 301 },
      { url: 'https://example.com/step2', status: 200 },
    ]);
  });

  it('throws on invalid url', async () => {
    await expect(traceLink('not a url')).rejects.toThrow('Invalid URL');
  });

  it('detects redirect loop', async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValue({
        status: 301,
        headers: new Headers({ location: 'https://example.com' }),
      } as Response);
    global.fetch = mockFetch as unknown as typeof fetch;

    const steps = await traceLink('https://example.com', 3);
    expect(steps[steps.length - 1].error).toBe('Redirect loop detected');
  });

  it('records fetch error', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('network fail'));
    global.fetch = mockFetch as unknown as typeof fetch;

    const steps = await traceLink('https://example.com');
    expect(steps[0].error).toBe('network fail');
  });
});
