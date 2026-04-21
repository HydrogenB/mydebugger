/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * ScannerController — runs the camera preview render loop on the main thread and
 * dispatches decode work to a Web Worker. The render loop never awaits the worker;
 * frames are dropped if the worker is still busy.
 */
import {
  nextDownscaledWidth,
  pickRunLevel,
  shouldDownscale,
  type DecodeEngineName,
  type RunLevel,
} from './qrCascade';
import type { DecodeRequest, DecodeResponse } from './qr.worker';
import { createDefaultQrWorker } from './defaultQrWorker';

export interface ScannerStartOptions {
  video: HTMLVideoElement;
  deviceId?: string;
  onResult: (text: string, engine: DecodeEngineName) => void;
  onError?: (error: Error) => void;
  initialWidth?: number;
  minWidth?: number;
  maxDecodeMs?: number;
  runLevelPattern?: readonly RunLevel[];
  workerFactory?: () => Worker;
}

export interface ScannerHandle {
  stop: () => void;
  getStream: () => MediaStream | null;
  getLastDecodeMs: () => number;
  getCanvasSize: () => { width: number; height: number };
}

const DEFAULT_INITIAL_WIDTH = 640;
const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MAX_DECODE_MS = 30;

const buildConstraints = (
  deviceId: string | undefined,
  idealWidth: number,
): MediaStreamConstraints => {
  const videoConstraints: MediaTrackConstraints = deviceId
    ? { deviceId: { exact: deviceId }, width: { ideal: idealWidth } }
    : { facingMode: { ideal: 'environment' }, width: { ideal: idealWidth } };
  return { audio: false, video: videoConstraints };
};

export const startScanner = async (
  options: ScannerStartOptions,
): Promise<ScannerHandle> => {
  const {
    video,
    deviceId,
    onResult,
    onError,
    initialWidth = DEFAULT_INITIAL_WIDTH,
    minWidth = DEFAULT_MIN_WIDTH,
    maxDecodeMs = DEFAULT_MAX_DECODE_MS,
    runLevelPattern,
    workerFactory = createDefaultQrWorker,
  } = options;

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera APIs are not available in this environment.');
  }

  const stream = await navigator.mediaDevices.getUserMedia(
    buildConstraints(deviceId, initialWidth),
  );

  video.srcObject = stream;
  video.muted = true;
  video.setAttribute('playsinline', 'true');
  try {
    await video.play();
  } catch (playError) {
    stream.getTracks().forEach((track) => track.stop());
    throw playError instanceof Error ? playError : new Error(String(playError));
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    stream.getTracks().forEach((track) => track.stop());
    throw new Error('Unable to acquire 2D canvas context for QR decoding.');
  }

  const worker = workerFactory();

  let stopped = false;
  let rafId = 0;
  let decoding = false;
  let frameIndex = 0;
  let lastDecodeMs = 0;
  let pendingJobId = 0;
  let nextJobId = 1;
  let currentWidth = initialWidth;

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    try {
      worker.terminate();
    } catch {
      // ignore — worker may already be detached
    }
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // ignore
      }
    });
    if (video.srcObject === stream) {
      video.srcObject = null;
    }
  };

  worker.onmessage = (event: MessageEvent<DecodeResponse>) => {
    const data = event.data;
    if (!data || data.type !== 'result') return;

    decoding = false;
    lastDecodeMs = data.decodeMs;

    if (shouldDownscale(lastDecodeMs, currentWidth, maxDecodeMs, minWidth)) {
      currentWidth = nextDownscaledWidth(currentWidth, minWidth);
    }

    if (data.jobId !== pendingJobId) return;
    if (data.result) {
      onResult(data.result.text, data.result.engine);
    }
  };

  worker.onerror = (err) => {
    decoding = false;
    onError?.(new Error(err.message || 'QR decode worker error'));
  };

  const renderFrame = () => {
    if (stopped) return;
    rafId = requestAnimationFrame(renderFrame);

    if (
      video.readyState < video.HAVE_ENOUGH_DATA ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return;
    }

    const aspect = video.videoHeight / video.videoWidth;
    const targetWidth = Math.min(currentWidth, video.videoWidth);
    const targetHeight = Math.max(1, Math.round(targetWidth * aspect));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (decoding) return;

    decoding = true;
    const thisFrameIndex = frameIndex;
    frameIndex += 1;
    pendingJobId = nextJobId;
    nextJobId += 1;

    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (drawError) {
      decoding = false;
      onError?.(drawError instanceof Error ? drawError : new Error(String(drawError)));
      return;
    }

    const buffer = imageData.data.buffer;
    const message: DecodeRequest = {
      type: 'decode',
      jobId: pendingJobId,
      width: imageData.width,
      height: imageData.height,
      buffer,
      runLevel: pickRunLevel(thisFrameIndex, runLevelPattern),
    };

    try {
      worker.postMessage(message, [buffer]);
    } catch (postError) {
      decoding = false;
      onError?.(postError instanceof Error ? postError : new Error(String(postError)));
    }
  };

  rafId = requestAnimationFrame(renderFrame);

  return {
    stop: cleanup,
    getStream: () => (stopped ? null : stream),
    getLastDecodeMs: () => lastDecodeMs,
    getCanvasSize: () => ({ width: canvas.width, height: canvas.height }),
  };
};
