/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState, useEffect, ChangeEvent } from 'react';
import { ImageInfo, formatBytes, extractImageFormat } from '../model/base64Image';

export const useBase64ImageDebugger = () => {
  const [base64Input, setBase64Input] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setBase64Input(input);
    setError('');

    let dataUrl = input.trim();
    if (!dataUrl.startsWith('data:image/')) {
      dataUrl = `data:image/png;base64,${dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '')}`;
    }
    setImageUrl(dataUrl);
  };

  useEffect(() => {
    if (!imageUrl) {
      setImageInfo(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const base64Data = imageUrl.split(',')[1] || '';
      const approximateBytes = base64Data ? base64Data.length * 0.75 : 0;

      setImageInfo({
        width: img.width,
        height: img.height,
        type: extractImageFormat(imageUrl),
        size: Math.round(approximateBytes),
        sizeFormatted: formatBytes(Math.round(approximateBytes))
      });
      setError('');
    };

    img.onerror = () => {
      setError('Failed to load image. Invalid base64 data or unsupported format.');
      setImageInfo(null);
    };

    img.src = imageUrl;
  }, [imageUrl]);

  const handlePasteExample = () => {
    const exampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    setBase64Input(exampleBase64);
    setImageUrl(exampleBase64);
  };

  const clear = () => {
    setBase64Input('');
    setImageUrl('');
    setError('');
    setImageInfo(null);
  };

  return {
    base64Input,
    imageUrl,
    error,
    imageInfo,
    handleInputChange,
    handlePasteExample,
    clear
  };
};

export default useBase64ImageDebugger;
