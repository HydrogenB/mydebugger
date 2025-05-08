import React, { useRef, useEffect, useState } from 'react';
import { CompileResult } from '../utils/compiler';
// Import local TypeScript stub implementation
import Diagram from '../utils/sequence-diagrams-stub';
// Still keep mermaid as a fallback option for now
import mermaid from 'mermaid';

// Initialize mermaid with configuration (as fallback)
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  sequence: {
    showSequenceNumbers: false,
    actorMargin: 80,
    messageMargin: 40,
    diagramMarginX: 50,
    diagramMarginY: 10,
    boxMargin: 10,
    noteMargin: 10,
    mirrorActors: false,
    bottomMarginAdj: 1,
    useMaxWidth: true
  },
  themeVariables: {
    primaryColor: '#326CE5',
    lineColor: '#666',
    textColor: '#333'
  }
});

// No longer needed since we're using js-sequence-diagrams directly
// const convertToMermaid = (code: string): string => { ... }

interface PreviewPaneProps {
  /**
   * The compiled diagram result
   */
  result: CompileResult | null;
  
  /**
   * Whether to show participants as an overlay when scrolled
   */
  participantOverlay?: boolean;
  
  /**
   * Whether the diagram is in presentation mode
   */
  presentationMode?: boolean;
  
  /**
   * Whether to scale the diagram to fit the container
   */
  shrinkToFit?: boolean;
  
  /**
   * Callback when compilation time changes
   */
  onPerformanceUpdate?: (time: number) => void;
}

/**
 * Component for displaying rendered sequence diagrams
 * 
 * Features:
 * - Safe HTML rendering using js-sequence-diagrams
 * - Participant overlay when scrolling
 * - Presentation mode
 * - Zoom/scale to fit
 */
