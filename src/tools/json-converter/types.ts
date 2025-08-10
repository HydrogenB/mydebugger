/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface OutputOptions {
  delimiter: string;
  includeHeader: boolean;
  suppressNewlines: boolean;
  flatten: boolean;
  pivot: boolean;
  dateFormat: string;
  forceQuotes: boolean;
  objectPath: string;
  upgradeToArray: boolean;
  useAltMode: boolean;
  eol: 'LF' | 'CRLF';
}
