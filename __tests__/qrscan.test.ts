import { renderHook, act } from '@testing-library/react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { startQrScan, stopQrScan, listVideoInputDevices } from '../src/tools/qrscan/lib/qrscan';
import useQrscan from '../src/tools/qrscan/hooks/useQrscan.ts';

const mockControls = { stop: jest.fn() };

jest.mock('@zxing/browser', () => ({
  BrowserQRCodeReader: jest.fn().mockImplementation(() => ({
    decodeFromVideoDevice: (_d: any, _v: any, cb: any) => {
      cb({ getText: () => 'data' });
      return Promise.resolve(mockControls);
    },
  })),
}));

(BrowserQRCodeReader as any).listVideoInputDevices = jest.fn().mockResolvedValue([
  { deviceId: '1', label: 'cam', kind: 'videoinput' }
]);

it('startQrScan returns scanner controls', async () => {
  const video = document.createElement('video');
  const cb = jest.fn();
  const controls = await startQrScan(video, cb);
  expect(cb).toHaveBeenCalledWith('data');
  expect(typeof controls.stop).toBe('function');
});

it('listVideoInputDevices returns devices', async () => {
  const devices = await listVideoInputDevices();
  expect(devices).toHaveLength(1);
  expect(devices[0].deviceId).toBe('1');
});

it('stopQrScan calls stop', () => {
  const c = { stop: jest.fn() } as any;
  stopQrScan(c);
  expect(c.stop).toHaveBeenCalled();
});

it('useQrscan hook captures result', async () => {
  const { result } = renderHook(() => useQrscan());
  const video = document.createElement('video');
  result.current.videoRef.current = video;
  await act(async () => {
    await result.current.start();
  });
  expect(result.current.result).toBe('data');
});
