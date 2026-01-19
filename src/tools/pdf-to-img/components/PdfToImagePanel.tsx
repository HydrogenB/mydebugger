/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';

import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { Button } from '../../../design-system/components/inputs';
import type { UsePdfToImageReturn, PageRangeMode } from '../hooks/usePdfToImage';
import { formatFileSize, getScalePresets, type ImageFormat } from '../lib/pdfConverter';

interface Props extends UsePdfToImageReturn {}

const FORMAT_OPTIONS: Array<{ value: ImageFormat; label: string; description: string }> = [
  { value: 'png', label: 'PNG', description: 'Lossless, best quality' },
  { value: 'jpeg', label: 'JPG', description: 'Smaller file size' },
  { value: 'webp', label: 'WebP', description: 'Modern, efficient' },
];

const SCALE_PRESETS = getScalePresets();

const PdfToImagePanel: React.FC<Props> = (props) => {
  const {
    file,
    pdfInfo,
    previewUrl,
    format,
    quality,
    scale,
    pageRangeMode,
    customPageRange,
    progress,
    convertedImages,
    error,
    isPasswordRequired,
    password,
    supportsWebP,
    onFileSelect,
    onFileDrop,
    clearFile,
    setPassword,
    submitPassword,
    setFormat,
    setQuality,
    setScale,
    setPageRangeMode,
    setCustomPageRange,
    startConversion,
    cancelConversion,
    downloadImage,
    downloadAllAsZip,
    clearResults,
    clearError,
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [resultsOpen, setResultsOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        await onFileDrop(files);
      }
    },
    [onFileDrop]
  );

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        await onFileSelect(selectedFile);
      }
      // Reset input value to allow re-selecting the same file
      event.target.value = '';
    },
    [onFileSelect]
  );

  const handlePasswordSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submitPassword();
    },
    [submitPassword]
  );

  const isConverting = progress.status === 'converting';
  const isLoading = progress.status === 'loading';
  const hasResults = convertedImages.length > 0;
  const canConvert = pdfInfo && !isConverting && !isLoading;

  const progressPercentage =
    progress.totalPages > 0 ? Math.round((progress.currentPage / progress.totalPages) * 100) : 0;

  return (
    <div className={TOOL_PANEL_CLASS}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PDF to Image</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Convert PDF pages to PNG, JPG, or WebP images. All processing happens in your browser.
          </p>
        </div>
        {pdfInfo && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
              {pdfInfo.pageCount} {pdfInfo.pageCount === 1 ? 'Page' : 'Pages'}
            </span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {formatFileSize(pdfInfo.fileSize)}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p>{error}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {/* Drop Zone / Preview */}
          {!pdfInfo && !isPasswordRequired ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
              className={clsx(
                'relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200',
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/10'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                className={clsx(
                  'mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors',
                  isDragging
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p
                className={clsx(
                  'text-lg font-semibold transition-colors',
                  isDragging ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'
                )}
              >
                {isDragging ? 'Drop your PDF here' : 'Drag & drop a PDF file'}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">or click to browse files</p>
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">Maximum file size: 100MB</p>
            </div>
          ) : isPasswordRequired ? (
            /* Password Input */
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h2 className="text-lg font-semibold">Password Protected PDF</h2>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                This PDF is encrypted. Please enter the password to unlock it.
              </p>
              <form onSubmit={handlePasswordSubmit} className="mt-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PDF password"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  autoFocus
                />
                <div className="mt-4 flex gap-2">
                  <Button type="submit" disabled={!password}>
                    Unlock PDF
                  </Button>
                  <Button variant="outline-secondary" onClick={clearFile}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* Preview and Info */
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="PDF Preview (Page 1)"
                    className="mx-auto max-h-[400px] object-contain"
                  />
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading preview...</div>
                  </div>
                )}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="rounded-lg bg-white px-4 py-2 text-sm font-medium dark:bg-gray-800">
                      Loading PDF...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{pdfInfo?.fileName}</p>
                  {pdfInfo?.title && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{pdfInfo.title}</p>
                  )}
                </div>
                <Button size="sm" variant="outline-secondary" onClick={clearFile}>
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isConverting && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {progress.message}
                </span>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {progressPercentage}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="outline-secondary" onClick={cancelConversion}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Converted Images Gallery */}
          {hasResults && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Converted Images ({convertedImages.length})
                </h2>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setResultsOpen((prev) => !prev)}>
                    {resultsOpen ? 'Hide' : 'Show'}
                  </Button>
                  <Button size="sm" onClick={downloadAllAsZip}>
                    Download All (ZIP)
                  </Button>
                  <Button size="sm" variant="outline-secondary" onClick={clearResults}>
                    Clear
                  </Button>
                </div>
              </div>

              {resultsOpen && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {convertedImages.map((image) => (
                    <div
                      key={image.pageNumber}
                      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <img
                        src={image.dataUrl}
                        alt={`Page ${image.pageNumber}`}
                        className="aspect-[3/4] w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="p-3">
                          <Button size="sm" onClick={() => downloadImage(image)}>
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
                        Page {image.pageNumber}
                      </div>
                      <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                        {formatFileSize(image.blob.size)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Settings */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
              <Button size="sm" variant="ghost" onClick={() => setSettingsOpen((prev) => !prev)}>
                {settingsOpen ? 'Hide' : 'Show'}
              </Button>
            </div>

            {settingsOpen && (
              <div className="mt-4 space-y-5">
                {/* Format Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Output Format
                  </label>
                  <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                    {FORMAT_OPTIONS.map((option) => {
                      const disabled = option.value === 'webp' && !supportsWebP;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => !disabled && setFormat(option.value)}
                          disabled={disabled}
                          className={clsx(
                            'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                            format === option.value
                              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                            disabled && 'cursor-not-allowed opacity-50'
                          )}
                          title={disabled ? 'WebP not supported in your browser' : option.description}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quality Slider (for JPEG/WebP) */}
                {(format === 'jpeg' || format === 'webp') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Quality
                      </label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality * 100}
                      onChange={(e) => setQuality(parseInt(e.target.value, 10) / 100)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Higher quality = larger file size
                    </p>
                  </div>
                )}

                {/* Scale / Resolution */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Resolution
                  </label>
                  <select
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    {SCALE_PRESETS.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                  {scale >= 3 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      High resolution may use more memory
                    </p>
                  )}
                </div>

                {/* Page Range */}
                {pdfInfo && pdfInfo.pageCount > 1 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Page Range
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="pageRange"
                          checked={pageRangeMode === 'all'}
                          onChange={() => setPageRangeMode('all')}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          All Pages ({pdfInfo.pageCount})
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="pageRange"
                          checked={pageRangeMode === 'custom'}
                          onChange={() => setPageRangeMode('custom')}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Custom Range</span>
                      </label>
                    </div>
                    {pageRangeMode === 'custom' && (
                      <input
                        type="text"
                        value={customPageRange}
                        onChange={(e) => setCustomPageRange(e.target.value)}
                        placeholder="e.g., 1, 3-5, 10"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                      />
                    )}
                  </div>
                )}

                {/* Convert Button */}
                <Button
                  onClick={startConversion}
                  disabled={!canConvert}
                  className="w-full"
                >
                  {isConverting
                    ? 'Converting...'
                    : `Convert ${
                        pdfInfo
                          ? pageRangeMode === 'all'
                            ? pdfInfo.pageCount
                            : 'Selected'
                          : ''
                      } ${pdfInfo?.pageCount === 1 ? 'Page' : 'Pages'}`}
                </Button>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">How it works</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                  1
                </span>
                <span>Upload or drag a PDF file</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                  2
                </span>
                <span>Choose format, quality and pages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                  3
                </span>
                <span>Click Convert and download images</span>
              </li>
            </ul>
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <strong>Privacy:</strong> All processing happens locally in your browser. Your files
              are never uploaded to any server.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PdfToImagePanel;
