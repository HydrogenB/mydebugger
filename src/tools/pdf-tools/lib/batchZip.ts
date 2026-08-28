/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { zipSync } from 'fflate';
import type { PdfToolRow } from '../types';

const blobToUint8Array = async (blob: Blob): Promise<Uint8Array> => new Uint8Array(await blob.arrayBuffer());

/**
 * Bundle every completed row's output into a single ZIP. Unlocked PDFs go in
 * as `<name>.pdf`; to-image outputs are flattened under a `<name>/` folder
 * (no zip-in-zip — a single ZIP is easier to open than nested archives).
 */
export const buildBatchZip = async (rows: PdfToolRow[]): Promise<Blob> => {
  const files: Record<string, Uint8Array> = {};

  for (const row of rows) {
    if (row.status !== 'done') continue;
    const baseName = row.file.name.replace(/\.pdf$/i, '');

    if (row.operation === 'unlock' && row.unlockedBytes) {
      files[`${baseName}.pdf`] = row.unlockedBytes;
    } else if (row.operation === 'to-image' && row.convertedImages) {
      // eslint-disable-next-line no-await-in-loop
      for (const image of row.convertedImages) {
        // eslint-disable-next-line no-await-in-loop
        files[`${baseName}/${image.fileName}`] = await blobToUint8Array(image.blob);
      }
    }
  }

  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped], { type: 'application/zip' });
};
