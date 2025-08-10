import { detectDelimiter, parseCsv, generateMarkdownTable } from '../src/tools/csvtomd/lib/csvtomd';

describe('detectDelimiter', () => {
  it('detects comma vs semicolon', () => {
    const csv = 'a,b\nc,d';
    const semicolon = 'a;b\nc;d';
    expect(detectDelimiter(csv)).toBe(',');
    expect(detectDelimiter(semicolon)).toBe(';');
  });
});

describe('parseCsv and generateMarkdownTable', () => {
  it('parses csv and generates markdown', () => {
    const csv = 'name,age\nAlice,30\nBob,40';
    const { data } = parseCsv(csv, ',');
    const md = generateMarkdownTable(data, ['left', 'right']);
    expect(md).toContain('| name | age |');
    expect(md).toContain('| Alice | 30 |');
  });
});
