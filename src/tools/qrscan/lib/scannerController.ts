/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * ScannerController — runs the camera preview render loop on the main thread and
 * dispatches decode work to a Web Worker. The render loop never awaits the worker;
 * frames are dropped if the worker is still busy.
 *
 * Edge cases covered:
 *   - Camera track ends mid-scan (permission revoked, device unplugged)
 *   - Worker replies arriving after stop() are ignored
 *   - Wedged worker (no reply within decodeTimeoutMs) is terminated + surfaced
 *   - Tab backgrounded — skip posting to save CPU (rAF is already throttled)
 *   - `onResult` throwing does not corrupt controller state
 *   - getImageData / postMessage failures reset the decoding flag
 *   - onmessageerror (structured clone failures)
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

export interface DecodeAttemptMeta {
  /** Engine that produced the hit, or null if every engine missed. */
  engine: DecodeEngineName | null;
  matched: boolean;
  decodeMs: number;
  runLevel: RunLevel;
  canvasWidth: number;
  canvasHeight: number;
}

export interface ScannerStartOptions {
  video: HTMLVideoElement;
  deviceId?: string;
  onResult: (text: string, engine: DecodeEngineName, decodeMs: number) => void;
  /** Fires after every worker reply (hit or miss) — use for live performance HUD. */
  onDecodeAttempt?: (meta: DecodeAttemptMeta) => void;
  onError?: (error: Error) => void;
  initialWidth?: number;
  minWidth?: number;
  maxDecodeMs?: number;
  /** Watchdog timeout — if the worker doesn't reply within this many ms, treat
   * it as wedged, surface an error, and stop. Default 3000. Pass 0 to disable. */
  decodeTimeoutMs?: number;
  /** Skip decoding while the document is hidden (default true). */
  pauseWhenHidden?: boolean;
  runLevelPattern?: readonly RunLevel[];
  workerFactory?: () => Worker;
  /** Crop the decode canvas to the centered square (matches the AR reticle).
   * Decoding only the area the user is aiming at speeds up jsQR substantially
   * and avoids wasted work on background pixels. Default false. */
  cropToCenterSquare?: boolean;
  /** Ideal camera height; pairs with initialWidth. Default 720. */
  initialHeight?: number;
}

export interface ScannerHandle {
  stop: () => void;
  getStream: () => MediaStream | null;
  getLastDecodeMs: () => number;
  getCanvasSize: () => { width: number; height: number };
}

const DEFAULT_INITIAL_WIDTH = 1280;
const DEFAULT_INITIAL_HEIGHT = 720;
const DEFAULT_MIN_WIDTH = 480;
const DEFAULT_MAX_DECODE_MS = 30;
const DEFAULT_DECODE_TIMEOUT_MS = 3000;

const buildConstraints = (
  deviceId: string | undefined,
  idealWidth: number,
  idealHeight: number,
): MediaStreamConstraints => {
  const base: MediaTrackConstraints = {
    width: { ideal: idealWidth },
    height: { ideal: idealHeight },
  };
  const videoConstraints: MediaTrackConstraints = deviceId
    ? { ...base, deviceId: { exact: deviceId } }
    : { ...base, facingMode: { ideal: 'environment' } };
  return { audio: false, video: videoConstraints };
};

