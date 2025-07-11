/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import flattenJSON from './flattenJSON';

export interface ExcelOptions {
  flatten?: boolean;
  dateFormat?: string;
}

export const exportToExcel = async (
  data: unknown,
  fileName: string,
  options: ExcelOptions = {},
): Promise<void> => {
  const { default: XLSX } = await import('xlsx');
  const { flatten = false, dateFormat } = options;
  const arr = Array.isArray(data) ? data : [data];
  const rows = arr.map((d) =>
    flatten ? flattenJSON(d as Record<string, unknown>, '', {}, dateFormat) : d,
  );
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

