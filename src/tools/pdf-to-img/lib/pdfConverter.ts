/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Client-side PDF to Image converter using PDF.js
 * Supports PNG, JPG, and WebP output formats
 */

import * as pdfjsLib from "pdfjs-dist";
import { zipSync } from "fflate";

// Configure PDF.js worker - use local file for reliability
// The worker file is copied from node_modules/pdfjs-dist/build/ to public/
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

export type ImageFormat = "png" | "jpeg" | "webp";

export interface ConversionConfig {
  scale: number;
  format: ImageFormat;
  quality: number; // 0.1 to 1.0 (only for jpeg/webp)
}

export interface ConversionProgress {
  currentPage: number;
  totalPages: number;
  status: "idle" | "loading" | "converting" | "complete" | "error";
  message?: string;
}

export interface ConvertedImage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  fileName: string;
}

export interface PdfInfo {
  fileName: string;
  fileSize: number;
  pageCount: number;
  title?: string;
  author?: string;
}

// Max canvas size to prevent browser crashes (16 megapixels is a safe limit)
const MAX_CANVAS_PIXELS = 16777216;

/**
 * Validate if file is a PDF
 */
export const validatePdfFile = (
  file: File,
): { valid: boolean; error?: string } => {
  // Check MIME type
  if (file.type !== "application/pdf") {
    return {
      valid: false,
      error: "Invalid file type. Please select a PDF file.",
    };
  }

  // Check file size (max 100MB for browser safety)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "File too large. Maximum size is 100MB." };
  }

  return { valid: true };
};

/**
 * Load PDF document and get metadata
 */
export const loadPdfDocument = async (
  file: File,
  password?: string,
): Promise<{ pdf: pdfjsLib.PDFDocumentProxy; info: PdfInfo }> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    password,
  });

  const pdf = await loadingTask.promise;

  // Get metadata
  const metadata = await pdf.getMetadata().catch(() => null);
  const info: PdfInfo = {
    fileName: file.name,
    fileSize: file.size,
    pageCount: pdf.numPages,
    title: (metadata?.info as any)?.Title as string | undefined,
    author: (metadata?.info as any)?.Author as string | undefined,
  };

  return { pdf, info };
};

/**
 * Calculate optimal scale to prevent canvas overflow
 */
const calculateSafeScale = (
  viewport: { width: number; height: number },
  requestedScale: number,
): number => {
  const pixelCount =
    viewport.width * requestedScale * viewport.height * requestedScale;

  if (pixelCount > MAX_CANVAS_PIXELS) {
    // Calculate max safe scale
    const safeScale = Math.sqrt(
      MAX_CANVAS_PIXELS / (viewport.width * viewport.height),
    );
    return Math.min(requestedScale, safeScale);
  }

  return requestedScale;
};

/**
 * Render a single PDF page to canvas and convert to image
 */
export const renderPageToImage = async (
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  config: ConversionConfig,
  fileName: string,
): Promise<ConvertedImage> => {
  const page = await pdf.getPage(pageNumber);

  // Get viewport at scale 1 first
  const baseViewport = page.getViewport({ scale: 1 });

  // Calculate safe scale to prevent browser crash
  const safeScale = calculateSafeScale(
    { width: baseViewport.width, height: baseViewport.height },
    config.scale,
  );

  const viewport = page.getViewport({ scale: safeScale });

  // Create canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to get canvas context");
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  // Render page
  const renderContext = {
    canvasContext: context,
    viewport,
  };

  await page.render(renderContext).promise;

  // Convert to image format
  const mimeType = `image/${config.format}`;
  const quality = config.format === "png" ? undefined : config.quality;

  const dataUrl = canvas.toDataURL(mimeType, quality);
  const blob = await canvasToBlob(canvas, mimeType, quality);

  // Clean up page resources
  page.cleanup();

  // Generate filename
  const baseName = fileName.replace(/\.pdf$/i, "");
  const pageStr = String(pageNumber).padStart(3, "0");
  const extension = config.format === "jpeg" ? "jpg" : config.format;
  const imageFileName = `${baseName}_page_${pageStr}.${extension}`;

  return {
    pageNumber,
    blob,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    fileName: imageFileName,
  };
};

/**
 * Convert canvas to Blob
 */
const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to blob"));
        }
      },
      mimeType,
      quality,
    );
  });
};

/**
 * Parse page range string (e.g., "1, 3-5, 10") to array of page numbers
 */
export const parsePageRange = (
  rangeStr: string,
  totalPages: number,
): { pages: number[]; error?: string } => {
  if (!rangeStr.trim()) {
    // Return all pages if empty
    return { pages: Array.from({ length: totalPages }, (_, i) => i + 1) };
  }

  const pages = new Set<number>();
  const parts = rangeStr.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (!part) continue;

    // Check if it's a range (e.g., "3-5")
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        return { pages: [], error: `Invalid range: ${part}` };
      }

      if (start < 1 || end > totalPages || start > end) {
        return {
          pages: [],
          error: `Invalid range: ${part} (pages 1-${totalPages})`,
        };
      }

      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      // Single page number
      const page = parseInt(part, 10);

      if (isNaN(page)) {
        return { pages: [], error: `Invalid page number: ${part}` };
      }

      if (page < 1 || page > totalPages) {
        return {
          pages: [],
          error: `Page ${page} out of range (1-${totalPages})`,
        };
      }

      pages.add(page);
    }
  }

  return { pages: Array.from(pages).sort((a, b) => a - b) };
};

/**
 * Convert Blob to Uint8Array for zip compression
 */
const blobToUint8Array = async (blob: Blob): Promise<Uint8Array> => {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

/**
 * Create ZIP file from converted images
 */
export const createZipFromImages = async (
  images: ConvertedImage[],
  baseName: string,
): Promise<Blob> => {
  const files: { [key: string]: Uint8Array } = {};

  for (const image of images) {
    const data = await blobToUint8Array(image.blob);
    files[image.fileName] = data;
  }

  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped], { type: "application/zip" });
};

/**
 * Download a single file
 */
export const downloadFile = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format file size to human readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
};

/**
 * Get recommended scale based on use case
 */
export const getScalePresets = (): Array<{
  label: string;
  value: number;
  description: string;
}> => [
  {
    label: "1x (72 DPI)",
    value: 1,
    description: "Web preview, smaller file size",
  },
  {
    label: "2x (144 DPI)",
    value: 2,
    description: "Retina display, recommended",
  },
  { label: "3x (216 DPI)", value: 3, description: "High quality print" },
  {
    label: "4x (288 DPI)",
    value: 4,
    description: "Professional print quality",
  },
];

/**
 * Check WebP support
 */
export const checkWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src =
      "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
  });
};
