/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export type ResourceType = 'script' | 'style' | 'image' | 'fetch';

export type CacheStatus = 'FRESH' | 'STALE' | 'EXPIRED' | 'NO-CACHE';
export type CacheOrigin = 'network' | 'memory' | 'service-worker';

export interface CacheResult {
  url: string;
  resourceType: ResourceType;
  cacheControl: string | null;
  cacheControlLabel: string | null;
  etag: string | null;
  expires: string | null;
  serviceWorkerCaches: string[];
  fromMemoryCache: boolean;
  origin: CacheOrigin;
  status: CacheStatus;
  /** Heuristics highlighting potential caching issues */
  issues: string[];
}

export interface ParsedCacheControl {
  maxAge?: number;
  noCache?: boolean;
  noStore?: boolean;
}

export const parseCacheControl = (header: string | null): ParsedCacheControl => {
  if (!header) return {};
  return header.split(',').reduce<ParsedCacheControl>((acc, part) => {
    const token = part.trim().toLowerCase();
    if (token === 'no-cache') acc.noCache = true;
    else if (token === 'no-store') acc.noStore = true;
    else if (token.startsWith('max-age=')) {
      const n = parseInt(token.split('=')[1], 10);
      if (!Number.isNaN(n)) acc.maxAge = n;
    }
    return acc;
  }, {});
};

export const formatCacheControl = (header: string | null): string | null => {
  if (!header) return null;
  const parsed = parseCacheControl(header);
  if (parsed.maxAge !== undefined) {
    const s = parsed.maxAge;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pieces = [] as string[];
    if (h) pieces.push(`${h}h`);
    if (m) pieces.push(`${m}m`);
    if (sec || pieces.length === 0) pieces.push(`${sec}s`);
    return `max-age=${s} \u2794 ${pieces.join(' ')}`;
  }
  if (parsed.noStore) return 'no-store';
  if (parsed.noCache) return 'no-cache';
  return header;
};

export const groupResultsByDomain = (
  results: CacheResult[],
): Record<string, CacheResult[]> =>
  results.reduce<Record<string, CacheResult[]>>((acc, item) => {
    const url = new URL(item.url);
    const domain = url.hostname;
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(item);
    return acc;
  }, {});

export const exportCacheResults = (results: CacheResult[]): string => {
  const grouped = groupResultsByDomain(results);
  const payload = Object.entries(grouped).map(([domain, entries]) => ({
    domain,
    timestamp: new Date().toISOString(),
    entries,
  }));
  return JSON.stringify(payload, null, 2);
};

export const exportCacheResultsCsv = (results: CacheResult[]): string => {
  const header = [
    'url',
    'type',
    'cacheControl',
    'etag',
    'expires',
    'origin',
    'status',
    'issues',
  ].join(',');
  const lines = results.map((r) =>
    [
      r.url,
      r.resourceType,
      r.cacheControl ?? '',
      r.etag ?? '',
      r.expires ?? '',
      r.origin,
      r.status,
      r.issues.join(';'),
    ]
      .map((v) => JSON.stringify(v))
      .join(',')
  );
  return [header, ...lines].join('\n');
};

const guessType = (url: string, initiator?: string): ResourceType => {
  const byInit =
    initiator &&
    ({
      script: 'script',
      css: 'style',
      img: 'image',
      xmlhttprequest: 'fetch',
      fetch: 'fetch',
    } as Record<string, ResourceType | undefined>)[initiator];
  if (byInit) return byInit;
  if (/\.css($|\?)/i.test(url)) return 'style';
  if (/\.(png|jpe?g|gif|svg|webp)($|\?)/i.test(url)) return 'image';
  if (/\.(js|mjs|ts)($|\?)/i.test(url)) return 'script';
  return 'fetch';
};

export const analyzeCacheFor = async (urls: string[]): Promise<CacheResult[]> => {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const cacheNames = await caches.keys();
  const cacheObjects = await Promise.all(cacheNames.map((n) => caches.open(n)));

  const findSwMatches = async (url: string) => {
    const matches = await Promise.all(
      cacheObjects.map(async (c, i) => {
        const m = await c.match(url);
        return m ? cacheNames[i] : null;
      })
    );
    return matches.filter(Boolean) as string[];
  };

  return Promise.all(
    urls.map(async (url) => {
      const entry = entries.find((e) => e.name === url);
      let cacheControl: string | null = null;
      let etag: string | null = null;
      let expires: string | null = null;
      try {
        const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
        cacheControl = res.headers.get('cache-control');
        etag = res.headers.get('etag');
        expires = res.headers.get('expires');
      } catch {
        // ignore failures (cross-origin etc.)
      }
      const swCaches = await findSwMatches(url);
      const fromMemoryCache =
        entry ? entry.transferSize === 0 && entry.decodedBodySize > 0 : false;
      let origin: CacheOrigin = 'network';
      if (swCaches.length > 0) origin = 'service-worker';
      else if (fromMemoryCache) origin = 'memory';
      const parsed = parseCacheControl(cacheControl);
      const label = formatCacheControl(cacheControl);
      let status: CacheStatus = 'FRESH';
      const now = Date.now();
      const exp = expires ? Date.parse(expires) : undefined;
      if (parsed.noStore) status = 'NO-CACHE';
      else if (parsed.noCache || parsed.maxAge === 0) status = 'STALE';
      else if (exp !== undefined && exp < now) status = 'EXPIRED';
      else status = 'FRESH';

      const issues: string[] = [];
      if (parsed.maxAge === 0 || parsed.noCache) issues.push('Not cacheable');
      if (!etag && !expires) issues.push('Missing ETag or Expires');
      if (parsed.maxAge !== undefined && parsed.maxAge < 300) issues.push('Short max-age');
      if (origin === 'network') issues.push('Network origin');

      return {
        url,
        resourceType: guessType(url, entry?.initiatorType),
        cacheControl,
        cacheControlLabel: label,
        etag,
        expires,
        serviceWorkerCaches: swCaches,
        fromMemoryCache,
        origin,
        status,
        issues,
      } as CacheResult;
    })
  );
};
