/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { zipSync } from 'fflate';
import type { PdfToolRow } from '../types';

const blobToUint8Array = async (blob: Blob): Promise<Uint8Array> => new Uint8Array(await blob.arrayBuffer());

/**
 * Bundle every completed row's output into a single ZIP. Unlocked PDFs go in
 * as `<NN>-<name>.pdf`; to-image outputs are flattened under a `<NN>-<name>/`
 * folder (no zip-in-zip — a single ZIP is easier to open than nested
 * archives). The index prefix keeps entries unique (and in table order) even
 * when two rows share a base filename — a normal batch scenario when files
 * come from different folders.
 */
export const buildBatchZip = async (rows: PdfToolRow[]): Promise<Blob> => {
  const files: Record<string, Uint8Array> = {};

  for (const [index, row] of rows.entries()) {
    if (row.status !== 'done') continue;
    const baseName = row.file.name.replace(/\.pdf$/i, '');
    const prefix = String(index + 1).padStart(2, '0');

    if (row.operation === 'unlock' && row.unlockedBytes) {
      files[`${prefix}-${baseName}.pdf`] = row.unlockedBytes;
    } else if (row.operation === 'to-image' && row.convertedImages) {
      // eslint-disable-next-line no-await-in-loop
      for (const image of row.convertedImages) {
        // eslint-disable-next-line no-await-in-loop
        files[`${prefix}-${baseName}/${image.fileName}`] = await blobToUint8Array(image.blob);
      }
    }
  }

  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped], { type: 'application/zip' });
};
