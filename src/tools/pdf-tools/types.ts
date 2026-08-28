/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { ConvertedImage } from './lib/pdfConverter';

export type PdfOperation = 'unlock' | 'to-image';

export type RowStatus = 'pending' | 'processing' | 'done' | 'needs-password' | 'error';

export interface PdfToolRow {
  id: string;
  file: File;
  operation: PdfOperation;
  status: RowStatus;
  /** Per-row password override. Empty string means "use the shared default password". */
  password: string;
  errorMessage?: string;
  /** Set when operation === 'unlock' and status === 'done'. */
  unlockedBytes?: Uint8Array;
  /** Set when operation === 'to-image' and status === 'done'. */
  convertedImages?: ConvertedImage[];
}
