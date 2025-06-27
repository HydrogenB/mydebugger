/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import compressImageFn, {
  CompressOptions,
  CompressedResult,
  ImageInfo,
} from '../model/imageCompressor';

export const useImageCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [info, setInfo] = useState<ImageInfo | null>(null);
  const [targetSize, setTargetSize] = useState(50);
  const [scale, setScale] = useState(1);
  const [colorDepth, setColorDepth] = useState(8);
  const [result, setResult] = useState<CompressedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFile = (f: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Only JPG, PNG or WebP allowed');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('Image must be 20MB or smaller');
      return;
    }
    setError('');
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      setInfo({ width: img.width, height: img.height, sizeKB: Math.round(f.size / 1024) });
    };
    img.src = url;
  };

  const compress = async () => {
    if (!file) return;
    setLoading(true);
    const opts: CompressOptions = { targetSizeKB: targetSize, scale, colorDepth };
    const res = await compressImageFn(file, opts);
    setResult(res);
    setLoading(false);
  };

  return {
    file,
    previewUrl,
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
    error,
  };
};

export type UseImageCompressorReturn = ReturnType<typeof useImageCompressor>;
