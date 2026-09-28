/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { compress, PipelineError } from '../lib/pipeline';
import type { WorkerRequest, WorkerResponse } from '../lib/types';

const post = (m: WorkerResponse) => (self as unknown as Worker).postMessage(m);

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { jobId, bytes, format } = e.data;
  try {
    const result = await compress(new Uint8Array(bytes), format, (step) => post({ type: 'progress', jobId, step }));
    post({ type: 'done', jobId, result });
  } catch (err) {
    post({
      type: 'error',
      jobId,
      code: err instanceof PipelineError ? err.code : 'internal',
      message: (err as Error).message || 'Something went wrong while compressing.',
    });
  }
};
