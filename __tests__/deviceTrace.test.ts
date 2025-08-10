import { renderHook, act } from '@testing-library/react';
import { runDeviceTrace } from '../src/tools/device-trace/lib/deviceTrace';
import useDeviceTrace from '../src/tools/linktracer/hooks/useDeviceTrace.ts';

describe('runDeviceTrace', () => {
  it('posts to the API and returns result', async () => {
    (global.fetch as any) = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://a.com', overallTimeMs: 1, results: [] }),
      })
    );
    const res = await runDeviceTrace('https://a.com');
    expect(res.url).toBe('https://a.com');
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('/api/probe-router?action=trace');
  });

  it('throws when request fails', async () => {
    (global.fetch as any) = jest.fn(() => Promise.resolve({ ok: false, status: 500 }));
    await expect(runDeviceTrace('https://x.com')).rejects.toThrow('500');
  });

  it('copy and export helpers work', async () => {
    (global.fetch as any) = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://a.com', overallTimeMs: 1, results: [] }),
      })
    );

    const { result } = renderHook(() => useDeviceTrace());
    await act(async () => {
      result.current.setUrl('https://a.com');
      await result.current.run();
    });

    (navigator as any).clipboard = { writeText: jest.fn() };
    await act(async () => {
      await result.current.copyJson();
      result.current.exportJson();
    });
  });

  it('clear resets state', () => {
    const { result } = renderHook(() => useDeviceTrace());
    act(() => {
      result.current.setUrl('x');
      result.current.setIosAppId('id');
      result.current.setAndroidPackage('pkg');
      result.current.setDeepLinkScheme('scheme');
      result.current.setMaxHops(10);
      result.current.clear();
    });
    expect(result.current.url).toBe('');
    expect(result.current.iosAppId).toBe('');
    expect(result.current.androidPackage).toBe('');
    expect(result.current.deepLinkScheme).toBe('');
    expect(result.current.maxHops).toBe(20);
  });
});
