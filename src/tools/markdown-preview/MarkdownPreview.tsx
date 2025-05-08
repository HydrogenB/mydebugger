import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import * as monaco from 'monaco-editor';
import 'github-markdown-css/github-markdown-light.css';
import 'github-markdown-css/github-markdown-dark.css';
import { Helmet } from 'react-helmet';
import { Card } from '../../design-system/components/layout';
import { ToolLayout } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import { Alert, LoadingSpinner } from '../../design-system/components/feedback';
import { getToolByRoute } from '../index';
import { useTheme } from '../../design-system/context/ThemeContext';
import { Modal } from '../../design-system/components/overlays';
import './MarkdownPreview.css'; // Import custom styles

// Default markdown template
const defaultMarkdown = `# Markdown syntax guide

## Headers

# This is a Heading h1
## This is a Heading h2
###### This is a Heading h6

## Emphasis

*This text will be italic*  
_This will also be italic_

**This text will be bold**  
__This will also be bold__

_You **can** combine them_

## Lists

### Unordered

* Item 1
* Item 2
* Item 2a
* Item 2b
    * Item 3a
    * Item 3b

### Ordered

1. Item 1
2. Item 2
3. Item 3
    1. Item 3a
    2. Item 3b

## Images

![This is an alt text.](/image/sample.webp "This is a sample image.")

## Links

You may be using [Markdown Live Preview](https://markdownlivepreview.com/).

## Blockquotes

> Markdown is a lightweight markup language with plain-text-formatting syntax, created in 2004 by John Gruber with Aaron Swartz.
>
>> Markdown is often used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.

## Tables

| Left columns  | Right columns |
| ------------- |:-------------:|
| left foo      | right foo     |
| left bar      | right bar     |
| left baz      | right baz     |

## Blocks of code

\`\`\`javascript
let message = 'Hello world';
alert(message);
\`\`\`

## Inline code

This web site is using \`markedjs/marked\`.
`;

// Helper functions for localStorage
const STORAGE_KEY = 'mydebugger.markdown.content';

const saveToLocalStorage = (content: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, content);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

