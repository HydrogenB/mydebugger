/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * Client wrapper around the QPDF worker. Follows the same singleton +
 * postMessage/id pattern as src/tools/aes-cbc/lib/crypto-worker.ts.
 */
import { createQpdfWorker } from '../workers/createQpdfWorker';

export interface UnlockSuccess {
  ok: true;
  bytes: Uint8Array;
}

export interface UnlockFailure {
  ok: false;
  reason: 'wrong-password' | 'error';
  message: string;
}

export type UnlockResult = UnlockSuccess | UnlockFailure;

interface WorkerRequest {
  id: string;
  bytes: Uint8Array;
  password: string;
}

type WorkerResponse =
  | { id: string; ok: true; bytes: Uint8Array }
  | { id: string; ok: false; reason: 'wrong-password' | 'error'; message: string };

let worker: Worker | null = null;
const pending = new Map<string, (result: UnlockResult) => void>();

const generateRequestId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getWorker = (): Worker => {
  if (worker) return worker;

  worker = createQpdfWorker();

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    const resolve = pending.get(response.id);
    if (!resolve) return;
    pending.delete(response.id);
    resolve(
      response.ok
        ? { ok: true, bytes: response.bytes }
        : { ok: false, reason: response.reason, message: response.message },
    );
  };

  worker.onerror = () => {
    pending.forEach((resolve) => resolve({ ok: false, reason: 'error', message: 'Worker crashed' }));
    pending.clear();
  };

  return worker;
};

export const unlockPdf = (bytes: Uint8Array, password: string): Promise<UnlockResult> => {
  const id = generateRequestId();
  const activeWorker = getWorker();

  return new Promise((resolve) => {
    pending.set(id, resolve);
    const request: WorkerRequest = { id, bytes, password };
    activeWorker.postMessage(request, [bytes.buffer]);
  });
};

export const terminateQpdfWorker = (): void => {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  pending.clear();
};
