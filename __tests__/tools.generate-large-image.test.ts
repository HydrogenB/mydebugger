/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { act, renderHook } from '@testing-library/react';
import { useGenerateLargeImage } from '../src/tools/generate-large-image/hooks/useGenerateLargeImage';

// jsdom implements neither of these — stub them so the hook's object-URL
// lifecycle (preview, output, and the download anchor) is observable.
let urlCounter = 0;
const createObjectURL = jest.fn(() => `blob:mock-url-${urlCounter += 1}`);
const revokeObjectURL = jest.fn();

beforeEach(() => {
  urlCounter = 0;
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  (global.URL as unknown as { createObjectURL: typeof createObjectURL }).createObjectURL =
    createObjectURL;
  (global.URL as unknown as { revokeObjectURL: typeof revokeObjectURL }).revokeObjectURL =
    revokeObjectURL;
});

afterEach(() => {
  delete (global.URL as unknown as { createObjectURL?: unknown }).createObjectURL;
  delete (global.URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;
});

const validPng = new File(['a'], 'photo.png', { type: 'image/png' });

describe('useGenerateLargeImage', () => {
  // Fix 2: an invalid selection must not leave the previous valid file's
  // preview on screen next to the error — `file` (and the preview derived
  // from it) must clear, not just the error text.
  describe('F: rejecting a selection clears the previous file/preview', () => {
    test('a wrong-type file clears the previously selected valid file', () => {
      const { result } = renderHook(() => useGenerateLargeImage());

      act(() => {
        result.current.onFile(validPng);
      });
      expect(result.current.file).toBe(validPng);
      expect(result.current.previewUrl).not.toBe('');

      const gif = new File(['a'], 'photo.gif', { type: 'image/gif' });
      act(() => {
        result.current.onFile(gif);
      });

      expect(result.current.error).toBe('Only JPG or PNG images allowed');
      expect(result.current.file).toBeNull();
      expect(result.current.previewUrl).toBe('');
    });

    test('an oversized file clears the previously selected valid file', () => {
      const { result } = renderHook(() => useGenerateLargeImage());

      act(() => {
        result.current.onFile(validPng);
      });
      expect(result.current.file).toBe(validPng);

      const tooBig = new File([new Uint8Array(2 * 1024 * 1024)], 'big.png', {
        type: 'image/png',
      });
      act(() => {
        result.current.onFile(tooBig);
      });

      expect(result.current.error).toBe('Image must be 1MB or smaller');
      expect(result.current.file).toBeNull();
      expect(result.current.previewUrl).toBe('');
    });
  });

  // Fix 1: the auto-download anchor must be attached to the document when
  // clicked (Firefox requirement) and its object URL must only be revoked
  // after the anchor is removed, not in the same synchronous block as click.
  test('F: auto-download appends the anchor before clicking, then removes it and revokes the URL', async () => {
    // Minimal canvas/image stand-ins: jsdom implements neither real image
    // decoding nor canvas encoding, so the generate() pipeline is driven
    // with fakes that exercise the same control flow.
    const OriginalImage = global.Image;
    class FakeImage {
      onload: (() => void) | null = null;

      width = 2;

      height = 2;

      set src(_value: string) {
        // Defer like a real image load, so this fires only after `onload`
        // is assigned by the caller (assignment happens after `src` is set).
        setTimeout(() => this.onload?.(), 0);
      }
    }
    // @ts-expect-error - test stand-in, not a full HTMLImageElement
    global.Image = FakeImage;

    const getContextSpy = jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage: () => {} } as unknown as CanvasRenderingContext2D);
    const toBlobSpy = jest
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(function toBlobMock(this: HTMLCanvasElement, cb) {
        cb(new Blob(['x'], { type: 'image/jpeg' }));
      });

    let anchorEl: HTMLAnchorElement | null = null;
    let wasInDocumentAtClick = false;
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function clickMock(this: HTMLAnchorElement) {
        anchorEl = this;
        wasInDocumentAtClick = document.body.contains(this);
      });

    let wasRemovedBeforeRevoke = false;
    revokeObjectURL.mockImplementation(() => {
      wasRemovedBeforeRevoke = anchorEl !== null && !document.body.contains(anchorEl);
    });

    const { result } = renderHook(() => useGenerateLargeImage());
    act(() => {
      result.current.onFile(validPng);
      result.current.setTargetSizeMB(0); // skip junk-padding, not under test here
      result.current.setAutoDownload(true);
    });

    await act(async () => {
      await result.current.generate();
    });

    expect(wasInDocumentAtClick).toBe(true);
    expect(document.querySelector('a[download^="photo_"]')).toBeNull();
    expect(wasRemovedBeforeRevoke).toBe(true);

    getContextSpy.mockRestore();
    toBlobSpy.mockRestore();
    clickSpy.mockRestore();
    global.Image = OriginalImage;
  });
});