// File handling functions
const downloadMarkdownFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const MarkdownPreview: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(loadFromLocalStorage() || defaultMarkdown);
  const [html, setHtml] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [scrollSync, setScrollSync] = useState<boolean>(true);
  const [hasEdited, setHasEdited] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>('document.md');
  
  const tool = getToolByRoute('/markdown-preview');
  const { isDark } = useTheme();
  
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Render markdown initially and when it changes
  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        // Define options using the correct type from marked
        const options = {
          gfm: true, // GitHub Flavored Markdown
          breaks: true, // Convert line breaks to <br>
          mangle: false // Don't mangle email addresses
        };
        
        // Use marked correctly with await since it may return a Promise
        const renderedHtml = await Promise.resolve(marked.parse(markdown, options));
        // Sanitize the HTML output
        const sanitizedHtml = DOMPurify.sanitize(renderedHtml);
        setHtml(sanitizedHtml);
        setError(null);
      } catch (error) {
        console.error('Error rendering markdown:', error);
        setError('Failed to render markdown. Please check your syntax.');
      }
    };

    renderMarkdown();
  }, [markdown]);
  
  // Initialize Monaco editor
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const initEditor = async () => {
      if (!editorContainerRef.current) return;
      
      setIsLoading(true);
      
      try {
        // Set theme based on app dark mode
        monaco.editor.defineTheme('mydebugger-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#1F2937',
            'editor.foreground': '#E5E7EB',
            'editorCursor.foreground': '#60A5FA',
            'editor.lineHighlightBackground': '#374151',
            'editorLineNumber.foreground': '#9CA3AF',
            'editorLineNumber.activeForeground': '#D1D5DB',
            'editor.selectionBackground': '#4B5563',
            'editor.inactiveSelectionBackground': '#374151'
          }
        });

        // Create the editor instance
        editorInstance.current = monaco.editor.create(editorContainerRef.current, {
          value: markdown,
          language: 'markdown',
          theme: isDark ? 'mydebugger-dark' : 'vs',
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          lineNumbers: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
          }
        });

        // Add keyboard shortcuts
        editorInstance.current.addAction({
          id: 'save-markdown',
          label: 'Save Markdown',
          keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
          ],
          run: () => {
            handleExport();
            return undefined;
          }
        });

        editorInstance.current.addAction({
          id: 'toggle-preview',
          label: 'Toggle Preview Sync',
          keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP
          ],
          run: () => {
            toggleScrollSync();
            return undefined;
          }
        });

        // Update preview when content changes
        editorInstance.current.onDidChangeModelContent(() => {
          if (editorInstance.current) {
            const value = editorInstance.current.getValue();
            setMarkdown(value);
            setHasEdited(true);
            saveToLocalStorage(value);
          }
        });

        // Handle scroll synchronization from editor to preview
        const scrollHandler = editorInstance.current.onDidScrollChange((e) => {
          if (!scrollSync || !previewRef.current || !editorInstance.current) return;

          const scrollTop = e.scrollTop;
          const scrollHeight = e.scrollHeight;
          const height = editorInstance.current.getLayoutInfo().height;
          const maxScrollTop = scrollHeight - height;
          
          if (maxScrollTop <= 0) return;
          
          const scrollRatio = scrollTop / maxScrollTop;
          const targetY = (previewRef.current.scrollHeight - previewRef.current.clientHeight) * scrollRatio;
          previewRef.current.scrollTop = targetY;
        });
        
        // Handle reversed scroll sync from preview to editor
        const handlePreviewScroll = () => {
          if (!scrollSync || !previewRef.current || !editorInstance.current) return;
          
          const previewElement = previewRef.current;
          const scrollTop = previewElement.scrollTop;
          const maxScrollTop = previewElement.scrollHeight - previewElement.clientHeight;
          
          if (maxScrollTop <= 0) return;
          
          const scrollRatio = scrollTop / maxScrollTop;
          const editorScrollTop = scrollRatio * (editorInstance.current.getContentHeight() - editorInstance.current.getLayoutInfo().height);
          editorInstance.current.setScrollTop(editorScrollTop);
        };
        
        if (previewRef.current) {
          previewRef.current.addEventListener('scroll', handlePreviewScroll);
        }
        
        cleanup = () => {
          scrollHandler.dispose();
          if (previewRef.current) {
            previewRef.current.removeEventListener('scroll', handlePreviewScroll);
          }
          if (editorInstance.current) {
            editorInstance.current.dispose();
            editorInstance.current = null;
          }
        };
      } catch (err) {
        console.error('Error initializing Monaco editor:', err);
        setError('Failed to initialize the editor. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initEditor();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [isDark]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Setup resizable divider
  useEffect(() => {
    if (!dividerRef.current || !containerRef.current || !editorContainerRef.current || !previewRef.current) return;

    let isDragging = false;
    let lastLeftRatio = 0.5;
    const divider = dividerRef.current;
    const container = containerRef.current;
    const editorContainer = editorContainerRef.current;
    const previewContainer = previewRef.current;
    
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDragging = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const containerRect = container.getBoundingClientRect();
      const totalWidth = containerRect.width;
      const offsetX = e.clientX - containerRect.left;
      const dividerWidth = divider.offsetWidth;
      
      // Set minimum and maximum widths for the editor
      const minWidth = 100;
      const maxWidth = totalWidth - minWidth - dividerWidth;
      const leftWidth = Math.max(minWidth, Math.min(offsetX, maxWidth));
      
      // Set the widths of the editor and preview panes
      editorContainer.style.width = `${leftWidth}px`;
      previewContainer.style.width = `${totalWidth - leftWidth - dividerWidth}px`;
      
      lastLeftRatio = leftWidth / (totalWidth - dividerWidth);
      
      // Update editor layout
      if (editorInstance.current) {
        editorInstance.current.layout();
      }
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
      }
    };
    
    const handleResize = () => {
      const containerRect = container.getBoundingClientRect();
      const totalWidth = containerRect.width;
      const dividerWidth = divider.offsetWidth;
      const availableWidth = totalWidth - dividerWidth;
      
      const newLeft = availableWidth * lastLeftRatio;
      const newRight = availableWidth * (1 - lastLeftRatio);
      
      editorContainer.style.width = `${newLeft}px`;
      previewContainer.style.width = `${newRight}px`;
      
      // Update editor layout
      if (editorInstance.current) {
        editorInstance.current.layout();
      }
    };
    
    divider.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
    
    // Initialize with equal widths
    handleResize();
    
    return () => {
      divider.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(markdown)
      .then(() => setCopied(true))
      .catch((error) => console.error('Failed to copy:', error));
  };
  
  const handleReset = () => {
    if (!hasEdited || window.confirm('Are you sure you want to reset? Your changes will be lost.')) {
      setMarkdown(defaultMarkdown);
      saveToLocalStorage(defaultMarkdown);
      setHasEdited(false);
      
      if (editorInstance.current) {
        editorInstance.current.setValue(defaultMarkdown);
        editorInstance.current.setPosition({ lineNumber: 1, column: 1 });
        editorInstance.current.revealPosition({ lineNumber: 1, column: 1 });
        editorInstance.current.focus();
      }
    }
  };
  
  const toggleScrollSync = () => {
    setScrollSync(!scrollSync);
  };
  
  // Import file handler
  const handleImport = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Extract filename for later use
    setFilename(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setMarkdown(content);
        saveToLocalStorage(content);
        setHasEdited(true);
        
        if (editorInstance.current) {
          editorInstance.current.setValue(content);
          editorInstance.current.setPosition({ lineNumber: 1, column: 1 });
        }
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };
  
  // Export file handler
  const handleExport = () => {
    setShowExportModal(true);
  };
  
  const confirmExport = () => {
    downloadMarkdownFile(markdown, filename);
    setShowExportModal(false);
  };
  
  // Generate PDF functionality
  const handleGeneratePDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      <Helmet>
        <title>Markdown Live Preview | MyDebugger</title>
        <meta name="description" content="Edit Markdown with real-time preview and GitHub styling support." />
      </Helmet>
      
      <ToolLayout 
        title="Markdown Live Preview" 
        description="A live preview tool for Markdown text with GitHub styling."
        tool={tool!}
      >
        <div className="mb-4">
          <Alert type="info" title="About this tool">
            Type Markdown in the editor and see the result in real-time. You can import/export markdown files and synchronize scrolling between the editor and preview.
            <div className="mt-2 text-sm">
              <strong>Keyboard shortcuts:</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Ctrl+S: Save/Export markdown</li>
                <li>Ctrl+P: Toggle scroll synchronization</li>
              </ul>
            </div>
          </Alert>
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
          <Button onClick={handleCopyToClipboard} variant="secondary">
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            onClick={toggleScrollSync}
            variant={scrollSync ? "primary" : "secondary"}
          >
            {scrollSync ? "Sync: ON" : "Sync: OFF"}
          </Button>
          <Button onClick={handleImport} variant="secondary">
            Import
          </Button>
          <Button onClick={handleExport} variant="secondary">
            Export
          </Button>
          <Button onClick={handleGeneratePDF} variant="secondary">
            Print/PDF
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".md,.markdown,.txt"
            className="hidden"
          />
        </div>
        
        {error && (
          <Alert type="error" title="Error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <Card className="p-0 overflow-hidden markdown-preview-container">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div 
              ref={containerRef}
              className="flex flex-col md:flex-row h-[70vh] w-full"
            >
              {/* Editor section */}
              <div 
                ref={editorContainerRef}
                className="h-full md:h-auto flex-1 overflow-hidden editor-container"
                style={{ flex: "1 1 50%" }}
              />
              
              {/* Divider */}
              <div
                ref={dividerRef}
                className="w-full md:w-1 h-1 md:h-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 cursor-row-resize md:cursor-col-resize transition-colors resizable-divider horizontal-divider"
              />
              
              {/* Preview section */}
              <div 
                ref={previewRef}
                className={`
                  h-full flex-1 overflow-auto p-6 preview-container
                  ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'}
                `}
                style={{ flex: "1 1 50%" }}
              >
                <div 
                  className={`${isDark ? 'markdown-body markdown-body-dark' : 'markdown-body'}`}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          )}
        </Card>
        
        {/* Export modal */}
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Export Markdown"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="filename" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                File Name
              </label>
              <input
                type="text"
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
                placeholder="document.md"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
              <Button onClick={confirmExport}>
                Download
              </Button>
            </div>
          </div>
        </Modal>
      </ToolLayout>
    </>
  );
};

export default MarkdownPreview;