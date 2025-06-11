import { runCorsPreflight, analyzeCors, generateCurlCommand } from '../model/cors';

describe('runCorsPreflight', () => {
  it('parses CORS headers', async () => {
    const headers = new Headers({
      'access-control-allow-origin': 'https://example.com',
      'access-control-allow-methods': 'GET, POST',
      'access-control-allow-headers': 'content-type',
    });
    (global.fetch as any) = jest.fn(() => Promise.resolve({
      status: 204,
      type: 'cors',
      headers,
    }));

    const res = await runCorsPreflight('https://api.com', 'GET', {});
    expect(res.response.headers['access-control-allow-origin']).toBe('https://example.com');
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('https://api.com');
  });

  it('handles network errors', async () => {
    (global.fetch as any) = jest.fn(() => Promise.reject(new Error('fail')));
    const res = await runCorsPreflight('https://api.com', 'GET', {});
    expect(res.response.error).toBe('fail');
  });

  it('returns status when denied', async () => {
    (global.fetch as any) = jest.fn(() =>
      Promise.resolve({ status: 403, type: 'cors', headers: new Headers() })
    );
    const res = await runCorsPreflight('https://api.com', 'POST', {});
    expect(res.response.status).toBe(403);
  });

  it('handles opaque responses', async () => {
    (global.fetch as any) = jest.fn(() =>
      Promise.resolve({ status: 0, type: 'opaque', headers: new Headers() })
    );
    const res = await runCorsPreflight('https://api.com', 'GET', {});
    expect(res.response.type).toBe('opaque');
  });
});

describe('analyzeCors', () => {
  it('detects mismatches and guides', () => {
    const result = {
      request: {
        url: 'https://api.com',
        method: 'POST',
        headers: {},
        actualHeaders: { Authorization: 'token', 'Content-Type': 'text/plain' },
      },
      response: {
        status: 200,
        type: 'cors',
        headers: {
          'access-control-allow-origin': 'https://site.com',
          'access-control-allow-methods': 'GET',
          'access-control-allow-headers': 'content-type',
        },
      },
    } as any;

    const res = analyzeCors(result, 'https://site.com', result.request.actualHeaders);
    expect(res.mismatches.method).toBe(true);
    expect(res.mismatches.headers).toBe(true);
    expect(res.mismatches.credentials).toBe(true);
    expect(res.guides.credentials).toBeDefined();
  });
});

describe('generateCurlCommand', () => {
  it('generates curl string', () => {
    const cmd = generateCurlCommand('https://a.com', 'POST', {
      Authorization: 'Bearer t',
    });
    expect(cmd).toContain("curl -X POST 'https://a.com'");
    expect(cmd).toContain("-H 'Authorization: Bearer t'");
  });
});
