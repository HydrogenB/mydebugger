/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState, useCallback } from 'react';
import {
  traceImageFromFile,
  TracingOptions,
  TracingResult,
  TracingEngine,
  DEFAULT_OPTIONS,
  PRESETS,
  TracingPreset,
  ENGINE_INFO,
} from '../lib/imageTracer';

export interface ImageInfo {
  name: string;
  width: number;
  height: number;
  sizeKB: number;
  type: string;
}

export const useImageToSvg = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<TracingOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<TracingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activePreset, setActivePreset] = useState<string>('Default');

  const onFile = useCallback((f: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!validTypes.includes(f.type)) {
      setError(`Unsupported file type: ${f.type}. Please use JPG, PNG, WebP, GIF, or BMP.`);
      return;
    }

    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(f);
    setResult(null);
    setError(null);
    setProgress(0);

    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setImageInfo({
        name: f.name,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        sizeKB: Math.round(f.size / 1024),
        type: f.type,
      });
    };
    img.onerror = () => {
      setError('Failed to load image. The file may be corrupted.');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [previewUrl]);

  const updateOption = useCallback(<K extends keyof TracingOptions>(
    key: K,
    value: TracingOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
    setActivePreset('Custom');
  }, []);

  const applyPreset = useCallback((preset: TracingPreset) => {
    setOptions((prev) => ({ ...prev, ...preset.options }));
    setActivePreset(preset.name);
  }, []);

  const resetOptions = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    setActivePreset('Default');
  }, []);

  const trace = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(10);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 80));
      }, 200);

      const tracingResult = await traceImageFromFile(file, options);

      clearInterval(progressInterval);
      setProgress(100);
      setResult(tracingResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trace image');
    } finally {
      setLoading(false);
    }
  }, [file, options]);

  const downloadSvg = useCallback(() => {
    if (!result) return;

    const blob = new Blob([result.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file ? file.name.replace(/\.[^.]+$/, '.svg') : 'traced.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result, file]);

  const copySvg = useCallback(async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.svg);
      return true;
    } catch {
      return false;
    }
  }, [result]);

  const clear = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setImageInfo(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setProgress(0);
  }, [previewUrl]);

  return {
    // State
    file,
    imageInfo,
    previewUrl,
    options,
    result,
    loading,
    error,
    progress,
    activePreset,
    presets: PRESETS,
    engineInfo: ENGINE_INFO,
    // Actions
    onFile,
    updateOption,
    applyPreset,
    resetOptions,
    trace,
    downloadSvg,
    copySvg,
    clear,
  };
};

export type UseImageToSvgReturn = ReturnType<typeof useImageToSvg>;
