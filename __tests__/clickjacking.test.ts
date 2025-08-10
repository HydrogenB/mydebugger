import { formatReportFilename, generateReport, ClickjackingReport } from '../src/tools/clickjacking/lib/clickjacking';

describe('formatReportFilename', () => {
  it('creates filename with host and timestamp', () => {
    const date = new Date('2025-06-11T12:34:56Z');
    const name = formatReportFilename('example.com', date);
    expect(name).toBe('example.com_clickjacking_2025-06-11-12-34-56.json');
  });
});

describe('generateReport', () => {
  it('stringifies the report data', () => {
    const data: ClickjackingReport = {
      url: 'https://a.com',
      headers: { 'x-frame-options': 'DENY' },
      protected: true,
      timestamp: '2025-06-11T12:00:00Z',
    };
    const out = generateReport(data);
    expect(JSON.parse(out)).toEqual(data);
  });
});
