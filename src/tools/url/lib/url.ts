/**
 * © 2025 MyDebugger Contributors – MIT License
 */

/**
 * Encode all query parameter values in a URL while preserving the base path.
 * Existing encodings are normalized to avoid double encoding.
 *
 * @param url - The URL which may contain unencoded query parameters.
 * @returns The URL with each query parameter percent-encoded.
 */
export const encodeUrlQueryParams = (url: string): string => {
  try {
    const normalized = url.startsWith('//') ? `https:${url}` : url;
    const urlObj = new URL(normalized);
    const base = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    // Preserve duplicate keys and their order by re-parsing the raw query
    const rawQuery = urlObj.search.startsWith('?') ? urlObj.search.slice(1) : '';
    const params = (rawQuery ? rawQuery.split('&').filter(Boolean).map(p => {
      const [k, v = ''] = p.split('=');
      return [decodeURIComponent(k), v] as const;
    }) : Array.from(urlObj.searchParams.entries()))
      .map(([k, v]) => {
        try {
          const decoded = decodeURIComponent(v);
          return `${encodeURIComponent(k)}=${encodeURIComponent(decoded)}`;
        } catch {
          return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        }
      })
      .join("&");
    const hash = urlObj.hash || (normalized.includes('#') ? `#${normalized.split('#').slice(1).join('#')}` : '');
    return params ? `${base}?${params}${hash}` : `${base}${hash}`;
  } catch {
    // Fallback for URLs without scheme or other parsing issues
    try {
      const [base, rest] = url.split("?");
      if (!rest) return url;
      const [query, fragment] = rest.split("#");
      const encodedQuery = query
        .split("&")
        .filter(Boolean)
        .map((part) => {
          const [k, v = ""] = part.split("=");
          try {
            const decodedVal = decodeURIComponent(v);
            return `${encodeURIComponent(k)}=${encodeURIComponent(decodedVal)}`;
          } catch {
            return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
          }
        })
        .join("&");
      return `${base}?${encodedQuery}${fragment ? `#${fragment}` : ""}`;
    } catch {
      return url;
    }
  }
};

export default encodeUrlQueryParams;
