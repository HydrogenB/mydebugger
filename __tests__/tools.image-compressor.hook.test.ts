/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  FORMAT_KEY,
  MAX_FILES,
  useImageCompressor,
  WATCHDOG_MS,
} from '../src/tools/image-compressor/hooks/useImageCompressor';
import type { CompressResult, WorkerRequest, WorkerResponse } from '../src/tools/image-compressor/lib/types';

class FakeWorker {
  static all: FakeWorker[] = [];
  onmessage: ((e: MessageEvent<WorkerResponse>) => void) | null = null;
  posted: WorkerRequest[] = [];
  terminate = jest.fn();
  constructor() { FakeWorker.all.push(this); }
  postMessage(m: WorkerRequest) { this.posted.push(m); }
  emit(m: WorkerResponse) { act(() => { this.onmessage?.({ data: m } as MessageEvent<WorkerResponse>); }); }
}
const factory = () => new FakeWorker() as unknown as Worker;
const last = () => FakeWorker.all[FakeWorker.all.length - 1];
const file = (name: string, size = 10, type = 'image/png') => {
  const f = new File([new Uint8Array(size)], name, { type });
  return f;
};
const result = (): CompressResult => ({
  bytes: new Uint8Array(3), mime: 'image/webp', ext: 'webp',
  report: { pipeline: 'WebP q80', mode: 'visually-lossless', ssim: 0.995, inputBytes: 10, outputBytes: 3, cls: 'photo', warnings: [], skipped: [] },
});
const posted = async (n: number) => waitFor(() => expect(last().posted).toHaveLength(n));

beforeEach(() => {
  FakeWorker.all = [];
  localStorage.clear();
});

describe('useImageCompressor', () => {
  it('defaults to WebP and restores the saved format', () => {
    expect(renderHook(() => useImageCompressor(factory)).result.current.format).toBe('webp');
    localStorage.setItem(FORMAT_KEY, 'png');
    expect(renderHook(() => useImageCompressor(factory)).result.current.format).toBe('png');
  });

  it('processes files one at a time', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    act(() => r.current.addFiles([file('a.png'), file('b.png')]));
    await posted(1);
    expect(last().posted[0]).toMatchObject({ type: 'compress', jobId: 1, format: 'webp' });
    expect(r.current.items.map((i) => i.status)).toEqual(['working', 'queued']);

    last().emit({ type: 'progress', jobId: 1, step: 'WebP q80' });
    expect(r.current.items[0].step).toBe('WebP q80');

    last().emit({ type: 'done', jobId: 1, result: result() });
    await posted(2);
    expect(r.current.items[0].status).toBe('done');
    expect(r.current.items[1].status).toBe('working');
  });

  it('ignores messages for stale jobs', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    act(() => r.current.addFiles([file('a.png')]));
    await posted(1);
    last().emit({ type: 'done', jobId: 99, result: result() });
    expect(r.current.items[0].status).toBe('working');
  });

  it('marks a format unavailable on codec errors', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    act(() => r.current.addFiles([file('a.png')]));
    await posted(1);
    last().emit({ type: 'error', jobId: 1, code: 'codec', message: 'Couldn’t load the WEBP encoder' });
    expect(r.current.items[0]).toMatchObject({ status: 'error', error: 'Couldn’t load the WEBP encoder' });
    expect(r.current.unavailable).toEqual(['webp']);
  });

  it('changing the format restarts every valid file with a fresh worker', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    act(() => r.current.addFiles([file('a.png'), file('big.png', 60 * 1024 * 1024)]));
    await posted(1);
    const first = last();
    act(() => r.current.setFormat('png'));
    expect(first.terminate).toHaveBeenCalled();
    expect(localStorage.getItem(FORMAT_KEY)).toBe('png');
    await waitFor(() => expect(FakeWorker.all).toHaveLength(2));
    await posted(1);
    expect(last().posted[0].format).toBe('png');
    expect(r.current.items[1]).toMatchObject({ status: 'error', invalid: true });
  });

  it('rejects oversized, non-image and over-limit files without sending them', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    const many = Array.from({ length: MAX_FILES + 1 }, (_, k) => file(`f${k}.png`));
    act(() => r.current.addFiles([file('big.png', 60 * 1024 * 1024), file('notes.txt', 5, 'text/plain'), ...many]));
    const errors = r.current.items.filter((i) => i.status === 'error').map((i) => i.error);
    expect(errors).toContain('File is larger than 50 MB.');
    expect(errors).toContain('Not an image file.');
    expect(errors).toContain('Limit is 20 files at a time.');
    expect(r.current.items).toHaveLength(MAX_FILES + 3);
  });

  it('times out a stuck job and recreates the worker', async () => {
    jest.useFakeTimers();
    try {
      const { result: r } = renderHook(() => useImageCompressor(factory));
      act(() => r.current.addFiles([file('a.png'), file('b.png')]));
      await waitFor(() => expect(FakeWorker.all).toHaveLength(1));
      const stuck = last();
      act(() => { jest.advanceTimersByTime(WATCHDOG_MS + 1); });
      expect(stuck.terminate).toHaveBeenCalled();
      expect(r.current.items[0]).toMatchObject({ status: 'error', error: 'Timed out — this image took too long to process.' });
      expect(r.current.items[1].status).toBe('working');
    } finally {
      jest.useRealTimers();
    }
  });

  it('removes items and clears the queue', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    act(() => r.current.addFiles([file('a.png'), file('b.png')]));
    await posted(1);
    act(() => r.current.removeItem(r.current.items[1].id));
    expect(r.current.items).toHaveLength(1);
    act(() => r.current.clear());
    expect(r.current.items).toHaveLength(0);
    expect(last().terminate).toHaveBeenCalled();
  });
});
