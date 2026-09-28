/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createCompressWorker } from '../workers/createCompressWorker';
import {
  OUTPUT_FORMATS,
  type CompressResult,
  type OutputFormat,
  type WorkerRequest,
  type WorkerResponse,
} from '../lib/types';

export const MAX_FILES = 20;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const WATCHDOG_MS = 60_000;
export const FORMAT_KEY = 'image-compressor-format';

export type ItemStatus = 'queued' | 'working' | 'done' | 'error';

export interface QueueItem {
  id: number;
  file: File;
  status: ItemStatus;
  step: string;
  result?: CompressResult;
  error?: string;
  /** Rejected before processing (too big, not an image, over the limit) — never retried. */
  invalid?: boolean;
}

const readFormat = (): OutputFormat => {
  try {
    const saved = localStorage.getItem(FORMAT_KEY) as OutputFormat | null;
    return saved && OUTPUT_FORMATS.includes(saved) ? saved : 'webp';
  } catch {
    return 'webp';
  }
};

interface ActiveJob {
  jobId: number;
  itemId: number;
  format: OutputFormat;
}

export const useImageCompressor = (createWorker: () => Worker = createCompressWorker) => {
  const [format, setFormatState] = useState<OutputFormat>(readFormat);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [unavailable, setUnavailable] = useState<OutputFormat[]>([]);

  const workerRef = useRef<Worker | null>(null);
  const activeRef = useRef<ActiveJob | null>(null);
  const watchdogRef = useRef<number | undefined>(undefined);
  const jobSeq = useRef(0);
  const idSeq = useRef(0);

  const patch = useCallback((id: number, p: Partial<QueueItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));
  }, []);

  const stopWorker = useCallback(() => {
    window.clearTimeout(watchdogRef.current);
    workerRef.current?.terminate();
    workerRef.current = null;
    activeRef.current = null;
  }, []);

  const armWatchdog = useCallback(() => {
    window.clearTimeout(watchdogRef.current);
    watchdogRef.current = window.setTimeout(() => {
      const job = activeRef.current;
      if (!job) return;
      stopWorker();
      patch(job.itemId, { status: 'error', step: '', error: 'Timed out — this image took too long to process.' });
    }, WATCHDOG_MS);
  }, [patch, stopWorker]);

  const onMessage = useCallback((m: WorkerResponse) => {
    const job = activeRef.current;
    if (!job || m.jobId !== job.jobId) return;
    if (m.type === 'progress') {
      armWatchdog();
      patch(job.itemId, { step: m.step });
      return;
    }
    window.clearTimeout(watchdogRef.current);
    activeRef.current = null;
    if (m.type === 'done') {
      patch(job.itemId, { status: 'done', step: '', result: m.result });
    } else {
      if (m.code === 'codec') {
        setUnavailable((u) => (u.includes(job.format) ? u : [...u, job.format]));
      }
      patch(job.itemId, { status: 'error', step: '', error: m.message });
    }
  }, [armWatchdog, patch]);

  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      const w = createWorker();
      w.onmessage = (e: MessageEvent<WorkerResponse>) => onMessageRef.current(e.data);
      workerRef.current = w;
    }
    return workerRef.current;
  }, [createWorker]);

  // Start the next queued item whenever nothing is running.
  useEffect(() => {
    if (activeRef.current) return;
    const next = items.find((it) => it.status === 'queued');
    if (!next) return;
    jobSeq.current += 1;
    const job: ActiveJob = { jobId: jobSeq.current, itemId: next.id, format };
    activeRef.current = job;
    patch(next.id, { status: 'working', step: 'Reading file' });
    armWatchdog();
    next.file.arrayBuffer().then(
      (bytes) => {
        if (activeRef.current?.jobId !== job.jobId) return;
        const msg: WorkerRequest = { type: 'compress', jobId: job.jobId, bytes, format: job.format };
        getWorker().postMessage(msg, [bytes]);
      },
      () => {
        if (activeRef.current?.jobId !== job.jobId) return;
        window.clearTimeout(watchdogRef.current);
        activeRef.current = null;
        patch(job.itemId, { status: 'error', step: '', error: 'Couldn’t read this file.' });
      },
    );
  }, [items, format, patch, armWatchdog, getWorker]);

  useEffect(() => stopWorker, [stopWorker]);

  const addFiles = useCallback((files: File[]) => {
    setItems((prev) => {
      let room = MAX_FILES - prev.length;
      const added = files.map((file): QueueItem => {
        idSeq.current += 1;
        const base = { id: idSeq.current, file, step: '' };
        room -= 1;
        if (room < 0) return { ...base, status: 'error', invalid: true, error: `Limit is ${MAX_FILES} files at a time.` };
        if (file.type && !file.type.startsWith('image/')) return { ...base, status: 'error', invalid: true, error: 'Not an image file.' };
        if (file.size > MAX_FILE_BYTES) return { ...base, status: 'error', invalid: true, error: 'File is larger than 50 MB.' };
        return { ...base, status: 'queued' };
      });
      return [...prev, ...added];
    });
  }, []);

  const setFormat = useCallback((next: OutputFormat) => {
    try {
      localStorage.setItem(FORMAT_KEY, next);
    } catch {
      // storage blocked — the choice just won't persist
    }
    stopWorker();
    setFormatState(next);
    setItems((prev) => prev.map((it) => (it.invalid ? it : { ...it, status: 'queued', step: '', result: undefined, error: undefined })));
  }, [stopWorker]);

  const removeItem = useCallback((id: number) => {
    if (activeRef.current?.itemId === id) stopWorker();
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, [stopWorker]);

  const clear = useCallback(() => {
    stopWorker();
    setItems([]);
  }, [stopWorker]);

  return { format, setFormat, items, addFiles, removeItem, clear, unavailable };
};

export type UseImageCompressorReturn = ReturnType<typeof useImageCompressor>;
