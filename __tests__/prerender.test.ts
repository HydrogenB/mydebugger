import { parseMetadata, fetchSnapshot } from '../model/prerender';

describe('parseMetadata', () => {
  it('extracts title, meta description and h1', () => {
    const html = '<html><head><title>T</title><meta name="description" content="D"/></head><body><h1>H</h1></body></html>';
    expect(parseMetadata(html)).toEqual({ title: 'T', description: 'D', h1: 'H' });
  });

  it('handles missing tags', () => {
    expect(parseMetadata('<html></html>')).toEqual({ title: null, description: null, h1: null });
  });
});

describe('fetchSnapshot', () => {
  it('calls proxy and parses', async () => {
    (global.fetch as any) = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 200, html: '<title>x</title>' }) })
    );
    const snap = await fetchSnapshot('https://a.com', 'ua');
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/api/utility-tools?tool=proxy');
    expect(snap.title).toBe('x');
  });
});
