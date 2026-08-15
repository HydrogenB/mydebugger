/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageCompressorView from '../src/tools/image-compressor/components/ImageCompressorPanel';
import type { UseImageCompressorReturn } from '../src/tools/image-compressor/hooks/useImageCompressor';
import type { CompressedResult } from '../src/tools/image-compressor/lib/imageCompressor';

// jsdom does not implement these — stub them so the component's URL lifecycle is observable.
let urlCounter = 0;
const createObjectURLMock = jest.fn(() => `blob:mock-url-${urlCounter += 1}`);
const revokeObjectURLMock = jest.fn();

beforeEach(() => {
  urlCounter = 0;
  createObjectURLMock.mockClear();
  revokeObjectURLMock.mockClear();
  (global.URL as unknown as { createObjectURL: typeof createObjectURLMock })
    .createObjectURL = createObjectURLMock;
  (global.URL as unknown as { revokeObjectURL: typeof revokeObjectURLMock })
    .revokeObjectURL = revokeObjectURLMock;
});

afterEach(() => {
  delete (global.URL as unknown as { createObjectURL?: unknown }).createObjectURL;
  delete (global.URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;
});

function makeResult(mimeType: CompressedResult['mimeType']): CompressedResult {
  return {
    blob: new Blob(['data'], { type: mimeType }),
    base64: 'data:base64,AAAA',
    info: { width: 10, height: 10, sizeKB: 1 },
    mimeType,
  };
}

// Stand-in for `useImageCompressor` that mirrors its state shape, so the view can be
// driven through props/state exactly as the real hook would drive it — without touching
// the real compression pipeline (canvas encoding does not work under jsdom).
function Harness({ initialResult }: { initialResult: CompressedResult | null }) {
  const [targetSize, setTargetSize] = useState(50);
  const [scale, setScale] = useState(1);
  const [colorDepth, setColorDepth] = useState(8);
  const [mimeType, setMimeType] = useState<UseImageCompressorReturn['mimeType']>('image/webp');
  const [result] = useState<CompressedResult | null>(initialResult);

  return (
    <ImageCompressorView
      file={null}
      info={null}
      targetSize={targetSize}
      setTargetSize={setTargetSize}
      scale={scale}
      setScale={setScale}
      colorDepth={colorDepth}
      setColorDepth={setColorDepth}
      mimeType={mimeType}
      setMimeType={setMimeType}
      result={result}
      onFile={() => {}}
      compress={async () => {}}
      loading={false}
    />
  );
}

describe('ImageCompressorPanel', () => {
  test('clearing the target-size input yields no NaN and no console warning', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Harness initialResult={null} />);
    const [targetSizeInput] = screen.getAllByRole('spinbutton') as HTMLInputElement[];

    fireEvent.change(targetSizeInput, { target: { value: '' } });

    expect(targetSizeInput.value).not.toBe('NaN');
    expect(Number.isNaN(Number(targetSizeInput.value))).toBe(false);

    const sawNaNWarning = consoleErrorSpy.mock.calls.some((args) =>
      args.some((arg) => String(arg).includes('NaN')));
    expect(sawNaNWarning).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  test('clearing the custom scale input yields no NaN and no console warning', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Harness initialResult={null} />);
    const [, scaleInput] = screen.getAllByRole('spinbutton') as HTMLInputElement[];

    fireEvent.change(scaleInput, { target: { value: '' } });

    expect(scaleInput.value).not.toBe('NaN');
    expect(Number.isNaN(Number(scaleInput.value))).toBe(false);

    const sawNaNWarning = consoleErrorSpy.mock.calls.some((args) =>
      args.some((arg) => String(arg).includes('NaN')));
    expect(sawNaNWarning).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  test('download extension follows the result mime type, not the live format radio', () => {
    const result = makeResult('image/webp');
    render(<Harness initialResult={result} />);

    const link = screen.getByRole('link', { name: /download image/i }) as HTMLAnchorElement;
    expect(link.getAttribute('download')).toBe('compressed.webp');

    // Switch the format radio without recompressing — the result is still WebP bytes.
    fireEvent.click(screen.getByRole('radio', { name: /png/i }));

    expect(link.getAttribute('download')).toBe('compressed.webp');
  });

  test('object URL is created once per result and revoked on unmount', () => {
    const result = makeResult('image/webp');
    const { rerender, unmount } = render(<Harness initialResult={result} />);

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);

    // Re-rendering with the same result reference must not mint another blob URL.
    rerender(<Harness initialResult={result} />);
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).not.toHaveBeenCalled();

    unmount();
    expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith(createObjectURLMock.mock.results[0].value);
  });
});
