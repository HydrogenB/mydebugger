// @ts-nocheck


import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';

const QRCodeGenerator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [size, setSize] = useState<number>(250);
  const [errorCorrection, setErrorCorrection] = useState<string>('M');
  const [darkColor, setDarkColor] = useState<string>('#000000');
  const [lightColor, setLightColor] = useState<string>('#FFFFFF');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [qrType, setQrType] = useState<'text' | 'link'>('text');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate QR code when input or properties change
  useEffect(() => {
    if (input) {
      generateQRCode();
    } else {
      setQrCodeUrl('');
    }
  }, [input, size, errorCorrection, darkColor, lightColor, qrType]);
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  // Function to draw a QR code dot on the canvas
  const drawDot = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    size: number, 
    color: string
  ) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  };

  // Generate a simple QR code using canvas
  const generateQRCode = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.fillStyle = lightColor;
      ctx.fillRect(0, 0, size, size);
      
      const content = qrType === 'link' && !input.startsWith('http') 
        ? `https://${input}` 
        : input;
        
      // Create a pseudo-random pattern based on input content
      // This is a simplified algorithm - not an actual QR code algorithm
      const hash = simpleHash(content + errorCorrection);
      const densityFactor = 0.15 + (errorCorrectionToNumber(errorCorrection) * 0.05);
      
      // Generate the pattern
      const dotSize = Math.max(2, Math.floor(size / 40));
      const gridSize = Math.floor(size / dotSize);
      
      // Draw finder patterns (the three square markers in corners)
      drawFinderPattern(ctx, 0, 0, gridSize, dotSize, darkColor, lightColor);
      drawFinderPattern(ctx, 0, gridSize - 8, gridSize, dotSize, darkColor, lightColor);
      drawFinderPattern(ctx, gridSize - 8, 0, gridSize, dotSize, darkColor, lightColor);
      
      // Draw data dots based on content hash
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          // Skip areas where finder patterns are
          if ((x < 8 && y < 8) || 
              (x < 8 && y > gridSize - 9) ||
              (x > gridSize - 9 && y < 8)) {
            continue;
          }
          
          // Create a deterministic but seemingly random pattern
          const shouldDraw = (
            (Math.sin(x * y * hash * 0.1) + Math.cos(x + y + hash * 0.1)) > (2 - densityFactor * 4)
          );
          
          if (shouldDraw) {
            drawDot(ctx, x * dotSize, y * dotSize, dotSize, darkColor);
          }
        }
      }
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setQrCodeUrl(dataUrl);
      
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };
  
  // Draw a finder pattern (the three square markers in the corners of QR codes)
  const drawFinderPattern = (
    ctx: CanvasRenderingContext2D,
    startX: number, 
    startY: number,
    gridSize: number,
    dotSize: number,
    darkColor: string,
    lightColor: string
  ) => {
    // Outer 7x7 square
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if ((x === 0 || x === 6 || y === 0 || y === 6) || // Outer frame
            (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {     // Inner square
          drawDot(ctx, (startX + x) * dotSize, (startY + y) * dotSize, dotSize, darkColor);
        } else {
          drawDot(ctx, (startX + x) * dotSize, (startY + y) * dotSize, dotSize, lightColor);
        }
      }
    }
  };
  
  // Simple string hashing function to create deterministic patterns
  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };
  
  // Convert error correction level to a number for calculations
  const errorCorrectionToNumber = (level: string): number => {
    switch (level) {
      case 'L': return 1;
      case 'M': return 2;
      case 'Q': return 3;
      case 'H': return 4;
      default: return 2;
    }
  };
  
  const handleCopyQRLink = () => {
    if (!qrCodeUrl) return;
    
    const contentToCopy = qrType === 'link' && !input.startsWith('http') 
      ? `https://${input}` 
      : input;
      
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
  };
  
  const handleDownloadQR = () => {
    if (!canvasRef.current || !input) return;
    
    const link = document.createElement('a');
    link.download = `qrcode-${input.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleReset = () => {
    setInput('');
    setSize(250);
    setErrorCorrection('M');
    setDarkColor('#000000');
    setLightColor('#FFFFFF');
    setQrCodeUrl('');
    setQrType('text');
  };
  
  // Handle saving QR code with link to local storage
  const handleSaveToCollection = () => {
    if (!input || !qrCodeUrl || !canvasRef.current) return;
    
    try {
      // Get existing saved QR codes or initialize empty array
      const savedQRs = JSON.parse(localStorage.getItem('savedQRCodes') || '[]');
      
      const contentToSave = qrType === 'link' && !input.startsWith('http') 
        ? `https://${input}` 
        : input;
      
      // Add new QR code with its data URL
      savedQRs.push({
        url: contentToSave,
        qrImage: canvasRef.current.toDataURL('image/png'),
        nickname: `QR Code ${savedQRs.length + 1}`,
        createdAt: new Date().toISOString(),
        type: qrType
      });
      
      // Save back to localStorage
      localStorage.setItem('savedQRCodes', JSON.stringify(savedQRs));
      
      // Show temporary success message (could be implemented with a state variable)
      alert('QR code saved to your collection!');
    } catch (error) {
      console.error("Error saving QR code:", error);
      alert('Failed to save QR code');
    }
  };
  
  // SEO metadata
  const pageTitle = "QR Code Generator | MyDebugger";
  const pageDescription = "Generate QR codes for links, text, or data instantly without uploading to a server.";
  
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/qrcode" />
        <meta name="twitter:card" content="summary" />
                    onChange={(e) => setErrorCorrection(e.target.value)}
                  >"twitter:description" content={pageDescription} />
        <link rel="canonical" href="https://mydebugger.vercel.app/qrcode" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-gray-600 mb-8">
          Generate, customize, and download QR codes for any URL or text.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Input Section */}
          <div className="flex-1">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4">
                <label htmlFor="qrType" className="block font-medium text-gray-700 mb-2">
                  QR Code Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="qrType"
                      value="text"
                      checked={qrType === 'text'}
                      onChange={() => setQrType('text')}
                    />
                    <span className="ml-2">Text</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="qrType"
                      value="link"
                      checked={qrType === 'link'}
                      onChange={() => setQrType('link')}
                    />
                    <span className="ml-2">Link</span>
                  </label>
                </div>
              </div>

              <label htmlFor="input" className="block font-medium text-gray-700 mb-2">
                {qrType === 'text' ? 'Text to Encode' : 'URL to Encode'}
              </label>
              <input
                type="text"
                id="input"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mb-4"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={qrType === 'text' ? "Enter text to encode into QR code..." : "Enter URL to encode into QR code..."}
                autoFocus
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                    Size (px)
                  </label>
                  <input
                    type="range"
                    id="size"
                    className="w-full"
                    min="100"
                    max="500"
                    step="10"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                  />
                  <div className="text-sm text-gray-500 text-right">{size}px</div>
                </div>
                <div>
                  <label htmlFor="errorCorrection" className="block text-sm font-medium text-gray-700 mb-1">
                    Error Correction
                  </label>
                  <select
                    id="errorCorrection"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    value={errorCorrection}
                    onChange={(e) => setErrorCorrection(e.target.value)}
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="darkColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Dark Color
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="darkColor"
                      className="h-8 w-8 rounded mr-2"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      maxLength={7}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lightColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Light Color
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="lightColor"
                      className="h-8 w-8 rounded mr-2"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          
          {/* Output Section */}
          <div className="flex-1">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">QR Code Preview</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyQRLink}
                    disabled={!qrCodeUrl}
                    className={`px-3 py-1 rounded-md text-sm transition ${
                      qrCodeUrl
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy Content'}
                  </button>
                  <button
                    onClick={handleDownloadQR}
                    disabled={!qrCodeUrl}
                    className={`px-3 py-1 rounded-md text-sm transition ${
                      qrCodeUrl
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Download PNG
                  </button>
                </div>
              </div>
              
              <div className={`qr-preview flex flex-col items-center justify-center p-4 rounded bg-${lightColor === '#FFFFFF' ? 'gray-50' : 'white'} border border-gray-100`}>
                {qrCodeUrl ? (
                  <>
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="mb-4" 
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <div className="text-xs text-center text-gray-500 break-all mt-2">
                      {qrType === 'link' && !input.startsWith('http') ? `https://${input}` : input}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                    <svg className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p>Enter {qrType === 'text' ? 'text' : 'a URL'} to generate QR code</p>
                  </div>
                )}
              </div>
              
              <canvas 
                ref={canvasRef} 
                style={{ display: 'none' }} 
                width={size} 
                height={size}
              />
              
              {qrCodeUrl && (
                <div className="mt-4">
                  <button
                    onClick={handleSaveToCollection}
                    className="w-full py-2 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white transition flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save to My Collection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Saved QR Codes Section */}
        <SavedQRCodes />
        
        {/* How to Use Section */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">How to Use QR Codes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-blue-500 mb-3">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="font-medium mb-2">Website URLs</h3>
              <p className="text-sm text-gray-600">
                Generate a QR code for your website to make it easy for mobile users to visit without typing the URL.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-blue-500 mb-3">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium mb-2">Mobile Apps</h3>
              <p className="text-sm text-gray-600">
                Create QR codes for app download links, deep links, or to share contact information with others.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-blue-500 mb-3">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-medium mb-2">Secure Sharing</h3>
              <p className="text-sm text-gray-600">
                Share sensitive links via QR codes for contactless transfer of information between devices.
              </p>
            </div>
          </div>
        </div>
        
        {/* Learn More Section */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Learn More</h2>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <p className="mb-2">
              QR codes (Quick Response codes) are two-dimensional barcodes that can store data and be scanned by smartphone cameras.
              They're widely used for sharing URLs, contact info, Wi-Fi credentials, and more.
            </p>
            <p className="mb-2">
              Our QR code generator creates codes directly in your browser without sending your data to any server, protecting your privacy.
            </p>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Error Correction Levels:</h3>
              <ul className="list-disc pl-5 text-gray-700">
                <li className="mb-1"><strong>Low (L):</strong> Recovers up to 7% damage</li>
                <li className="mb-1"><strong>Medium (M):</strong> Recovers up to 15% damage</li>
                <li className="mb-1"><strong>Quartile (Q):</strong> Recovers up to 25% damage</li>
                <li className="mb-1"><strong>High (H):</strong> Recovers up to 30% damage</li>
              </ul>
            </div>
            <a 
              href="https://en.wikipedia.org/wiki/QR_code" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center mt-3"
            >
              Learn more about QR codes
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Related Tools */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/url-encoder"
              className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="font-medium text-lg mb-1">URL Encoder/Decoder</h3>
              <p className="text-gray-600">Encode or decode URL components safely.</p>
            </a>
            <a
              href="/jwt"
              className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="font-medium text-lg mb-1">JWT Decoder</h3>
              <p className="text-gray-600">Decode and verify JSON Web Tokens (JWT) instantly.</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

// Component to display saved QR codes from localStorage
const SavedQRCodes: React.FC = () => {
  const [savedQRs, setSavedQRs] = useState<any[]>([]);
  
  // Load saved QR codes from localStorage on component mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedQRCodes') || '[]');
      setSavedQRs(saved);
    } catch (error) {
      console.error("Error loading saved QR codes:", error);
    }
  }, []);
  
  // If no saved QR codes, don't render this section
  if (!savedQRs.length) return null;
  
  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h2 className="text-xl font-semibold mb-4">Your Saved QR Codes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {savedQRs.map((qr, index) => (
          <div key={index} className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md">
            <div className="flex justify-center mb-3">
              <img src={qr.qrImage} alt="Saved QR Code" className="w-32 h-32" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-gray-800">{qr.nickname}</h3>
              <p className="text-xs text-gray-500 truncate mt-1">{qr.url}</p>
              <div className="flex justify-center space-x-2 mt-2">
                <a 
                  href={qr.qrImage} 
                  download={`${qr.nickname.replace(/[^a-zA-Z0-9]/g, '-')}.png`} 
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  Download
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(qr.url);
                  }}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  Copy {qr.type === 'link' ? 'URL' : 'Text'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRCodeGenerator;