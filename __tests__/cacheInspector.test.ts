import {
  analyzeCacheFor,
  parseCacheControl,
  formatCacheControl,
  exportCacheResults,
} from '../model/cacheInspector';

describe('analyzeCacheFor', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        headers: new Headers({ 'cache-control': 'max-age=0', etag: 'abc' }),
      })
    ) as any;

    (global as any).caches = {
      keys: () => Promise.resolve([]),
      open: () => Promise.resolve({ match: () => Promise.resolve(undefined) }),
    };

    Object.defineProperty(global.performance, 'getEntriesByType', {
      value: () => [
        { name: 'https://example.com/app.js', initiatorType: 'script', transferSize: 0, decodedBodySize: 123 } as any,
      ],
      configurable: true,
    });
  });

  it('marks resources as stale when max-age=0', async () => {
    const res = await analyzeCacheFor(['https://example.com/app.js']);
    expect(res[0].status).toBe('STALE');
    expect(res[0].origin).toBe('memory');
  });

  it('guesses type from extension and service worker match', async () => {
    (global as any).caches = {
      keys: () => Promise.resolve(['v1']),
      open: () => Promise.resolve({
        match: (u: string) => Promise.resolve(u.endsWith('.css') ? {} : undefined),
      }),
    };
    const res = await analyzeCacheFor(['https://example.com/style.css']);
    expect(res[0].resourceType).toBe('style');
    expect(res[0].serviceWorkerCaches).toEqual(['v1']);
    expect(res[0].origin).toBe('service-worker');
  });

  it('parses cache-control headers', () => {
    expect(parseCacheControl('max-age=3600, no-cache')).toEqual({ maxAge: 3600, noCache: true });
  });

  it('formats cache-control nicely', () => {
    expect(formatCacheControl('max-age=60')).toBe('max-age=60 \u2794 1m');
  });

  it('exports grouped results', () => {
    const data = [
      {
        url: 'https://a.com/foo.js',
        resourceType: 'script',
        cacheControl: 'max-age=0',
        cacheControlLabel: 'max-age=0 \u2794 0s',
        etag: null,
        expires: null,
        serviceWorkerCaches: [],
        fromMemoryCache: false,
        origin: 'network',
        status: 'STALE',
      },
    ];
    const json = exportCacheResults(data);
    const obj = JSON.parse(json)[0];
    expect(obj.domain).toBe('a.com');
    expect(Array.isArray(obj.entries)).toBe(true);
  });
});
