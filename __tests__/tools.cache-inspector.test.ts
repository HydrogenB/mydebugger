import { parseCacheControl, formatCacheControl, exportCacheResultsCsv } from '../src/tools/cache-inspector/lib/cacheInspector';

describe('Cache Inspector utils', () => {
  test('parseCacheControl handles max-age/no-cache/no-store', () => {
    expect(parseCacheControl(null)).toEqual({});
    expect(parseCacheControl('max-age=3600')).toEqual({ maxAge: 3600 });
    expect(parseCacheControl('no-cache')).toEqual({ noCache: true });
    expect(parseCacheControl('no-store')).toEqual({ noStore: true });
  });

  test('formatCacheControl renders human readable', () => {
    expect(formatCacheControl(null)).toBeNull();
    expect(formatCacheControl('max-age=65')).toContain('1m');
    expect(formatCacheControl('no-store')).toBe('no-store');
  });

  test('exportCacheResultsCsv emits header and rows', () => {
    const csv = exportCacheResultsCsv([
      {
        url: 'https://a/b.js', resourceType: 'script', cacheControl: 'max-age=0', cacheControlLabel: 'max-age=0 → 0s',
        etag: null, expires: null, serviceWorkerCaches: [], fromMemoryCache: false, origin: 'network', status: 'STALE', issues: []
      } as any,
    ]);
    expect(csv.split('\n')[0]).toContain('url');
    expect(csv).toContain('https://a/b.js');
  });
});


