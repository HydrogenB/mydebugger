import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import CodeEditor from '@uiw/react-textarea-code-editor';
import Prism from 'prismjs';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import { Alert } from '../../design-system/components/feedback';
import { Card } from '../../design-system/components/layout';
import 'github-markdown-css/github-markdown-light.css';
import 'prismjs/themes/prism-tomorrow.css';
import './MarkdownPreview.css';
import { useTheme } from '../../design-system/context/ThemeContext';

// Import only core Prism - we'll load languages dynamically
const STORAGE_KEY = 'markdownPreview';
const DEFAULT_MARKDOWN = `# Markdown Live Preview

## Getting Started with Markdown

Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.

## Basic Syntax

### Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5

### Emphasis

*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

### Lists

#### Unordered List

* Item 1
* Item 2
  * Item 2a
  * Item 2b

#### Ordered List

1. Item 1
2. Item 2
3. Item 3
   1. Item 3a
   2. Item 3b

### Links

[GitHub](http://github.com)

### Images

![GitHub Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)

### Code

\`\`\`javascript
function factorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}
\`\`\`

### Tables

| Header 1 | Header 2 |
| -------- | -------- |
| Content 1 | Content 2 |
| Content 3 | Content 4 |

### Blockquotes

> This is a blockquote.
> 
> This is the second paragraph in the blockquote.

### Horizontal Rule

---
`;

const commonLanguages = [
  'javascript', 'typescript', 'jsx', 'tsx', 
  'css', 'html', 'json', 'python', 'java', 
  'c', 'cpp', 'csharp', 'go', 'ruby', 'rust', 
  'bash', 'yaml', 'markdown', 'sql', 'php'
];

// Helper to dynamically load Prism language components
const loadPrismLanguage = async (language: any) => { // Typed language
  if (!language || language === 'none' || Prism.languages[language]) {
    return;
  }
  try {
    // @ts-ignore
    await import(`prismjs/components/prism-${language}`);
    Prism.highlightAll(); // Re-highlight after loading new language
  } catch (e) {
    console.warn(`Failed to load Prism language: ${language}`, e);
  }
};

// Helper to detect and load languages in code blocks
const detectAndLoadLanguages = async (html: any) => { // Typed html
  if (typeof html !== 'string') return;

  const codeBlockRegex = /<pre><code class="language-(\w+)">/g;
  let match;
  const languages: string[] = []; // Typed languages
  while ((match = codeBlockRegex.exec(html)) !== null) {
    const language = match[1];
    if (language && !Prism.languages[language]) {
      if (!languages.includes(language)) {
        languages.push(language);
      }
    }
  }
  await Promise.all(languages.map(language => loadPrismLanguage(language)));
};

/**
 * Markdown Preview Tool Component
 * A real-time markdown editor and preview with synchronized scrolling
 */