export const startScanner = async (
  options: ScannerStartOptions,
): Promise<ScannerHandle> => {
  const {
    video,
    deviceId,
    onResult,
    onDecodeAttempt,
    onError,
    initialWidth = DEFAULT_INITIAL_WIDTH,
    initialHeight = DEFAULT_INITIAL_HEIGHT,
    minWidth = DEFAULT_MIN_WIDTH,
    maxDecodeMs = DEFAULT_MAX_DECODE_MS,
    decodeTimeoutMs = DEFAULT_DECODE_TIMEOUT_MS,
    pauseWhenHidden = true,
    runLevelPattern,
    workerFactory = createDefaultQrWorker,
    cropToCenterSquare = false,
  } = options;

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera APIs are not available in this environment.');
  }

  const stream = await navigator.mediaDevices.getUserMedia(
    buildConstraints(deviceId, initialWidth, initialHeight),
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
  let pendingRunLevel: RunLevel = 'fast';
  let pendingCanvasWidth = 0;
  let pendingCanvasHeight = 0;
  let nextJobId = 1;
  let currentWidth = initialWidth;
  let decodeTimer: ReturnType<typeof setTimeout> | null = null;

  const reportError = (error: unknown, fallbackMessage: string) => {
    if (!onError) return;
    try {
      onError(error instanceof Error ? error : new Error(fallbackMessage));
    } catch {
      // onError must not itself crash the controller.
    }
  };

  const clearDecodeTimer = () => {
    if (decodeTimer !== null) {
      clearTimeout(decodeTimer);
      decodeTimer = null;
    }
  };

  const trackEndedHandler = () => {
    if (stopped) return;
    reportError(
      new Error('Camera stream ended unexpectedly.'),
      'Camera stream ended unexpectedly.',
    );
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    cleanup();
  };

  const visibilityHandler = () => {
    // When the tab becomes visible again, rAF resumes on its own; nothing to do.
    // When it becomes hidden we just let rAF throttle and skip worker posts.
  };

  stream.getVideoTracks().forEach((track) => {
    track.addEventListener('ended', trackEndedHandler);
  });

  if (pauseWhenHidden && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', visibilityHandler);
  }

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    clearDecodeTimer();
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    try {
      worker.terminate();
    } catch {
      // ignore — worker may already be detached
    }
    stream.getVideoTracks().forEach((track) => {
      track.removeEventListener('ended', trackEndedHandler);
    });
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // ignore
      }
    });
    if (pauseWhenHidden && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', visibilityHandler);
    }
    if (video.srcObject === stream) {
      video.srcObject = null;
    }
  };

  worker.onmessage = (event: MessageEvent<DecodeResponse>) => {
    const data = event.data;
    if (!data || data.type !== 'result') return;

    // Late reply after stop(): ignore entirely.
    if (stopped) return;

    clearDecodeTimer();
    decoding = false;
    lastDecodeMs = data.decodeMs;

    if (shouldDownscale(lastDecodeMs, currentWidth, maxDecodeMs, minWidth)) {
      currentWidth = nextDownscaledWidth(currentWidth, minWidth);
    }

    if (data.jobId !== pendingJobId) return;

    if (onDecodeAttempt) {
      try {
        onDecodeAttempt({
          engine: data.result?.engine ?? null,
          matched: Boolean(data.result),
          decodeMs: data.decodeMs,
          runLevel: pendingRunLevel,
          canvasWidth: pendingCanvasWidth,
          canvasHeight: pendingCanvasHeight,
        });
      } catch (attemptError) {
        reportError(attemptError, 'QR decode attempt handler threw');
      }
    }

    if (!data.result) return;

    try {
      onResult(data.result.text, data.result.engine, data.decodeMs);
    } catch (callbackError) {
      reportError(callbackError, 'QR result handler threw');
    }
  };

  worker.onerror = (err) => {
    decoding = false;
    clearDecodeTimer();
    reportError(err, 'QR decode worker error');
  };

  // onmessageerror fires when postMessage payload fails to (de)serialize or when
  // a transferred buffer is malformed. Reset the flag so the pipeline recovers.
  (worker as Worker & { onmessageerror: ((ev: MessageEvent) => void) | null }).onmessageerror = () => {
    decoding = false;
    clearDecodeTimer();
    reportError(new Error('QR decode worker message error'), 'QR decode worker message error');
  };

  const isDocumentHidden = (): boolean =>
    pauseWhenHidden && typeof document !== 'undefined' && document.hidden === true;

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

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = video.videoWidth;
    let sourceHeight = video.videoHeight;

    if (cropToCenterSquare) {
      const side = Math.min(video.videoWidth, video.videoHeight);
      sourceWidth = side;
      sourceHeight = side;
      sourceX = Math.round((video.videoWidth - side) / 2);
      sourceY = Math.round((video.videoHeight - side) / 2);
    }

    const sourceAspect = sourceHeight / sourceWidth;
    const targetWidth = Math.max(1, Math.min(currentWidth, sourceWidth));
    const targetHeight = Math.max(1, Math.round(targetWidth * sourceAspect));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    try {
      ctx.drawImage(
        video,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    } catch (drawError) {
      // drawImage can throw if the video frame is not decodable yet. Skip frame.
      reportError(drawError, 'Unable to draw video frame');
      return;
    }

    if (decoding) return;
    if (isDocumentHidden()) return; // save CPU while backgrounded

    decoding = true;
    const thisFrameIndex = frameIndex;
    frameIndex += 1;
    pendingJobId = nextJobId;
    nextJobId += 1;
    pendingRunLevel = pickRunLevel(thisFrameIndex, runLevelPattern);
    pendingCanvasWidth = canvas.width;
    pendingCanvasHeight = canvas.height;

    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (readError) {
      decoding = false;
      reportError(readError, 'Unable to read pixels from canvas');
      return;
    }

    const buffer = imageData.data.buffer;
    const message: DecodeRequest = {
      type: 'decode',
      jobId: pendingJobId,
      width: imageData.width,
      height: imageData.height,
      buffer,
      runLevel: pendingRunLevel,
    };

    try {
      worker.postMessage(message, [buffer]);
    } catch (postError) {
      decoding = false;
      reportError(postError, 'Unable to post frame to worker');
      return;
    }

    if (decodeTimeoutMs > 0) {
      const armedJobId = pendingJobId;
      decodeTimer = setTimeout(() => {
        if (stopped || armedJobId !== pendingJobId) return;
        // Worker is wedged. Surface and tear down — caller can restart.
        reportError(
          new Error(`QR decode timed out after ${decodeTimeoutMs}ms`),
          'QR decode timed out',
        );
        cleanup();
      }, decodeTimeoutMs);
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
