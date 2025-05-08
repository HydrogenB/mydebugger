import React, { useRef, useEffect, useState } from 'react';
import { CompileResult } from '../utils/compiler';
import mermaid from 'mermaid';

// Initialize mermaid with configuration
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

// Convert sequencediagram.org format to mermaid format
const convertToMermaid = (code: string): string => {
  let lines = code.trim().split('\n');
  let mermaidCode = 'sequenceDiagram\n';
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Skip empty lines and handle comments
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
      return;
    }
    
    // Handle title
    if (trimmedLine.startsWith('title ')) {
      const title = trimmedLine.substring(6).trim();
      mermaidCode += `  title: ${title}\n`;
      return;
    }
    
    // Handle participants
    if (trimmedLine.startsWith('participant ') || trimmedLine.startsWith('actor ')) {
      const isActor = trimmedLine.startsWith('actor ');
      let participant = trimmedLine.substring(isActor ? 6 : 11).trim();
      
      // Handle quoted participants with aliases
      if (participant.includes(' as ')) {
        const parts = participant.split(' as ');
        let name = parts[0].trim();
        const alias = parts[1].trim();
        
        // Remove quotes if they exist
        if (name.startsWith('"') && name.endsWith('"')) {
          name = name.substring(1, name.length - 1);
        }
        
        mermaidCode += isActor ? `  actor ${name} as ${alias}\n` : `  participant ${name} as ${alias}\n`;
      } else {
        // Handle quoted participants without aliases
        if (participant.startsWith('"') && participant.endsWith('"')) {
          participant = participant.substring(1, participant.length - 1);
        }
        
        mermaidCode += isActor ? `  actor ${participant}\n` : `  participant ${participant}\n`;
      }
      return;
    }
    
    // Handle arrows/messages
    if (trimmedLine.includes('->') || 
        trimmedLine.includes('-->') ||
        trimmedLine.includes('->>') ||
        trimmedLine.includes('-->>') ||
        trimmedLine.includes('<-') ||
        trimmedLine.includes('<--')) {
      
      // Simplify by converting all arrow types to mermaid format
      let newLine = trimmedLine;
      
      // Convert arrows to mermaid format
      newLine = newLine.replace('-->', '->');
      newLine = newLine.replace('->', '->');
      newLine = newLine.replace('-->>', '->>');
      newLine = newLine.replace('->>', '->>');
      
      // Reverse left-to-right arrows
      if (newLine.includes('<-') || newLine.includes('<--')) {
        const parts = newLine.split(/<-+/);
        if (parts.length === 2) {
          const to = parts[0].trim();
          let fromParts = parts[1].trim().split(':');
          const from = fromParts[0].trim();
          const message = fromParts.length > 1 ? fromParts.slice(1).join(':').trim() : '';
          
          newLine = `  ${from}->${to}: ${message}`;
        }
      } else {
        // Add indentation for mermaid
        newLine = `  ${newLine}`;
      }
      
      mermaidCode += `${newLine}\n`;
      return;
    }
    
    // Handle activation
    if (trimmedLine.startsWith('activate ')) {
      const participant = trimmedLine.substring(9).trim();
      mermaidCode += `  activate ${participant}\n`;
      return;
    }
    
    // Handle deactivation
    if (trimmedLine.startsWith('deactivate ')) {
      const participant = trimmedLine.substring(11).trim();
      mermaidCode += `  deactivate ${participant}\n`;
      return;
    }
    
    // Handle notes
    if (trimmedLine.startsWith('note ')) {
      let position = '';
      let participant = '';
      let text = '';
      
      if (trimmedLine.includes(' over ')) {
        position = 'over';
        const parts = trimmedLine.substring(10).split(':');
        participant = parts[0].trim();
        if (parts.length > 1) {
          text = parts[1].trim();
        }
        mermaidCode += `  Note over ${participant}: ${text}\n`;
      } else if (trimmedLine.includes(' left of ')) {
        position = 'left';
        const parts = trimmedLine.substring(13).split(':');
        participant = parts[0].trim();
        if (parts.length > 1) {
          text = parts[1].trim();
        }
        mermaidCode += `  Note left of ${participant}: ${text}\n`;
      } else if (trimmedLine.includes(' right of ')) {
        position = 'right';
        const parts = trimmedLine.substring(14).split(':');
        participant = parts[0].trim();
        if (parts.length > 1) {
          text = parts[1].trim();
        }
        mermaidCode += `  Note right of ${participant}: ${text}\n`;
      }
      return;
    }
    
    // Handle alt/opt/loop/par blocks
    if (trimmedLine.match(/^(alt|opt|loop|par|break|critical|group) /)) {
      const match = trimmedLine.match(/^(alt|opt|loop|par|break|critical|group) (.*)/);
      if (match) {
        const type = match[1];
        const label = match[2] || '';
        mermaidCode += `  ${type === 'group' ? 'rect rgb(200, 200, 240)' : type} ${label}\n`;
      }
      return;
    }
    
    // Handle else in alt blocks
    if (trimmedLine === 'else' || trimmedLine.startsWith('else ')) {
      const label = trimmedLine.substring(4).trim();
      mermaidCode += `  else ${label}\n`;
      return;
    }
    
    // Handle end of blocks
    if (trimmedLine === 'end') {
      mermaidCode += '  end\n';
      return;
    }
    
    // Handle dividers
    if (trimmedLine.startsWith('==') && trimmedLine.endsWith('==')) {
      const label = trimmedLine.substring(2, trimmedLine.length - 2).trim();
      mermaidCode += `  rect rgb(240, 240, 240, 0.5)\n  Note over ${label}: ${label}\n  end\n`;
      return;
    }
  });
  
  return mermaidCode;
};

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
 * - Safe HTML rendering using mermaid.js
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
        // For sequencediagram.org format, convert to mermaid format
        if (result.format === 'sequencediagram') {
          const mermaidCode = convertToMermaid(result.html);
          setRenderedDiagram(''); // Clear previous diagram
          
          const renderStart = performance.now();
          
          try {
            const { svg } = await mermaid.render('diagram-container', mermaidCode);
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
  
  // Handle theme changes by reinitializing mermaid
  useEffect(() => {
    const darkMode = document.documentElement.classList.contains('dark');
    
    // Create a new configuration object instead of trying to get the existing one
    mermaid.initialize({
      startOnLoad: false,
      theme: darkMode ? 'dark' : 'default',
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
        primaryColor: darkMode ? '#4B6BFB' : '#326CE5',
        lineColor: darkMode ? '#aaa' : '#666',
        textColor: darkMode ? '#ddd' : '#333',
        mainBkg: darkMode ? '#2D3748' : '#FFFFFF',
        secondaryBkg: darkMode ? '#374151' : '#F7F9FC',
        tertiaryBkg: darkMode ? '#4B5563' : '#EDF2F7',
      }
    });
    
    // Re-render when theme changes
    if (result?.html && result.format === 'sequencediagram') {
      const mermaidCode = convertToMermaid(result.html);
      mermaid.render('diagram-container', mermaidCode)
        .then(({ svg }) => {
          setRenderedDiagram(svg);
        })
        .catch(error => {
          console.error('Mermaid re-rendering error:', error);
        });
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
        const newScale = containerWidth / diagramWidth * 0.95; // 5% padding
        setScale(Math.max(0.5, newScale)); // Limit minimum scale to 50%
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
        className="diagram-container p-4 min-h-full flex items-center justify-center"
        style={{
          transform: shrinkToFit && scale !== 1 ? `scale(${scale})` : 'none',
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out',
        }}
      >
        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
            <h3 className="font-bold mb-2">Error rendering diagram</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[400px]">{error}</pre>
          </div>
        ) : renderedDiagram ? (
          <div 
            ref={diagramRef}
            className="diagram-content-wrapper animate-fade-in"
            dangerouslySetInnerHTML={{ __html: renderedDiagram }}
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