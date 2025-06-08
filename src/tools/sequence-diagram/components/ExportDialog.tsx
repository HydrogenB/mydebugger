import React, { useState, useCallback } from 'react';
import { exportDiagram, ExportFormat, ExportOptions } from '../utils/exportWorker';

interface ExportDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;
  
  /**
   * Called when the dialog should close
   */
  onClose: () => void;
  
  /**
   * SVG content to export
   */
  svgContent?: string;
  
  /**
   * Diagram name/title for the exported file
   */
  diagramName?: string;
}

/**
 * Export dialog component for exporting diagrams to different formats
 */
const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  svgContent,
  diagramName = 'sequence-diagram'
}) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Export settings
  const [quality, setQuality] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [filename, setFilename] = useState(diagramName);
  
  // Handle export
  const handleExport = useCallback(async () => {
    if (!svgContent) {
      setExportError('No diagram content to export');
      return;
    }
    
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);
    
    try {
      const options: ExportOptions = {
        format,
        quality,
        backgroundColor,
        filename
      };
      
      const result = await exportDiagram(svgContent, options);
      
      if (result.success) {
        setExportSuccess(true);
        
        // Track export analytics
        if (window.gtag) {
          window.gtag('event', 'seqdiag.export', {
            type: format,
            size: svgContent.length
          });
        }
      } else {
        setExportError(result.error || 'Unknown export error');
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsExporting(false);
      
      // Auto-close after successful export
      if (exportSuccess) {
        setTimeout(() => {
          onClose();
          setExportSuccess(false);
        }, 1500);
      }
    }
  }, [svgContent, format, quality, backgroundColor, filename, onClose]);
  
  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    onClose();
    setExportError(null);
    setExportSuccess(false);
  }, [onClose]);
  
  // Update filename when diagram name changes
  React.useEffect(() => {
    setFilename(diagramName);
  }, [diagramName]);
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Export Diagram
          </h2>
          
          {/* Export format */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Format
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`
                  px-3 py-2 rounded text-sm flex-grow
                  ${format === 'png' ? 
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }
                `}
              >
                PNG
              </button>
              <button
                type="button"
                onClick={() => setFormat('svg')}
                className={`
                  px-3 py-2 rounded text-sm flex-grow
                  ${format === 'svg' ? 
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }
                `}
              >
                SVG
              </button>
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`
                  px-3 py-2 rounded text-sm flex-grow
                  ${format === 'pdf' ? 
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }
                `}
              >
                PDF
              </button>
            </div>
          </div>
          
          {/* Filename */}
          <div className="mb-4">
            <label 
              htmlFor="export-filename" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filename
            </label>
            <input
              type="text"
              id="export-filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                         text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
            />
          </div>
          
          {/* PNG-specific settings */}
          {format === 'png' && (
            <div className="mb-4">
              <label 
                htmlFor="export-quality" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                id="export-quality"
                min="0.5"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
          
          {/* Background color (for PNG and PDF) */}
          {(format === 'png' || format === 'pdf') && (
            <div className="mb-4">
              <label 
                htmlFor="export-bg" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Background Color
              </label>
              <div className="flex">
                <input
                  type="color"
                  id="export-bg"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 p-0 rounded"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="ml-2 flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                             text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setBackgroundColor('#ffffff')}
                  className="ml-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                  aria-label="Reset to white"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
          
          {/* Status messages */}
          {exportError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
              {exportError}
            </div>
          )}
          
          {exportSuccess && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md text-sm">
              Export successful! Your file is downloading.
            </div>
          )}
          
          {/* Action buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded
                         text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || !svgContent}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;