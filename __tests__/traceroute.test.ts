import { renderHook, act } from '@testing-library/react';
import { parseMtrOutput } from '../model/traceroute';
import useTraceroute from '../viewmodel/useTraceroute';

describe('parseMtrOutput', () => {
  it('parses basic mtr text', () => {
    const sample = `traceroute to 8.8.8.8 (8.8.8.8), 5 hops max
 1 192.168.1.1 1.1 ms
 2 10.0.0.1 5.2 ms
 3 203.0.113.14 20.0 ms`;
    const hops = parseMtrOutput(sample);
    expect(hops.length).toBe(3);
    expect(hops[0].ip).toBe('192.168.1.1');
    expect(hops[2].latency).toBeCloseTo(20.0);
  });
});

describe('useTraceroute', () => {
  it('runs trace and toggles logs', async () => {
    const sample = `traceroute to 8.8.8.8 (8.8.8.8), 5 hops max\n 1 8.8.8.8 1 ms`;
    (global.fetch as any) = jest.fn((url: string) => {
      if (url.startsWith('https://api.hackertarget.com')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(sample) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    const { result } = renderHook(() => useTraceroute());
    act(() => {
      result.current.setHost('8.8.8.8');
      result.current.setApiKey('key');
    });
    await act(async () => {
      await result.current.run();
    });
    act(() => {
      result.current.toggleRaw();
    });
    expect(result.current.hops.length).toBe(1);
    expect(result.current.showRaw).toBe(true);
  });
});
