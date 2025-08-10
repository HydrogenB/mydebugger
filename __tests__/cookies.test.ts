import {
  parseCookieString,
  mergeCookies,
  formatExportFilename,
} from '../src/tools/cookie-inspector/lib/cookies';

describe('parseCookieString', () => {
  it('parses name=value pairs', () => {
    const res = parseCookieString('a=1; b=2');
    expect(res).toEqual([
      { name: 'a', value: '1' },
      { name: 'b', value: '2' },
    ]);
  });

  it('handles empty string', () => {
    expect(parseCookieString('')).toEqual([]);
  });
});

describe('mergeCookies', () => {
  it('marks cookies as httpOnly when missing from client list', () => {
    const server = [ { name: 'sid', value: '123' } ];
    const client: any[] = [];
    const merged = mergeCookies(server, client);
    expect(merged[0].httpOnly).toBe(true);
    expect(merged[0].accessible).toBe(false);
  });

  it('combines client details', () => {
    const server = [ { name: 'a', value: '1' } ];
    const client = [ { name: 'a', value: '1', secure: true } ];
    const merged = mergeCookies(server, client);
    expect(merged[0].secure).toBe(true);
    expect(merged[0].httpOnly).toBe(false);
  });

  it('merges multiple cookies', () => {
    const server = [ { name: 'a', value: '1' }, { name: 'b', value: '2' } ];
    const client = [ { name: 'b', value: '2', path: '/' } ];
    const merged = mergeCookies(server, client);
    expect(merged).toHaveLength(2);
    expect(merged[0].accessible).toBe(false);
    expect(merged[1].path).toBe('/');
  });
});

describe('formatExportFilename', () => {
  it('generates a timestamped filename', () => {
    const date = new Date('2025-06-11T12:34:56Z');
    const name = formatExportFilename('example.com', date);
    expect(name).toBe('example.com_2025-06-11-12-34-56.json');
  });
});
