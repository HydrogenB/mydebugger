import { formatReportFilename, generateReport } from '../src/tools/clickjacking/lib/clickjacking';

describe('Clickjacking report utils', () => {
  test('formatReportFilename sanitizes host and includes date', () => {
    const f = formatReportFilename('ex\nample.com', new Date('2025-01-02T03:04:05Z'));
    expect(f).toBe('example.com_clickjacking_2025-01-02-03-04-05.json');
  });

  test('generateReport stringifies payload', () => {
    const s = generateReport({ url: 'https://x', headers: { a: 'b' }, protected: true, timestamp: 'now' });
    expect(() => JSON.parse(s)).not.toThrow();
    expect(s).toContain('https://x');
  });
});


