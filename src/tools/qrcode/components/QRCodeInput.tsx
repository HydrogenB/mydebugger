import React from 'react';

interface QRCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onToggleOptions: () => void;
  showOptions: boolean;
}

/**
 * Input component for the QR code generator
 */
const QRCodeInput: React.FC<QRCodeInputProps> = ({
  value,
  onChange,
  onGenerate,
  onToggleOptions,
  showOptions
}) => {
  return (
    <div className="mb-4">
      <div className="flex flex-col mb-2">
        <label htmlFor="qrInput" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Enter URL or text to encode
        </label>
        <div className="flex space-x-2">
          <input
            id="qrInput"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com or any text"
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onGenerate();
              }
            }}
          />
          <button
            onClick={onGenerate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Generate
          </button>
        </div>
      </div>
      
      <button
        onClick={onToggleOptions}
        className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none"
      >
        <span>{showOptions ? 'Hide options' : 'Show options'}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ml-1 transition-transform ${showOptions ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default QRCodeInput;
