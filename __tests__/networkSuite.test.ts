import { getTechTier, average, pingSamples, measureDownloadSpeed } from '../model/networkSuite';

describe('getTechTier', () => {
  it('maps tiers correctly', () => {
    expect(getTechTier({ effectiveType: '3g' })).toBe('3G');
    expect(getTechTier({ effectiveType: '4g', downlink: 10 })).toBe('4G');
    expect(getTechTier({ effectiveType: '4g', downlink: 60 })).toBe('≈5G');
  });
});

describe('average', () => {
  it('computes average', () => {
    expect(average([1, 2, 3])).toBeCloseTo(2);
  });
});

describe('pingSamples', () => {
  it('returns times for samples', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({});
    let now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => {
      now += 5;
      return now;
    });
    const res = await pingSamples('https://a.com', 3);
    expect(res).toHaveLength(2);
    expect((global.fetch as any)).toHaveBeenCalledTimes(3);
  });
});

describe('measureDownloadSpeed', () => {
  it('calculates mbps', async () => {
    const chunk = new Uint8Array(1024);
    (global.fetch as any) = jest.fn().mockResolvedValue({
      body: {
        getReader() {
          let done = false;
          return {
            read: () => Promise.resolve(done ? { done: true } : ((done = true), { value: chunk, done: false })),
            cancel: jest.fn(),
          };
        },
      },
    });
    const times = [0, 1000];
    jest.spyOn(performance, 'now').mockImplementation(() => times.shift() ?? 1000);
    const mbps = await measureDownloadSpeed('https://a.com', 1024);
    expect(mbps).toBeCloseTo((1024 * 8) / 1_000_000);
  });
});
