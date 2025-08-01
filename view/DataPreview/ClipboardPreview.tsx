/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Clipboard Preview Component - Shows clipboard content
 */
import React, { useState, useEffect } from 'react';
import { FiCopy, FiCheck, FiX } from 'react-icons/fi';

interface ClipboardPreviewProps {
  onStop: () => void;
}

function ClipboardPreview({ onStop }: ClipboardPreviewProps) {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copying, setCopying] = useState(false);
  const [reading, setReading] = useState(false);

  const readClipboard = async () => {
    if (!navigator.clipboard) {
      setError('Clipboard API not available');
      return;
    }

    setReading(true);
    setError('');
    
    try {
      const text = await navigator.clipboard.readText();
      setContent(text || 'Clipboard is empty');
    } catch (err) {
      setError(`Failed to read clipboard: ${(err as Error).message}`);
    } finally {
      setReading(false);
    }
  };

  const writeToClipboard = async () => {
    if (!navigator.clipboard) {
      setError('Clipboard API not available');
      return;
    }

    setCopying(true);
    setError('');
    
    try {
      const testText = `MyDebugger Clipboard Test - ${new Date().toISOString()}`;
      await navigator.clipboard.writeText(testText);
      setContent(testText);
    } catch (err) {
      setError(`Failed to write clipboard: ${(err as Error).message}`);
    } finally {
      setCopying(false);
    }
  };

  useEffect(() => {
    readClipboard();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Clipboard Preview
        </h4>
        <button
          type="button"
          onClick={onStop}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={readClipboard}
            disabled={reading}
            className="px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50"
          >
            {reading ? 'Reading...' : 'Read Clipboard'}
          </button>
          <button
            type="button"
            onClick={writeToClipboard}
            disabled={copying}
            className="px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50"
          >
            {copying ? 'Writing...' : 'Test Write'}
          </button>
        </div>

        {error && (
          <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-red-700 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        {content && (
          <div className="bg-white dark:bg-gray-900 p-3 rounded border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Current Content:
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(content)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiCopy className="w-3 h-3" />
              </button>
            </div>
            <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
              {content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClipboardPreview;
