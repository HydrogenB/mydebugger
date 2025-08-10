/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import { expandImageWithJunk } from '../../ImagePaddingUtils';

export const useGenerateLargeImage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [sizeKB, setSizeKB] = useState(0);
  const [targetSizeMB, setTargetSizeMB] = useState(1);
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg');
  const [autoDownload, setAutoDownload] = useState(false);
  const [preserveResolution, setPreserveResolution] = useState(true);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [error, setError] = useState('');

  const reset = () => {
    setPreviewUrl('');
    setWidth(0);
    setHeight(0);
    setSizeKB(0);
    setOutputUrl(null);
    setOutputSize(0);
    setProgress(0);
  };

  const onFile = (f: File) => {
    reset();
    if (!['image/jpeg', 'image/png'].includes(f.type)) {
      setError('Only JPG or PNG images allowed');
      return;
    }
    if (f.size > 1 * 1024 * 1024) {
      setError('Image must be 1MB or smaller');
      return;
    }
    setError('');
    setFile(f);
    setSizeKB(Math.round(f.size / 1024));
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = url;
  };

  const generate = async () => {
    if (!file) return;
    setProgress(10);
    const img = new Image();
    img.src = previewUrl;
    await new Promise((res) => {
      img.onload = () => res(null);
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    setProgress(50);
    const blob: Blob = await new Promise((resolve) => {
      if (format === 'jpg') {
        canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.8);
      } else {
        canvas.toBlob((b) => resolve(b as Blob), 'image/png');
      }
    });
    let finalBlob = blob;
    if (blob.size < targetSizeMB * 1024 * 1024) {
      finalBlob = expandImageWithJunk(blob, targetSizeMB);
    }
    const url = URL.createObjectURL(finalBlob);
    setOutputUrl(url);
    setOutputSize(finalBlob.size);
    setProgress(100);
    if (autoDownload) {
      const a = document.createElement('a');
      a.href = url;
      const base = file.name.replace(/\.[^.]+$/, '');
      a.download = `${base}_${targetSizeMB}MB.${format}`;
      a.click();
    }
  };

  return {
    file,
    previewUrl,
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
  };
};

export type UseGenerateLargeImageReturn = ReturnType<typeof useGenerateLargeImage>;
