/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import {
  createBarcodeDetectorIfAvailable,
  nextDownscaledWidth,
  pickRunLevel,
  runEngineCascade,
  shouldDownscale,
  type CascadeDeps,
  type RunLevel,
} from '../src/tools/qrscan/lib/qrCascade';

const buildImageData = (width = 4, height = 4): ImageData => {
  const data = new Uint8ClampedArray(width * height * 4);
  return { data, width, height, colorSpace: 'srgb' } as ImageData;
};

const noBitmap = (): Promise<ImageBitmap> => Promise.resolve({} as ImageBitmap);

describe('pickRunLevel', () => {
  test('cycles fast → medium → full by default', () => {
    expect(pickRunLevel(0)).toBe('fast');
    expect(pickRunLevel(1)).toBe('medium');
    expect(pickRunLevel(2)).toBe('full');
    expect(pickRunLevel(3)).toBe('fast');
    expect(pickRunLevel(7)).toBe('medium');
  });

  test('respects custom pattern', () => {
    const pattern: RunLevel[] = ['full', 'fast'];
    expect(pickRunLevel(0, pattern)).toBe('full');
    expect(pickRunLevel(1, pattern)).toBe('fast');
    expect(pickRunLevel(4, pattern)).toBe('full');
  });

  test('handles negative frame indices', () => {
    expect(pickRunLevel(-1)).toBe('full');
    expect(pickRunLevel(-3)).toBe('fast');
  });

  test('falls back to default when given empty pattern', () => {
    expect(pickRunLevel(2, [])).toBe('full');
  });
});

describe('shouldDownscale', () => {
  test('returns true when decode is slow and there is room to shrink', () => {
    expect(shouldDownscale(45, 640, 30, 320)).toBe(true);
  });

  test('returns false when below threshold', () => {
    expect(shouldDownscale(20, 640, 30, 320)).toBe(false);
  });

  test('returns false at minimum width', () => {
    expect(shouldDownscale(120, 320, 30, 320)).toBe(false);
  });
});

describe('nextDownscaledWidth', () => {
  test('shrinks by factor and clamps to min', () => {
    expect(nextDownscaledWidth(640, 320)).toBe(480);
    expect(nextDownscaledWidth(400, 320)).toBe(320);
    expect(nextDownscaledWidth(320, 320)).toBe(320);
  });

  test('honours custom factor', () => {
    expect(nextDownscaledWidth(800, 320, 0.5)).toBe(400);
  });
});

describe('createBarcodeDetectorIfAvailable', () => {
  test('returns null when global is missing', () => {
    expect(createBarcodeDetectorIfAvailable({})).toBeNull();
  });

  test('instantiates when constructor is present', () => {
    const ctor = jest.fn().mockImplementation((init) => ({ init }));
    const detector = createBarcodeDetectorIfAvailable(
      { BarcodeDetector: ctor as unknown as new (init: { formats: string[] }) => never },
      ['qr_code'],
    );
    expect(detector).not.toBeNull();
    expect(ctor).toHaveBeenCalledWith({ formats: ['qr_code'] });
  });

  test('returns null if constructor throws', () => {
    const ctor = jest.fn(() => {
      throw new Error('unsupported');
    });
    expect(
      createBarcodeDetectorIfAvailable({
        BarcodeDetector: ctor as unknown as new (init: { formats: string[] }) => never,
      }),
    ).toBeNull();
  });
});

describe('runEngineCascade', () => {
  const detectorHit = (text: string): CascadeDeps => ({
    detector: { detect: jest.fn().mockResolvedValue([{ rawValue: text }]) },
    createBitmap: noBitmap,
    jsQRImpl: jest.fn(() => null) as unknown as CascadeDeps['jsQRImpl'],
  });

  test('returns BarcodeDetector hit without falling through', async () => {
    const deps = detectorHit('https://example.com');
    const result = await runEngineCascade(buildImageData(), 'full', deps);
    expect(result).toEqual({ text: 'https://example.com', engine: 'BarcodeDetector' });
    expect(deps.jsQRImpl).not.toHaveBeenCalled();
  });

  test('runLevel "fast" stops after BarcodeDetector miss', async () => {
    const jsQRSpy = jest.fn(() => null) as unknown as CascadeDeps['jsQRImpl'];
    const deps: CascadeDeps = {
      detector: { detect: jest.fn().mockResolvedValue([]) },
      createBitmap: noBitmap,
      jsQRImpl: jsQRSpy,
    };
    const result = await runEngineCascade(buildImageData(), 'fast', deps);
    expect(result).toBeNull();
    expect(jsQRSpy).not.toHaveBeenCalled();
  });

  test('runLevel "medium" runs jsQR-fast but not the deep pass', async () => {
    const jsQRSpy = jest.fn(() => null) as unknown as CascadeDeps['jsQRImpl'];
    const deps: CascadeDeps = {
      detector: null,
      createBitmap: noBitmap,
      jsQRImpl: jsQRSpy,
    };
    const result = await runEngineCascade(buildImageData(), 'medium', deps);
    expect(result).toBeNull();
    expect(jsQRSpy).toHaveBeenCalledTimes(1);
    expect((jsQRSpy as jest.Mock).mock.calls[0][3]).toEqual({ inversionAttempts: 'dontInvert' });
  });

  test('runLevel "full" attempts inversion when fast pass misses', async () => {
    const jsQRSpy = jest
      .fn()
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ data: 'INVERTED' });
    const deps: CascadeDeps = {
      detector: null,
      createBitmap: noBitmap,
      jsQRImpl: jsQRSpy as unknown as CascadeDeps['jsQRImpl'],
    };
    const result = await runEngineCascade(buildImageData(), 'full', deps);
    expect(result).toEqual({ text: 'INVERTED', engine: 'jsQR-deep' });
    expect(jsQRSpy).toHaveBeenCalledTimes(2);
    expect(jsQRSpy.mock.calls[0][3]).toEqual({ inversionAttempts: 'dontInvert' });
    expect(jsQRSpy.mock.calls[1][3]).toEqual({ inversionAttempts: 'attemptBoth' });
  });

  test('returns null when every engine misses', async () => {
    const deps: CascadeDeps = {
      detector: { detect: jest.fn().mockResolvedValue([]) },
      createBitmap: noBitmap,
      jsQRImpl: jest.fn(() => null) as unknown as CascadeDeps['jsQRImpl'],
    };
    const result = await runEngineCascade(buildImageData(), 'full', deps);
    expect(result).toBeNull();
  });

  test('swallows BarcodeDetector errors and continues to jsQR', async () => {
    const jsQRSpy = jest.fn(() => ({ data: 'JSQR' }));
    const deps: CascadeDeps = {
      detector: { detect: jest.fn().mockRejectedValue(new Error('not supported')) },
      createBitmap: noBitmap,
      jsQRImpl: jsQRSpy as unknown as CascadeDeps['jsQRImpl'],
    };
    const result = await runEngineCascade(buildImageData(), 'full', deps);
    expect(result).toEqual({ text: 'JSQR', engine: 'jsQR-fast' });
  });
});
