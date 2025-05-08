import React, { useState, useEffect, useCallback } from 'react';
import { ToolLayout, SplitPane } from '../../design-system/components/layout';
import { Button, ButtonGroup } from '../../design-system/components/inputs';
import { Tooltip } from '../../design-system/components/display';
import EditorPane from './components/EditorPane';
import PreviewPane from './components/PreviewPane';
import ExportDialog from './components/ExportDialog';
import TemplateLoader from './components/TemplateLoader';
import { useLiveUpdate } from './hooks/useLiveUpdate';
import { useUndoStack } from './hooks/useUndoStack';
import { useShortcut } from './hooks/useShortcut';
import { getLastDiagram, saveDiagram } from './services/storage.service';
import basicTemplate from './assets/templates/basic.txt';

/**
 * Sequence Diagram Tool
 * 
 * A powerful tool for creating and editing sequence diagrams with
 * split-pane editing, real-time preview, and multiple export options.
 */
const SequenceDiagramTool: React.FC = () => {
  // State for managing diagram name and sharing
  const [diagramName, setDiagramName] = useState('Untitled Diagram');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // State for managing UI modes
  const [presentationMode, setPresentationMode] = useState(false);
  const [participantOverlay, setParticipantOverlay] = useState(true);
  const [shrinkToFit, setShrinkToFit] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // Performance metrics
  const [renderTime, setRenderTime] = useState(0);
  
  // Load saved diagram or URL param diagram on mount
  const [initialCode, setInitialCode] = useState('');
  
  useEffect(() => {
    const loadInitialDiagram = async () => {
      // Check URL for shared diagram
      const urlParams = new URLSearchParams(window.location.search);
      const sharedData = urlParams.get('data');
      
      if (sharedData) {
        try {
          // Decompress and parse the shared data
          const decoded = decodeURIComponent(atob(sharedData));
          const { name, content } = JSON.parse(decoded);
          
          setDiagramName(name || 'Shared Diagram');
          setInitialCode(content);
          return;
        } catch (error) {
          console.error('Failed to load shared diagram:', error);
        }
      }
      
      // If no shared diagram, try to load from local storage
      try {
        const lastDiagram = await getLastDiagram();
        
        if (lastDiagram) {
          setDiagramName(lastDiagram.name);
          setInitialCode(lastDiagram.content);
          return;
        }
      } catch (error) {
        console.error('Failed to load saved diagram:', error);
      }
      
      // If nothing else, use the basic template
      setInitialCode(basicTemplate);
    };
    
    loadInitialDiagram();
    
    // Setup document title
    document.title = `Sequence Diagram Editor – MyDebugger`;
    
    return () => {
      // Reset document title on unmount
      document.title = 'MyDebugger';
    };
  }, []);
  
  // Live update with our custom hook
  const {
    code,
    setCode,
    result,
    error,
    isCompiling,
    compileTime
  } = useLiveUpdate(initialCode);
  
  // Undo/redo history
  const {
    value: undoValue,
    update: updateUndoStack,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetUndoStack
  } = useUndoStack(code, {
    onChange: (newCode) => setCode(newCode)
  });
  
  // Keep undo stack in sync with editor content
  useEffect(() => {
    if (code !== undoValue) {
      updateUndoStack(code);
    }
  }, [code, undoValue, updateUndoStack]);
  
  // Auto-save diagram
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (code.trim()) {
        saveDiagram(diagramName, code)
          .catch(err => console.error('Failed to auto-save diagram:', err));
      }
    }, 2000);
    
    return () => clearTimeout(saveTimer);
  }, [code, diagramName]);
  
  // Share diagram logic
  const handleShare = useCallback(() => {
    try {
      const shareData = {
        name: diagramName,
        content: code
      };
      
      // Compress the data for URL sharing
      const compressed = btoa(encodeURIComponent(JSON.stringify(shareData)));
      const url = `${window.location.origin}${window.location.pathname}?data=${compressed}`;
      
      setShareUrl(url);
      setShareDialogOpen(true);
      
      // Track analytics
      if (window.gtag) {
        window.gtag('event', 'seqdiag.share');
      }
    } catch (error) {
      console.error('Failed to create share URL:', error);
    }
  }, [diagramName, code]);
  
  // Copy share URL to clipboard
  const handleCopyShareUrl = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          // Show toast or feedback that URL was copied
        })
        .catch(err => console.error('Failed to copy URL:', err));
    }
  }, [shareUrl]);
  
  // Handle template selection
  const handleTemplateSelect = useCallback((template: { name: string, content: string }) => {
    // Confirm if there are unsaved changes
    if (code.trim() && code !== initialCode) {
      if (!window.confirm('Loading a template will replace your current diagram. Continue?')) {
        return;
      }
    }
    
    setDiagramName(template.name);
    setCode(template.content);
    resetUndoStack(template.content);
  }, [code, initialCode, setCode, resetUndoStack]);
  
  // Keyboard shortcuts
  useShortcut([
    {
      key: 'z',
      ctrlKey: true,
      action: undo,
      description: 'Undo'
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: redo,
      description: 'Redo'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => saveDiagram(diagramName, code),
      description: 'Save'
    },
    {
      key: 'm',
      ctrlKey: true,
      action: () => setPresentationMode(prev => !prev),
      description: 'Toggle Presentation Mode'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => setExportDialogOpen(true),
      description: 'Export'
    }
  ]);
  
  // Toggle presentation mode
  const togglePresentationMode = useCallback(() => {
    setPresentationMode(prev => !prev);
  }, []);
  
  // Handle performance updates
  const handlePerformanceUpdate = useCallback((time: number) => {
    setRenderTime(time);
  }, []);
  
  return (
    <ToolLayout title="Sequence Diagram">
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        {!presentationMode && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap items-center gap-2">
            {/* Diagram name input */}
            <div className="flex-grow max-w-md">
              <input
                type="text"
                value={diagramName}
                onChange={(e) => setDiagramName(e.target.value)}
                placeholder="Diagram name"
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded
                         text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                aria-label="Diagram name"
              />
            </div>
            
            {/* Template loader */}
            <TemplateLoader onSelect={handleTemplateSelect} />
            
            {/* Undo/Redo */}
            <ButtonGroup>
              <Tooltip content="Undo (Ctrl+Z)">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Undo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Button>
              </Tooltip>
              <Tooltip content="Redo (Ctrl+Shift+Z)">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="Redo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </Tooltip>
            </ButtonGroup>
            
            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportDialogOpen(true)}
              disabled={!result?.svg}
            >
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              Share
            </Button>
            
            {/* View options */}
            <div className="flex items-center gap-3 ml-auto">
              <Tooltip content="Participant Overlay">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={participantOverlay}
                    onChange={(e) => setParticipantOverlay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600"></div>
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Overlay</span>
                </label>
              </Tooltip>
              
              <Tooltip content="Shrink to Fit">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shrinkToFit}
                    onChange={(e) => setShrinkToFit(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600"></div>
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Fit</span>
                </label>
              </Tooltip>
              
              <Tooltip content="Presentation Mode (Ctrl+M)">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePresentationMode}
                  aria-label="Presentation Mode"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Button>
              </Tooltip>
              
              {/* Render performance indicator in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Compile: {Math.round(compileTime)}ms | Render: {Math.round(renderTime)}ms
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-grow overflow-hidden">
          {presentationMode ? (
            <div className="h-full relative">
              <PreviewPane
                result={result}
                participantOverlay={false}
                presentationMode={true}
                shrinkToFit={shrinkToFit}
                onPerformanceUpdate={handlePerformanceUpdate}
              />
              
              {/* Exit presentation mode button */}
              <button
                onClick={togglePresentationMode}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full backdrop-blur-sm"
                aria-label="Exit presentation mode"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <SplitPane
              left={
                <EditorPane
                  value={code}
                  onChange={setCode}
                  error={error}
                  format={result?.format}
                />
              }
              right={
                <PreviewPane
                  result={result}
                  participantOverlay={participantOverlay}
                  shrinkToFit={shrinkToFit}
                  onPerformanceUpdate={handlePerformanceUpdate}
                />
              }
              initialSplit={50}
              storageKey="sequence-diagram-split"
            />
          )}
        </div>
      </div>
      
      {/* Export dialog */}
      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        svgContent={result?.svg}
        diagramName={diagramName}
      />
      
      {/* Share dialog */}
      {shareDialogOpen && shareUrl && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setShareDialogOpen(false)}
            aria-hidden="true"
          />
          
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Share Diagram
            </h2>
            
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Share this link with others to let them view and edit your diagram:
            </p>
            
            <div className="flex">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l
                           text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
              />
              <button
                onClick={handleCopyShareUrl}
                className="px-3 py-2 bg-blue-600 text-white rounded-r"
                aria-label="Copy link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShareDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};

export default SequenceDiagramTool;