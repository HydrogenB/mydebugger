/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import * as Papa from 'papaparse';
import flattenJSON from './flattenJSON';

export interface CsvOptions {
  flatten?: boolean;
  header?: boolean;
  eol?: '\n' | '\r\n';
}

export const convertToCSV = (
  data: unknown,
  options: CsvOptions = {},
): string => {
  const { flatten = false, header = true, eol = '\n' } = options;
  const arr = Array.isArray(data) ? data : [data];
  const rows = arr.map((d) => (flatten ? flattenJSON(d as Record<string, unknown>) : d));
  return Papa.unparse(rows, { header, newline: eol });
};

