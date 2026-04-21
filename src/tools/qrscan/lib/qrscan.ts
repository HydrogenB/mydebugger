/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * QR scanner utility helpers used by the QR Scan tool view-model.
 *
 * The camera path runs through a Web Worker via {@link startScanner} so the rAF
 * preview loop on the main thread stays smooth. File decoding still uses ZXing
 * because it covers non-QR formats (Code128, EAN, etc.) that the in-worker
 * cascade does not.
 */
import { BrowserMultiFormatReader, BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import type { Result } from '@zxing/library';

import type { DecodeEngineName } from './qrCascade';
import { startScanner, type ScannerHandle } from './scannerController';

export type VideoDevice = MediaDeviceInfo;

const DEFAULT_FORMAT = 'QR_CODE';

const getFormatName = (result: Result | undefined, fallback: string): string => {
  if (!result) {
    return fallback;
  }

  const getBarcodeFormat = (result as { getBarcodeFormat?: () => unknown }).getBarcodeFormat;
  if (typeof getBarcodeFormat === 'function') {
    const format = getBarcodeFormat();
    if (format) {
      return String(format);
    }
  }

  return fallback;
};

const createReader = (enableMultiFormat: boolean) =>
  (enableMultiFormat ? new BrowserMultiFormatReader() : new BrowserQRCodeReader());

export const listVideoInputDevices = async (): Promise<VideoDevice[]> =>
  BrowserQRCodeReader.listVideoInputDevices();

const formatForEngine = (engine: DecodeEngineName): string => `${DEFAULT_FORMAT}:${engine}`;

export const startQrScan = async (
  video: HTMLVideoElement,
  onResult: (text: string, format?: string) => void,
  deviceId?: string,
  // Retained for API compatibility — the worker cascade is QR-only. Multi-format
  // decoding remains available through `decodeFile` for uploaded images.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enableMultiFormat: boolean = true,
): Promise<IScannerControls> => {
  const handle: ScannerHandle = await startScanner({
    video,
    deviceId,
    onResult: (text, engine) => onResult(text, formatForEngine(engine)),
  });

  return {
    stop: () => handle.stop(),
  } as IScannerControls;
};

export const stopQrScan = (controls: IScannerControls | undefined) => {
  controls?.stop();
};

export interface DecodeResult {
  text: string;
  format: string;
}

export const decodeFile = async (file: File, enableMultiFormat: boolean = true): Promise<DecodeResult> => {
  const reader = createReader(enableMultiFormat);
  const imageUrl = URL.createObjectURL(file);
  const image = document.createElement('img');

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Unable to load image for decoding'));
      image.src = imageUrl;
    });

    const result = await reader.decodeFromImageElement(image);
    return {
      text: result.getText(),
      format: getFormatName(result, enableMultiFormat ? 'UNKNOWN' : DEFAULT_FORMAT),
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const getActiveTrack = (video: HTMLVideoElement | null): MediaStreamTrack | undefined => {
  const stream = video?.srcObject as MediaStream | null;
  return stream?.getVideoTracks?.()[0];
};

export const isTorchSupported = (video: HTMLVideoElement | null): boolean => {
  const track = getActiveTrack(video);
  const capabilities = track?.getCapabilities?.() as MediaTrackCapabilities | undefined;
  return Boolean(capabilities && 'torch' in capabilities && (capabilities as { torch?: boolean }).torch !== undefined);
};

export const toggleTorch = async (video: HTMLVideoElement | null, enabled: boolean) => {
  const track = getActiveTrack(video);
  if (!track) {
    throw new Error('Torch requires an active camera stream');
  }

  const capabilities = track.getCapabilities?.() as MediaTrackCapabilities | undefined;
  if (!capabilities || !('torch' in capabilities)) {
    throw new Error('Torch is not supported on this camera');
  }

  await track.applyConstraints({ advanced: [{ torch: enabled }] });
};

export interface ZoomCapability {
  min: number;
  max: number;
  step: number;
}

export const getZoomCapability = (video: HTMLVideoElement | null): ZoomCapability | null => {
  const track = getActiveTrack(video);
  const capabilities = track?.getCapabilities?.() as MediaTrackCapabilities | undefined;

  if (!capabilities || typeof (capabilities as { zoom?: unknown }).zoom === 'undefined') {
    return null;
  }

  const zoomCap = (capabilities as { zoom: number | { min?: number; max?: number; step?: number } }).zoom;

  if (typeof zoomCap === 'number') {
    return { min: zoomCap, max: zoomCap, step: 0 };
  }

  const { min = 1, max = 1, step = 0.1 } = zoomCap;
  return { min, max, step: step || 0.1 };
};

export const setZoom = async (video: HTMLVideoElement | null, value: number) => {
  const track = getActiveTrack(video);
  if (!track) {
    throw new Error('Zoom requires an active camera stream');
  }

  const capabilities = track.getCapabilities?.() as MediaTrackCapabilities | undefined;
  if (!capabilities || typeof (capabilities as { zoom?: unknown }).zoom === 'undefined') {
    throw new Error('Zoom is not supported on this camera');
  }

  await track.applyConstraints({ advanced: [{ zoom: value }] });
};
