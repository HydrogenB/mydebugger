/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useCallback, useRef, useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  Upload,
  FileText,
  Download,
  X,
  Lock,
  Image,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
  Archive,
  Trash2,
  Eye,
  Shield,
} from 'lucide-react';

import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import type { UsePdfToImageReturn } from '../hooks/usePdfToImage';
import { formatFileSize, getScalePresets, type ImageFormat } from '../lib/pdfConverter';
import { PDFPreviewCarousel } from './PDFPreviewCarousel';
import { ImageLightbox } from './ImageLightbox';
import { ImageGridToolbar } from './ImageGridToolbar';

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
    downloadStatus,
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
    clearDownloadTracking,
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPage, setLightboxPage] = useState(1);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        await onFileDrop(e.dataTransfer.files);
      }
    },
    [onFileDrop]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        await onFileSelect(e.target.files[0]);
      }
      e.target.value = '';
    },
    [onFileSelect]
  );

  const triggerFileInput = () => fileInputRef.current?.click();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPassword();
  };

  const isConverting = progress.status === 'converting';
  const isLoading = progress.status === 'loading';
  const hasResults = convertedImages.length > 0;
  const canConvert = pdfInfo && !isConverting && !isLoading;
  const progressPercent = progress.totalPages > 0
    ? Math.round((progress.currentPage / progress.totalPages) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Upload & Settings */}
        <div className="lg:col-span-1 space-y-4">
          {/* Upload Area */}
          <div className={TOOL_PANEL_CLASS}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Source PDF
            </h3>

            {isPasswordRequired ? (
              /* Password Input */
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Password Protected</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the password to unlock this PDF.
                </p>
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter PDF password"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:border-primary-500 focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!password}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      Unlock
                    </button>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Drop Zone */
              <div
                className={clsx(
                  'border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer',
                  isDragging
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700/50'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={triggerFileInput}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && triggerFileInput()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Drop PDF here or click to upload
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Max 100MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Info */}
            {pdfInfo && !isPasswordRequired && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    PDF Info
                  </span>
                  <button
                    onClick={clearFile}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">File:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-mono truncate max-w-[140px]">
                      {pdfInfo.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Size:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatFileSize(pdfInfo.fileSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Pages:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">
                      {pdfInfo.pageCount}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Output Format */}
          <div className={TOOL_PANEL_CLASS}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Output Format
            </h3>
            <div className="space-y-2">
              {FORMAT_OPTIONS.map((option) => {
                const disabled = option.value === 'webp' && !supportsWebP;
                return (
                  <button
                    key={option.value}
                    onClick={() => !disabled && setFormat(option.value)}
                    disabled={disabled}
                    className={clsx(
                      'w-full px-4 py-3 rounded-lg text-left transition-all border-2',
                      format === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={clsx(
                          'font-medium text-sm',
                          format === option.value
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300'
                        )}
                      >
                        {option.label}
                      </span>
                      {format === option.value && (
                        <div className="w-2 h-2 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Quality Slider */}
            {(format === 'jpeg' || format === 'webp') && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Quality
                  </label>
                  <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality * 100}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10) / 100)}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Smaller</span>
                  <span>Better</span>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className={TOOL_PANEL_CLASS}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Options
              </span>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* Resolution */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Resolution
                    </label>
                    <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
                      {scale}x
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {SCALE_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setScale(preset.value)}
                        className={clsx(
                          'px-2 py-2 rounded-lg text-xs font-medium transition-all',
                          scale === preset.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        )}
                        title={preset.description}
                      >
                        {preset.value}x
                      </button>
                    ))}
                  </div>
                  {scale >= 3 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      High resolution uses more memory
                    </p>
                  )}
                </div>

                {/* Page Range */}
                {pdfInfo && pdfInfo.pageCount > 1 && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                      Page Range
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pageRange"
                          checked={pageRangeMode === 'all'}
                          onChange={() => setPageRangeMode('all')}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          All {pdfInfo.pageCount} pages
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pageRange"
                          checked={pageRangeMode === 'custom'}
                          onChange={() => setPageRangeMode('custom')}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Custom range
                        </span>
                      </label>
                    </div>
                    {pageRangeMode === 'custom' && (
                      <input
                        type="text"
                        value={customPageRange}
                        onChange={(e) => setCustomPageRange(e.target.value)}
                        placeholder="e.g., 1, 3-5, 10"
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Convert Button */}
          <button
            onClick={startConversion}
            disabled={!canConvert}
            className={clsx(
              'w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2',
              !canConvert
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            )}
          >
            {isConverting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Converting... {progressPercent}%
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Convert to {format.toUpperCase()}
              </>
            )}
          </button>

          {/* Privacy Notice */}
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-start gap-2">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-700 dark:text-green-400">
              100% client-side. Your files never leave your device.
            </p>
          </div>
        </div>

        {/* Right Column: Preview & Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Preview */}
          {pdfInfo && (
            <div className={TOOL_PANEL_CLASS}>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </h3>
              {/* Note: Preview carousel requires access to PDF document which is stored in usePdfToImage hook */}
              {previewUrl && (
                <div className="relative bg-gray-100 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 min-h-[300px] flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="PDF Preview"
                    className="max-w-full max-h-[500px] object-contain p-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setLightboxPage(1);
                      setLightboxOpen(true);
                    }}
                    title="Click to view in full screen"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded-md text-xs text-white font-medium">
                    Page 1 of {pdfInfo.pageCount} (Click for full screen)
                  </div>
                </div>
              )}
            </div>
          )}

          {!pdfInfo && !hasResults && (
            <div className={TOOL_PANEL_CLASS}>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </h3>
              <div className="relative bg-gray-100 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 min-h-[300px] flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center">
                    <svg
                      className="animate-spin h-8 w-8 mx-auto text-primary-600"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading PDF...
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 dark:text-gray-500 p-8">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Upload a PDF to preview</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {isConverting && (
            <div className={TOOL_PANEL_CLASS}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progress.message}
                </span>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <button
                onClick={cancelConversion}
                className="mt-3 w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Cancel conversion
              </button>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <>
              <div className={TOOL_PANEL_CLASS}>
                <ImageGridToolbar
                  images={convertedImages}
                  downloadStatus={downloadStatus}
                  selectedPages={selectedPages}
                  onSelectAll={() => setSelectedPages(new Set(convertedImages.map(img => img.pageNumber)))}
                  onClearSelection={() => setSelectedPages(new Set())}
                  onDownloadAll={downloadAllAsZip}
                  onDownloadSelected={(pages) => downloadAllAsZip(pages)}
                  onClearTracking={clearDownloadTracking}
                />

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 px-4 pt-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Format
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {format.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pages
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {convertedImages.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Size
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatFileSize(convertedImages.reduce((sum, img) => sum + img.blob.size, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resolution
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {scale}x
                    </p>
                  </div>
                </div>

                {/* Image Grid */}
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {convertedImages.map((image) => {
                      const isSelected = selectedPages.has(image.pageNumber);
                      const isDownloaded = downloadStatus.get(image.pageNumber)?.status === 'completed';
                      return (
                        <div
                          key={image.pageNumber}
                          className={clsx(
                            'group relative bg-gray-100 dark:bg-gray-700/50 rounded-lg overflow-hidden border-2 aspect-[3/4] cursor-pointer transition-all',
                            isSelected
                              ? 'border-blue-500 shadow-lg'
                              : 'border-gray-200 dark:border-gray-600 hover:border-blue-400'
                          )}
                          onClick={() => {
                            const newSelected = new Set(selectedPages);
                            if (newSelected.has(image.pageNumber)) {
                              newSelected.delete(image.pageNumber);
                            } else {
                              newSelected.add(image.pageNumber);
                            }
                            setSelectedPages(newSelected);
                          }}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newSelected = new Set(selectedPages);
                              if (e.target.checked) {
                                newSelected.add(image.pageNumber);
                              } else {
                                newSelected.delete(image.pageNumber);
                              }
                              setSelectedPages(newSelected);
                            }}
                            className="absolute top-2 left-2 w-4 h-4 rounded z-20 cursor-pointer accent-blue-500"
                          />

                          {/* Placeholder or image URL using object URL */}
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400">
                            <FileText className="w-12 h-12 opacity-50" />
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(image);
                              }}
                              className="w-full py-1.5 bg-white/90 text-gray-900 rounded text-xs font-medium hover:bg-white transition-colors flex items-center justify-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxPage(image.pageNumber);
                                setLightboxOpen(true);
                              }}
                              className="w-full mt-1 py-1.5 bg-blue-500/90 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                            >
                              View
                            </button>
                          </div>

                          {/* Page number badge */}
                          <div className="absolute top-1.5 left-8 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-medium">
                            {image.pageNumber}
                          </div>

                          {/* Download status badge */}
                          {isDownloaded && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-green-500/90 rounded text-[10px] text-white font-medium flex items-center gap-1">
                              ✓
                            </div>
                          )}

                          {/* File size */}
                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white">
                            {formatFileSize(image.blob.size)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Clear button */}
                <div className="px-4 pb-4 flex justify-end">
                  <button
                    onClick={clearResults}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2"
                    title="Clear results"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Results
                  </button>
                </div>
              </div>

              {/* Lightbox */}
              {lightboxOpen && (
                <ImageLightbox
                  images={convertedImages}
                  initialPageNumber={lightboxPage}
                  onClose={() => setLightboxOpen(false)}
                  onDownload={downloadImage}
                />
              )}
            </>
          )}

          {/* Empty state when no PDF and no results */}
          {!pdfInfo && !hasResults && !isPasswordRequired && (
            <div className={clsx(TOOL_PANEL_CLASS, 'text-center py-12')}>
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                No PDF loaded
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Upload a PDF file to convert its pages to high-quality images in PNG, JPG, or WebP format.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfToImagePanel;
