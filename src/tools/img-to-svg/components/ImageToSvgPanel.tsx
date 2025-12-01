/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { ChangeEvent, DragEvent, useState, useRef } from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { UseImageToSvgReturn } from '../hooks/useImageToSvg';
import { Download, Copy, RefreshCw, Upload, Palette, Settings, Sparkles, Check, X, Image, FileCode, Zap, ChevronDown, ChevronUp, Eye, EyeOff, Cpu, SlidersHorizontal } from 'lucide-react';
import { TracingEngine } from '../lib/imageTracer';
import clsx from 'clsx';

interface Props extends UseImageToSvgReturn {}

const ImageToSvgPanel: React.FC<Props> = ({
  imageInfo,
  previewUrl,
  options,
  result,
  loading,
  error,
  progress,
  activePreset,
  presets,
  engineInfo,
  onFile,
  updateOption,
  applyPreset,
  resetOptions,
  trace,
  downloadSvg,
  copySvg,
  clear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [compareMode, setCompareMode] = useState<'side-by-side' | 'overlay' | 'split'>('side-by-side');
  const [showOriginal, setShowOriginal] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleCopy = async () => {
    const success = await copySvg();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={clear}
            className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300"
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
              Source Image
            </h3>
            <div
              className={clsx(
                'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
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
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
                onChange={handleFile}
                className="hidden"
              />
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                  <Image className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Drop image here or click to upload
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JPG, PNG, WebP, GIF, BMP supported
                  </p>
                </div>
              </div>
            </div>

            {/* Image Info */}
            {imageInfo && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source Info
                  </span>
                  <button
                    onClick={clear}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-mono truncate max-w-[150px]">{imageInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Size:</span>
                    <span className="text-gray-700 dark:text-gray-300">{imageInfo.sizeKB} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Dimensions:</span>
                    <span className="text-gray-700 dark:text-gray-300">{imageInfo.width} × {imageInfo.height}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tracing Engine Selector */}
          <div className={TOOL_PANEL_CLASS}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Tracing Engine
            </h3>
            <div className="space-y-2">
              {(Object.keys(engineInfo) as TracingEngine[]).map((engineKey) => (
                <button
                  key={engineKey}
                  onClick={() => updateOption('engine', engineKey)}
                  className={clsx(
                    'w-full px-4 py-3 rounded-lg text-left transition-all border-2',
                    options.engine === engineKey
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={clsx(
                      'font-medium text-sm',
                      options.engine === engineKey
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300'
                    )}>
                      {engineInfo[engineKey].name}
                    </span>
                    {options.engine === engineKey && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {engineInfo[engineKey].description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className={TOOL_PANEL_CLASS}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Tracing Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-xs font-medium transition-all text-left',
                    activePreset === preset.name
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Basic Options */}
          <div className={TOOL_PANEL_CLASS}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Tracing Options
            </h3>
            <div className="space-y-4">
              {/* Mode */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Output Mode
                </label>
                <div className="flex gap-2">
                  {(['color', 'grayscale', 'monochrome'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateOption('mode', mode)}
                      className={clsx(
                        'flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all',
                        options.mode === mode
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Count */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Colors
                  </label>
                  <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
                    {options.colorCount}
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={64}
                  value={options.colorCount}
                  onChange={(e) => updateOption('colorCount', parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Fewer</span>
                  <span>More</span>
                </div>
              </div>

              {/* Smoothing */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Path Smoothing
                  </label>
                  <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
                    {options.pathSmoothing}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={options.pathSmoothing}
                  onChange={(e) => updateOption('pathSmoothing', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Sharp</span>
                  <span>Smooth</span>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-3 h-3" />
                  Advanced Options
                </span>
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                  {/* Threshold (for Potrace/Edge engines) */}
                  {(options.engine === 'potrace' || options.engine === 'edgeTrace') && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Threshold
                        </label>
                        <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
                          {options.threshold}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={255}
                        value={options.threshold}
                        onChange={(e) => updateOption('threshold', parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>More detail</span>
                        <span>Less detail</span>
                      </div>
                    </div>
                  )}

                  {/* Stroke Width */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Stroke Width
                      </label>
                      <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
                        {options.strokeWidth}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={5}
                      step={0.5}
                      value={options.strokeWidth}
                      onChange={(e) => updateOption('strokeWidth', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>

                  {/* Min Path Length */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Min Path Length
                      </label>
                      <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
                        {options.minPathLength}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={options.minPathLength}
                      onChange={(e) => updateOption('minPathLength', parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>

                  {/* Corner Threshold */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Corner Detection
                      </label>
                      <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
                        {options.cornerThreshold}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={45}
                      max={180}
                      value={options.cornerThreshold}
                      onChange={(e) => updateOption('cornerThreshold', parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Line Filter (Strokes)
                      </span>
                      <input
                        type="checkbox"
                        checked={options.lineFilter}
                        onChange={(e) => updateOption('lineFilter', e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Blur Preprocessing
                      </span>
                      <input
                        type="checkbox"
                        checked={options.blur}
                        onChange={(e) => updateOption('blur', e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Invert Colors
                      </span>
                      <input
                        type="checkbox"
                        checked={options.invert}
                        onChange={(e) => updateOption('invert', e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={resetOptions}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset to Defaults
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Convert Button */}
          <button
            onClick={trace}
            disabled={!imageInfo || loading}
            className={clsx(
              'w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2',
              !imageInfo || loading
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            )}
          >
            {loading ? (
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
                Converting... {progress}%
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Convert to SVG
              </>
            )}
          </button>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Compare Mode Tabs */}
          {previewUrl && (
            <div className={TOOL_PANEL_CLASS}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {(['side-by-side', 'overlay', 'split'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setCompareMode(mode)}
                        className={clsx(
                          'px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all',
                          compareMode === mode
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        {mode.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                  {result && (
                    <button
                      onClick={() => setShowOriginal(!showOriginal)}
                      className={clsx(
                        'p-2 rounded-lg transition-all',
                        showOriginal
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      )}
                      title={showOriginal ? 'Hide Original' : 'Show Original'}
                    >
                      {showOriginal ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Content */}
              <div className={clsx(
                'grid gap-4 min-h-[400px]',
                compareMode === 'side-by-side' && result ? 'grid-cols-2' : 'grid-cols-1'
              )}>
                {/* Original Image */}
                {(showOriginal || !result) && previewUrl && (
                  <div className="relative bg-gray-100 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                    <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/50 rounded-md text-xs text-white font-medium">
                      Original
                    </div>
                    <div className="flex items-center justify-center h-full p-4" style={{ minHeight: '300px' }}>
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {/* SVG Result */}
                {result && (
                  <div className="relative bg-gray-100 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                    <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-primary-600 rounded-md text-xs text-white font-medium flex items-center gap-1">
                      <FileCode className="w-3 h-3" />
                      SVG
                    </div>
                    <div className="flex items-center justify-center h-full p-4" style={{ minHeight: '300px' }}>
                      <div
                        className="max-w-full max-h-[400px] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: result.svg }}
                      />
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!result && !previewUrl && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <FileCode className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-sm">Upload an image to preview the conversion</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result Stats & Actions */}
          {result && (
            <div className={TOOL_PANEL_CLASS}>
              <div className="flex flex-wrap items-center gap-4">
                {/* Stats */}
                <div className="flex-1 flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Engine</p>
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {engineInfo[result.engine]?.name || result.engine}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paths</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{result.pathCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Colors</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{result.colorPalette.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dimensions</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {result.width} × {result.height}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">SVG Size</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {Math.round(result.svg.length / 1024)} KB
                    </p>
                  </div>
                </div>

                {/* Color Palette Preview */}
                <div className="flex items-center gap-1">
                  {result.colorPalette.slice(0, 8).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  {result.colorPalette.length > 8 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      +{result.colorPalette.length - 8}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={downloadSvg}
                  className="flex-1 sm:flex-none px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Download SVG
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy SVG Code
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SVG Code Preview */}
          {result && (
            <details className={clsx(TOOL_PANEL_CLASS, 'group')}>
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 select-none">
                <FileCode className="w-4 h-4" />
                SVG Source Code
                <ChevronDown className="w-4 h-4 ml-auto group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-xs max-h-[400px] overflow-y-auto">
                  <code>{result.svg}</code>
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageToSvgPanel;
