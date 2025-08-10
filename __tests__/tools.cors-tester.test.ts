import { generateCurlCommand, analyzeCors } from '../src/tools/cors-tester/lib/cors';

describe('CORS tester helpers', () => {
  test('generateCurlCommand builds header flags', () => {
    const cmd = generateCurlCommand('https://a', 'GET', { 'X-Test': '1' });
    expect(cmd).toContain("curl -X GET 'https://a'");
    expect(cmd).toContain("-H 'X-Test: 1'");
  });

  test('analyzeCors detects origin mismatch', () => {
    const result = {
      request: { url: 'https://a', method: 'GET', headers: {}, actualHeaders: {} },
      response: { status: 200, type: 'basic', headers: { 'access-control-allow-origin': 'https://other' } },
    } as any;
    const analysis = analyzeCors(result, 'https://a', {});
    expect(analysis.mismatches.origin).toBe(true);
  });
});


