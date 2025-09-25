/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export type InputFormat = "auto" | "bson" | "ndjson" | "json-array";

export type FlattenStrategy = "index" | "join" | "explode";

export type SchemaMode = "two-pass" | "single-pass";

export type KeyOrder = "alpha" | "first-seen" | "custom";

export type NullPolicy = "empty" | "literal-null";

export interface CsvDialectOptions {
  delimiter: string;
  quote: string;
  newline: "\n" | "\r\n";
  includeBom: boolean;
  includeHeader: boolean;
}

export interface NumericOptions {
  stringifyIntegers: boolean;
  stringifyFloats: boolean;
}

export interface FlattenOptions {
  strategy: FlattenStrategy;
  joinDelimiter: string;
  maxArrayLength: number;
  explodeMaxRows: number;
}

export interface OutputOptions {
  splitEvery: number | null;
  zipOutput: boolean;
}

export interface PerformanceOptions {
  readChunkBytes: number;
  lineBufferLimit: number;
  discoverySampleRows: number;
}

export interface GeneralOptions {
  stopOnError: boolean;
  persistSchema: boolean;
  autoStartAfterDiscovery: boolean;
}

export interface ConverterOptions {
  format: InputFormat;
  flatten: FlattenOptions;
  schemaMode: SchemaMode;
  schemaKeyOrder: KeyOrder;
  nullPolicy: NullPolicy;
  csv: CsvDialectOptions;
  numerics: NumericOptions;
  output: OutputOptions;
  performance: PerformanceOptions;
  general: GeneralOptions;
}

export type ConversionPhase =
  | "idle"
  | "discovery"
  | "awaiting-schema"
  | "conversion"
  | "paused"
  | "cancelled"
  | "completed"
  | "failed";

export interface ConversionStats {
  bytesRead: number;
  rowsParsed: number;
  rowsWritten: number;
  colsDiscovered: number;
  elapsedMs: number;
  errors: number;
}

export interface ProgressPayload extends ConversionStats {
  phase: ConversionPhase;
  rateRowsPerSec: number;
  rateMBPerSec: number;
  etaSeconds: number | null;
}

export interface SchemaPayload {
  columns: string[];
  sample: Record<string, unknown>;
}

export interface LogEntry {
  level: "info" | "warn" | "error";
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
}

export interface OutputPart {
  filename: string;
  sizeBytes: number;
  href: string;
  rows: number;
  mimeType: string;
}

export interface WorkerStartMessage {
  type: "START";
  file: File;
  options: ConverterOptions;
}

export interface WorkerPauseMessage {
  type: "PAUSE" | "RESUME" | "CANCEL";
}

export interface WorkerWarmupMessage {
  type: "WARMUP";
}

export interface WorkerContinueMessage {
  type: "CONTINUE";
}

export type WorkerRequestMessage =
  | WorkerStartMessage
  | WorkerPauseMessage
  | WorkerWarmupMessage
  | WorkerContinueMessage;

export interface WorkerPhaseMessage {
  type: "PHASE";
  value: ConversionPhase;
}

export interface WorkerProgressMessage {
  type: "PROGRESS";
  payload: ProgressPayload;
}

export interface WorkerSchemaMessage {
  type: "SCHEMA";
  payload: SchemaPayload;
}

export interface WorkerLogMessage {
  type: "LOG";
  payload: LogEntry;
}

export interface WorkerPartReadyMessage {
  type: "PART_READY";
  payload: {
    partIndex: number;
    chunkIndex: number;
    buffer: ArrayBuffer;
    mimeType: string;
  };
}

export interface WorkerPartDoneMessage {
  type: "PART_DONE";
  payload: {
    partIndex: number;
    filename: string;
    rows: number;
    sizeBytes: number;
    mimeType: string;
  };
}

export interface WorkerDoneMessage {
  type: "DONE";
  payload: {
    outputs: OutputPart[];
    stats: ConversionStats;
    schema: SchemaPayload;
    log: LogEntry[];
  };
}

export interface WorkerFailedMessage {
  type: "FAILED";
  error: string;
}

export interface WorkerReadyMessage {
  type: "READY";
}

export type WorkerResponseMessage =
  | WorkerPhaseMessage
  | WorkerProgressMessage
  | WorkerSchemaMessage
  | WorkerLogMessage
  | WorkerPartReadyMessage
  | WorkerPartDoneMessage
  | WorkerDoneMessage
  | WorkerFailedMessage
  | WorkerReadyMessage;
