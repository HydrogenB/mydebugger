/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * PDF Preview Carousel Component
 * Provides slide-show style navigation through PDF pages with zoom controls
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { renderPageToImage, type ConversionConfig } from '../lib/pdfConverter';

interface PDFPreviewCarouselProps {
  pdf: PDFDocumentProxy;
  fileName: string;
  totalPages: number;
  onFullScreenClick?: () => void;
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150];
const DEFAULT_ZOOM = 100;
const PAGE_CACHE_SIZE = 3; // Cache last 2-3 pages for smooth transitions

interface CachedPage {
  pageNum: number;
  imageUrl: string;
}

export const PDFPreviewCarousel = ({
  pdf,
  fileName,
  totalPages,
  onFullScreenClick,
}: PDFPreviewCarouselProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jumpToPageInput, setJumpToPageInput] = useState('');
  const cacheRef = useRef<CachedPage[]>([]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      setIsLoading(true);
      try {
        // Check cache first
        const cached = cacheRef.current.find(p => p.pageNum === currentPage);
        if (cached) {
          setImageUrl(cached.imageUrl);
          setIsLoading(false);
          return;
        }

        // Render page at zoom level
        const scale = zoomLevel / 100;
        const config: ConversionConfig = {
          scale,
          format: 'png',
          quality: 0.95, // High quality for preview
        };

        const rendered = await renderPageToImage(pdf, currentPage, config, fileName);
        const url = URL.createObjectURL(rendered.blob);
        setImageUrl(url);

        // Add to cache
        cacheRef.current.push({ pageNum: currentPage, imageUrl: url });
        if (cacheRef.current.length > PAGE_CACHE_SIZE) {
          const removed = cacheRef.current.shift();
          if (removed) URL.revokeObjectURL(removed.imageUrl);
        }
      } catch (err) {
        console.error('Failed to render preview page:', err);
      } finally {
        setIsLoading(false);
      }
    };

    renderPage();
  }, [currentPage, zoomLevel, pdf, fileName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cacheRef.current.forEach(p => URL.revokeObjectURL(p.imageUrl));
    };
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(p => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(z => {
      const current = ZOOM_LEVELS.indexOf(z);
      return current < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[current + 1] : z;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(z => {
      const current = ZOOM_LEVELS.indexOf(z);
      return current > 0 ? ZOOM_LEVELS[current - 1] : z;
    });
  }, []);

  const handleJumpToPage = useCallback(() => {
    const pageNum = parseInt(jumpToPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpToPageInput('');
    }
  }, [jumpToPageInput, totalPages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePreviousPage();
      else if (e.key === 'ArrowRight') handleNextPage();
      else if (e.key === '+' || e.key === '=') handleZoomIn();
      else if (e.key === '-') handleZoomOut();
      else if (e.key === 'Enter' && jumpToPageInput) handleJumpToPage();
    },
    [handlePreviousPage, handleNextPage, handleZoomIn, handleZoomOut, jumpToPageInput, handleJumpToPage]
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page (← arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={jumpToPageInput}
              onChange={e => setJumpToPageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${currentPage}`}
              className="w-12 px-2 py-1 text-sm border rounded text-center bg-slate-50 dark:bg-slate-900 dark:border-slate-600"
              title="Jump to page (type page number and press Enter)"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              / {totalPages}
            </span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page (→ arrow)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel === ZOOM_LEVELS[0]}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom out (- key)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <span className="text-sm font-medium w-12 text-center">
            {zoomLevel}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom in (+ key)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {onFullScreenClick && (
            <button
              onClick={onFullScreenClick}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors ml-2"
              title="Full screen preview"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">Loading page {currentPage}...</span>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={`PDF page ${currentPage}`}
            className="max-w-full max-h-full object-contain"
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="text-slate-400">Failed to load page</div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <span>Use arrow keys to navigate • +/- to zoom • Enter to jump to page</span>
      </div>
    </div>
  );
};
