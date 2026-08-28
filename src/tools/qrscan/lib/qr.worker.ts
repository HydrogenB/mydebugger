/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * QR decode worker. Owns no UI state — receives transferred ImageData buffers,
 * runs the multi-engine cascade, and posts the first match (or null) back.
 */
/// <reference lib="webworker" />
import {
  createBarcodeDetectorIfAvailable,
  runEngineCascade,
  type CascadeMatch,
  type RunLevel,
} from './qrCascade';

declare const self: DedicatedWorkerGlobalScope;

export interface DecodeRequest {
  type: 'decode';
  jobId: number;
  width: number;
  height: number;
  buffer: ArrayBuffer;
  runLevel?: RunLevel;
}

export interface DecodeResponse {
  type: 'result';
  jobId: number;
  result: CascadeMatch | null;
  decodeMs: number;
}

const detector = createBarcodeDetectorIfAvailable(
  self as unknown as { BarcodeDetector?: new (init: { formats: string[] }) => never },
  ['qr_code'],
);

const now = (): number =>
  (typeof performance !== 'undefined' ? performance.now() : Date.now());

self.onmessage = async (event: MessageEvent<DecodeRequest>) => {
  const data = event.data;
  if (!data || data.type !== 'decode') return;

  const startedAt = now();
  let result: CascadeMatch | null = null;
  try {
    const imageData = new ImageData(
      new Uint8ClampedArray(data.buffer),
      data.width,
      data.height,
    );
    result = await runEngineCascade(imageData, data.runLevel ?? 'full', { detector });
  } catch {
    result = null;
  }

  const reply: DecodeResponse = {
    type: 'result',
    jobId: data.jobId,
    result,
    decodeMs: now() - startedAt,
  };
  self.postMessage(reply);
};

export {};
