import React, { useState } from 'react';
import { Button } from '../../../design-system/components/inputs';
import { CodeExample } from '../types';

interface CodeExampleViewerProps {
  example: CodeExample;
}

/**
 * Component for displaying and copying code examples
 */
export const CodeExampleViewer: React.FC<CodeExampleViewerProps> = ({
  example
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(example.code);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {example.title}
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyCode}
        >
          {copied ? 'Copied!' : 'Copy Code'}
        </Button>
      </div>
      
      {example.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {example.description}
        </p>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden">
        <pre className="p-4 text-sm font-mono overflow-x-auto">
          <code className="language-jsx">
            {example.code}
          </code>
        </pre>
      </div>
      
      {example.preview && (
        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
          <div className="mb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            Preview
          </div>
          <div className="p-4 flex justify-center items-center">
            {example.preview}
          </div>
        </div>
      )}
    </div>
  );
};
