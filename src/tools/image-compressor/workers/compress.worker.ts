/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { compress, PipelineError } from '../lib/pipeline';
import type { WorkerRequest, WorkerResponse } from '../lib/types';

const post = (m: WorkerResponse, transfer: Transferable[] = []) =>
  (self as unknown as Worker).postMessage(m, transfer);

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { jobId, bytes, format } = e.data;
  try {
    const result = await compress(new Uint8Array(bytes), format, (step) => post({ type: 'progress', jobId, step }));
    // Transfer instead of structured-cloning; copy first when the bytes are a view or are the input.
    const out = result.bytes;
    const owned = out.buffer !== bytes && out.byteOffset === 0 && out.byteLength === out.buffer.byteLength;
    const payload = owned ? out : out.slice();
    post({ type: 'done', jobId, result: { ...result, bytes: payload } }, [payload.buffer]);
  } catch (err) {
    post({
      type: 'error',
      jobId,
      code: err instanceof PipelineError ? err.code : 'internal',
      message: (err as Error).message || 'Something went wrong while compressing.',
    });
  }
};
