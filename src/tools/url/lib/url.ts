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
    const urlObj = new URL(url);
    const base = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    const params = Array.from(urlObj.searchParams.entries())
      .map(([k, v]) => {
        try {
          const decoded = decodeURIComponent(v);
          return `${encodeURIComponent(k)}=${encodeURIComponent(decoded)}`;
        } catch {
          return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        }
      })
      .join("&");
    return params ? `${base}?${params}${urlObj.hash}` : `${base}${urlObj.hash}`;
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
