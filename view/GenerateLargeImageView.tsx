/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { ChangeEvent, DragEvent } from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { UseGenerateLargeImageReturn } from '../viewmodel/useGenerateLargeImage';
import { ProgressBar, Alert } from '../src/design-system/components/feedback';

const dropClasses = 'border-2 border-dashed border-gray-300 p-6 rounded-md text-center bg-gray-50 dark:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors';

function GenerateLargeImageView({
  previewUrl,
  file,
  width,
  height,
  sizeKB,
  targetSizeMB,
  setTargetSizeMB,
  format,
  setFormat,
  autoDownload,
  setAutoDownload,
  preserveResolution,
  setPreserveResolution,
  progress,
  outputUrl,
  outputSize,
  error,
  onFile,
  generate,
}: UseGenerateLargeImageReturn) {
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
            Upload Image (≤1MB)
            <input
              id="file"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFile}
              className="mt-2"
            />
            <p className="text-xs text-gray-500">Drag & drop or click to select</p>
          </label>
          {error && (
            <Alert type="error" className="text-sm">
              {error}
            </Alert>
          )}
          {file && (
            <div className="text-sm space-y-2">
              <p>Name: {file.name}</p>
              <p>Resolution: {width} × {height}</p>
              <p>Size: {sizeKB} KB</p>
              {previewUrl && (
                <img src={previewUrl} alt="preview" className="max-h-40 rounded" />
              )}
            </div>
          )}
        </div>

        <div className={`${TOOL_PANEL_CLASS} space-y-2`}>
          <label htmlFor="target-size" className="block text-sm font-medium">
            Target size (MB)
            <select
              id="target-size"
              value={targetSizeMB}
            onChange={(e) => setTargetSizeMB(parseFloat(e.target.value))}
            className="border p-2 rounded-md w-full"
          >
            <option value={1}>1MB</option>
            <option value={5}>5MB</option>
            <option value={10}>10MB</option>
          </select>
        </label>
        <input
          id="target-size-custom"
          type="number"
          min={0}
          step={0.1}
          value={targetSizeMB}
          onChange={(e) => setTargetSizeMB(parseFloat(e.target.value))}
          className="border p-2 rounded-md w-full"
        />

        <div className="space-x-3">
          <label htmlFor="format-jpg" className="inline-flex items-center space-x-1">
            <input
              id="format-jpg"
              type="radio"
              checked={format === 'jpg'}
              onChange={() => setFormat('jpg')}
            />
            <span>JPG</span>
          </label>
          <label htmlFor="format-png" className="inline-flex items-center space-x-1">
            <input
              id="format-png"
              type="radio"
              checked={format === 'png'}
              onChange={() => setFormat('png')}
            />
            <span>PNG</span>
          </label>
        </div>

        <label htmlFor="auto-download" className="inline-flex items-center space-x-2">
          <input
            id="auto-download"
            type="checkbox"
            checked={autoDownload}
            onChange={(e) => setAutoDownload(e.target.checked)}
          />
          <span>Auto-download after generation</span>
        </label>

        <label htmlFor="preserve-res" className="inline-flex items-center space-x-2">
          <input
            id="preserve-res"
            type="checkbox"
            checked={preserveResolution}
            onChange={(e) => setPreserveResolution(e.target.checked)}
          />
          <span>Preserve original resolution (no resize)</span>
        </label>

        <button
          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md"
          type="button"
          onClick={generate}
        >
          Generate
        </button>
        {progress > 0 && (
          <ProgressBar value={progress} className="mt-2" />
        )}
        {outputUrl && (
          <div className="text-sm">
            <p>Target size: {targetSizeMB} MB</p>
            <p>
              Output size: {(outputSize / (1024 * 1024)).toFixed(2)} MB{' '}
              {Math.abs(outputSize - targetSizeMB * 1024 * 1024) <= targetSizeMB * 1024 * 0.05 ? '✅' : '⚠️'}
            </p>
            <a
              href={outputUrl}
              download={file ? `${file.name.replace(/\.[^.]+$/, '')}_${targetSizeMB}MB.${format}` : `dummy_${targetSizeMB}MB.${format}`}
              className="underline text-primary-600"
            >
              Download file
            </a>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default GenerateLargeImageView;
