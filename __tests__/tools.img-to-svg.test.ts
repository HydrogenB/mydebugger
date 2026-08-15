/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { act, renderHook } from '@testing-library/react';

const mockTraceImageFromFile = jest.fn();

jest.mock('../src/tools/img-to-svg/lib/imageTracer', () => {
  const actual = jest.requireActual('../src/tools/img-to-svg/lib/imageTracer');
  return {
    ...actual,
    traceImageFromFile: (...args: unknown[]) => mockTraceImageFromFile(...args),
  };
});

// eslint-disable-next-line import/first
import { useImageToSvg } from '../src/tools/img-to-svg/hooks/useImageToSvg';

// jsdom does not implement these — stub them so onFile's preview-URL lifecycle works.
let urlCounter = 0;
const createObjectURLMock = jest.fn(() => `blob:mock-url-${(urlCounter += 1)}`);
const revokeObjectURLMock = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  urlCounter = 0;
  mockTraceImageFromFile.mockReset();
  createObjectURLMock.mockClear();
  revokeObjectURLMock.mockClear();
  (global.URL as unknown as { createObjectURL: typeof createObjectURLMock })
    .createObjectURL = createObjectURLMock;
  (global.URL as unknown as { revokeObjectURL: typeof revokeObjectURLMock })
    .revokeObjectURL = revokeObjectURLMock;
});

afterEach(() => {
  jest.useRealTimers();
  delete (global.URL as unknown as { createObjectURL?: unknown }).createObjectURL;
  delete (global.URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;
});

describe('useImageToSvg', () => {
  test('a throwing trace clears the progress interval instead of leaking it', async () => {
    let rejectTrace: (err: Error) => void = () => {};
    mockTraceImageFromFile.mockImplementation(
      () => new Promise((_resolve, reject) => {
        rejectTrace = reject;
      }),
    );

    const { result } = renderHook(() => useImageToSvg());

    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    act(() => {
      result.current.onFile(file);
    });

    let tracePromise!: Promise<void>;
    act(() => {
      tracePromise = result.current.trace();
    });

    // Let the simulated progress interval tick a couple of times before it fails.
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.progress).toBeGreaterThan(10);

    await act(async () => {
      rejectTrace(new Error('boom'));
      await tracePromise;
    });

    expect(result.current.error).toBe('boom');
    const progressAfterError = result.current.progress;

    // If the interval were still alive, advancing time here would keep climbing it
    // toward 80 — asserting it holds steady proves clearInterval ran on the throw path.
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.progress).toBe(progressAfterError);
  });
});
