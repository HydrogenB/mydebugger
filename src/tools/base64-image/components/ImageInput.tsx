import React from 'react';

interface ImageInputProps {
  base64Input: string;
  setBase64Input: (value: string) => void;
  error: string;
  onAnalyze: () => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({ 
  base64Input, 
  setBase64Input, 
  error, 
  onAnalyze 
}) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3">Enter Base64 Image Data</h3>
      <textarea
        value={base64Input}
        onChange={(e) => setBase64Input(e.target.value)}
        className="w-full h-40 border rounded p-2 text-sm font-mono bg-white dark:bg-gray-800"
        placeholder="Paste your base64 image data here..."
      />
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      <div className="mt-3">
        <button
          onClick={onAnalyze}
          disabled={!base64Input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Analyze Image
        </button>
      </div>
    </div>
  );
};
