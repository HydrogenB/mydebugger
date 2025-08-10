import { parseCurl } from '../src/tools/api-test/lib/apiRepeater';

describe('api repeater model', () => {
  it('parses curl command with single quotes', () => {
    const curl = "curl -X POST 'https://api.example.com/data' -H 'Authorization: Bearer abc' -H 'Content-Type: application/json' -d '{\"value\":42}'";
    const res = parseCurl(curl);
    expect(res.method).toBe('POST');
    expect(res.url).toBe('https://api.example.com/data');
    expect(res.headers).toEqual({
      Authorization: 'Bearer abc',
      'Content-Type': 'application/json',
    });
    expect(res.body).toBe('{"value":42}');
  });

  it('parses curl command with double quotes', () => {
    const curl = "curl -X PUT 'https://api.example.com/update' -H 'Accept: application/json' -d '{\"id\":1}'";
    const res = parseCurl(curl);
    expect(res.method).toBe('PUT');
    expect(res.url).toBe('https://api.example.com/update');
    expect(res.headers).toEqual({
      Accept: 'application/json',
    });
    expect(res.body).toBe('{"id":1}');
  });
});
