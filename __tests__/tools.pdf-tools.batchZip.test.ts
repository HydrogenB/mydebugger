/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { unzipSync } from 'fflate';
import { buildBatchZip } from '../src/tools/pdf-tools/lib/batchZip';
import type { PdfToolRow } from '../src/tools/pdf-tools/types';

const makeFile = (name: string): File => new File([new Uint8Array([1, 2, 3])], name, { type: 'application/pdf' });

describe('buildBatchZip', () => {
  test('includes unlocked PDF bytes under the original base name', async () => {
    const rows: PdfToolRow[] = [
      {
        id: '1',
        file: makeFile('secret.pdf'),
        operation: 'unlock',
        status: 'done',
        password: '',
        unlockedBytes: new Uint8Array([80, 68, 70]),
      },
    ];

    const zipBlob = await buildBatchZip(rows);
    const zipBytes = new Uint8Array(await zipBlob.arrayBuffer());
    const entries = unzipSync(zipBytes);

    expect(Object.keys(entries)).toEqual(['secret.pdf']);
    expect(Array.from(entries['secret.pdf'])).toEqual([80, 68, 70]);
  });

  test('nests to-image outputs under a folder named after the file', async () => {
    const imageBlob = new Blob([new Uint8Array([9, 9])], { type: 'image/png' });
    const rows: PdfToolRow[] = [
      {
        id: '2',
        file: makeFile('report.pdf'),
        operation: 'to-image',
        status: 'done',
        password: '',
        convertedImages: [
          { pageNumber: 1, blob: imageBlob, width: 10, height: 10, fileName: 'report_page_001.png' },
        ],
      },
    ];

    const zipBlob = await buildBatchZip(rows);
    const entries = unzipSync(new Uint8Array(await zipBlob.arrayBuffer()));

    expect(Object.keys(entries)).toEqual(['report/report_page_001.png']);
  });

  test('skips rows that are not done', async () => {
    const rows: PdfToolRow[] = [
      { id: '3', file: makeFile('pending.pdf'), operation: 'unlock', status: 'pending', password: '' },
    ];

    const zipBlob = await buildBatchZip(rows);
    const entries = unzipSync(new Uint8Array(await zipBlob.arrayBuffer()));

    expect(Object.keys(entries)).toEqual([]);
  });
});
