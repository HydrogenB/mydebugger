import { average, calcJitter, getQualityScore } from '../src/tools/networksuit/lib/networkSuite';

describe('Network suite math', () => {
  test('average and jitter', () => {
    const vals = [100, 120, 110, 130];
    expect(Math.round(average(vals))).toBe(115);
    expect(calcJitter(vals)).toBeGreaterThan(0);
  });

  test('quality score grading', () => {
    const { grade } = getQualityScore({ avgPingMs: 50, jitterMs: 2, downloadMbps: 50, uploadMbps: 10 });
    expect(['A','B','C','D']).toContain(grade);
  });
});


