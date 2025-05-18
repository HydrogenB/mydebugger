import React from 'react';
import { SavedQRCode } from '../types';

interface QRCodeListProps {
  savedCodes: SavedQRCode[];
  onDelete: (id: string) => void;
  onSelect: (code: SavedQRCode) => void;
}

/**
 * Component to display a list of saved QR codes
 */
const QRCodeList: React.FC<QRCodeListProps> = ({ savedCodes, onDelete, onSelect }) => {
  if (savedCodes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No saved QR codes yet. Generate and save a QR code to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
      {savedCodes.map((code) => (
        <div 
          key={code.id} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={code.nickname}>
              {code.nickname}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(code.id);
              }}
              className="text-red-500 hover:text-red-700"
              aria-label="Delete saved QR code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div 
            className="cursor-pointer" 
            onClick={() => onSelect(code)}
          >
            <div className="flex justify-center mb-2">
              <img 
                src={code.qrCodeUrl} 
                alt="QR Code" 
                className="h-32 w-32 object-contain" 
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={code.url}>
              {code.url}
            </p>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {new Date(code.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QRCodeList;
