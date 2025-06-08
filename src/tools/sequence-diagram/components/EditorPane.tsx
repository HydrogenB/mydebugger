import React, { useRef, useEffect } from 'react';
import { DiagramFormat } from '../utils/compiler';

interface EditorPaneProps {
  /**
   * The code content to edit
   */
  value: string;
  
  /**
   * Called when the code content changes
   */
  onChange: (value: string) => void;
  
  /**
   * Error message to display, if any
   */
  error?: string | null;
  
  /**
   * Detected diagram format
   */
  format?: DiagramFormat;
  
  /**
   * Whether the editor should be read-only
   */
  readOnly?: boolean;
  
  /**
   * Line number to highlight (for error jumping)
   */
  highlightLine?: number;
}

/**
 * Editor component for sequence diagram code
 * Features syntax highlighting, line numbers, and error handling
 */
const EditorPane: React.FC<EditorPaneProps> = ({
  value,
  onChange,
  error,
  format = 'sequencediagram',
  readOnly = false,
  highlightLine
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  // Highlight line on error
  useEffect(() => {
    if (highlightLine !== undefined && editorRef.current) {
      const lines = value.split('\n');
      
      if (highlightLine >= 0 && highlightLine < lines.length) {
        // Calculate position of the error line
        const position = lines.slice(0, highlightLine).join('\n').length + 
          (highlightLine > 0 ? 1 : 0);
        
        // Focus and set cursor position
        editorRef.current.focus();
        editorRef.current.setSelectionRange(position, position + lines[highlightLine].length);
        
        // Ensure the line is visible
        const lineHeight = 20; // Approximate line height
        const scrollPosition = highlightLine * lineHeight;
        editorRef.current.scrollTop = scrollPosition - 100; // 100px margin for context
      }
    }
  }, [highlightLine, value]);
  
  // Set up keyboard shortcuts for indentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorRef.current) return;
      
      // Tab key for indentation
      if (e.key === 'Tab') {
        e.preventDefault();
        
        const start = editorRef.current.selectionStart;
        const end = editorRef.current.selectionEnd;
        
        // Get current text and selection
        const text = editorRef.current.value;
        
        // Insert tab at cursor position
        const newText = text.substring(0, start) + '  ' + text.substring(end);
        
        // Update value
        onChange(newText);
        
        // Restore cursor position
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = start + 2;
            editorRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    };
    
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (editor) {
        editor.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [onChange]);
  
  return (
    <div className="flex flex-col h-full relative">
      {/* Format indicator */}
      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <span className="font-mono">
            {format === 'sequencediagram' && 'SequenceDiagram.org'}
            {format === 'mermaid' && 'Mermaid'}
            {format === 'plantuml' && 'PlantUML'}
            {format === 'unknown' && 'Unknown Format'}
          </span>
          {format !== 'unknown' && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              auto-detected
            </span>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {value.split('\n').length} lines
        </div>
      </div>
      
      {/* Editor area */}
      <div className="relative flex-grow overflow-hidden" style={{ height: 'calc(100% - 32px)' }}>
        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full h-full p-4 pl-12 font-mono text-sm resize-none outline-none
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
            ${error ? 'border-red-300 dark:border-red-700' : 'border-transparent'}
            focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700
            transition-colors duration-150
          `}
          style={{ boxSizing: 'border-box', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Sequence diagram code editor"
          readOnly={readOnly}
          data-testid="sequence-diagram-editor"
        />
        
        {/* Line numbers */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 bg-gray-50 dark:bg-gray-800 
                    border-r border-gray-200 dark:border-gray-700 pt-4 text-right pr-2 
                    text-xs text-gray-400 select-none font-mono"
          aria-hidden="true"
        >
          {value.split('\n').map((_, i) => (
            <div 
              key={i} 
              className={`${
                highlightLine === i ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 font-bold' : ''
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border-t border-red-200 dark:border-red-700 
                       px-4 py-2 text-sm text-red-600 dark:text-red-200 flex items-center">
          <svg 
            className="w-4 h-4 mr-2 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default EditorPane;