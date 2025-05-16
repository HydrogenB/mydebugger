import React, { useState, useEffect } from 'react';

interface ImageInfo {
  width: number;
  height: number;
  type: string;
  size: number;
  sizeFormatted: string;
}

const Base64ImageDebugger: React.FC = () => {
  const [base64Input, setBase64Input] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Extract image format from data URL
  const extractImageFormat = (dataUrl: string): string => {
    const match = dataUrl.match(/data:image\/([a-zA-Z0-9+.-]+);base64,/);
    return match ? match[1].toUpperCase() : 'Unknown';
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setBase64Input(input);
    
    // Clear previous errors
    setError('');
    
    // Try to validate and display the image
    try {
      // Check if input already has the data URL prefix
      let dataUrl = input.trim();
      
      if (!dataUrl.startsWith('data:image/')) {
        // Try to add the generic image data URL prefix
        dataUrl = `data:image/png;base64,${dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '')}`;
      }
      
      setImageUrl(dataUrl);
    } catch (err) {
      setError('Invalid base64 string');
      setImageUrl('');
      setImageInfo(null);
    }
  };

  // Load image information when image URL changes
  useEffect(() => {
    if (!imageUrl) {
      setImageInfo(null);
      return;
    }

    // Create image element to get dimensions
    const img = new Image();
    img.onload = () => {
      // Calculate approximate size in bytes (base64 encoded size * 0.75)
      const base64Data = imageUrl.split(',')[1] || '';
      const approximateBytes = base64Data ? base64Data.length * 0.75 : 0;
      
      setImageInfo({
        width: img.width,
        height: img.height,
        type: extractImageFormat(imageUrl),
        size: Math.round(approximateBytes),
        sizeFormatted: formatBytes(Math.round(approximateBytes))
      });
      
      // Clear error if image loads successfully
      setError('');
    };
    
    img.onerror = () => {
      setError('Failed to load image. Invalid base64 data or unsupported format.');
      setImageInfo(null);
    };
    
    img.src = imageUrl;
  }, [imageUrl]);

  const handlePasteExample = () => {
    // Example base64 PNG (a small 1x1 transparent pixel)
    const exampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    setBase64Input(exampleBase64);
    setImageUrl(exampleBase64);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Base64 Image Debugger</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Paste your base64 image data:
        </label>
        <textarea
          className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          value={base64Input}
          onChange={handleInputChange}
          placeholder="data:image/png;base64,..."
        />
        <div className="mt-2 flex gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            onClick={handlePasteExample}
          >
            Paste Example
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            onClick={() => {
              setBase64Input('');
              setImageUrl('');
              setError('');
              setImageInfo(null);
            }}
          >
            Clear
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded dark:bg-red-900 dark:text-red-200 dark:border-red-700">
          {error}
        </div>
      )}
      
      {imageUrl && !error && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Preview:</h3>
          <div className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <img 
              src={imageUrl} 
              alt="Base64 Preview" 
              className="max-w-full mx-auto"
              style={{ maxHeight: '400px' }}
            />
          </div>
        </div>
      )}
      
      {imageInfo && (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Image Details:</h3>
          <table className="w-full text-left">
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Format:</td>
                <td className="py-2 text-gray-800 dark:text-gray-200">{imageInfo.type}</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Dimensions:</td>
                <td className="py-2 text-gray-800 dark:text-gray-200">{imageInfo.width} × {imageInfo.height} pixels</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">File Size:</td>
                <td className="py-2 text-gray-800 dark:text-gray-200">{imageInfo.sizeFormatted} ({imageInfo.size} bytes)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Data URL Length:</td>
                <td className="py-2 text-gray-800 dark:text-gray-200">{imageUrl.length} characters</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Base64ImageDebugger;