const MarkdownPreview: React.FC = () => {
  // Get tool metadata
  const tool = getToolByRoute('/markdown-preview');
  const { isDark } = useTheme();
  
  // State for markdown content and editor/preview configuration
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [htmlOutput, setHtmlOutput] = useState<string>('');
  const [syncScroll, setSyncScroll] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState<number>(50); // Percentage
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  // References for DOM elements
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved content from local storage on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMarkdown(saved);
      }
    } catch (err) {
      console.error('Error loading saved markdown:', err);
    }
  }, []);
  
  // Preload common languages for better UX
  useEffect(() => {
    Promise.all(commonLanguages.map(lang => loadPrismLanguage(lang)));
  }, []);

  // Convert markdown to HTML whenever content changes
  useEffect(() => {
    const parseMarkdown = async () => {
      try {
        const html = marked(markdown, {
          gfm: true,
          breaks: true,
        });
        
        // Detect and load languages from the HTML
        await detectAndLoadLanguages(html);
        
        setHtmlOutput(DOMPurify.sanitize(html as string)); // Cast html to string
        
        // Save to local storage
        try {
          localStorage.setItem(STORAGE_KEY, markdown);
        } catch (err) {
          console.error('Error saving markdown:', err);
        }
        
        // Apply syntax highlighting to code blocks
        setTimeout(() => {
          if (previewRef.current) {
            const codeBlocks = previewRef.current.querySelectorAll('pre code');
            codeBlocks.forEach((block) => {
              Prism.highlightElement(block);
            });
          }
        }, 0);
        
        setError(null);
      } catch (err) {
        console.error('Error parsing markdown:', err);
        setError('Failed to parse markdown. Please check your syntax.');
      }
    };
    
    parseMarkdown();
  }, [markdown]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);
  
  // Break circular dependency by creating refs for the scroll handlers
  const handlePreviewScrollRef = useRef<() => void>(() => {});
  
  // Handle editor scroll - sync with preview if enabled
  const handleEditorScroll = useCallback((): void => {
    if (!syncScroll || !editorRef.current || !previewRef.current) return;
    
    const editorElement = editorRef.current;
    const previewElement = previewRef.current;
    
    // Synchronize vertical scroll
    const editorScrollHeight = editorElement.scrollHeight - editorElement.clientHeight;
    const scrollRatio = editorElement.scrollTop / editorScrollHeight;
    
    const previewScrollHeight = previewElement.scrollHeight - previewElement.clientHeight;
    const previewScrollTop = scrollRatio * previewScrollHeight;
    
    // Synchronize horizontal scroll
    const editorScrollWidth = editorElement.scrollWidth - editorElement.clientWidth;
    const horizontalScrollRatio = editorElement.scrollLeft / (editorScrollWidth || 1);
    
    const previewScrollWidth = previewElement.scrollWidth - previewElement.clientWidth;
    const previewScrollLeft = horizontalScrollRatio * previewScrollWidth;
    
    // Apply both scrolls without triggering scroll events
    previewElement.removeEventListener('scroll', handlePreviewScrollRef.current);
    previewElement.scrollTop = previewScrollTop;
    previewElement.scrollLeft = previewScrollLeft;
    setTimeout(() => {
      previewElement.addEventListener('scroll', handlePreviewScrollRef.current);
    }, 50);
  }, [syncScroll]);
  
  // Handle preview scroll - sync with editor if enabled
  const handlePreviewScroll = useCallback((): void => {
    if (!syncScroll || !editorRef.current || !previewRef.current) return;
    
    const editorElement = editorRef.current;
    const previewElement = previewRef.current;
    
    // Synchronize vertical scroll
    const previewScrollHeight = previewElement.scrollHeight - previewElement.clientHeight;
    const scrollRatio = previewElement.scrollTop / (previewScrollHeight || 1);
    
    const editorScrollHeight = editorElement.scrollHeight - editorElement.clientHeight;
    const editorScrollTop = scrollRatio * editorScrollHeight;
    
    // Synchronize horizontal scroll
    const previewScrollWidth = previewElement.scrollWidth - previewElement.clientWidth;
    const horizontalScrollRatio = previewElement.scrollLeft / (previewScrollWidth || 1);
    
    const editorScrollWidth = editorElement.scrollWidth - editorElement.clientWidth;
    const editorScrollLeft = horizontalScrollRatio * editorScrollWidth;
    
    // Apply both scrolls without triggering scroll events
    editorElement.removeEventListener('scroll', handleEditorScroll);
    editorElement.scrollTop = editorScrollTop;
    editorElement.scrollLeft = editorScrollLeft;
    setTimeout(() => {
      editorElement.addEventListener('scroll', handleEditorScroll);
    }, 50);
  }, [syncScroll, handleEditorScroll]);

  // Update the ref when the function changes
  useEffect(() => {
    handlePreviewScrollRef.current = handlePreviewScroll;
  }, [handlePreviewScroll]);

  // Set up event listeners for scroll synchronization
  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    
    if (editor && preview) {
      editor.addEventListener('scroll', handleEditorScroll);
      preview.addEventListener('scroll', handlePreviewScroll);
      
      return () => {
        editor.removeEventListener('scroll', handleEditorScroll);
        preview.removeEventListener('scroll', handlePreviewScroll);
      };
    }
  }, [handleEditorScroll, handlePreviewScroll]);
  
  // Handle resize functionality with the divider
  useEffect(() => {
    const divider = dividerRef.current;
    const container = containerRef.current;
    
    if (!divider || !container) return;
    
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;
    let containerWidth = 0;
    
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      containerWidth = container.offsetWidth;
      startWidth = (leftPaneWidth / 100) * containerWidth;
      divider.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;
      const newPercentage = Math.min(Math.max(20, (newWidth / containerWidth) * 100), 80);
      
      setLeftPaneWidth(newPercentage);
    };
    
    const handleMouseUp = () => {
      isDragging = false;
      divider.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    divider.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      divider.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [leftPaneWidth]);
  
  // Reset to default markdown
  const handleReset = () => {
    if (markdown !== DEFAULT_MARKDOWN) {
      const confirmReset = window.confirm('Are you sure you want to reset? All changes will be lost.');
      if (confirmReset) {
        setMarkdown(DEFAULT_MARKDOWN);
      }
    }
  };
  
  // Copy markdown to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setError('Failed to copy to clipboard. Please try again.');
    }
  };
  
  // Toggle synchronized scrolling
  const toggleSyncScroll = () => {
    setSyncScroll(prev => !prev);
  };

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  // Handle file import
  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process imported file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setMarkdown(content);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Export markdown as file
  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate PDF
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <>
      <Helmet>
        <title>Markdown Live Preview | MyDebugger</title>
        <meta name="description" content="Edit Markdown with real-time preview and GitHub styling support" />
        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              .markdown-body, .markdown-body * {
                visibility: visible;
              }
              .markdown-body {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
            }
          `}
        </style>
      </Helmet>
      
      <ToolLayout 
        tool={tool!} 
        showHeader={!isFullScreen}
        showDescription={!isFullScreen}
      >
        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <Card className="p-0 overflow-hidden">
          {/* Compact toolbar */}
          <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="secondary" onClick={handleReset} title="Reset to default content">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </Button>
              <Button size="sm" variant="secondary" onClick={handleCopy} title="Copy to clipboard">
                {isCopied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleImport} title="Import markdown file">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".md,.markdown,.txt" 
                className="hidden" 
              />
              <Button size="sm" variant="secondary" onClick={handleExport} title="Export as markdown file">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </Button>
              <Button size="sm" variant="secondary" onClick={handlePrint} title="Print/Generate PDF">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="sync-scroll-indicator hidden sm:flex">
                <label htmlFor="sync-scroll" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer flex items-center">
                  <input 
                    id="sync-scroll" 
                    type="checkbox" 
                    checked={syncScroll} 
                    onChange={toggleSyncScroll}
                    className="mr-2 h-3 w-3"
                  />
                  Sync Scroll
                </label>
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={toggleFullScreen} 
                title={isFullScreen ? "Exit fullscreen" : "Fullscreen mode"}
              >
                {isFullScreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
          
          <div 
            ref={containerRef} 
            className={`markdown-container ${isFullScreen ? 'fullscreen-mode' : ''}`}
          >
            <div 
              ref={editorRef}
              className="editor-pane" 
              style={{ width: `${leftPaneWidth}%` }}
            >
              <CodeEditor
                value={markdown}
                language="markdown"
                placeholder="Type your markdown here..."
                onChange={(e) => setMarkdown(e.target.value)}
                padding={15}
                style={{
                  fontSize: '14px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  minHeight: '100%',
                  height: '100%',
                  backgroundColor: isDark ? '#1a202c' : '#f9fafb',
                  color: isDark ? '#e5e7eb' : '#111827',
                }}
                data-color-mode={isDark ? "dark" : "light"}
                data-testid="markdown-editor"
              />
            </div>
            
            <div 
              ref={dividerRef}
              className="divider"
              title="Drag to resize"
            />
            
            <div 
              ref={previewRef}
              className="preview-pane" 
              style={{ width: `${100 - leftPaneWidth}%` }}
            >
              <div 
                className={`markdown-body ${isDark ? 'markdown-body-dark' : ''}`}
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
                data-testid="markdown-preview"
              />
            </div>
          </div>
        </Card>
      </ToolLayout>
    </>
  );
};

export default MarkdownPreview;