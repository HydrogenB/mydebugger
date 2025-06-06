import { traceLink } from '@/model/linkTracer';

describe('traceLink', () => {
  it('follows redirect chain', async () => {
    const mockFetch = jest.fn()
      .mockResolvedValueOnce(new Response(null, { status: 301, headers: { location: 'https://example.com/step2' } }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    global.fetch = mockFetch as unknown as typeof fetch;

    const steps = await traceLink('https://example.com');

    expect(steps).toEqual([
      { url: 'https://example.com', status: 301 },
      { url: 'https://example.com/step2', status: 200 },
    ]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
