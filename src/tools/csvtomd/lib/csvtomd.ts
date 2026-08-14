/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import * as Papa from 'papaparse';

function escapeMd(text: string): string {
  return String(text)
    .replace(/\|/g, '\\|')
    .replace(/\r\n|\r|\n/g, '<br>');
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

// Note: headerless CSV is not supported — the first row is always treated as
// the header row. There is no reliable way to distinguish a header row from
// a data row by inspection alone (a prior heuristic here tested only that the
// first line contained a delimiter, which every data row also does).
export function parseCsv(csvText: string, delimiter: string): CsvParseResult {
  const text = csvText.replace(/\r\n?/g, '\n').trim();
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
  // Defend at the root: regardless of what the caller hands in, the
  // separator row must have exactly one cell per header. Pad missing
  // columns with 'left' and drop any excess.
  const alignRow = headers.map((_, i) => {
    const align = alignment[i] ?? 'left';
    if (align === 'center') return ':---:';
    if (align === 'right') return '---:';
    if (align === 'left') return ':---';
    return '---';
  });

  return [
    `| ${headers.map(escapeMd).join(' | ')} |`,
    `| ${alignRow.join(' | ')} |`,
    ...rows.map((r) => `| ${r} |`),
  ].join('\n');
}
