import { parseCookieString, formatExportFilename, mergeCookies } from '../src/tools/cookie-inspector/lib/cookies';

describe('Cookie inspector utils', () => {
  test('parseCookieString handles empty', () => {
    expect(parseCookieString('')).toEqual([]);
  });

  test('parseCookieString parses multiple', () => {
    const arr = parseCookieString('a=1; b=2');
    expect(arr).toEqual([{ name: 'a', value: '1' }, { name: 'b', value: '2' }]);
  });

  test('mergeCookies marks accessibility and httpOnly', () => {
    const merged = mergeCookies([{ name: 'a', value: '1' }], [{ name: 'a', value: '1', domain: 'x' } as any]);
    expect(merged[0].size).toBeGreaterThan(0);
    expect(merged[0].accessible).toBe(true);
  });

  test('formatExportFilename is safe', () => {
    const f = formatExportFilename('ex\nample.com');
    expect(f).not.toContain('\n');
    expect(f.endsWith('.json')).toBe(true);
  });
});


