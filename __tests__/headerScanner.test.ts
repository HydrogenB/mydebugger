import { analyzeHeaders } from '../model/headerScanner';

describe('analyzeHeaders', () => {
  it('marks headers as ok when values are secure', async () => {
    (global.fetch as any) = jest.fn(() => Promise.resolve({
      type: 'basic',
      headers: new Headers({
        'x-frame-options': 'DENY',
        'content-security-policy': "default-src 'self'",
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'no-referrer',
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
      }),
    }));

    const res = await analyzeHeaders('https://example.com');
    const statuses = Object.fromEntries(res.map(r => [r.name, r.status]));
    expect(statuses['x-frame-options']).toBe('ok');
    expect(statuses['content-security-policy']).toBe('ok');
  });

  it('flags missing headers', async () => {
    (global.fetch as any) = jest.fn(() => Promise.resolve({
      type: 'basic',
      headers: new Headers(),
    }));

    const res = await analyzeHeaders('https://example.com');
    expect(res.find(r => r.name === 'x-frame-options')?.status).toBe('missing');
  });

  it('returns warnings on fetch error', async () => {
    (global.fetch as any) = jest.fn(() => Promise.reject(new Error('fail')));
    const res = await analyzeHeaders('https://bad.com');
    expect(res.every(r => r.status === 'warning')).toBe(true);
  });
});
