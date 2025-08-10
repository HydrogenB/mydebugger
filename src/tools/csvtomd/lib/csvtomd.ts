/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import * as Papa from 'papaparse';

function escapeMd(text: string): string {
  return String(text).replace(/\|/g, '\\|');
}

export function detectDelimiter(text: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const lines = text.split('\n').slice(0, 10);
  const scores = delimiters.map((d) => ({
    delimiter: d,
    count: lines.reduce((acc, line) => acc + line.split(d).length, 0),
  }));
  return scores.sort((a, b) => b.count - a.count)[0].delimiter;
}

export interface CsvParseResult {
  data: Record<string, string>[];
  errors: Papa.ParseError[];
}

export function parseCsv(csvText: string, delimiter: string): CsvParseResult {
  const text = csvText.replace(/\r\n?/g, '\n').trim();
  const hasHeader = /^[^\n]*[,;\t|].*\n/.test(text);
  const res = Papa.parse<Record<string, string>>(text, {
    header: true,
    delimiter,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
    transform: (v) => v === undefined ? '' : String(v).trim(),
  });
  return { data: res.data, errors: res.errors };
}

export function generateMarkdownTable(
  data: Record<string, string>[],
  alignment: string[],
): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => escapeMd(row[h] ?? '')).join(' | '),
  );
  const alignRow = alignment.map((align) => {
    if (align === 'center') return ':---:';
    if (align === 'right') return '---:';
    if (align === 'left') return ':---';
    return '---';
  });

  return [
    `| ${headers.join(' | ')} |`,
    `| ${alignRow.join(' | ')} |`,
    ...rows.map((r) => `| ${r} |`),
  ].join('\n');
}
