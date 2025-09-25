/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import type { ConverterOptions } from "../types";

export const DEFAULT_OPTIONS: ConverterOptions = {
  format: "auto",
  flatten: {
    strategy: "index",
    joinDelimiter: "|",
    maxArrayLength: 32,
    explodeMaxRows: 5000,
  },
  schemaMode: "two-pass",
  schemaKeyOrder: "alpha",
  nullPolicy: "empty",
  csv: {
    delimiter: ",",
    quote: '"',
    newline: "\n",
    includeBom: false,
    includeHeader: true,
  },
  numerics: {
    stringifyIntegers: true,
    stringifyFloats: true,
  },
  output: {
    splitEvery: 100_000,
    zipOutput: true,
  },
  performance: {
    readChunkBytes: 8 * 1024 * 1024,
    lineBufferLimit: 4 * 1024 * 1024,
    discoverySampleRows: 50_000,
  },
  general: {
    stopOnError: false,
    persistSchema: true,
    autoStartAfterDiscovery: true,
  },
};

export default DEFAULT_OPTIONS;
