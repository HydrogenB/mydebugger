/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { ChangeEvent, DragEvent } from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { UseImageCompressorReturn } from '../hooks/useImageCompressor';

const dropClasses = 'border-2 border-dashed border-gray-300 p-6 rounded-md text-center bg-gray-50 dark:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors';

function ImageCompressorView({
  info,
  targetSize,
  setTargetSize,
  scale,
  setScale,
  colorDepth,
  setColorDepth,
  result,
  onFile,
  compress,
  loading,
}: UseImageCompressorReturn) {
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) onFile(e.target.files[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div
          className={`${TOOL_PANEL_CLASS} space-y-2`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <label htmlFor="file" className={`block text-sm font-medium ${dropClasses}`}> 
            Select Image
            <input
              id="file"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFile}
              className="mt-2"
            />
            <p className="text-xs text-gray-500">Drag & drop or click to select</p>
          </label>
          {info && (
            <div className="text-sm space-y-1">
              <p>Resolution: {info.width} × {info.height}</p>
              <p>Size: {info.sizeKB} kB</p>
            </div>
          )}
        </div>
        <div className={`${TOOL_PANEL_CLASS} space-y-2`}>
          <label htmlFor="target-size" className="block text-sm font-medium">
            Target size (kB)
            <input
              id="target-size"
              type="number"
              min={1}
              value={targetSize}
              onChange={(e) => setTargetSize(parseInt(e.target.value, 10))}
              className="border p-2 rounded-md w-full"
            />
          </label>
          <div className="space-y-1">
            <p className="font-medium text-sm">Resolution</p>
            <div className="space-x-2 text-sm">
              {([1, 0.7, 0.5] as number[]).map((s) => (
                <label key={s} htmlFor={`scale-${s}`} className="inline-flex items-center space-x-1">
                  <input
                    id={`scale-${s}`}
                    type="radio"
                    checked={scale === s}
                    onChange={() => setScale(s)}
                  />
                  <span>x{s}</span>
                </label>
              ))}
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className="inline-flex items-center space-x-1">
                <input
                  type="radio"
                  checked={![1,0.7,0.5].includes(scale)}
                  onChange={() => {}}
                />
                <span className="sr-only">Custom scale</span>
                <input
                  type="number"
                  value={scale}
                  step={0.1}
                  min={0.1}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="border p-1 w-16"
                />
              </label>
            </div>
          </div>
          <label htmlFor="color" className="block text-sm font-medium">
            Color depth (bits per channel)
            <select
              id="color"
              value={colorDepth}
              onChange={(e) => setColorDepth(parseInt(e.target.value, 10))}
              className="border p-2 rounded-md w-full"
            >
              <option value={8}>8</option>
              <option value={6}>6</option>
              <option value={4}>4</option>
            </select>
          </label>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-md"
            type="button"
            onClick={compress}
            disabled={loading}
          >
            {loading ? 'Compressing...' : 'Compress'}
          </button>
          {result && (
            <div className="text-sm space-y-1">
              <p>New size: {result.info.sizeKB} kB</p>
              <p>Resolution: {result.info.width} × {result.info.height}</p>
              <a
                href={URL.createObjectURL(result.blob)}
                download="compressed.jpg"
                className="underline text-primary-600"
              >
                Download image
              </a>
              <details className="mt-2">
                <summary className="cursor-pointer">Base64</summary>
                <textarea
                  readOnly
                  className="w-full mt-1 p-1 border rounded text-xs"
                  rows={4}
                  value={result.base64}
                />
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageCompressorView;
