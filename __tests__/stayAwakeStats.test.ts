import { addAwakeTime, loadStats, resetStats } from '../src/tools/stayawake/lib/stayAwakeStats';

describe('stayAwakeStats', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: {
        store: {} as Record<string, string>,
        getItem(key: string) { return this.store[key] || null; },
        setItem(key: string, value: string) { this.store[key] = value; },
        removeItem(key: string) { delete this.store[key]; },
      },
      writable: true,
    });
    resetStats();
  });

  test('increments stats', () => {
    const stats1 = addAwakeTime(1000);
    expect(stats1.todayMs).toBe(1000);
    const stats2 = addAwakeTime(1000);
    expect(stats2.todayMs).toBe(2000);
  });

  test('resetStats clears data', () => {
    addAwakeTime(1000);
    resetStats();
    const stats = loadStats();
    expect(stats.todayMs).toBe(0);
  });
});
