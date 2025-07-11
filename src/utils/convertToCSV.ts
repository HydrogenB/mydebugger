/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import * as Papa from 'papaparse';
import flattenJSON from './flattenJSON';

const getPath = (obj: any, path: string) =>
  path.split('.').reduce<any>((acc, key) => acc?.[key], obj);

export interface CsvOptions {
  delimiter?: string;
  includeHeader?: boolean;
  suppressNewlines?: boolean;
  flatten?: boolean;
  forceQuotes?: boolean;
  eol?: '\n' | '\r\n';
  dateFormat?: string;
  objectPath?: string;
}

export const convertToCSV = (
  data: unknown,
  options: CsvOptions = {},
): string => {
  const {
    delimiter = ',',
    includeHeader = true,
    suppressNewlines = false,
    flatten = false,
    forceQuotes = false,
    eol = '\n',
    dateFormat,
    objectPath,
  } = options;

  const arr = Array.isArray(data) ? data : [data];
  const selected = objectPath ? arr.map((r) => getPath(r, objectPath)) : arr;
  const rows = selected.map((d) =>
    flatten ? flattenJSON(d as Record<string, unknown>, '', {}, dateFormat) : d,
  );
  let csv = Papa.unparse(rows, {
    delimiter,
    header: includeHeader,
    newline: eol,
    quotes: forceQuotes,
  });

  if (suppressNewlines) {
    csv = csv.replace(/\r?\n/g, '');
  }

  return csv;
};

