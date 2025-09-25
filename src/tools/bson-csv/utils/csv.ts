/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import type { CsvDialectOptions } from "../types";

export function csvCell(value: string, opts: CsvDialectOptions): string {
  const { delimiter, quote } = opts;
  if (value == null) return "";
  const needsQuote =
    value.includes("\n") || value.includes("\r") || value.includes(delimiter) || value.includes(quote);
  if (!needsQuote) return value;
  return quote + replaceAllStr(value, quote, quote + quote) + quote;
}

export function encodeRow(cells: string[], opts: CsvDialectOptions): string {
  return cells.map((c) => csvCell(c, opts)).join(opts.delimiter) + opts.newline;
}

export function encodeHeader(columns: string[], opts: CsvDialectOptions, includeBom: boolean): Uint8Array {
  const line = encodeRow(columns, opts);
  const enc = new TextEncoder();
  const bytes = enc.encode(line);
  if (!includeBom) return bytes;
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const merged = new Uint8Array(bom.length + bytes.length);
  merged.set(bom, 0);
  merged.set(bytes, bom.length);
  return merged;
}

function replaceAllStr(s: string, search: string, replacement: string): string {
  if (search === "") return s;
  return s.split(search).join(replacement);
}
