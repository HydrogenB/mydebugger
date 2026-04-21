/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Integration tests for the ScannerController. We stub MediaDevices, the
 * worker factory, and rAF so the loop runs deterministically in jsdom.
 */
import { startScanner } from '../src/tools/qrscan/lib/scannerController';
import type { DecodeRequest, DecodeResponse } from '../src/tools/qrscan/lib/qr.worker';

interface FakeWorker {
  posts: DecodeRequest[];
  transfers: ArrayBuffer[][];
  onmessage: ((event: MessageEvent<DecodeResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage: (msg: DecodeRequest, transfer?: ArrayBuffer[]) => void;
  terminate: () => void;
  terminated: boolean;
  reply: (response: Omit<DecodeResponse, 'type'>) => void;
}

const createFakeWorker = (): FakeWorker => {
  const worker: FakeWorker = {
    posts: [],
    transfers: [],
    onmessage: null,
    onerror: null,
    terminated: false,
    postMessage(msg, transfer) {
      this.posts.push(msg);
      this.transfers.push(transfer ?? []);
    },
    terminate() {
      this.terminated = true;
    },
    reply(response) {
      this.onmessage?.({
        data: { type: 'result', ...response },
      } as MessageEvent<DecodeResponse>);
    },
  };
  return worker;
};

interface RafQueue {
  flush: (frames?: number) => void;
  pending: number;
  cancelled: number[];
}

const installRaf = (): RafQueue => {
  const callbacks: Array<{ id: number; fn: FrameRequestCallback }> = [];
  let nextId = 1;
  const cancelled: number[] = [];

  (globalThis as unknown as { requestAnimationFrame: typeof requestAnimationFrame }).requestAnimationFrame = (
    fn,
  ) => {
    const id = nextId;
    nextId += 1;
    callbacks.push({ id, fn });
    return id;
  };
  (globalThis as unknown as { cancelAnimationFrame: typeof cancelAnimationFrame }).cancelAnimationFrame = (id) => {
    cancelled.push(id);
    const idx = callbacks.findIndex((c) => c.id === id);
    if (idx >= 0) callbacks.splice(idx, 1);
  };

  return {
    cancelled,
    get pending() {
      return callbacks.length;
    },
    flush(frames = 1) {
      for (let i = 0; i < frames; i += 1) {
        const next = callbacks.shift();
        if (!next) return;
        next.fn(performance.now());
      }
    },
  };
};

interface FakeTrack {
  stop: jest.Mock;
  listeners: Record<string, Array<(ev?: unknown) => void>>;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  fireEnded: () => void;
}

const createFakeStream = () => {
  const tracks: FakeTrack[] = [];
  const stream = {
    getTracks: () => tracks,
    getVideoTracks: () => tracks,
  } as unknown as MediaStream;
  const addTrack = (): FakeTrack => {
    const listeners: FakeTrack['listeners'] = {};
    const track: FakeTrack = {
      stop: jest.fn(),
      listeners,
      addEventListener: jest.fn((event: string, handler: (ev?: unknown) => void) => {
        (listeners[event] ||= []).push(handler);
      }),
      removeEventListener: jest.fn((event: string, handler: (ev?: unknown) => void) => {
        const arr = listeners[event];
        if (!arr) return;
        const idx = arr.indexOf(handler);
        if (idx >= 0) arr.splice(idx, 1);
      }),
      fireEnded() {
        (listeners.ended || []).forEach((handler) => handler({ type: 'ended' }));
      },
    };
    tracks.push(track);
    return track;
  };
  addTrack();
  return { stream, tracks };
};

const createFakeVideo = (width = 800, height = 600): HTMLVideoElement => {
  const video = {
    srcObject: null as MediaStream | null,
    muted: false,
    readyState: 4,
    videoWidth: width,
    videoHeight: height,
    HAVE_ENOUGH_DATA: 4,
    setAttribute: jest.fn(),
    play: jest.fn().mockResolvedValue(undefined),
  } as unknown as HTMLVideoElement;
  return video;
};

const createFakeCanvas = () => {
  const ctx = {
    drawImage: jest.fn(),
    getImageData: jest.fn((x: number, y: number, w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
      colorSpace: 'srgb',
    })),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: jest.fn(() => ctx),
  } as unknown as HTMLCanvasElement;
  return { canvas, ctx };
};

describe('startScanner', () => {
  let raf: RafQueue;
  let canvasFake: ReturnType<typeof createFakeCanvas>;
  let originalCreateElement: typeof document.createElement;
  let mediaStream: ReturnType<typeof createFakeStream>;

  beforeEach(() => {
    raf = installRaf();
    canvasFake = createFakeCanvas();
    originalCreateElement = document.createElement.bind(document);
    jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string, options?: ElementCreationOptions) => {
        if (tag === 'canvas') return canvasFake.canvas;
        return originalCreateElement(tag, options);
      });

    mediaStream = createFakeStream();
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue(mediaStream.stream),
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('drops frames while the worker is busy and resumes after reply', async () => {
    const worker = createFakeWorker();
    const onResult = jest.fn();
    const video = createFakeVideo();

    const handle = await startScanner({
      video,
      onResult,
      workerFactory: () => worker as unknown as Worker,
    });

    // Frame 1 — worker idle, message posted.
    raf.flush(1);
    expect(worker.posts).toHaveLength(1);
    expect(worker.transfers[0]).toHaveLength(1);
    expect(worker.transfers[0][0]).toBe(worker.posts[0].buffer);

    // Frames 2 & 3 — worker still busy, no new posts.
    raf.flush(2);
    expect(worker.posts).toHaveLength(1);

    // Worker replies → next frame should post again.
    worker.reply({ jobId: worker.posts[0].jobId, result: null, decodeMs: 5 });
    raf.flush(1);
    expect(worker.posts).toHaveLength(2);

    handle.stop();
    expect(worker.terminated).toBe(true);
    expect(mediaStream.tracks[0].stop).toHaveBeenCalled();
  });

  test('downscales canvas width when worker reports slow decode', async () => {
    const worker = createFakeWorker();
    const video = createFakeVideo(1920, 1080);

    const handle = await startScanner({
      video,
      onResult: jest.fn(),
      initialWidth: 640,
      minWidth: 320,
      maxDecodeMs: 30,
      workerFactory: () => worker as unknown as Worker,
    });

    raf.flush(1);
    expect(handle.getCanvasSize().width).toBe(640);

    worker.reply({ jobId: worker.posts[0].jobId, result: null, decodeMs: 80 });
    raf.flush(1);

    // 640 * 0.75 = 480
    expect(handle.getCanvasSize().width).toBe(480);

    handle.stop();
  });

  test('forwards decoded text to onResult callback', async () => {
    const worker = createFakeWorker();
    const onResult = jest.fn();
    const video = createFakeVideo();

    const handle = await startScanner({
      video,
      onResult,
      workerFactory: () => worker as unknown as Worker,
    });

    raf.flush(1);
    worker.reply({
      jobId: worker.posts[0].jobId,
      result: { text: 'https://example.com', engine: 'BarcodeDetector' },
      decodeMs: 4,
    });

    expect(onResult).toHaveBeenCalledWith('https://example.com', 'BarcodeDetector');
    handle.stop();
  });

  test('cycles run levels across frames so heavy engines run intermittently', async () => {
    const worker = createFakeWorker();
    const video = createFakeVideo();

    const handle = await startScanner({
      video,
      onResult: jest.fn(),
      workerFactory: () => worker as unknown as Worker,
    });

    raf.flush(1);
    worker.reply({ jobId: worker.posts[0].jobId, result: null, decodeMs: 4 });
    raf.flush(1);
    worker.reply({ jobId: worker.posts[1].jobId, result: null, decodeMs: 4 });
    raf.flush(1);

    expect(worker.posts.map((p) => p.runLevel)).toEqual(['fast', 'medium', 'full']);
    handle.stop();
  });

  test('ignores stale worker replies whose jobId no longer matches', async () => {
    const worker = createFakeWorker();
    const onResult = jest.fn();
    const video = createFakeVideo();

    const handle = await startScanner({
      video,
      onResult,
      workerFactory: () => worker as unknown as Worker,
    });

    raf.flush(1);
    const staleJobId = worker.posts[0].jobId - 1;
    worker.reply({
      jobId: staleJobId,
      result: { text: 'STALE', engine: 'jsQR-fast' },
      decodeMs: 3,
    });

    expect(onResult).not.toHaveBeenCalled();
    handle.stop();
  });
});

describe('startScanner edge cases', () => {
  let raf: RafQueue;
  let canvasFake: ReturnType<typeof createFakeCanvas>;
  let originalCreateElement: typeof document.createElement;
  let mediaStream: ReturnType<typeof createFakeStream>;

  beforeEach(() => {
    jest.useFakeTimers();
    raf = installRaf();
    canvasFake = createFakeCanvas();
    originalCreateElement = document.createElement.bind(document);
    jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string, options?: ElementCreationOptions) => {
        if (tag === 'canvas') return canvasFake.canvas;
        return originalCreateElement(tag, options);
      });

    mediaStream = createFakeStream();
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue(mediaStream.stream),
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('surfaces error and cleans up when the camera track ends unexpectedly', async () => {
    const worker = createFakeWorker();
    const onError = jest.fn();
    const video = createFakeVideo();

    await startScanner({
      video,
      onResult: jest.fn(),
      onError,
      workerFactory: () => worker as unknown as Worker,
    });

    mediaStream.tracks[0].fireEnded();

    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0][0] as Error).message).toContain('ended unexpectedly');
    expect(worker.terminated).toBe(true);
    expect(mediaStream.tracks[0].stop).toHaveBeenCalled();
    expect(mediaStream.tracks[0].removeEventListener).toHaveBeenCalledWith(
      'ended',
      expect.any(Function),
    );
  });

  test('late worker reply after stop() does not fire onResult', async () => {
    const worker = createFakeWorker();
    const onResult = jest.fn();
    const video = createFakeVideo();

    const handle = await startScanner({
      video,
      onResult,
      workerFactory: () => worker as unknown as Worker,
    });

    raf.flush(1);
    handle.stop();

    worker.reply({
      jobId: worker.posts[0].jobId,
      result: { text: 'LATE', engine: 'jsQR-fast' },
      decodeMs: 5,
    });

    expect(onResult).not.toHaveBeenCalled();
  });

  test('decode watchdog fires onError and stops when worker does not reply in time', async () => {
    const worker = createFakeWorker();
    const onError = jest.fn();
    const video = createFakeVideo();

    await startScanner({
      video,
      onResult: jest.fn(),
      onError,
      decodeTimeoutMs: 1000,
      workerFactory: () => worker as unknown as Worker,
    });

    raf.flush(1);
    expect(worker.posts).toHaveLength(1);

    jest.advanceTimersByTime(1000);

    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0][0] as Error).message).toContain('timed out');
    expect(worker.terminated).toBe(true);
    expect(mediaStream.tracks[0].stop).toHaveBeenCalled();
  });

  test('skips posting frames while the document is hidden', async () => {
    const worker = createFakeWorker();
    const video = createFakeVideo();

    const hiddenSpy = jest
      .spyOn(document, 'hidden', 'get')
      .mockReturnValue(true);

    const handle = await startScanner({
      video,
      onResult: jest.fn(),
      pauseWhenHidden: true,
      workerFactory: () => worker as unknown as Worker,
    });

    raf.flush(2);
    expect(worker.posts).toHaveLength(0);

    hiddenSpy.mockReturnValue(false);
    raf.flush(1);
    expect(worker.posts).toHaveLength(1);

    handle.stop();
  });

  test('continues decoding when onResult throws', async () => {
    const worker = createFakeWorker();
    const onError = jest.fn();
    const onResult = jest.fn(() => {
      throw new Error('handler blew up');
    });
    const video = createFakeVideo();

    const handle = await startScanner({
      video,
      onResult,
      onError,
      workerFactory: () => worker as unknown as Worker,
    });

    raf.flush(1);
    worker.reply({
      jobId: worker.posts[0].jobId,
      result: { text: 'FIRST', engine: 'BarcodeDetector' },
      decodeMs: 4,
    });

    // Second frame should still be scheduled despite the handler error.
    raf.flush(1);
    expect(worker.posts).toHaveLength(2);
    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0][0] as Error).message).toContain('handler blew up');

    handle.stop();
  });

  test('onmessageerror resets the decoding flag so the pipeline recovers', async () => {
    const worker = createFakeWorker();
    const onError = jest.fn();
    const video = createFakeVideo();

    const handle = await startScanner({
      video,
      onResult: jest.fn(),
      onError,
      workerFactory: () => worker as unknown as Worker,
    });

    raf.flush(1);
    expect(worker.posts).toHaveLength(1);

    const w = worker as unknown as { onmessageerror?: (ev: MessageEvent) => void };
    w.onmessageerror?.(new MessageEvent('messageerror'));

    raf.flush(1);
    expect(worker.posts).toHaveLength(2);
    expect(onError).toHaveBeenCalledTimes(1);

    handle.stop();
  });

  test('clears watchdog timer on successful worker reply', async () => {
    const worker = createFakeWorker();
    const onError = jest.fn();
    const video = createFakeVideo();

    const handle = await startScanner({
      video,
      onResult: jest.fn(),
      onError,
      decodeTimeoutMs: 500,
      workerFactory: () => worker as unknown as Worker,
    });

    raf.flush(1);
    worker.reply({ jobId: worker.posts[0].jobId, result: null, decodeMs: 5 });

    jest.advanceTimersByTime(1000);

    expect(onError).not.toHaveBeenCalled();
    handle.stop();
  });
});
