import { detectDelimiter, parseCsv, generateMarkdownTable } from '../src/tools/csvtomd/lib/csvtomd';

describe('CSV to Markdown', () => {
  test('detectDelimiter chooses comma', () => {
    const d = detectDelimiter('a,b\nc,d');
    expect(d).toBe(',');
  });

  test('parseCsv returns data', () => {
    const res = parseCsv('a,b\n1,2', ',');
    expect(res.data).toEqual([{ a: '1', b: '2' }]);
  });

  test('generateMarkdownTable outputs table', () => {
    const md = generateMarkdownTable([{ a: '1', b: '2' }], ['left', 'right']);
    expect(md).toContain('| a | b |');
  });
});


