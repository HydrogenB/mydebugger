/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Hook for managing PDF to Image conversion state
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  validatePdfFile,
  loadPdfDocument,
  renderPageToImage,
  parsePageRange,
  createZipFromImages,
  downloadFile,
  checkWebPSupport,
  type ImageFormat,
  type ConversionConfig,
  type ConversionProgress,
  type ConvertedImage,
  type PdfInfo,
  type DownloadStatus,
} from '../lib/pdfConverter';

export type PageRangeMode = 'all' | 'custom';

export interface UsePdfToImageState {
  // File state
  file: File | null;
  pdfInfo: PdfInfo | null;
  previewUrl: string | null;

  // Configuration
  format: ImageFormat;
  quality: number;
  scale: number;
  pageRangeMode: PageRangeMode;
  customPageRange: string;

  // Conversion state
  progress: ConversionProgress;
  convertedImages: ConvertedImage[];
  downloadStatus: Map<number, DownloadStatus>;
  error: string | null;
  isPasswordRequired: boolean;
  password: string;

  // Browser capabilities
  supportsWebP: boolean;
}

export interface UsePdfToImageActions {
  // File actions
  onFileSelect: (file: File) => Promise<void>;
  onFileDrop: (files: FileList) => Promise<void>;
  clearFile: () => void;

  // Password actions
  setPassword: (password: string) => void;
  submitPassword: () => Promise<void>;

  // Configuration actions
  setFormat: (format: ImageFormat) => void;
  setQuality: (quality: number) => void;
  setScale: (scale: number) => void;
  setPageRangeMode: (mode: PageRangeMode) => void;
  setCustomPageRange: (range: string) => void;

  // Conversion actions
  startConversion: () => Promise<void>;
  cancelConversion: () => void;
  downloadImage: (image: ConvertedImage) => void;
  downloadAllAsZip: (selectedPages?: number[]) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;

  // Download tracking actions
  markAsDownloaded: (pageNumber: number) => void;
  clearDownloadTracking: () => void;
}

export type UsePdfToImageReturn = UsePdfToImageState & UsePdfToImageActions;

const INITIAL_PROGRESS: ConversionProgress = {
  currentPage: 0,
  totalPages: 0,
  status: 'idle',
};

