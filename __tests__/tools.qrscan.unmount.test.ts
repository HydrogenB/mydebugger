/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { act, renderHook } from '@testing-library/react';

const mockStopSpy = jest.fn();
let mockResolveStart: (() => void) | undefined;

jest.mock('../src/tools/qrscan/lib/qrscan', () => ({
  decodeFile: jest.fn(),
  getZoomCapability: () => null,
  isTorchSupported: () => false,
  listVideoInputDevices: async () => [],
  setZoom: jest.fn(),
  toggleTorch: jest.fn(),
  startQrScan: () =>
    new Promise((resolve) => {
      mockResolveStart = () => resolve({ stop: mockStopSpy });
    }),
  stopQrScan: (controls?: { stop: () => void }) => controls?.stop(),
}));

// eslint-disable-next-line import/first
import useQrscan from '../src/tools/qrscan/hooks/useQrscan';

const renderWithVideo = () => {
  const hook = renderHook(() => useQrscan());
  // Attach a video element so start() proceeds.
  (hook.result.current.videoRef as { current: HTMLVideoElement }).current =
    document.createElement('video');
  return hook;
};

describe('useQrscan camera release', () => {
  beforeEach(() => {
    mockStopSpy.mockClear();
    mockResolveStart = undefined;
  });

  it('stops the camera when the page unmounts', async () => {
    const { result, unmount } = renderWithVideo();
    await act(async () => {
      const started = result.current.start();
      mockResolveStart?.();
      await started;
    });
    expect(mockStopSpy).not.toHaveBeenCalled();
    unmount();
    expect(mockStopSpy).toHaveBeenCalledTimes(1);
  });

  it('stops a camera that finishes starting after unmount', async () => {
    const { result, unmount } = renderWithVideo();
    let started: Promise<void> = Promise.resolve();
    act(() => {
      started = result.current.start();
    });
    unmount();
    mockResolveStart?.();
    await started;
    expect(mockStopSpy).toHaveBeenCalledTimes(1);
  });
});
