/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface CorsHeaders {
  [key: string]: string | null;
}

export interface CorsResult {
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    actualHeaders: Record<string, string>;
    /** Which transport produced this result — determines what can honestly be reported. */
    mode: 'browser' | 'server';
  };
  response: {
    status: number;
    type: Response['type'];
    headers: CorsHeaders;
    error?: string;
  };
}

export const runCorsPreflight = async (
  url: string,
  method: string,
  headers: Record<string, string>,
  mode: 'browser' | 'server' = 'browser'
): Promise<CorsResult> => {
  const { origin } = window.location;
  const requestHeaders: Record<string, string> = {
    Origin: origin,
    'Access-Control-Request-Method': method.toUpperCase(),
  };
  const headerNames = Object.keys(headers);
  if (headerNames.length > 0) {
    requestHeaders['Access-Control-Request-Headers'] = headerNames.join(',');
  }

  try {
    if (mode === 'server') {
      const res = await fetch('/api/utility-tools?tool=cors-preflight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, method, headers }),
      });
      if (!res.ok) throw new Error('Server request failed');
      const serverResult = (await res.json()) as CorsResult;
      // The proxy observes real preflight headers server-side; stamp the mode we used so
      // analyzeCors can trust this result even when the CORS headers all come back empty.
      return { ...serverResult, request: { ...serverResult.request, mode } };
    }
    const res = await fetch(url, {
      method: 'OPTIONS',
      mode: 'cors',
      headers: requestHeaders,
    });

    const corsHeaders: CorsHeaders = {
      'access-control-allow-origin': res.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': res.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': res.headers.get('access-control-allow-headers'),
      'access-control-allow-credentials': res.headers.get('access-control-allow-credentials'),
    };

    return {
      request: { url, method, headers: requestHeaders, actualHeaders: headers, mode },
      response: {
        status: res.status,
        type: res.type,
        headers: corsHeaders,
      },
    };
  } catch (err: unknown) {
    return {
      request: { url, method, headers: requestHeaders, actualHeaders: headers, mode },
      response: {
        status: 0,
        type: 'error',
        headers: {},
        error: err instanceof Error ? err.message : String(err),
      },
    };
  }
};

export default runCorsPreflight;

/** Wrap a value in single quotes for a POSIX shell, escaping any embedded single quotes. */
const shellQuote = (value: string): string => `'${value.replace(/'/g, "'\\''")}'`;

export const generateCurlCommand = (
  url: string,
  method: string,
  headers: Record<string, string>
): string => {
  const parts = [`curl -X ${method.toUpperCase()} ${shellQuote(url)}`];
  Object.entries(headers).forEach(([k, v]) => {
    parts.push(`-H ${shellQuote(`${k}: ${v}`)}`);
  });
  return parts.join(' ');
};

export interface CorsAnalysis {
  mismatches: {
    origin: boolean;
    method: boolean;
    headers: boolean;
    credentials: boolean;
  };
  guides: Record<string, string>;
  blockedBrowsers: string[];
  /**
   * True when this result came from browser mode and every access-control-allow-* header read
   * back as null — i.e. there is nothing real to analyze (fetch strips the request headers it
   * sent and a cross-origin response exposes no non-safelisted response headers). mismatches,
   * guides and blockedBrowsers are all empty/false in this case rather than fabricated.
   */
  browserOpaque: boolean;
}

const CORS_RESPONSE_HEADER_NAMES = [
  'access-control-allow-origin',
  'access-control-allow-methods',
  'access-control-allow-headers',
  'access-control-allow-credentials',
] as const;

/** Split a comma-separated header value into trimmed, non-empty entries. */
const splitHeaderList = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const analyzeCors = (
  result: CorsResult,
  origin: string,
  actualHeaders: Record<string, string>
): CorsAnalysis => {
  const resHeaders = result.response.headers;

  if (
    result.request.mode === 'browser' &&
    CORS_RESPONSE_HEADER_NAMES.every((h) => resHeaders[h] == null)
  ) {
    // Browser mode cannot observe the server's real preflight headers in either direction:
    // fetch() silently strips the forbidden request headers it claims to send, and a
    // cross-origin response exposes no non-safelisted response headers. Reporting mismatches
    // here would be fabricated, not measured — say so instead.
    const info =
      result.response.status === 0
        ? 'The browser blocked or failed this request before a response came back. Browser ' +
          'mode cannot read preflight response headers either way — use Server mode to inspect ' +
          "the target's actual CORS headers."
        : "Browser mode can only tell you whether the browser let this request through — " +
          'fetch() does not expose the access-control-allow-* response headers to cross-origin ' +
          'scripts, so there is nothing here to compare against your request. Use Server mode ' +
          'to inspect the real preflight headers.';
    return {
      mismatches: { origin: false, method: false, headers: false, credentials: false },
      guides: { info },
      blockedBrowsers: [],
      browserOpaque: true,
    };
  }

  const allowOrigin = resHeaders['access-control-allow-origin'] || '';
  const allowMethods = splitHeaderList(resHeaders['access-control-allow-methods'] || '').map(
    (m) => m.toUpperCase()
  );
  const allowHeaders = splitHeaderList(resHeaders['access-control-allow-headers'] || '').map(
    (h) => h.toLowerCase()
  );

  const reqHeaderNames = Object.keys(actualHeaders).map((h) => h.toLowerCase());

  const credentialsNeeded = reqHeaderNames.some((h) =>
    ['authorization', 'cookie'].includes(h)
  );
  // Access-Control-Allow-Origin: "*" is invalid whenever credentials are sent — every browser
  // (not just Safari) rejects that combination, so a wildcard only counts as "allowed" once
  // credentials are out of the picture.
  const originAllowed = credentialsNeeded
    ? allowOrigin === origin
    : allowOrigin === '*' || allowOrigin === origin;
  const methodAllowed = allowMethods.includes(result.request.method.toUpperCase());
  const headersAllowed = reqHeaderNames.every(
    (h) => allowHeaders.includes(h) || allowHeaders.includes('*')
  );
  const credentialsAllowed =
    !credentialsNeeded || resHeaders['access-control-allow-credentials'] === 'true';

  const mismatches = {
    origin: !originAllowed,
    method: !methodAllowed,
    headers: !headersAllowed,
    credentials: !credentialsAllowed,
  };

  const guides: Record<string, string> = {};
  if (mismatches.origin) {
    guides.origin =
      credentialsNeeded && allowOrigin === '*'
        ? 'Access-Control-Allow-Origin: "*" is rejected by every browser when credentials are ' +
          'sent. The server must echo back your exact origin instead.'
        : 'Server must send Access-Control-Allow-Origin with your origin or "*".';
  }
  if (mismatches.method) {
    guides.method = 'Add the method to Access-Control-Allow-Methods.';
  }
  if (mismatches.headers) {
    guides.headers =
      'Ensure Access-Control-Allow-Headers lists all request headers.';
  }
  if (mismatches.credentials) {
    guides.credentials =
      'Use Access-Control-Allow-Credentials: true and avoid "*" for origin when sending credentials.';
  }

  const blockedBrowsers: string[] = [];
  if (credentialsNeeded && allowOrigin === '*') {
    // Every major browser — not just Safari — rejects a wildcard origin once credentials are
    // involved, so this specific combination blocks all of them.
    blockedBrowsers.push('Chrome', 'Firefox', 'Safari', 'Edge');
  } else if (Object.values(mismatches).some(Boolean)) {
    ['Chrome', 'Firefox', 'Edge'].forEach((b) => blockedBrowsers.push(b));
  }

  return { mismatches, guides, blockedBrowsers, browserOpaque: false };
};
