import React from 'react';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  encodedLink: string;
  onShowLarge: () => void;
  onSave: () => void;
  onCopyLink?: () => void;
  onCopyEncodedLink?: () => void;
  onCopyImage?: () => void;
  onDownload?: () => void;
  onOpenLink?: () => void;
  onShareLink?: () => void;
  isRunningLink?: boolean;
}

/**
 * Component to display the generated QR code
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qrCodeUrl, 
  encodedLink, 
  onShowLarge,
  onSave,
  onCopyLink,
  onCopyEncodedLink,
  onCopyImage,
  onDownload,
  onOpenLink,
  onShareLink,
  isRunningLink
}) => {
  if (!qrCodeUrl) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 flex flex-col items-center">
        {/* QR Code display */}
        <img 
          src={qrCodeUrl} 
          alt="QR Code" 
          className="max-w-full cursor-pointer" 
          onClick={onShowLarge}
        />
        
        {/* Encoded link display */}
        <div className="mt-3 w-full max-w-full overflow-hidden">
          <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
            {encodedLink}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
          </svg>
          Save QR Code
        </button>
        
        <button
          onClick={() => {
            // Open QR code in new tab
            const win = window.open();
            if (win) {
              win.document.write(`<img src="${qrCodeUrl}" alt="QR Code"/>`);
              win.document.title = 'QR Code';
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in New Tab
        </button>
        
        <a
          href={qrCodeUrl}
          download="qrcode.png"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download
        </a>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
