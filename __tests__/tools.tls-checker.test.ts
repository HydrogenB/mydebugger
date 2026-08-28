/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import {
  TLS_PROTOCOL_LABELS,
  describeErrorCode,
  getProtocolSeverity,
  isDeprecatedProtocol,
  isValidDomain,
  normalizeDomain,
  runTlsCheck,
} from '../src/tools/tls-checker/lib/tlsChecker';

describe('TLS Checker lib', () => {
  test('TLS_PROTOCOL_LABELS contains six protocol versions in order', () => {
    expect(TLS_PROTOCOL_LABELS).toEqual([
      'SSL 2.0',
      'SSL 3.0',
      'TLS 1.0',
      'TLS 1.1',
      'TLS 1.2',
      'TLS 1.3',
    ]);
  });

  test('isDeprecatedProtocol flags SSL and early TLS', () => {
    expect(isDeprecatedProtocol('SSL 2.0')).toBe(true);
    expect(isDeprecatedProtocol('SSL 3.0')).toBe(true);
    expect(isDeprecatedProtocol('TLS 1.0')).toBe(true);
    expect(isDeprecatedProtocol('TLS 1.1')).toBe(true);
    expect(isDeprecatedProtocol('TLS 1.2')).toBe(false);
    expect(isDeprecatedProtocol('TLS 1.3')).toBe(false);
  });

  test('normalizeDomain strips scheme, path and whitespace', () => {
    expect(normalizeDomain('  https://Example.COM/path?x=1 ')).toBe(
      'example.com',
    );
    expect(normalizeDomain('sub.Example.org')).toBe('sub.example.org');
  });

  test('isValidDomain accepts typical hostnames and rejects malformed input', () => {
    expect(isValidDomain('example.com')).toBe(true);
    expect(isValidDomain('sub.example.co.uk')).toBe(true);
    expect(isValidDomain('https://example.com/foo')).toBe(true);
    expect(isValidDomain('')).toBe(false);
    expect(isValidDomain('example')).toBe(false);
    expect(isValidDomain('.example.com')).toBe(false);
    expect(isValidDomain('example..com')).toBe(false);
    expect(isValidDomain('-bad.example.com')).toBe(false);
    expect(isValidDomain('a b.com')).toBe(false);
  });

  test('getProtocolSeverity classifies results', () => {
    expect(
      getProtocolSeverity({ version: 'TLS 1.3', supported: true, deprecated: false }),
    ).toBe('secure');
    expect(
      getProtocolSeverity({ version: 'TLS 1.0', supported: true, deprecated: true }),
    ).toBe('insecure');
    expect(
      getProtocolSeverity({ version: 'SSL 3.0', supported: false, deprecated: true }),
    ).toBe('disabled');
  });

  test('describeErrorCode returns user-friendly strings', () => {
    expect(describeErrorCode('INVALID_DOMAIN')).toMatch(/valid domain/i);
    expect(describeErrorCode('CONNECTION_FAILED')).toMatch(/connect/i);
    expect(describeErrorCode('TIMEOUT')).toMatch(/timed out/i);
    expect(describeErrorCode('SERVER_ERROR')).toMatch(/wrong/i);
    expect(describeErrorCode('UNKNOWN_CODE')).toMatch(/wrong/i);
  });
});

describe('runTlsCheck', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('posts domain to API and returns parsed response', async () => {
    const payload = {
      domain: 'example.com',
      results: [
        { version: 'TLS 1.2', supported: true, deprecated: false },
        { version: 'TLS 1.3', supported: true, deprecated: false },
      ],
      scannedAt: '2026-04-22T10:00:00Z',
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await runTlsCheck('example.com');
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tls-check',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: 'example.com' }),
      }),
    );
  });

  test('throws with server-provided error code on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'CONNECTION_FAILED' }),
    }) as unknown as typeof fetch;
    await expect(runTlsCheck('bad.example')).rejects.toThrow(
      'CONNECTION_FAILED',
    );
  });

  test('falls back to SERVER_ERROR when response body is unparseable', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('bad json');
      },
    }) as unknown as typeof fetch;
    await expect(runTlsCheck('bad.example')).rejects.toThrow('SERVER_ERROR');
  });
});