const PreviewPane: React.FC<PreviewPaneProps> = ({
  result,
  participantOverlay = true,
  presentationMode = false,
  shrinkToFit = false,
  onPerformanceUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [renderedDiagram, setRenderedDiagram] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [scale, setScale] = useState(1);
  
  // Render the diagram when result changes
  useEffect(() => {
    const renderDiagram = async () => {
      if (!result?.html) {
        setRenderedDiagram(null);
        setError(null);
        return;
      }
      
      try {
        // For sequencediagram.org format, use js-sequence-diagrams directly
        if (result.format === 'sequencediagram' && diagramRef.current) {
          const renderStart = performance.now();
          
          try {
            // Clear previous content
            if (diagramRef.current) {
              diagramRef.current.innerHTML = '';
              
              // Create a container for the diagram
              const diagramContainer = document.createElement('div');
              diagramContainer.id = 'js-sequence-diagram';
              diagramRef.current.appendChild(diagramContainer);
              
              // Use js-sequence-diagrams to render
              const diagram = Diagram.parse(result.html);
              
              // Set theme based on current mode
              const darkMode = document.documentElement.classList.contains('dark');
              const theme = darkMode ? 'simple' : 'hand'; // Use appropriate themes
              
              diagram.drawSVG('js-sequence-diagram', { theme: theme });
              
              // Success!
              setError(null);
              
              const renderEnd = performance.now();
              if (onPerformanceUpdate) {
                onPerformanceUpdate(renderEnd - renderStart);
              }
            }
          } catch (renderError) {
            console.error('js-sequence-diagrams rendering error:', renderError);
            setError(`Error rendering diagram: ${renderError instanceof Error ? renderError.message : String(renderError)}`);
            
            // Set rendered diagram to null to show error state
            setRenderedDiagram(null);
          }
        } else if (result.format === 'mermaid') {
          // For mermaid format, use mermaid renderer
          const renderStart = performance.now();
          
          try {
            const { svg } = await mermaid.render('diagram-container', result.html);
            setRenderedDiagram(svg);
            setError(null);
            
            const renderEnd = performance.now();
            if (onPerformanceUpdate) {
              onPerformanceUpdate(renderEnd - renderStart);
            }
          } catch (renderError) {
            console.error('Mermaid rendering error:', renderError);
            setError(`Error rendering diagram: ${renderError instanceof Error ? renderError.message : String(renderError)}`);
            setRenderedDiagram(null);
          }
        } else {
          // For other formats or simple HTML, just use as is
          setRenderedDiagram(result.html);
          setError(result.error || null);
        }
      } catch (error) {
        console.error('Diagram rendering error:', error);
        setError(`Error rendering diagram: ${error instanceof Error ? error.message : String(error)}`);
        setRenderedDiagram(null);
      }
    };
    
    renderDiagram();
  }, [result, onPerformanceUpdate]);
  
  // Handle theme changes
  useEffect(() => {
    const darkMode = document.documentElement.classList.contains('dark');
    
    // Re-render when theme changes
    if (result?.html && result.format === 'sequencediagram' && diagramRef.current) {
      try {
        // Clear previous content
        diagramRef.current.innerHTML = '';
        
        // Create a container for the diagram
        const diagramContainer = document.createElement('div');
        diagramContainer.id = 'js-sequence-diagram';
        diagramRef.current.appendChild(diagramContainer);
        
        // Use js-sequence-diagrams to render
        const diagram = Diagram.parse(result.html);
        
        // Set theme based on current mode
        const theme = darkMode ? 'simple' : 'hand';
        
        diagram.drawSVG('js-sequence-diagram', { theme: theme });
      } catch (error) {
        console.error('js-sequence-diagrams re-rendering error:', error);
      }
    }
  }, []); // Run only once on mount
  
  // Handle participant overlay visibility
  useEffect(() => {
    if (!participantOverlay || !containerRef.current) {
      return;
    }
    
    const container = containerRef.current;
    
    // Use IntersectionObserver to detect when the top of the diagram scrolls out of view
    const observer = new IntersectionObserver(
      (entries) => {
        setShowOverlay(!entries[0].isIntersecting);
      },
      { threshold: 0, rootMargin: '-50px 0px 0px 0px' }
    );
    
    // Observe the top part of the diagram
    if (diagramRef.current) {
      observer.observe(diagramRef.current);
    }
    
    return () => observer.disconnect();
  }, [participantOverlay, renderedDiagram]);
  
  // Calculate scale for shrink-to-fit
  useEffect(() => {
    if (!shrinkToFit || !containerRef.current || !diagramRef.current) {
      setScale(1);
      return;
    }
    
    const container = containerRef.current;
    const diagram = diagramRef.current;
    
    const handleResize = () => {
      const containerWidth = container.clientWidth;
      const diagramWidth = diagram.scrollWidth;
      
      if (diagramWidth > containerWidth) {
        const newScale = (containerWidth / diagramWidth) * 0.9; // 10% padding
        setScale(Math.max(0.4, newScale)); // Limit minimum scale to 40%
      } else {
        setScale(1);
      }
    };
    
    // Observe size changes
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    resizeObserver.observe(diagram);
    
    // Initial calculation
    handleResize();
    
    return () => resizeObserver.disconnect();
  }, [shrinkToFit, renderedDiagram]);
  
  return (
    <div 
      ref={containerRef}
      className={`
        h-full relative bg-white dark:bg-gray-900 overflow-auto
        ${presentationMode ? 'diagram-presentation' : ''}
      `}
      data-testid="sequence-diagram-preview"
    >
      {/* Format indicator for debugging */}
      {process.env.NODE_ENV === 'development' && result?.format && (
        <div className="absolute top-2 right-2 bg-black/20 text-white text-xs p-1 rounded z-50">
          {result.format}
        </div>
      )}
      
      {/* Participant overlay when scrolled */}
      {participantOverlay && showOverlay && !presentationMode && (
        <div 
          className="sticky top-0 bg-white/90 dark:bg-gray-900/90 shadow-md z-10
                    backdrop-blur-sm py-2 px-4 border-b border-gray-200 dark:border-gray-700"
          aria-hidden="true"
        >
          <div className="participants-overlay text-center text-sm text-gray-700 dark:text-gray-300">
            Participants
          </div>
        </div>
      )}
      
      {/* Main diagram container */}
      <div 
        className={`diagram-container p-4 min-h-full 
          ${shrinkToFit ? 'flex items-center justify-center' : 'w-full'}`}
        style={{
          transform: shrinkToFit && scale !== 1 ? `scale(${scale})` : 'none',
          transformOrigin: 'center top',
          transition: 'transform 0.2s ease-out',
          width: shrinkToFit && scale !== 1 ? `${100/scale}%` : '100%',
          height: shrinkToFit && scale !== 1 ? `${100/scale}%` : '100%',
        }}
      >
        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
            <h3 className="font-bold mb-2">Error rendering diagram</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[400px]">{error}</pre>
          </div>
        ) : (
          <div 
            ref={diagramRef}
            className="diagram-content-wrapper animate-fade-in"
          >
            {result?.format !== 'sequencediagram' && renderedDiagram ? (
              <div dangerouslySetInnerHTML={{ __html: renderedDiagram }} />
            ) : null}
          </div>
        )}
        
        {!result?.html && !error && (
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 h-full">
            <svg 
              className="w-16 h-16 mb-4 opacity-50" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1" 
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" 
              />
            </svg>
            <p className="text-lg">Enter a sequence diagram to see the preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPane;