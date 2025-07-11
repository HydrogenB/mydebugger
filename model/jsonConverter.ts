/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { convertToCSV } from '../src/utils/convertToCSV';
import { exportToExcel } from '../src/utils/exportToExcel';
import type { CsvOptions } from '../src/utils/convertToCSV';
import type { ExcelOptions } from '../src/utils/exportToExcel';

export const parseJson = (
  text: string,
): Record<string, unknown>[] => {
  try {
    const data = JSON.parse(text.trim());
    return Array.isArray(data) ? data : [data];
  } catch {
    throw new Error('Invalid JSON input');
  }
};

export const fetchJsonFromUrl = async (url: string): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed with ${res.status}`);
  const text = await res.text();
  JSON.parse(text); // validate
  return text;
};

export const convertJsonToCsv = (
  text: string,
  options: CsvOptions,
): string => {
  const data = parseJson(text);
  return convertToCSV(data, options);
};

export const convertJsonToExcel = async (
  text: string,
  fileName: string,
  options: ExcelOptions,
): Promise<void> => {
  const data = parseJson(text);
  await exportToExcel(data, fileName, options);
};
