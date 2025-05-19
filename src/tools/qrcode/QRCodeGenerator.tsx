import React, { useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useQRCodeGenerator } from './hooks';
import { QRCodeGeneratorProps } from './types';
import {
  QRCodeInput,
  QRCodeDisplay,
  QRCodeSettings,
  QRCodeList,
  SaveQRCodeModal,
  LargeQRCodeModal,
  ToastMessage
} from './components';

/**
 * QR Code Generator Tool
 * Creates QR codes from URLs or text with customization options
 */
const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ initialLink }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  
  // Using our custom hook for all QR code functionality
  const {
    // State
    input,
    encodedLink,
    settings,
    qrCodeUrl,
    toastMessage,
    showCosmeticOptions,
    savedQRCodes,
    showSaveModal,
    nickname,
    showLargeQRModal,
    isRunningLink,
    isMobile,
    
    // Actions
    setInput,
    updateSettings,
    toggleCosmeticOptions,
    generateQRCode,
    saveQRCode,
    deleteQRCode,
    setShowSaveModal,
    setNickname,
    setShowLargeQRModal,
    setIsRunningLink,
    showToast
  } = useQRCodeGenerator(initialLink);

  // SECTION: Clipboard and sharing functions
  
  /**
   * Generic clipboard copy function with error handling
   */
  const handleCopyToClipboard = useCallback((text: string, message: string) => {
    try {
      navigator.clipboard.writeText(text);
      showToast(message);
    } catch (error) {
      console.error("Clipboard error:", error);
      showToast("Clipboard access denied. Please update your browser permissions.");
    }
  }, [showToast]);

  /**
   * Copy URL-encoded version of link to clipboard
   */
  const handleCopyEncodedLink = useCallback(() => {
    if (!encodedLink) return;
    handleCopyToClipboard(encodedLink, "Encoded link copied!");
  }, [encodedLink, handleCopyToClipboard]);
  
  /**
   * Copy raw link to clipboard
   */
  const handleCopyRawLink = useCallback(() => {
    if (!input) return;
    handleCopyToClipboard(input, "Link copied!");
  }, [input, handleCopyToClipboard]);
  
  /**
   * Copy QR code as image to clipboard with fallback to download
   */
  const handleCopyQRAsImage = useCallback(async () => {
    if (!qrCodeUrl || !input) return;
    
    try {
      // Convert data URL to blob
      const blob = await (await fetch(qrCodeUrl)).blob();
      
      // Try to use the clipboard API for images if supported
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        const clipboardItem = new ClipboardItem({
          [blob.type]: blob
        });
        await navigator.clipboard.write([clipboardItem]);
        showToast("QR image copied to clipboard!");
      } else {
        // Fallback - create a temp link and download
        handleDownloadQR();
        showToast("QR image downloaded (copy not supported in this browser)");
      }
    } catch (error) {
      console.error("Error copying QR:", error);
      handleDownloadQR();
      showToast("Image copy failed - downloaded instead");
    }
  }, [qrCodeUrl, input, showToast]);
  
  // SECTION: QR code download and export 
  
  /**
   * Download QR code as PNG with enhanced formatting
   */
  const handleDownloadQR = useCallback(() => {
    if (!qrCodeUrl || !input) return;
    
    // Create a new image element
    const img = new Image();
    img.src = qrCodeUrl;
    
    img.onload = () => {
      // Generate a new canvas with the QR code and URL text
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      // Set sizes to allow for text below QR code
      const padding = 20;
      const size = settings.size;
      tempCanvas.width = size + (padding * 2);
      tempCanvas.height = size + (padding * 3) + 20; // Extra space for text
      
      if (ctx) {
        // Fill with light color
        ctx.fillStyle = settings.lightColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the QR code from our image
        ctx.drawImage(img, padding, padding, size, size);
        
        // Draw the URL text below QR code
        ctx.font = '12px Arial';
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'center';
        
        // Truncate long URLs for display
        const displayText = input.length > 50 ? input.substring(0, 47) + '...' : input;
        ctx.fillText(displayText, tempCanvas.width / 2, size + (padding * 2));
        
        // Add a "Generated with MyDebugger" note
        ctx.font = '10px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('Generated with MyDebugger QR Tool', tempCanvas.width / 2, size + (padding * 2) + 15);
        
        // Create download link
        const link = document.createElement('a');
        const fileName = `qrcode-${input.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        link.download = fileName;
        link.href = tempCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("QR code downloaded!");
      }
    };
  }, [qrCodeUrl, input, settings, showToast]);
  
  /**
   * Open the generated link in a new browser tab
   */
  const handleRunLink = useCallback(() => {
    if (!input || isMobile) return;
    
    setIsRunningLink(true);
    setTimeout(() => {
      try {
        window.location.href = input;
      } catch (error) {
        console.error("Error opening link:", error);
        showToast("Error opening link");
      }
      setTimeout(() => setIsRunningLink(false), 1000);
    }, 10);
  }, [input, isMobile, setIsRunningLink, showToast]);
  
  /**
   * Create and copy shareable link with QR code parameter
   */
  const handleSharePageWithLink = useCallback(() => {
    if (!input) return;
    
    try {
      // Create a URL object for the current page
      const currentUrl = new URL(window.location.href);
      
      // Reset any existing search parameters
      currentUrl.search = '';
      
      // Add the properly encoded link parameter
      const encodedLinkParam = encodeURIComponent(input);
      currentUrl.searchParams.set('link', encodedLinkParam);
      
      // Copy the full URL to clipboard
      navigator.clipboard.writeText(currentUrl.toString());
      showToast("Shareable link copied! Send to your team.");
    } catch (error) {
      console.error("Error creating shareable link:", error);
      showToast("Error creating shareable link");
    }
  }, [input, showToast]);

  // SECTION: Component rendering
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Helmet>
        <title>QR Code Generator - MyDebugger</title>
        <meta name="description" content="Generate QR codes for URLs or text with customization options" />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          QR Code Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate QR codes for URLs or any text. Customize size, colors, and error correction level.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {/* Input component */}
          <QRCodeInput
            value={input}
            onChange={setInput}
            onGenerate={generateQRCode}
            onToggleOptions={toggleCosmeticOptions}
            showOptions={showCosmeticOptions}
          />

          {/* QR Code Settings */}
          {showCosmeticOptions && (
            <QRCodeSettings
              settings={settings}
              onUpdateSettings={updateSettings}
            />
          )}

          {/* QR Code Display */}
          {qrCodeUrl && (
            <QRCodeDisplay
              qrCodeUrl={qrCodeUrl}
              encodedLink={encodedLink}
              onShowLarge={() => setShowLargeQRModal(true)}
              onSave={() => setShowSaveModal(true)}
              onCopyLink={handleCopyRawLink}
              onCopyEncodedLink={handleCopyEncodedLink}
              onCopyImage={handleCopyQRAsImage}
              onDownload={handleDownloadQR}
              onOpenLink={handleRunLink}
              onShareLink={handleSharePageWithLink}
              isRunningLink={isRunningLink}
            />
          )}
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Saved QR Codes
            </h2>
            <QRCodeList
              savedCodes={savedQRCodes}
              onDelete={deleteQRCode}
              onSelect={(code) => {
                setInput(code.url);
                updateSettings(code.settings);
              }}
            />
          </div>
        </div>
      </div>

      {/* Hidden canvas for QR code operations */}
      <canvas 
        ref={canvasRef}
        style={{ display: 'none' }}
        width={settings.size}
        height={settings.size}
      />

      {/* Modals & Toast */}
      <SaveQRCodeModal
        isOpen={showSaveModal}
        nickname={nickname}
        onNicknameChange={setNickname}
        onSave={saveQRCode}
        onClose={() => setShowSaveModal(false)}
      />

      <LargeQRCodeModal
        isOpen={showLargeQRModal}
        qrCodeUrl={qrCodeUrl}
        onClose={() => setShowLargeQRModal(false)}
      />

      <ToastMessage
        message={toastMessage}
        isVisible={Boolean(toastMessage)}
      />
    </div>
  );
};

export default QRCodeGenerator;
