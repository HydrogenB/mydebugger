import { parseCurl } from '../src/tools/api-test/lib/apiRepeater';

describe('API Repeater curl parser', () => {
  test('parses basic GET', () => {
    const p = parseCurl("curl 'https://example.com/api'");
    expect(p.method).toBe('GET');
    expect(p.url).toBe('https://example.com/api');
  });

  test('parses method, headers and data', () => {
    const p = parseCurl(`curl -X POST -H 'Content-Type: application/json' --data '{"a":1}' 'https://x.test'`);
    expect(p.method).toBe('POST');
    expect(p.headers['Content-Type']).toBe('application/json');
    expect(p.body).toBe('{"a":1}');
  });

  test('throws on invalid command', () => {
    expect(() => parseCurl('wget http://x')).toThrow(/Invalid curl/);
  });
});


