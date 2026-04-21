/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Multi-engine QR decode cascade. Pure logic — no DOM, no worker globals — so it can
 * run inside a DedicatedWorker, OffscreenCanvas, or jsdom-based unit tests.
 */
import jsQR from 'jsqr';

export type RunLevel = 'fast' | 'medium' | 'full';

export type DecodeEngineName =
  | 'BarcodeDetector'
  | 'jsQR-fast'
  | 'jsQR-deep';

export interface CascadeMatch {
  text: string;
  engine: DecodeEngineName;
}

interface BarcodeDetectorLike {
  detect: (bitmap: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
}

export interface CascadeDeps {
  detector: BarcodeDetectorLike | null;
  createBitmap?: (imageData: ImageData) => Promise<ImageBitmap>;
  jsQRImpl?: typeof jsQR;
}

const defaultCreateBitmap = (imageData: ImageData): Promise<ImageBitmap> => {
  if (typeof createImageBitmap !== 'function') {
    return Promise.reject(new Error('createImageBitmap is unavailable'));
  }
  return createImageBitmap(imageData);
};

const closeBitmap = (bitmap: ImageBitmap | null) => {
  if (bitmap && typeof (bitmap as { close?: () => void }).close === 'function') {
    (bitmap as { close: () => void }).close();
  }
};

const tryBarcodeDetector = async (
  imageData: ImageData,
  deps: CascadeDeps,
): Promise<CascadeMatch | null> => {
  if (!deps.detector) return null;
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await (deps.createBitmap ?? defaultCreateBitmap)(imageData);
    const hits = await deps.detector.detect(bitmap);
    if (hits && hits.length > 0) {
      const text = hits[0]?.rawValue;
      if (typeof text === 'string' && text.length > 0) {
        return { text, engine: 'BarcodeDetector' };
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    closeBitmap(bitmap);
  }
};

const tryJsQR = (
  imageData: ImageData,
  mode: 'dontInvert' | 'attemptBoth',
  deps: CascadeDeps,
): CascadeMatch | null => {
  const decoder = deps.jsQRImpl ?? jsQR;
  const code = decoder(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: mode,
  });
  if (code && typeof code.data === 'string' && code.data.length > 0) {
    return {
      text: code.data,
      engine: mode === 'dontInvert' ? 'jsQR-fast' : 'jsQR-deep',
    };
  }
  return null;
};

/**
 * runEngineCascade walks engines in increasing cost order and stops at the first hit.
 *
 * Run levels gate which engines run on a given frame:
 *   - 'fast'   → BarcodeDetector only
 *   - 'medium' → BarcodeDetector + jsQR (no inversion)
 *   - 'full'   → BarcodeDetector + jsQR + jsQR with inversion attempts
 */
export const runEngineCascade = async (
  imageData: ImageData,
  runLevel: RunLevel,
  deps: CascadeDeps,
): Promise<CascadeMatch | null> => {
  const native = await tryBarcodeDetector(imageData, deps);
  if (native) return native;
  if (runLevel === 'fast') return null;

  const fast = tryJsQR(imageData, 'dontInvert', deps);
  if (fast) return fast;
  if (runLevel === 'medium') return null;

  return tryJsQR(imageData, 'attemptBoth', deps);
};

const DEFAULT_PATTERN: readonly RunLevel[] = ['fast', 'medium', 'full'];

/**
 * pickRunLevel cycles through a pattern of run levels (default ['fast','medium','full'])
 * keyed by frame index. The default pattern hits every engine roughly every third frame
 * so the heavy paths don't run on every rAF tick.
 */
export const pickRunLevel = (
  frameIndex: number,
  pattern: readonly RunLevel[] = DEFAULT_PATTERN,
): RunLevel => {
  const safePattern = pattern.length > 0 ? pattern : DEFAULT_PATTERN;
  const idx = ((frameIndex % safePattern.length) + safePattern.length) % safePattern.length;
  return safePattern[idx];
};

/**
 * shouldDownscale decides whether to shrink the decode canvas next frame because
 * the worker is taking too long. Caller applies the new resolution.
 */
export const shouldDownscale = (
  decodeMs: number,
  currentWidth: number,
  thresholdMs: number,
  minWidth: number,
): boolean => decodeMs > thresholdMs && currentWidth > minWidth;

export const nextDownscaledWidth = (
  currentWidth: number,
  minWidth: number,
  factor = 0.75,
): number => Math.max(minWidth, Math.round(currentWidth * factor));

export const createBarcodeDetectorIfAvailable = (
  scope: { BarcodeDetector?: new (init: { formats: string[] }) => BarcodeDetectorLike },
  formats: string[] = ['qr_code'],
): BarcodeDetectorLike | null => {
  try {
    const Ctor = scope.BarcodeDetector;
    if (typeof Ctor === 'function') {
      return new Ctor({ formats });
    }
  } catch {
    // BarcodeDetector exists but threw on construction — treat as unavailable.
  }
  return null;
};
