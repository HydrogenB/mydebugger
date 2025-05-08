import React, { useState, useEffect, useCallback, lazy } from 'react';
import { ToolLayout, SplitPane } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import { ToolCategory } from '../index';
import EditorPane from './components/EditorPane';
import PreviewPane from './components/PreviewPane';
import ExportDialog from './components/ExportDialog';
import TemplateLoader from './components/TemplateLoader';
import { useLiveUpdate } from './hooks/useLiveUpdate';
import { useUndoStack } from './hooks/useUndoStack';
import { useShortcut } from './hooks/useShortcut';
import { getLastDiagram, saveDiagram } from './services/storage.service';

// Import template as a string constant - using inline template to avoid import issues
const basicTemplate = `title Basic Sequence Diagram

participant User
participant System
participant Database

User->System: Request data
activate System
System->Database: Query data
activate Database
Database-->System: Return results
deactivate Database
System-->User: Display data
deactivate System`;

/**
 * Sequence Diagram Tool
 * 
 * A powerful tool for creating and editing sequence diagrams with
 * split-pane editing, real-time preview, and export options.
 * Fully supports sequencediagram.org syntax.
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
  
  // Tool instance for ToolLayout
  const tool = {
    title: "Sequence Diagram",
    description: "Create and edit sequence diagrams with live preview",
    route: "/tools/sequence-diagram",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    metadata: {
      keywords: ['sequence diagram', 'uml', 'visualization', 'diagram', 'flow'],
      learnMoreUrl: 'https://sequencediagram.org/index.html#language'
    },
    id: 'sequence-diagram',
    isBeta: false,
    isNew: false,
    category: 'Utilities' as ToolCategory,
    component: lazy(() => import('./SequenceDiagramTool')),
    uiOptions: {
      fullWidth: true
    }
  };
  
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
      
      // Analytics tracking removed to fix build error
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

  // Fullscreen mode style classes
  const fullscreenHeaderClass = "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 py-1 px-3 flex items-center gap-2 shadow-sm fixed top-0 left-0 right-0 z-10";
  const fullscreenButtonClass = "p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded";
  
  return (
    <ToolLayout tool={tool}>
      <div className="h-full flex flex-col" style={{ minHeight: '80vh' }}>
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
            
            {/* Undo/Redo buttons - replaced ButtonGroup with div */}
            <div className="flex space-x-1">
              <Button
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <Button
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                aria-label="Redo"
                title="Redo (Ctrl+Shift+Z)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </div>
            
            {/* Actions */}
            <Button
              size="sm"
              onClick={() => setExportDialogOpen(true)}
              disabled={!result?.svg}
              title="Export diagram"
            >
              Export
            </Button>
            <Button
              size="sm"
              onClick={handleShare}
              title="Share diagram"
            >
              Share
            </Button>
            
            {/* View options */}
            <div className="flex items-center gap-3 ml-auto">
              <label className="flex items-center cursor-pointer" title="Participant Overlay">
                <input
                  type="checkbox"
                  checked={participantOverlay}
                  onChange={(e) => setParticipantOverlay(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600"></div>
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Overlay</span>
              </label>
              
              <label className="flex items-center cursor-pointer" title="Shrink to Fit">
                <input
                  type="checkbox"
                  checked={shrinkToFit}
                  onChange={(e) => setShrinkToFit(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600"></div>
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Fit</span>
              </label>
              
              <Button
                size="sm"
                onClick={togglePresentationMode}
                aria-label="Presentation Mode"
                title="Presentation Mode (Ctrl+M)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
              
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
        <div className="flex-grow overflow-hidden" style={{ height: 'calc(80vh - 60px)' }}>
          {presentationMode ? (
            <div className="h-full relative pt-10">
              <div className={fullscreenHeaderClass}>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={togglePresentationMode}
                    className={fullscreenButtonClass}
                    aria-label="Exit presentation mode"
                    title="Exit fullscreen (Ctrl+M)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                  <div className="font-medium text-sm text-gray-700 dark:text-gray-200 max-w-[200px] truncate">
                    {diagramName}
                  </div>
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                  <div className="flex space-x-1">
                    <button
                      className={fullscreenButtonClass}
                      onClick={undo}
                      disabled={!canUndo}
                      aria-label="Undo"
                      title="Undo (Ctrl+Z)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <button
                      className={fullscreenButtonClass}
                      onClick={redo}
                      disabled={!canRedo}
                      aria-label="Redo"
                      title="Redo (Ctrl+Shift+Z)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="h-4 border-r border-gray-300 dark:border-gray-600 mx-1"></div>
                  
                  <label className="flex items-center cursor-pointer" title="Participant Overlay">
                    <input
                      type="checkbox"
                      checked={participantOverlay}
                      onChange={(e) => setParticipantOverlay(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-8 h-4 bg-gray-300 peer-checked:bg-blue-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600"></div>
                    <span className="ml-1 text-xs text-gray-700 dark:text-gray-300">Overlay</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer" title="Shrink to Fit">
                    <input
                      type="checkbox"
                      checked={shrinkToFit}
                      onChange={(e) => setShrinkToFit(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-8 h-4 bg-gray-300 peer-checked:bg-blue-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600"></div>
                    <span className="ml-1 text-xs text-gray-700 dark:text-gray-300">Fit</span>
                  </label>
                  
                  <div className="h-4 border-r border-gray-300 dark:border-gray-600 mx-1"></div>
                  
                  <button
                    className={fullscreenButtonClass}
                    onClick={() => setExportDialogOpen(true)}
                    disabled={!result?.svg}
                    title="Export diagram"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
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
                    presentationMode={true}
                    shrinkToFit={shrinkToFit}
                    onPerformanceUpdate={handlePerformanceUpdate}
                  />
                }
                initialSplit={50}
                storageKey="sequence-diagram-split-fullscreen"
              />
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

/**
 * Third-Party Software Acknowledgements
 * 
 * This component uses the following open-source libraries:
 * 
 * - lz-string: Used to create URLs for sharing sequence diagrams.
 * - Canvas2Svg: Used to export the diagram into SVG file format.
 * - CodeMirror: Used as the text editor.
 * - Font Awesome: Used to provide icons for the icon participants.
 * - Material Design Icons: Used to provide icons for the icon participants. Color of the icons is altered based on input.
 * - Font Awesome 5 Free: Used to provide icons for the icon participants.
 * - Font Awesome 6 Free: Used to provide icons for the icon participants. Color of the icons is altered based on input.
 * - RBush: Used for collision detection calculations for onmousemove events.
 * - DomPurify: Used as a safeguard when embedding SVG files from Font Awesome and Material Design Icons.
 * - MSAL.js from Microsoft: Used for authentication towards Microsoft services.
 * - OneDrive.js from Microsoft: Used for file picker for OneDrive and SharePoint.
 * - gsi/client and api.js from Google: Used for authentication towards Google services and file picker for Google Drive and Team Drives.
 */

export default SequenceDiagramTool;