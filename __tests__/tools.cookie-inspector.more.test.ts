import { parseCookieString, mergeCookies } from '../src/tools/cookie-inspector/lib/cookies';

describe('Cookie inspector edge cases', () => {
  test('parseCookieString tolerates values with equals', () => {
    const arr = parseCookieString('token=abc=def; id=1');
    expect(arr.find(c => c.name === 'token')?.value).toBe('abc=def');
  });

  test('mergeCookies marks httpOnly when not in client', () => {
    const merged = mergeCookies([{ name: 'sid', value: 'x' }], []);
    expect(merged[0].httpOnly).toBe(true);
    expect(merged[0].accessible).toBe(false);
  });
});


