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
  const [info, setInfo] = useState<ImageInfo | null>(null);
  const [targetSize, setTargetSize] = useState(50);
  const [scale, setScale] = useState(1);
  const [colorDepth, setColorDepth] = useState(8);
  const [result, setResult] = useState<CompressedResult | null>(null);
  const [loading, setLoading] = useState(false);

  const onFile = (f: File) => {
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setInfo({ width: img.width, height: img.height, sizeKB: Math.round(f.size / 1024) });
      URL.revokeObjectURL(url);
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
  };
};

export type UseImageCompressorReturn = ReturnType<typeof useImageCompressor>;
