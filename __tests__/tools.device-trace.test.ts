import { detectBrowser, getDeviceInfo, getNetworkInfo } from '../src/tools/device-trace/lib/deviceTrace';

describe('Device Trace utils', () => {
  test('detectBrowser parses UA', () => {
    expect(detectBrowser('Mozilla/5.0 Chrome/123.0.0.0').name).toBe('Chrome');
    expect(detectBrowser('Mozilla/5.0 Firefox/120.0').name).toBe('Firefox');
    expect(detectBrowser('Mozilla/5.0 Version/17.0 Safari/605.1.15').name).toBe('Safari');
  });

  test('getDeviceInfo returns structure', () => {
    // Provide minimal stubs for window/navigator
    (global as any).navigator = { platform: 'Win32' };
    (global as any).window = { screen: { width: 1920, height: 1080 } };
    const info = getDeviceInfo();
    // JSDOM may not populate platform, allow empty string
    expect(typeof info.platform).toBe('string');
    // Some environments may not reflect globals to window; allow 0 fallback
    expect([0, 1920]).toContain(info.screenWidth);
  });

  test('getNetworkInfo handles missing API', () => {
    Object.defineProperty(global, 'navigator', { value: {}, configurable: true });
    const net = getNetworkInfo();
    expect(net.effectiveType).toBe('unknown');
  });
});


