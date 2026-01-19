/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * PDF Conversion Queue - Batch Processing with Memory Management
 * Handles large PDFs by processing pages in batches to optimize memory usage
 */

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPageToImage, type ConversionConfig, type ConvertedImage } from './pdfConverter';

export interface ConversionBatchConfig {
  pdf: PDFDocumentProxy;
  pages: number[];
  config: ConversionConfig;
  fileName: string;
  batchSize?: number; // Default: 5 pages per batch
  onProgress?: (current: number, total: number) => void;
  onMemoryWarning?: (usedMemory: number, maxMemory: number) => void;
}

export interface ConversionBatchResult {
  images: ConvertedImage[];
  completedPages: number;
  totalPages: number;
}

// Memory thresholds
const MAX_MEMORY_USAGE = 0.85; // Stop processing if memory usage exceeds 85% of available
const WARNING_MEMORY_USAGE = 0.70; // Warn when memory usage exceeds 70%

/**
 * Get current memory usage ratio (0-1)
 */
const getMemoryUsageRatio = (): number => {
  if (!performance.memory) return 0;
  return performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
};

/**
 * Process PDF pages in batches with memory awareness
 * Yields results after each batch completes
 */
export async function* processPdfInBatches(
  config: ConversionBatchConfig
): AsyncGenerator<ConversionBatchResult, void, unknown> {
  const batchSize = config.batchSize ?? 5;
  const { pdf, pages, config: conversionConfig, fileName, onProgress, onMemoryWarning } = config;

  let processedCount = 0;
  let currentScale = conversionConfig.scale;

  for (let i = 0; i < pages.length; i += batchSize) {
    // Check memory before processing batch
    const memoryRatio = getMemoryUsageRatio();

    if (memoryRatio > MAX_MEMORY_USAGE) {
      // If memory pressure is critical, try to reduce scale
      const reducedScale = Math.max(1, Math.floor(currentScale * 0.75));
      if (reducedScale < currentScale) {
        console.warn(`[PDF Converter] High memory pressure (${Math.round(memoryRatio * 100)}%). Reducing scale from ${currentScale}x to ${reducedScale}x`);
        currentScale = reducedScale;
        if (onMemoryWarning) {
          onMemoryWarning(memoryRatio, MAX_MEMORY_USAGE);
        }
      } else {
        console.warn('[PDF Converter] Critical memory pressure. Consider processing fewer pages.');
      }
    } else if (memoryRatio > WARNING_MEMORY_USAGE && onMemoryWarning) {
      onMemoryWarning(memoryRatio, WARNING_MEMORY_USAGE);
    }

    // Process batch
    const batchEnd = Math.min(i + batchSize, pages.length);
    const batchPages = pages.slice(i, batchEnd);
    const batchImages: ConvertedImage[] = [];

    for (const pageNum of batchPages) {
      try {
        const configWithScale = { ...conversionConfig, scale: currentScale };
        const image = await renderPageToImage(pdf, pageNum, configWithScale, fileName);
        batchImages.push(image);
        processedCount++;

        if (onProgress) {
          onProgress(processedCount, pages.length);
        }
      } catch (err) {
        console.error(`[PDF Converter] Failed to convert page ${pageNum}:`, err);
        // Continue with next page even if one fails
      }
    }

    // Yield results after each batch
    yield {
      images: batchImages,
      completedPages: processedCount,
      totalPages: pages.length,
    };

    // Allow UI to update between batches
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

/**
 * Process all pages with automatic batching
 * Returns all results at once
 */
export async function processPdfInBatchesSync(
  config: ConversionBatchConfig
): Promise<ConvertedImage[]> {
  const allImages: ConvertedImage[] = [];

  for await (const result of processPdfInBatches(config)) {
    allImages.push(...result.images);
  }

  return allImages;
}

/**
 * Estimate memory required to process a page
 * Helps determine safe batch sizes
 */
export function estimatePageMemory(
  pageWidth: number,
  pageHeight: number,
  scale: number,
  format: 'png' | 'jpeg' | 'webp'
): number {
  // Canvas data: width * height * 4 bytes per pixel (RGBA)
  const canvasMemory = pageWidth * scale * pageHeight * scale * 4;

  // Blob size varies by format - use rough estimates
  const compressionRatio = {
    png: 0.3, // PNG typically 30% of canvas size
    jpeg: 0.1, // JPEG typically 10% of canvas size
    webp: 0.15, // WebP typically 15% of canvas size
  };

  const blobMemory = canvasMemory * compressionRatio[format];

  // Total includes overhead for image objects, etc.
  return Math.ceil(canvasMemory + blobMemory + 1000);
}

/**
 * Recommend batch size based on available memory and page size
 */
export function recommendBatchSize(
  pageWidth: number,
  pageHeight: number,
  scale: number,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  maxMemoryPercent: number = 0.5
): number {
  if (!performance.memory) return 5; // Default if memory API unavailable

  const availableMemory = performance.memory.jsHeapSizeLimit;
  const maxMemoryToUse = availableMemory * maxMemoryPercent;
  const pageMemory = estimatePageMemory(pageWidth, pageHeight, scale, format);

  const recommendedSize = Math.max(1, Math.floor(maxMemoryToUse / pageMemory / 2)); // Divide by 2 for safety margin
  return Math.min(recommendedSize, 20); // Cap at 20 pages per batch
}

/**
 * Detect if page sizes vary significantly in PDF
 * Used to recommend adaptive batch sizing
 */
export function hasVariablePageSizes(pageSizes: Array<{ width: number; height: number }>): boolean {
  if (pageSizes.length < 2) return false;

  const avgWidth = pageSizes.reduce((sum, p) => sum + p.width, 0) / pageSizes.length;
  const avgHeight = pageSizes.reduce((sum, p) => sum + p.height, 0) / pageSizes.length;

  // Consider sizes variable if any page differs by more than 20%
  return pageSizes.some(
    p =>
      Math.abs(p.width - avgWidth) / avgWidth > 0.2 ||
      Math.abs(p.height - avgHeight) / avgHeight > 0.2
  );
}
