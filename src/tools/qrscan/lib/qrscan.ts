/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { BrowserQRCodeReader, BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

export type VideoDevice = MediaDeviceInfo;

export const listVideoInputDevices = async (): Promise<VideoDevice[]> =>
  BrowserQRCodeReader.listVideoInputDevices();

export const startQrScan = async (
  video: HTMLVideoElement,
  onResult: (text: string, format?: string) => void,
  deviceId?: string,
  enableMultiFormat: boolean = false,
): Promise<IScannerControls> => {
  const reader = enableMultiFormat ? new BrowserMultiFormatReader() : new BrowserQRCodeReader();
  const controls = await reader.decodeFromVideoDevice(
    deviceId ?? undefined,
    video,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result: any) => {
      if (result) {
        const fmt = typeof result.getBarcodeFormat === 'function' ? String(result.getBarcodeFormat()) : (enableMultiFormat ? 'MULTI' : 'QR_CODE');
        onResult(result.getText(), fmt);
      }
    },
  );
  return controls;
};

export const stopQrScan = (controls: IScannerControls | undefined) => {
  controls?.stop();
};

export default startQrScan;
