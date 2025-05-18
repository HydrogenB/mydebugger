import React from 'react';

interface LargeQRCodeModalProps {
  isOpen: boolean;
  qrCodeUrl: string;
  onClose: () => void;
}

/**
 * Modal to display a larger version of the QR code
 */
const LargeQRCodeModal: React.FC<LargeQRCodeModalProps> = ({
  isOpen,
  qrCodeUrl,
  onClose
}) => {
  if (!isOpen || !qrCodeUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex justify-center">
          <img 
            src={qrCodeUrl} 
            alt="Large QR Code" 
            className="max-w-full max-h-[70vh]" 
          />
        </div>
        
        <div className="mt-4 flex justify-center space-x-3">
          <a
            href={qrCodeUrl}
            download="qrcode.png"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default LargeQRCodeModal;
