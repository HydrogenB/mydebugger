/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('../src/tools/pdf-tools/lib/qpdfClient', () => ({
  unlockPdf: jest.fn(),
}));
jest.mock('../src/tools/pdf-tools/lib/pdfConverter', () => ({
  validatePdfFile: jest.fn(() => ({ valid: true })),
  loadPdfDocument: jest.fn(),
  renderPageToImage: jest.fn(),
  parsePageRange: jest.fn(() => ({ pages: [1] })),
  createZipFromImages: jest.fn(async () => new Blob(['zip'])),
  downloadFile: jest.fn(),
}));

import { unlockPdf } from '../src/tools/pdf-tools/lib/qpdfClient';
import { downloadFile } from '../src/tools/pdf-tools/lib/pdfConverter';
import useBatchPdfTools from '../src/tools/pdf-tools/hooks/useBatchPdfTools';

const makeFile = (name: string): File => new File([new Uint8Array([1])], name, { type: 'application/pdf' });

describe('useBatchPdfTools', () => {
  beforeEach(() => jest.clearAllMocks());

  test('addFiles only accepts PDFs and defaults to the current bulk operation', () => {
    const { result } = renderHook(() => useBatchPdfTools());

    act(() => {
      result.current.addFiles([makeFile('a.pdf'), new File(['x'], 'b.txt', { type: 'text/plain' })]);
    });

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].file.name).toBe('a.pdf');
    expect(result.current.rows[0].operation).toBe('unlock');
    expect(result.current.rows[0].status).toBe('pending');
  });

  test('startAll unlocks a row and marks it done', async () => {
    (unlockPdf as jest.Mock).mockResolvedValue({ ok: true, bytes: new Uint8Array([9]) });
    const { result } = renderHook(() => useBatchPdfTools());

    act(() => {
      result.current.addFiles([makeFile('secret.pdf')]);
    });

    await act(async () => {
      await result.current.startAll();
    });

    expect(result.current.rows[0].status).toBe('done');
    expect(result.current.rows[0].unlockedBytes).toEqual(new Uint8Array([9]));
  });

  test('startAll flips a row to needs-password on a wrong password', async () => {
    (unlockPdf as jest.Mock).mockResolvedValue({ ok: false, reason: 'wrong-password', message: 'Incorrect password' });
    const { result } = renderHook(() => useBatchPdfTools());

    act(() => {
      result.current.addFiles([makeFile('locked.pdf')]);
    });

    await act(async () => {
      await result.current.startAll();
    });

    expect(result.current.rows[0].status).toBe('needs-password');
    expect(result.current.rows[0].errorMessage).toBe('Incorrect password');
  });

  test('retryRow re-runs with the row-level password after it is set', async () => {
    (unlockPdf as jest.Mock)
      .mockResolvedValueOnce({ ok: false, reason: 'wrong-password', message: 'Incorrect password' })
      .mockResolvedValueOnce({ ok: true, bytes: new Uint8Array([1]) });

    const { result } = renderHook(() => useBatchPdfTools());
    act(() => result.current.addFiles([makeFile('locked.pdf')]));
    await act(async () => {
      await result.current.startAll();
    });

    const rowId = result.current.rows[0].id;
    act(() => result.current.setRowPassword(rowId, 'correct-password'));
    await act(async () => {
      await result.current.retryRow(rowId);
    });

    expect(result.current.rows[0].status).toBe('done');
    expect(unlockPdf).toHaveBeenLastCalledWith(expect.any(Uint8Array), 'correct-password');
  });

  test('applyOperationToAll switches every row and resets status to pending', () => {
    const { result } = renderHook(() => useBatchPdfTools());
    act(() => result.current.addFiles([makeFile('a.pdf'), makeFile('b.pdf')]));

    act(() => result.current.setBulkOperation('to-image'));
    act(() => result.current.applyOperationToAll());

    expect(result.current.rows.every((row) => row.operation === 'to-image')).toBe(true);
    expect(result.current.rows.every((row) => row.status === 'pending')).toBe(true);
  });

  test('downloadRow downloads the unlocked PDF under its original name', async () => {
    (unlockPdf as jest.Mock).mockResolvedValue({ ok: true, bytes: new Uint8Array([1, 2]) });
    const { result } = renderHook(() => useBatchPdfTools());
    act(() => result.current.addFiles([makeFile('secret.pdf')]));
    await act(async () => {
      await result.current.startAll();
    });

    await act(async () => {
      await result.current.downloadRow(result.current.rows[0].id);
    });

    expect(downloadFile).toHaveBeenCalledWith(expect.any(Blob), 'secret.pdf');
  });

  test('an edit made mid-processing is not clobbered by the stale result', async () => {
    let resolveUnlock: (value: { ok: true; bytes: Uint8Array }) => void = () => {};
    (unlockPdf as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveUnlock = resolve;
      }),
    );

    const { result } = renderHook(() => useBatchPdfTools());
    act(() => result.current.addFiles([makeFile('secret.pdf')]));
    const rowId = result.current.rows[0].id;

    let startPromise!: Promise<void>;
    act(() => {
      startPromise = result.current.startAll();
    });

    await waitFor(() => expect(result.current.rows[0].status).toBe('processing'));

    act(() => {
      result.current.setRowPassword(rowId, 'user-typed-password');
    });

    await act(async () => {
      resolveUnlock({ ok: true, bytes: new Uint8Array([9]) });
      await startPromise;
    });

    expect(result.current.rows[0].status).toBe('done');
    expect(result.current.rows[0].password).toBe('user-typed-password');
  });

  test('removeRow drops the row from state', () => {
    const { result } = renderHook(() => useBatchPdfTools());
    act(() => result.current.addFiles([makeFile('a.pdf')]));
    const rowId = result.current.rows[0].id;

    act(() => result.current.removeRow(rowId));

    expect(result.current.rows).toHaveLength(0);
  });
});
