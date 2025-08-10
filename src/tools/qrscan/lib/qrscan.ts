/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';

export type VideoDevice = MediaDeviceInfo;

export const listVideoInputDevices = async (): Promise<VideoDevice[]> =>
  BrowserQRCodeReader.listVideoInputDevices();

export const startQrScan = async (
  video: HTMLVideoElement,
  onResult: (text: string) => void,
  deviceId?: string,
): Promise<IScannerControls> => {
  const reader = new BrowserQRCodeReader();
  const controls = await reader.decodeFromVideoDevice(
    deviceId ?? undefined,
    video,
    (result) => {
      if (result) onResult(result.getText());
    },
  );
  return controls;
};

export const stopQrScan = (controls: IScannerControls | undefined) => {
  controls?.stop();
};

export default startQrScan;
