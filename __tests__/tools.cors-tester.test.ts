import { generateCurlCommand, analyzeCors, CorsResult } from '../src/tools/cors-tester/lib/cors';

const makeResult = (overrides: Partial<CorsResult> = {}): CorsResult => ({
  request: {
    url: 'https://a',
    method: 'GET',
    headers: {},
    actualHeaders: {},
    mode: 'browser',
    ...overrides.request,
  },
  response: {
    status: 200,
    type: 'cors',
    headers: {},
    ...overrides.response,
  },
});

describe('CORS tester helpers', () => {
  test('generateCurlCommand builds header flags', () => {
    const cmd = generateCurlCommand('https://a', 'GET', { 'X-Test': '1' });
    expect(cmd).toContain("curl -X GET 'https://a'");
    expect(cmd).toContain("-H 'X-Test: 1'");
  });

  test('generateCurlCommand escapes single quotes in the URL and in a header value', () => {
    const cmd = generateCurlCommand("https://a/it's-here", 'GET', { 'X-Test': "va'lue" });
    // A single-quoted shell string containing a quote must close, escape, and reopen: '\''
    expect(cmd).toContain("curl -X GET 'https://a/it'\\''s-here'");
    expect(cmd).toContain("-H 'X-Test: va'\\''lue'");
  });

  test('analyzeCors detects origin mismatch', () => {
    const result = makeResult({
      request: { url: 'https://a', method: 'GET', headers: {}, actualHeaders: {}, mode: 'server' },
      response: { status: 200, type: 'basic', headers: { 'access-control-allow-origin': 'https://other' } },
    });
    const analysis = analyzeCors(result, 'https://a', {});
    expect(analysis.mismatches.origin).toBe(true);
  });

  test('F7: wildcard origin plus an Authorization header is a credentials AND origin mismatch, blocking every major browser', () => {
    const result = makeResult({
      request: { url: 'https://a', method: 'GET', headers: {}, actualHeaders: { Authorization: 'Bearer x' }, mode: 'server' },
      response: {
        status: 200,
        type: 'cors',
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET',
        },
      },
    });
    const analysis = analyzeCors(result, 'https://a', { Authorization: 'Bearer x' });
    expect(analysis.mismatches.origin).toBe(true);
    expect(analysis.mismatches.credentials).toBe(true);
    expect(analysis.blockedBrowsers).toEqual(
      expect.arrayContaining(['Chrome', 'Firefox', 'Safari', 'Edge'])
    );
    expect(analysis.blockedBrowsers.length).toBe(4);
  });

  test('F7: wildcard origin without credentials still passes', () => {
    const result = makeResult({
      request: { url: 'https://a', method: 'GET', headers: {}, actualHeaders: {}, mode: 'server' },
      response: {
        status: 200,
        type: 'cors',
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET',
        },
      },
    });
    const analysis = analyzeCors(result, 'https://a', {});
    expect(analysis.mismatches.origin).toBe(false);
    expect(analysis.mismatches.credentials).toBe(false);
    expect(analysis.blockedBrowsers).toEqual([]);
  });

  test("F8: 'GET , POST' (loose comma spacing) matches both GET and POST after trimming", () => {
    const baseHeaders = { 'access-control-allow-origin': 'https://a', 'access-control-allow-methods': 'GET , POST' };
    const postResult = makeResult({
      request: { url: 'https://a', method: 'POST', headers: {}, actualHeaders: {}, mode: 'server' },
      response: { status: 200, type: 'cors', headers: baseHeaders },
    });
    const getResult = makeResult({
      request: { url: 'https://a', method: 'GET', headers: {}, actualHeaders: {}, mode: 'server' },
      response: { status: 200, type: 'cors', headers: baseHeaders },
    });
    expect(analyzeCors(postResult, 'https://a', {}).mismatches.method).toBe(false);
    expect(analyzeCors(getResult, 'https://a', {}).mismatches.method).toBe(false);
  });

  test('F6: browser mode with no observable CORS headers reports an honest "cannot verify" state, not a fabricated mismatch', () => {
    const result = makeResult({
      request: { url: 'https://a', method: 'GET', headers: {}, actualHeaders: {}, mode: 'browser' },
      response: {
        status: 200,
        type: 'cors',
        headers: {
          'access-control-allow-origin': null,
          'access-control-allow-methods': null,
          'access-control-allow-headers': null,
          'access-control-allow-credentials': null,
        },
      },
    });
    const analysis = analyzeCors(result, 'https://a', {});
    expect(analysis.browserOpaque).toBe(true);
    expect(analysis.mismatches).toEqual({
      origin: false,
      method: false,
      headers: false,
      credentials: false,
    });
    expect(analysis.blockedBrowsers).toEqual([]);
    expect(analysis.guides.info).toBeTruthy();
  });

  test('F6: server mode with genuinely absent CORS headers is still a real mismatch (distinguishable from browser opacity)', () => {
    const result = makeResult({
      request: { url: 'https://a', method: 'GET', headers: {}, actualHeaders: {}, mode: 'server' },
      response: {
        status: 200,
        type: 'cors',
        headers: {
          'access-control-allow-origin': null,
          'access-control-allow-methods': null,
          'access-control-allow-headers': null,
          'access-control-allow-credentials': null,
        },
      },
    });
    const analysis = analyzeCors(result, 'https://a', {});
    expect(analysis.browserOpaque).toBe(false);
    expect(analysis.mismatches.origin).toBe(true);
  });
});
