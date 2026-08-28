/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * Orchestrates the batch file list: adding files, per-row or bulk operation
 * assignment, running each row through the right pipeline (QPDF unlock or
 * pdf.js image conversion), and downloads.
 */
import { useCallback, useState } from 'react';
import {
  validatePdfFile,
  loadPdfDocument,
  renderPageToImage,
  parsePageRange,
  createZipFromImages,
  downloadFile,
} from '../lib/pdfConverter';
import { unlockPdf } from '../lib/qpdfClient';
import { buildBatchZip } from '../lib/batchZip';
import type { PdfOperation, PdfToolRow } from '../types';

export interface UseBatchPdfToolsReturn {
  rows: PdfToolRow[];
  defaultPassword: string;
  bulkOperation: PdfOperation;
  setDefaultPassword: (password: string) => void;
  setBulkOperation: (operation: PdfOperation) => void;
  addFiles: (files: FileList | File[]) => void;
  applyOperationToAll: () => void;
  setRowOperation: (rowId: string, operation: PdfOperation) => void;
  setRowPassword: (rowId: string, password: string) => void;
  removeRow: (rowId: string) => void;
  startAll: () => Promise<void>;
  retryRow: (rowId: string) => Promise<void>;
  downloadRow: (rowId: string) => Promise<void>;
  downloadAllAsZip: () => Promise<void>;
  clearAll: () => void;
}

const generateRowId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const runRow = async (row: PdfToolRow, password: string): Promise<PdfToolRow> => {
  if (row.operation === 'unlock') {
    const bytes = new Uint8Array(await row.file.arrayBuffer());
    const result = await unlockPdf(bytes, password);

    if (result.ok) {
      return { ...row, status: 'done', errorMessage: undefined, unlockedBytes: result.bytes };
    }
    if (result.reason === 'wrong-password') {
      return { ...row, status: 'needs-password', errorMessage: result.message };
    }
    return { ...row, status: 'error', errorMessage: result.message };
  }

  try {
    const validation = validatePdfFile(row.file);
    if (!validation.valid) {
      return { ...row, status: 'error', errorMessage: validation.error };
    }

    const { pdf, info } = await loadPdfDocument(row.file, password || undefined);
    const { pages } = parsePageRange('', info.pageCount);
    const images = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const pageNumber of pages) {
      // eslint-disable-next-line no-await-in-loop
      images.push(await renderPageToImage(pdf, pageNumber, { scale: 2, format: 'png', quality: 0.9 }, row.file.name));
    }
    pdf.destroy();

    return { ...row, status: 'done', errorMessage: undefined, convertedImages: images };
  } catch (err) {
    const error = err as Error;
    if (error.name === 'PasswordException' || error.message?.includes('password')) {
      return { ...row, status: 'needs-password', errorMessage: 'Incorrect password' };
    }
    return { ...row, status: 'error', errorMessage: error.message || 'Failed to convert PDF' };
  }
};

const useBatchPdfTools = (): UseBatchPdfToolsReturn => {
  const [rows, setRows] = useState<PdfToolRow[]>([]);
  const [defaultPassword, setDefaultPassword] = useState('');
  const [bulkOperation, setBulkOperation] = useState<PdfOperation>('unlock');

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files).filter((file) => file.type === 'application/pdf');
      setRows((prev) => [
        ...prev,
        ...incoming.map(
          (file): PdfToolRow => ({
            id: generateRowId(),
            file,
            operation: bulkOperation,
            status: 'pending',
            password: '',
          }),
        ),
      ]);
    },
    [bulkOperation],
  );

  const applyOperationToAll = useCallback(() => {
    setRows((prev) =>
      prev.map((row) => ({ ...row, operation: bulkOperation, status: 'pending', errorMessage: undefined })),
    );
  }, [bulkOperation]);

  const setRowOperation = useCallback((rowId: string, operation: PdfOperation) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, operation, status: 'pending', errorMessage: undefined } : row)),
    );
  }, []);

  const setRowPassword = useCallback((rowId: string, password: string) => {
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, password } : row)));
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  }, []);

  const runAndStore = useCallback(
    async (row: PdfToolRow) => {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'processing' } : r)));
      const password = row.password || defaultPassword;
      const result = await runRow(row, password);
      setRows((prev) => prev.map((r) => (r.id === row.id ? result : r)));
    },
    [defaultPassword],
  );

  const startAll = useCallback(async () => {
    const pendingRows = rows.filter((row) => row.status === 'pending');
    // eslint-disable-next-line no-restricted-syntax
    for (const row of pendingRows) {
      // eslint-disable-next-line no-await-in-loop
      await runAndStore(row);
    }
  }, [rows, runAndStore]);

  const retryRow = useCallback(
    async (rowId: string) => {
      const row = rows.find((r) => r.id === rowId);
      if (row) await runAndStore(row);
    },
    [rows, runAndStore],
  );

  const downloadRow = useCallback(
    async (rowId: string) => {
      const row = rows.find((r) => r.id === rowId);
      if (!row || row.status !== 'done') return;

      const baseName = row.file.name.replace(/\.pdf$/i, '');
      if (row.operation === 'unlock' && row.unlockedBytes) {
        downloadFile(new Blob([row.unlockedBytes], { type: 'application/pdf' }), `${baseName}.pdf`);
      } else if (row.operation === 'to-image' && row.convertedImages) {
        const zipBlob = await createZipFromImages(row.convertedImages, baseName);
        downloadFile(zipBlob, `${baseName}_images.zip`);
      }
    },
    [rows],
  );

  const downloadAllAsZip = useCallback(async () => {
    const zipBlob = await buildBatchZip(rows);
    downloadFile(zipBlob, 'pdf-tools-batch.zip');
  }, [rows]);

  const clearAll = useCallback(() => setRows([]), []);

  return {
    rows,
    defaultPassword,
    bulkOperation,
    setDefaultPassword,
    setBulkOperation,
    addFiles,
    applyOperationToAll,
    setRowOperation,
    setRowPassword,
    removeRow,
    startAll,
    retryRow,
    downloadRow,
    downloadAllAsZip,
    clearAll,
  };
};

export default useBatchPdfTools;
