import { decodeVapidKey, detectPushSupport } from '../src/tools/push-tester/lib/pushTester';

describe('decodeVapidKey', () => {
  it('decodes base64url string', () => {
    const arr = decodeVapidKey('AQAB');
    expect(arr).toBeInstanceOf(Uint8Array);
    expect(arr.length).toBeGreaterThan(0);
  });
});

describe('detectPushSupport', () => {
  it('returns boolean flags', () => {
    const s = detectPushSupport();
    expect(typeof s.secure).toBe('boolean');
    expect(typeof s.serviceWorker).toBe('boolean');
    expect(typeof s.pushManager).toBe('boolean');
    expect(typeof s.notification).toBe('boolean');
  });
});
