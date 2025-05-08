import React, { useRef, useEffect, useState } from 'react';
import { CompileResult } from '../utils/compiler';

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
 * - Safe HTML rendering
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [scale, setScale] = useState(1);
  
  // Handle participant overlay visibility
  useEffect(() => {
    if (!participantOverlay || !containerRef.current) {
      return;
    }
    
    const container = containerRef.current;
    
    // Find participant rows (specific to sequence diagram DOM structure)
    const participantsRow = container.querySelector('.diagram-participants');
    
    if (!participantsRow) return;
    
    // Set up intersection observer to detect when participants scroll out of view
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setShowOverlay(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    observerRef.current.observe(participantsRow);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [result, participantOverlay]);
  
  // Calculate scale for shrink-to-fit
  useEffect(() => {
    if (!shrinkToFit || !containerRef.current) {
      setScale(1);
      return;
    }
    
    const container = containerRef.current;
    const diagram = container.querySelector('.diagram-container');
    
    if (!diagram) {
      setScale(1);
      return;
    }
    
    const resizeObserver = new ResizeObserver(() => {
      const containerWidth = container.clientWidth;
      const diagramWidth = diagram.scrollWidth;
      
      if (diagramWidth > containerWidth) {
        const newScale = containerWidth / diagramWidth;
        setScale(Math.max(0.5, newScale)); // Limit minimum scale to 50%
      } else {
        setScale(1);
      }
    });
    
    resizeObserver.observe(container);
    resizeObserver.observe(diagram);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [result, shrinkToFit]);
  
  // Track performance
  useEffect(() => {
    if (result && onPerformanceUpdate) {
      const renderStart = performance.now();
      
      // Defer to next frame to measure actual render time
      const animFrameId = requestAnimationFrame(() => {
        const renderTime = performance.now() - renderStart;
        onPerformanceUpdate(renderTime);
      });
      
      return () => cancelAnimationFrame(animFrameId);
    }
  }, [result, onPerformanceUpdate]);
  
  return (
    <div 
      ref={containerRef}
      className={`
        h-full relative bg-white dark:bg-gray-900 overflow-auto
        ${presentationMode ? 'diagram-presentation' : ''}
      `}
      data-testid="sequence-diagram-preview"
    >
      {/* Performance indicator for debug */}
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
          {/* Clone of participants for overlay */}
          <div className="participants-overlay">
            {/* Will be populated by diagram renderer */}
          </div>
        </div>
      )}
      
      {/* Main diagram container */}
      <div 
        className="diagram-container p-4 min-h-full flex items-center justify-center"
        style={{
          transform: shrinkToFit ? `scale(${scale})` : 'none',
          transformOrigin: 'top left',
          transition: 'transform 0.2s ease-out',
        }}
      >
        {result ? (
          <div 
            className="diagram-content"
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
        ) : (
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