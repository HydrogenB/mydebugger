/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export type TlsProtocolLabel =
  | 'SSL 2.0'
  | 'SSL 3.0'
  | 'TLS 1.0'
  | 'TLS 1.1'
  | 'TLS 1.2'
  | 'TLS 1.3';

export interface TlsProbeResult {
  version: TlsProtocolLabel;
  supported: boolean;
  deprecated: boolean;
}

export interface TlsCheckResponse {
  domain: string;
  results: TlsProbeResult[];
  scannedAt: string;
}

export type TlsCheckErrorCode =
  | 'INVALID_DOMAIN'
  | 'CONNECTION_FAILED'
  | 'TIMEOUT'
  | 'SERVER_ERROR';

export interface TlsCheckErrorResponse {
  error: TlsCheckErrorCode;
}

export const TLS_PROTOCOL_LABELS: readonly TlsProtocolLabel[] = [
  'SSL 2.0',
  'SSL 3.0',
  'TLS 1.0',
  'TLS 1.1',
  'TLS 1.2',
  'TLS 1.3',
];

const DEPRECATED_PROTOCOLS = new Set<TlsProtocolLabel>([
  'SSL 2.0',
  'SSL 3.0',
  'TLS 1.0',
  'TLS 1.1',
]);

export const isDeprecatedProtocol = (label: TlsProtocolLabel): boolean =>
  DEPRECATED_PROTOCOLS.has(label);

export type ProtocolSeverity = 'secure' | 'insecure' | 'disabled';

export const getProtocolSeverity = (
  result: TlsProbeResult,
): ProtocolSeverity => {
  if (!result.supported) return 'disabled';
  return result.deprecated ? 'insecure' : 'secure';
};

const DOMAIN_REGEX =
  /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63})+$/;

export const normalizeDomain = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const candidate = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    const url = new URL(candidate);
    return url.hostname.toLowerCase();
  } catch {
    return trimmed.toLowerCase();
  }
};

export const isValidDomain = (raw: string): boolean => {
  const domain = normalizeDomain(raw);
  if (!domain || domain.length > 253) return false;
  if (domain.endsWith('.') || domain.startsWith('.')) return false;
  if (domain.includes('..')) return false;
  return DOMAIN_REGEX.test(domain);
};

const ERROR_MESSAGES: Record<TlsCheckErrorCode, string> = {
  INVALID_DOMAIN: 'Please enter a valid domain (e.g. example.com)',
  CONNECTION_FAILED:
    'Could not connect to the server. Please check the domain and try again.',
  TIMEOUT: 'Request timed out. The server may be slow or unreachable.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again.',
};

export const describeErrorCode = (code: string): string =>
  ERROR_MESSAGES[code as TlsCheckErrorCode] ?? ERROR_MESSAGES.SERVER_ERROR;

export const runTlsCheck = async (
  domain: string,
): Promise<TlsCheckResponse> => {
  const res = await fetch('/api/tls-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain }),
  });
  if (!res.ok) {
    let code: TlsCheckErrorCode = 'SERVER_ERROR';
    try {
      const body = (await res.json()) as TlsCheckErrorResponse;
      if (body?.error) code = body.error;
    } catch {
      // ignore parse errors and fall through to SERVER_ERROR
    }
    throw new Error(code);
  }
  return (await res.json()) as TlsCheckResponse;
};
