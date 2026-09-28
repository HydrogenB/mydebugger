/**
 * © 2026 MyDebugger Contributors – MIT License
 */
export type OutputFormat = 'png' | 'jpg' | 'webp' | 'gif' | 'bmp';
export type SourceFormat = OutputFormat | 'unknown';
/** 'original' = compress in each file's own format (the default). */
export type FormatChoice = OutputFormat | 'original';
export type ImageClass = 'photo' | 'ui' | 'flat';

/** Structural stand-in for ImageData (jsdom has no ImageData). */
export interface Pixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface Frame {
  data: Pixels;
  delayMs: number;
}

export interface DecodedImage {
  frames: Frame[];
  width: number;
  height: number;
  source: SourceFormat;
  warnings: string[];
}

export interface Analysis {
  hasAlpha: boolean;
  animated: boolean;
  /** Exact unique RGBA count, or COLOR_CAP + 1 when over the cap. */
  colorCount: number;
  flatRatio: number;
  cls: ImageClass;
}

export interface EncodeOutput {
  bytes: Uint8Array;
  /** Pixels a viewer will see. Lossless candidates may return the input frames. */
  frames: Frame[];
}

export interface Candidate {
  label: string;
  lossless: boolean;
  run: () => Promise<EncodeOutput>;
}

/** Candidates ordered most aggressive (smallest expected) first. */
export interface Family {
  name: string;
  candidates: Candidate[];
}

export interface FormatPlan {
  families: Family[];
  warnings: string[];
  /** What the candidates are judged against (e.g. first frame only, or flattened for JPG). */
  reference: Frame[];
}

export type Mode = 'lossless' | 'visually-lossless' | 'below-target' | 'already-optimal';

export interface Report {
  pipeline: string;
  mode: Mode;
  ssim: number | null;
  inputBytes: number;
  outputBytes: number;
  cls: ImageClass;
  warnings: string[];
  skipped: string[];
}

export interface CompressResult {
  bytes: Uint8Array;
  mime: string;
  ext: OutputFormat;
  report: Report;
}

export type ErrorCode = 'decode' | 'too-big' | 'codec' | 'internal';

export type WorkerRequest = {
  type: 'compress';
  jobId: number;
  bytes: ArrayBuffer;
  format: FormatChoice;
};

export type WorkerResponse =
  | { type: 'progress'; jobId: number; step: string }
  | { type: 'done'; jobId: number; result: CompressResult }
  | { type: 'error'; jobId: number; code: ErrorCode; message: string };

export const OUTPUT_FORMATS: OutputFormat[] = ['png', 'jpg', 'webp', 'gif', 'bmp'];

export const MIME: Record<OutputFormat, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
};

export const COLOR_CAP = 4096;
export const MAX_STATIC_PIXELS = 40_000_000;
export const MAX_ANIMATED_PIXELS = 100_000_000;