const usePdfToImage = (): UsePdfToImageReturn => {
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

  // Configuration
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(2);
  const [pageRangeMode, setPageRangeMode] = useState<PageRangeMode>('all');
  const [customPageRange, setCustomPageRange] = useState('');

  // Conversion state
  const [progress, setProgress] = useState<ConversionProgress>(INITIAL_PROGRESS);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [downloadStatus, setDownloadStatus] = useState<Map<number, DownloadStatus>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const cancelRef = useRef(false);

  // Browser capabilities
  const [supportsWebP, setSupportsWebP] = useState(true);

  // Check WebP support on mount
  useEffect(() => {
    checkWebPSupport().then(setSupportsWebP);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      // Destroy PDF document
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const loadPdf = useCallback(async (selectedFile: File, pwd?: string) => {
    setError(null);
    setProgress({ ...INITIAL_PROGRESS, status: 'loading', message: 'Loading PDF...' });

    try {
      // Validate file
      const validation = validatePdfFile(selectedFile);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setProgress(INITIAL_PROGRESS);
        return;
      }

      // Load PDF
      const { pdf, info } = await loadPdfDocument(selectedFile, pwd);

      // Store PDF document reference
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
      pdfDocRef.current = pdf;

      setFile(selectedFile);
      setPdfInfo(info);
      setIsPasswordRequired(false);
      setPassword('');

      // Generate first page preview
      const config: ConversionConfig = { scale: 1, format: 'png', quality: 0.8 };
      const preview = await renderPageToImage(pdf, 1, config, selectedFile.name);
      const previewBlob = preview.blob;
      const previewDataUrl = URL.createObjectURL(previewBlob);
      setPreviewUrl(previewDataUrl);

      setProgress(INITIAL_PROGRESS);
    } catch (err) {
      const error = err as Error;

      // Check if password is required
      if (error.name === 'PasswordException' || error.message?.includes('password')) {
        setIsPasswordRequired(true);
        setFile(selectedFile);
        setProgress(INITIAL_PROGRESS);
        return;
      }

      // Check if PDF is corrupted
      if (error.name === 'InvalidPDFException' || error.message?.includes('Invalid')) {
        setError('The PDF file appears to be corrupted and cannot be opened.');
      } else {
        setError(`Failed to load PDF: ${error.message}`);
      }

      setProgress(INITIAL_PROGRESS);
    }
  }, []);

  const onFileSelect = useCallback(
    async (selectedFile: File) => {
      await loadPdf(selectedFile);
    },
    [loadPdf]
  );

  const onFileDrop = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;

      const selectedFile = files[0];

      // Check if it's a PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Please drop a PDF file.');
        return;
      }

      await loadPdf(selectedFile);
    },
    [loadPdf]
  );

  const submitPassword = useCallback(async () => {
    if (!file || !password) return;
    await loadPdf(file, password);
  }, [file, password, loadPdf]);

  const clearFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Destroy PDF document
    if (pdfDocRef.current) {
      pdfDocRef.current.destroy();
      pdfDocRef.current = null;
    }

    // Reset state
    setFile(null);
    setPdfInfo(null);
    setPreviewUrl(null);
    setConvertedImages([]);
    setDownloadStatus(new Map());
    setError(null);
    setIsPasswordRequired(false);
    setPassword('');
    setProgress(INITIAL_PROGRESS);
    setCustomPageRange('');
    setPageRangeMode('all');
  }, [previewUrl]);

  const startConversion = useCallback(async () => {
    if (!pdfDocRef.current || !pdfInfo || !file) {
      setError('No PDF loaded');
      return;
    }

    cancelRef.current = false;
    setError(null);

    // Clear previous results
    setConvertedImages([]);
    setDownloadStatus(new Map());

    // Parse page range
    const rangeInput = pageRangeMode === 'all' ? '' : customPageRange;
    const { pages, error: rangeError } = parsePageRange(rangeInput, pdfInfo.pageCount);

    if (rangeError) {
      setError(rangeError);
      return;
    }

    if (pages.length === 0) {
      setError('No pages selected for conversion');
      return;
    }

    const config: ConversionConfig = { scale, format, quality };
    const results: ConvertedImage[] = [];

    setProgress({
      currentPage: 0,
      totalPages: pages.length,
      status: 'converting',
      message: `Converting page 1 of ${pages.length}...`,
    });

    try {
      for (let i = 0; i < pages.length; i++) {
        // Check if cancelled
        if (cancelRef.current) {
          setProgress({ ...INITIAL_PROGRESS, message: 'Conversion cancelled' });
          return;
        }

        const pageNum = pages[i];

        setProgress({
          currentPage: i + 1,
          totalPages: pages.length,
          status: 'converting',
          message: `Converting page ${i + 1} of ${pages.length}...`,
        });

        const image = await renderPageToImage(pdfDocRef.current, pageNum, config, file.name);
        results.push(image);

        // Update results progressively
        setConvertedImages([...results]);
      }

      setProgress({
        currentPage: pages.length,
        totalPages: pages.length,
        status: 'complete',
        message: `Successfully converted ${pages.length} page${pages.length > 1 ? 's' : ''}`,
      });
    } catch (err) {
      const error = err as Error;
      setError(`Conversion failed: ${error.message}`);
      setProgress({
        ...INITIAL_PROGRESS,
        status: 'error',
        message: 'Conversion failed',
      });
    }
  }, [pdfInfo, file, pageRangeMode, customPageRange, scale, format, quality, convertedImages]);

  const cancelConversion = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const downloadImage = useCallback((image: ConvertedImage) => {
    downloadFile(image.blob, image.fileName);
    setDownloadStatus(prev => new Map(prev).set(image.pageNumber, {
      pageNumber: image.pageNumber,
      status: 'completed',
      timestamp: Date.now(),
    }));
  }, []);

  const downloadAllAsZip = useCallback(async (selectedPages?: number[]) => {
    if (convertedImages.length === 0 || !file) return;

    setProgress((prev) => ({
      ...prev,
      message: 'Creating ZIP file...',
    }));

    try {
      const baseName = file.name.replace(/\.pdf$/i, '');
      const imagesToZip = selectedPages
        ? convertedImages.filter(img => selectedPages.includes(img.pageNumber))
        : convertedImages;

      if (imagesToZip.length === 0) {
        setError('No images selected for download');
        return;
      }

      const zipBlob = await createZipFromImages(imagesToZip, baseName);
      downloadFile(zipBlob, `${baseName}_images.zip`);

      // Mark all as downloaded
      imagesToZip.forEach(img => {
        setDownloadStatus(prev => new Map(prev).set(img.pageNumber, {
          pageNumber: img.pageNumber,
          status: 'completed',
          timestamp: Date.now(),
        }));
      });

      setProgress((prev) => ({
        ...prev,
        message: 'ZIP downloaded successfully',
      }));
    } catch (err) {
      const error = err as Error;
      setError(`Failed to create ZIP: ${error.message}`);
    }
  }, [convertedImages, file]);

  const clearResults = useCallback(() => {
    setConvertedImages([]);
    setDownloadStatus(new Map());
    setProgress(INITIAL_PROGRESS);
  }, []);

  const markAsDownloaded = useCallback((pageNumber: number) => {
    setDownloadStatus(prev => new Map(prev).set(pageNumber, {
      pageNumber,
      status: 'completed',
      timestamp: Date.now(),
    }));
  }, []);

  const clearDownloadTracking = useCallback(() => {
    setDownloadStatus(new Map());
  }, []);

  return {
    // State
    file,
    pdfInfo,
    previewUrl,
    format,
    quality,
    scale,
    pageRangeMode,
    customPageRange,
    progress,
    convertedImages,
    downloadStatus,
    error,
    isPasswordRequired,
    password,
    supportsWebP,

    // Actions
    onFileSelect,
    onFileDrop,
    clearFile,
    setPassword,
    submitPassword,
    setFormat,
    setQuality,
    setScale,
    setPageRangeMode,
    setCustomPageRange,
    startConversion,
    cancelConversion,
    downloadImage,
    downloadAllAsZip,
    clearResults,
    clearError,
    markAsDownloaded,
    clearDownloadTracking,
  };
};

export default usePdfToImage;
