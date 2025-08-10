import { formatExportFilename } from '../src/tools/cookie-scope/lib/cookies';
import { parseCookies } from '../src/tools/cookie-scope/lib/cookieScope';

describe('Cookie Scope utilities', () => {
  test('formatExportFilename sanitizes', () => {
    const f = formatExportFilename('ex\nample.com');
    expect(f.startsWith('cookies-ex-ample.com-')).toBe(true);
    expect(f.endsWith('.json')).toBe(true);
  });

  test('parseCookies returns array in environments without cookieStore', async () => {
    (document as any).cookie = 'a=1; b=2';
    const list = await parseCookies();
    expect(Array.isArray(list)).toBe(true);
  });
});


