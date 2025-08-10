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
      return await res.json();
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
      request: { url, method, headers: requestHeaders, actualHeaders: headers },
      response: {
        status: res.status,
        type: res.type,
        headers: corsHeaders,
      },
    };
  } catch (err: unknown) {
    return {
      request: { url, method, headers: requestHeaders, actualHeaders: headers },
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

export const generateCurlCommand = (
  url: string,
  method: string,
  headers: Record<string, string>
): string => {
  const parts = [`curl -X ${method.toUpperCase()} '${url}'`];
  Object.entries(headers).forEach(([k, v]) => {
    parts.push(`-H '${k}: ${v}'`);
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
}

export const analyzeCors = (
  result: CorsResult,
  origin: string,
  actualHeaders: Record<string, string>
): CorsAnalysis => {
  const resHeaders = result.response.headers;
  const allowOrigin = resHeaders['access-control-allow-origin'] || '';
  const allowMethods = (resHeaders['access-control-allow-methods'] || '')
    .toUpperCase()
    .split(/,\s*/);
  const allowHeaders = (resHeaders['access-control-allow-headers'] || '')
    .toLowerCase()
    .split(/,\s*/);

  const reqHeaderNames = Object.keys(actualHeaders).map((h) => h.toLowerCase());

  const originAllowed = allowOrigin === '*' || allowOrigin === origin;
  const methodAllowed = allowMethods.includes(result.request.method.toUpperCase());
  const headersAllowed = reqHeaderNames.every(
    (h) => allowHeaders.includes(h) || allowHeaders.includes('*')
  );
  const credentialsNeeded = reqHeaderNames.some((h) =>
    ['authorization', 'cookie'].includes(h)
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
      'Server must send Access-Control-Allow-Origin with your origin or "*".';
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
  if (
    resHeaders['access-control-allow-credentials'] === 'true' &&
    allowOrigin === '*'
  ) {
    blockedBrowsers.push('Safari');
  }
  if (Object.values(mismatches).some(Boolean)) {
    ['Chrome', 'Firefox', 'Edge'].forEach((b) => blockedBrowsers.push(b));
  }

  return { mismatches, guides, blockedBrowsers };
};
