/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface RedirectHop {
  url: string;
  status?: number;
  headers?: Record<string, string>;
  error?: string;
  mixedProtocol?: boolean;
}

export interface OpenGraphPreview {
  title: string;
  image?: string;
  domain: string;
}

export const parseUtmParams = (target: string): Record<string, string> => {
  try {
    const url = new URL(target);
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      if (key.toLowerCase().startsWith('utm_')) {
        params[key] = value;
      }
    });
    return params;
  } catch {
    return {};
  }
};

export const MAX_REDIRECTS = 20;

/**
 * Request the redirect chain from the serverless API to avoid CORS issues.
 * @param initialUrl URL to trace
 */
export const followRedirectChainRemote = async (
  initialUrl: string,
): Promise<RedirectHop[]> => {
  try {
    // Normalize URL to include protocol; assume https if omitted
    const normalized = (() => {
      try { return new URL(initialUrl).toString(); } catch { return `https://${initialUrl}`; }
    })();
    const res = await fetch('/api/deep-link-chain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: normalized }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.hops) ? data.hops : [];
  } catch (e) {
    return [{ url: initialUrl, error: (e as Error).message }];
  }
};

const tryFetchFinalUrl = async (url: string): Promise<string | undefined> => {
  try {
    const res = await fetch(url, { mode: 'no-cors', redirect: 'follow' });
    return res.url || undefined;
  } catch {
    return undefined;
  }
};

export async function followRedirectChain(initialUrl: string): Promise<RedirectHop[]> {
  const hops: RedirectHop[] = [];
  const visited = new Set<string>();
  let url = initialUrl;
  for (let i = 0; i < MAX_REDIRECTS; i += 1) {
    if (visited.has(url)) {
      hops.push({ url, error: 'Redirect loop detected' });
      break;
    }
    visited.add(url);
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(url, { redirect: 'manual' });
      const hop: RedirectHop = { url, status: res.status, headers: {} };
      res.headers.forEach((value, key) => {
        hop.headers![key] = value;
      });
      hops.push(hop);
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) break;
        const next = new URL(loc, url).toString();
        hop.mixedProtocol = new URL(next).protocol !== new URL(url).protocol;
        url = next;
      } else {
        break;
      }
    } catch (e) {
      hops.push({ url, error: (e as Error).message });
      // eslint-disable-next-line no-await-in-loop
      const finalUrl = await tryFetchFinalUrl(url);
      if (finalUrl && finalUrl !== url) {
        hops.push({ url: finalUrl });
      }
      break;
    }
  }
  if (hops.length >= MAX_REDIRECTS) {
    hops.push({ url, error: 'Maximum redirects reached' });
  }
  return hops;
}

export async function fetchOpenGraph(url: string): Promise<OpenGraphPreview | null> {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const title =
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.title;
    const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
      undefined;
    return { title, image, domain: new URL(url).hostname };
  } catch {
    return null;
  }
}

export default followRedirectChain;

