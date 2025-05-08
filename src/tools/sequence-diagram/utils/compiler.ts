/**
 * Sequence Diagram Compiler
 * 
 * This utility detects the syntax format and renders the diagram accordingly.
 * Supported formats:
 * - SequenceDiagram.org format
 * - Mermaid
 * - PlantUML
 */
import DOMPurify from 'dompurify';

export type DiagramFormat = 'sequencediagram' | 'mermaid' | 'plantuml' | 'unknown';

export interface CompileResult {
  html: string;
  format: DiagramFormat;
  error?: string;
  svg?: string;
}

/**
 * Detects the diagram format based on syntax pattern
 */
export function detectFormat(code: string): DiagramFormat {
  const trimmedCode = code.trim();
  
  // Check for Mermaid syntax
  if (trimmedCode.startsWith('sequenceDiagram') || 
      trimmedCode.match(/^graph\s+(TB|BT|RL|LR|TD)/)) {
    return 'mermaid';
  }
  
  // Check for PlantUML syntax
  if (trimmedCode.startsWith('@startuml') || 
      trimmedCode.includes('skinparam') ||
      trimmedCode.match(/^\s*actor\s+/m)) {
    return 'plantuml';
  }
  
  // Default to sequencediagram.org format if it has typical elements
  if (trimmedCode.match(/participant|actor|note|title/) ||
      trimmedCode.match(/->|-->|<<--|<-/)) {
    return 'sequencediagram';
  }
  
  return 'unknown';
}

/**
 * Main compiler function that processes the diagram code
 * and returns rendered HTML
 */
export async function compileSequenceDiagram(code: string): Promise<CompileResult> {
  const format = detectFormat(code);
  
  try {
    switch (format) {
      case 'mermaid':
        return await compileMermaid(code);
      case 'plantuml':
        return await compilePlantUML(code);
      case 'sequencediagram':
        return await compileSequenceDiagramFormat(code);
      default:
        return {
          html: '<div class="text-red-500">Unknown diagram format. Please use SequenceDiagram.org, Mermaid or PlantUML syntax.</div>',
          format: 'unknown',
          error: 'Unknown diagram format'
        };
    }
  } catch (error) {
    return {
      html: `<div class="text-red-500">Error compiling diagram: ${error instanceof Error ? error.message : String(error)}</div>`,
      format,
      error: String(error)
    };
  }
}

/**
 * Compile Mermaid syntax
 */
async function compileMermaid(code: string): Promise<CompileResult> {
  try {
    // Lazy import mermaid to reduce initial load time
    const mermaid = await import('mermaid');
    
    // Initialize mermaid with secure settings
    mermaid.default.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'neutral',
    });
    
    // Generate a unique ID for the diagram
    const id = `mermaid-${Math.random().toString(36).substring(2, 10)}`;
    
    // Render the diagram
    const { svg } = await mermaid.default.render(id, code);
    
    // Sanitize the SVG output to prevent XSS
    const sanitizedSvg = DOMPurify.sanitize(svg);
    
    return {
      html: `<div class="mermaid-diagram">${sanitizedSvg}</div>`,
      format: 'mermaid',
      svg: sanitizedSvg
    };
  } catch (error) {
    throw new Error(`Mermaid compile error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Compile PlantUML syntax
 */
async function compilePlantUML(code: string): Promise<CompileResult> {
  // In a real implementation, you would call PlantUML server
  // For now, we'll return a placeholder since it requires a server component
  return {
    html: `<div class="plantuml-diagram p-4 bg-yellow-50 border border-yellow-200 rounded">
      <p class="text-amber-700">PlantUML rendering requires a server component.</p>
      <p class="font-mono text-sm bg-gray-100 p-2 mt-2 whitespace-pre-wrap">${DOMPurify.sanitize(code)}</p>
    </div>`,
    format: 'plantuml'
  };
}

/**
 * Compile SequenceDiagram.org format
 */
async function compileSequenceDiagramFormat(code: string): Promise<CompileResult> {
  try {
    // Lazy import SequenceDiagram library
    const { default: SequenceDiagram } = await import('sequence-diagram-web');
    
    // Create a temporary element to render the diagram
    const tempElement = document.createElement('div');
    
    // Render the diagram
    const diagram = SequenceDiagram.parse(code);
    diagram.drawSVG(tempElement, { theme: 'simple' });
    
    // Get the SVG output
    const svg = tempElement.innerHTML;
    
    // Sanitize the SVG output to prevent XSS
    const sanitizedSvg = DOMPurify.sanitize(svg);
    
    return {
      html: `<div class="sequence-diagram">${sanitizedSvg}</div>`,
      format: 'sequencediagram',
      svg: sanitizedSvg
    };
  } catch (error) {
    throw new Error(`SequenceDiagram compile error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Web worker implementation for diagram compilation
 * to avoid blocking the main thread during rendering
 */
export function createCompileWorker() {
  // Implementation would depend on your bundler
  // This is a simplified approach
  const workerCode = `
    self.importScripts('https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js');
    
    self.onmessage = async function(e) {
      const { code, format } = e.data;
      
      try {
        // Initialize mermaid
        self.mermaid.initialize({ startOnLoad: false });
        
        // Generate diagram
        const id = \`mermaid-\${Math.random().toString(36).substring(2, 10)}\`;
        const { svg } = await self.mermaid.render(id, code);
        
        // Return the result
        self.postMessage({ svg, format });
      } catch (error) {
        self.postMessage({ error: error.message, format });
      }
    };
  `;
  
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}