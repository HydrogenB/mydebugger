import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import { Alert } from '../../design-system/components/feedback';
import { Card } from '../../design-system/components/layout';
import 'github-markdown-css/github-markdown-light.css';
import './MarkdownPreview.css';
import { useTheme } from '../../design-system/context/ThemeContext';

const MarkdownPreview: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('# Hello World\n\nThis is a **markdown** preview.');
  const [tab, setTab] = useState<string>('editor');
  const tool = getToolByRoute('/markdown-preview');
  const { isDark } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Simple markdown to HTML converter (very basic)
  const convertMarkdownToHtml = (md: string): string => {
    return md
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
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

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

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
        showHeader={true}
        showDescription={true}
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
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Markdown Preview</h1>

            <div className="mb-4">
              <div className="flex border-b">
                <button
                  className={`py-2 px-4 ${tab === 'editor' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
                  onClick={() => setTab('editor')}
                >
                  Editor
                </button>
                <button
                  className={`py-2 px-4 ${tab === 'preview' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
                  onClick={() => setTab('preview')}
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="border rounded-md">
              {tab === 'editor' ? (
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full h-96 p-4 font-mono"
                  placeholder="Type some markdown here..."
                />
              ) : (
                <div 
                  className="prose max-w-none p-4 h-96 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(markdown) }}
                />
              )}
            </div>
          </div>
        </Card>
      </ToolLayout>
    </>
  );
};

export default MarkdownPreview;