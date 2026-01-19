/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Image Grid Toolbar Component
 * Provides batch actions and filtering for converted images
 */

import { useCallback, useMemo } from 'react';
import { Download, Trash2, CheckCircle2 } from 'lucide-react';
import type { ConvertedImage, DownloadStatus } from '../lib/pdfConverter';
import { formatFileSize } from '../lib/pdfConverter';

interface ImageGridToolbarProps {
  images: ConvertedImage[];
  downloadStatus: Map<number, DownloadStatus>;
  selectedPages: Set<number>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDownloadAll: () => void;
  onDownloadSelected: (pages: number[]) => void;
  onClearTracking: () => void;
}

export const ImageGridToolbar = ({
  images,
  downloadStatus,
  selectedPages,
  onSelectAll,
  onClearSelection,
  onDownloadAll,
  onDownloadSelected,
  onClearTracking,
}: ImageGridToolbarProps) => {
  const downloadedCount = useMemo(
    () => Array.from(downloadStatus.values()).filter(s => s.status === 'completed').length,
    [downloadStatus]
  );

  const totalSize = useMemo(
    () => images.reduce((sum, img) => sum + img.blob.size, 0),
    [images]
  );

  const selectedSize = useMemo(
    () => images
      .filter(img => selectedPages.has(img.pageNumber))
      .reduce((sum, img) => sum + img.blob.size, 0),
    [images, selectedPages]
  );

  const handleDownloadSelected = useCallback(() => {
    if (selectedPages.size > 0) {
      onDownloadSelected(Array.from(selectedPages).sort((a, b) => a - b));
    }
  }, [selectedPages, onDownloadSelected]);

  const allSelected = images.length > 0 && selectedPages.size === images.length;
  const someSelected = selectedPages.size > 0 && !allSelected;

  return (
    <div className="space-y-3 p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 rounded-t-lg">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            ref={el => {
              if (el) {
                el.indeterminate = someSelected;
              }
            }}
            onChange={(e) => {
              if (e.target.checked) {
                onSelectAll();
              } else {
                onClearSelection();
              }
            }}
            className="w-5 h-5 rounded cursor-pointer accent-blue-500"
            title={allSelected ? 'Deselect all' : 'Select all'}
          />
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {selectedPages.size > 0
              ? `${selectedPages.size} selected`
              : `${images.length} images`}
          </label>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span>
            Downloaded: <span className="font-semibold text-slate-900 dark:text-white">{downloadedCount}</span>
          </span>
          <span>
            Total: <span className="font-semibold text-slate-900 dark:text-white">{formatFileSize(totalSize)}</span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedPages.size > 0 && (
          <>
            <button
              onClick={handleDownloadSelected}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              title={`Download ${selectedPages.size} selected image(s) as ZIP`}
            >
              <Download className="w-4 h-4" />
              Download Selected ({formatFileSize(selectedSize)})
            </button>

            <button
              onClick={onClearSelection}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium transition-colors"
            >
              Clear Selection
            </button>
          </>
        )}

        {images.length > 0 && (
          <>
            <button
              onClick={onDownloadAll}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              title={`Download all ${images.length} images as ZIP`}
            >
              <Download className="w-4 h-4" />
              Download All ({formatFileSize(totalSize)})
            </button>

            {downloadedCount > 0 && (
              <button
                onClick={onClearTracking}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                title="Clear download tracking"
              >
                <Trash2 className="w-4 h-4" />
                Clear Tracking
              </button>
            )}
          </>
        )}
      </div>

      {/* Info Row */}
      {downloadedCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>
            {downloadedCount} image{downloadedCount !== 1 ? 's' : ''} downloaded
          </span>
        </div>
      )}
    </div>
  );
};
