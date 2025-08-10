import { analyzeHeaders, getSecurityScore } from '../src/tools/header-scanner/lib/headerScanner';

describe('Header Scanner', () => {
  test('analyzeHeaders with provided Headers object', async () => {
    const headers = new Headers({
      'x-frame-options': 'DENY',
      'content-security-policy': "default-src 'self'",
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
    });
    const results = await analyzeHeaders(headers);
    expect(results.every(r => r.status === 'ok')).toBe(true);
    expect(getSecurityScore(results)).toBe(100);
  });

  test('getSecurityScore handles empty', () => {
    expect(getSecurityScore([])).toBe(0);
  });
});


