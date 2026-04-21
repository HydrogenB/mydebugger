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

export interface ScannerStartOptions {
  video: HTMLVideoElement;
  deviceId?: string;
  onResult: (text: string, engine: DecodeEngineName) => void;
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
const DEFAULT_DECODE_TIMEOUT_MS = 3000;

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
    decodeTimeoutMs = DEFAULT_DECODE_TIMEOUT_MS,
    pauseWhenHidden = true,
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
    if (!data.result) return;

    try {
      onResult(data.result.text, data.result.engine);
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

    const aspect = video.videoHeight / video.videoWidth;
    const targetWidth = Math.max(1, Math.min(currentWidth, video.videoWidth));
    const targetHeight = Math.max(1, Math.round(targetWidth * aspect));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
      runLevel: pickRunLevel(thisFrameIndex, runLevelPattern),
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
