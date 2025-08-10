import { parseCookies } from '../src/tools/cookie-scope/lib/cookieScope';

describe('parseCookies', () => {
  it('parses cookies from document.cookie', async () => {
    document.cookie = 'foo=bar';
    document.cookie = 'baz=qux';
    const res = await parseCookies();
    expect(res.find((c) => c.name === 'foo')?.value).toBe('bar');
    expect(res.find((c) => c.name === 'baz')?.value).toBe('qux');
  });

  it('returns empty array when cookies disabled', async () => {
    const enabled = Object.getOwnPropertyDescriptor(Navigator.prototype, 'cookieEnabled');
    Object.defineProperty(Navigator.prototype, 'cookieEnabled', { value: false, configurable: true });
    const res = await parseCookies();
    expect(res).toEqual([]);
    if (enabled) Object.defineProperty(Navigator.prototype, 'cookieEnabled', enabled);
  });

  it('uses cookieStore when available', async () => {
    (global as any).window.cookieStore = {
      getAll: async () => [
        { name: 'cs', value: '1', domain: 'example.com', path: '/', sameSite: 'Lax', secure: true },
      ],
    };
    const res = await parseCookies();
    expect(res[0].name).toBe('cs');
    expect(res[0].secure).toBe(true);
    delete (global as any).window.cookieStore;
  });

  it('handles malformed cookie strings', async () => {
    document.cookie = 'good=1';
    document.cookie = 'malformed';
    document.cookie = 'another=value';
    const res = await parseCookies();
    expect(res.find((c) => c.name === 'good')?.value).toBe('1');
    expect(res.find((c) => c.name === 'malformed')?.value).toBe('');
    expect(res.find((c) => c.name === 'another')?.value).toBe('value');
  });
});
