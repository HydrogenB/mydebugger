/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Image Lightbox Component
 * Full-screen preview of converted images with navigation and zoom
 */

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import type { ConvertedImage } from '../lib/pdfConverter';
import { formatFileSize } from '../lib/pdfConverter';

interface ImageLightboxProps {
  images: ConvertedImage[];
  initialPageNumber?: number;
  onClose: () => void;
  onDownload?: (image: ConvertedImage) => void;
}

export const ImageLightbox = ({
  images,
  initialPageNumber = 1,
  onClose,
  onDownload,
}: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, images.findIndex(img => img.pageNumber === initialPageNumber))
  );
  const [zoomLevel, setZoomLevel] = useState(100);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentImage = images[currentIndex];

  // Create object URL for current image
  useEffect(() => {
    setIsLoading(true);
    const url = URL.createObjectURL(currentImage.blob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [currentImage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(i => (i > 0 ? i - 1 : images.length - 1));
    setZoomLevel(100);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(i => (i < images.length - 1 ? i + 1 : 0));
    setZoomLevel(100);
  }, [images.length]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(z => Math.min(z + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(z => Math.max(z - 25, 50));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    },
    [onClose, handlePrevious, handleNext, handleZoomIn, handleZoomOut]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload(currentImage);
    }
  }, [currentImage, onDownload]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/50 border-b border-slate-600">
        <div className="flex items-center gap-4">
          <h3 className="text-white text-lg font-semibold">
            {currentImage.fileName}
          </h3>
          <span className="text-slate-400 text-sm">
            {currentIndex + 1} of {images.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-slate-400 text-sm flex gap-4">
            <span>{currentImage.width} × {currentImage.height}px</span>
            <span>{formatFileSize(currentImage.blob.size)}</span>
          </div>

          {onDownload && (
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300 hover:text-white"
              title="Download image"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300 hover:text-white"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center">
        {isLoading && imageUrl ? (
          <img
            src={imageUrl}
            alt={`Preview ${currentImage.pageNumber}`}
            className="object-contain"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'center',
            }}
            onLoad={() => setIsLoading(false)}
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={`Preview ${currentImage.pageNumber}`}
            className="object-contain"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-out',
            }}
          />
        ) : (
          <div className="text-slate-400">Failed to load image</div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/50 border-t border-slate-600">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300 hover:text-white"
            title="Previous image (← arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300 hover:text-white"
            title="Next image (→ arrow)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel === 50}
            className="p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom out (- key)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <span className="text-slate-300 text-sm w-16 text-center font-medium">
            {zoomLevel}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel === 200}
            className="p-2 hover:bg-slate-700 rounded-md transition-colors text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom in (+ key)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        <div className="text-slate-400 text-xs">
          ESC to close • ← → to navigate • +/- to zoom
        </div>
      </div>
    </div>
  );
};
