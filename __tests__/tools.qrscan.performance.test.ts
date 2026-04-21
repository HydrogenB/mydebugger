/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import {
  createEmptyPerformance,
  mergeAttempt,
} from '../src/tools/qrscan/hooks/useQrscan';
import type { DecodeAttemptMeta } from '../src/tools/qrscan/lib/qrscan';

const attempt = (overrides: Partial<DecodeAttemptMeta> = {}): DecodeAttemptMeta => ({
  engine: 'BarcodeDetector',
  matched: true,
  decodeMs: 5,
  runLevel: 'fast',
  canvasWidth: 640,
  canvasHeight: 480,
  ...overrides,
});

describe('mergeAttempt', () => {
  test('populates last-attempt fields', () => {
    const next = mergeAttempt(createEmptyPerformance(), attempt({ decodeMs: 12 }));
    expect(next.lastEngine).toBe('BarcodeDetector');
    expect(next.lastDecodeMs).toBe(12);
    expect(next.lastRunLevel).toBe('fast');
    expect(next.lastCanvasSize).toEqual({ width: 640, height: 480 });
    expect(next.attempts).toBe(1);
    expect(next.hits).toBe(1);
  });

  test('computes rolling averages per engine', () => {
    let perf = createEmptyPerformance();
    perf = mergeAttempt(perf, attempt({ engine: 'jsQR-fast', decodeMs: 10 }));
    perf = mergeAttempt(perf, attempt({ engine: 'jsQR-fast', decodeMs: 20 }));
    perf = mergeAttempt(perf, attempt({ engine: 'jsQR-fast', decodeMs: 30 }));
    expect(perf.engines['jsQR-fast'].hits).toBe(3);
    expect(perf.engines['jsQR-fast'].averageDecodeMs).toBeCloseTo(20, 5);
    expect(perf.engines['jsQR-fast'].lastDecodeMs).toBe(30);
  });

  test('picks winningEngine by hit count, tie-broken by avg latency', () => {
    let perf = createEmptyPerformance();
    perf = mergeAttempt(perf, attempt({ engine: 'BarcodeDetector', decodeMs: 5 }));
    perf = mergeAttempt(perf, attempt({ engine: 'BarcodeDetector', decodeMs: 5 }));
    perf = mergeAttempt(perf, attempt({ engine: 'jsQR-fast', decodeMs: 15 }));
    perf = mergeAttempt(perf, attempt({ engine: 'jsQR-fast', decodeMs: 15 }));
    expect(perf.winningEngine).toBe('BarcodeDetector'); // same hits, lower avg wins
  });

  test('ignores misses for engine hit counts but still increments global attempts', () => {
    let perf = createEmptyPerformance();
    perf = mergeAttempt(perf, attempt({ engine: null, matched: false, decodeMs: 8 }));
    perf = mergeAttempt(perf, attempt({ engine: null, matched: false, decodeMs: 9 }));
    expect(perf.attempts).toBe(2);
    expect(perf.hits).toBe(0);
    expect(perf.winningEngine).toBeNull();
    expect(perf.averageDecodeMs).toBeCloseTo(8.5, 5);
  });

  test('uses decodeMs of missed attempts in global average but not in engine averages', () => {
    let perf = createEmptyPerformance();
    perf = mergeAttempt(perf, attempt({ engine: 'jsQR-fast', matched: true, decodeMs: 10 }));
    perf = mergeAttempt(perf, attempt({ engine: null, matched: false, decodeMs: 40 }));
    expect(perf.engines['jsQR-fast'].averageDecodeMs).toBe(10);
    expect(perf.averageDecodeMs).toBeCloseTo(25, 5);
  });
});
