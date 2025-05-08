/**
 * Export Worker utility
 * 
 * This module provides WebWorker-based export functionality for sequence diagrams
 * to avoid blocking the main thread during export operations.
 */

export type ExportFormat = 'png' | 'svg' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number;
  width?: number;
  height?: number;
  filename?: string;
  backgroundColor?: string;
}

export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  error?: string;
  filename: string;
}

/**
 * Creates a worker for handling exports
 */
export function createExportWorker() {
  const workerCode = `
    // Import required libraries (CDN for worker simplicity)
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
    importScripts('https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js');
    
    self.onmessage = async function(e) {
      const { svg, options } = e.data;
      const { format, quality = 1, width, height, filename = 'sequence-diagram', backgroundColor = 'white' } = options;
      
      try {
        switch (format) {
          case 'svg':
            handleSVGExport(svg, filename);
            break;
          case 'png':
            await handlePNGExport(svg, filename, quality, width, height, backgroundColor);
            break;
          case 'pdf':
            await handlePDFExport(svg, filename, width, height, backgroundColor);
            break;
          default:
            throw new Error('Unsupported export format');
        }
      } catch (error) {
        self.postMessage({ 
          success: false, 
          error: error.message,
          filename
        });
      }
    };
    
    function handleSVGExport(svgString, filename) {
      // Create a Blob containing the SVG data
      const blob = new Blob([svgString], {type: 'image/svg+xml'});
      
      // Use FileSaver to trigger the download
      self.saveAs(blob, \`\${filename}.svg\`);
      
      // Report success back to the main thread
      self.postMessage({ 
        success: true, 
        data: svgString,
        filename: \`\${filename}.svg\`
      });
    }
    
    async function handlePNGExport(svgString, filename, quality, width, height, backgroundColor) {
      // Create an SVG element to get dimensions if not specified
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      const svgWidth = width || parseFloat(svgElement.getAttribute('width') || '800');
      const svgHeight = height || parseFloat(svgElement.getAttribute('height') || '600');
      
      // Create a canvas in the worker
      const canvas = new OffscreenCanvas(svgWidth, svgHeight);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, svgWidth, svgHeight);
      
      // Draw SVG on canvas
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
      
      // Convert canvas to PNG
      const blob = await canvas.convertToBlob({type: 'image/png', quality});
      
      // Use FileSaver to trigger the download
      self.saveAs(blob, \`\${filename}.png\`);
      
      // Report success back to the main thread
      self.postMessage({ 
        success: true,
        filename: \`\${filename}.png\`
      });
    }
    
    async function handlePDFExport(svgString, filename, width, height, backgroundColor) {
      // Create an SVG element to get dimensions if not specified
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      const svgWidth = width || parseFloat(svgElement.getAttribute('width') || '800');
      const svgHeight = height || parseFloat(svgElement.getAttribute('height') || '600');
      
      // Create a jsPDF instance
      const orientation = svgWidth > svgHeight ? 'landscape' : 'portrait';
      const pdf = new self.jspdf.jsPDF({
        orientation,
        unit: 'pt',
        format: [svgWidth, svgHeight]
      });
      
      // Set background color if specified
      if (backgroundColor !== 'transparent') {
        pdf.setFillColor(backgroundColor);
        pdf.rect(0, 0, svgWidth, svgHeight, 'F');
      }
      
      // Convert SVG to data URI
      const svgDataUri = 'data:image/svg+xml;base64,' + btoa(svgString);
      
      // Add SVG to PDF
      pdf.addImage(svgDataUri, 'SVG', 0, 0, svgWidth, svgHeight);
      
      // Save PDF (using jsPDF's save method)
      pdf.save(\`\${filename}.pdf\`);
      
      // Report success back to the main thread
      self.postMessage({ 
        success: true,
        filename: \`\${filename}.pdf\`
      });
    }
  `;
  
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

/**
 * Export diagram to the specified format using a WebWorker
 */
export async function exportDiagram(
  svg: string, 
  options: ExportOptions
): Promise<ExportResult> {
  return new Promise((resolve, reject) => {
    try {
      const worker = createExportWorker();
      
      worker.onmessage = (e) => {
        const result = e.data;
        worker.terminate();
        resolve(result);
      };
      
      worker.onerror = (e) => {
        worker.terminate();
        reject(new Error(`Export worker error: ${e.message}`));
      };
      
      worker.postMessage({ svg, options });
    } catch (error) {
      reject(error);
    }
  });
}