import React, { useState, useEffect } from 'react';
import { ImageInfo } from './types';
import { formatBytes, extractImageFormat } from './utils';
import { ImageInput, ImagePreview } from './components';

const Base64ImageDebugger: React.FC = () => {
  const [base64Input, setBase64Input] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);

  // Process and analyze the base64 image
  const analyzeImage = () => {
    setError('');
    setImageInfo(null);

    try {
      let processedInput = base64Input.trim();

      // Handle URLs that might contain a base64 string
      if (processedInput.includes('base64,')) {
        processedInput = processedInput.split('base64,')[1];
      }

      // Validate the base64 string
      if (!/^[A-Za-z0-9+/=]+$/.test(processedInput)) {
        setError('Invalid base64 format');
        return;
      }

      // Create the full data URL
      const dataUrl = processedInput.includes('data:image/')
        ? processedInput
        : `data:image/png;base64,${processedInput}`;

      // Load the image to get dimensions
      const img = new Image();
      img.onload = () => {
        // Calculate the size in bytes (approximate)
        const binaryString = atob(dataUrl.split(',')[1]);
        const bytes = binaryString.length;

        setImageInfo({
          width: img.width,
          height: img.height,
          type: extractImageFormat(dataUrl),
          size: bytes,
          sizeFormatted: formatBytes(bytes)
        });
      };
      
      img.onerror = () => {
        setError('Failed to load image. The base64 data might be corrupted.');
      };
      
      img.src = dataUrl;
      setImageUrl(dataUrl);
    } catch (err) {
      setError('Error processing image: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Clear everything when the input is empty
  useEffect(() => {
    if (!base64Input) {
      setImageUrl('');
      setImageInfo(null);
      setError('');
    }
  }, [base64Input]);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Base64 Image Debugger</h2>
      
      <ImageInput
        base64Input={base64Input}
        setBase64Input={setBase64Input}
        error={error}
        onAnalyze={analyzeImage}
      />
      
      <ImagePreview 
        imageUrl={imageUrl} 
        imageInfo={imageInfo} 
      />
      
      {imageUrl && (
        <div className="mt-4 border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Data URL</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
            <pre className="text-xs break-all whitespace-pre-wrap">
              {imageUrl}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Base64ImageDebugger;
