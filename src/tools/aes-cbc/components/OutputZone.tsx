/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Output Zone Component
 * Display results with study mode, copy, and transfer functionality
 */

import React from 'react';
import { Button } from '../../../design-system/components/inputs';
import type { CryptoMode, OutputAnatomy, HashResult } from '../types';
import OutputAnatomyDisplay from './OutputAnatomy';

interface OutputZoneProps {
  output: string;
  mode: CryptoMode;
  isProcessing: boolean;
  studyModeEnabled: boolean;
  outputAnatomy: OutputAnatomy | null;
  opensslCommand: string;
  hashResult: HashResult | null;
  onCopyOutput: () => void;
  onCopyOpenSSLCommand: () => void;
  onMoveToInput: () => void;
  onToggleStudyMode: () => void;
  isSymmetric: boolean;
}

export const OutputZone: React.FC<OutputZoneProps> = ({
  output,
  mode,
  isProcessing,
  studyModeEnabled,
  outputAnatomy,
  opensslCommand,
  hashResult,
  onCopyOutput,
  onCopyOpenSSLCommand,
  onMoveToInput,
  onToggleStudyMode,
  isSymmetric,
}) => {
  const getOutputLabel = (): string => {
    if (mode === 'hash') return 'Hash Output';
    if (mode === 'encrypt') return 'Ciphertext';
    return 'Plaintext';
  };

  return (
    <div className="space-y-4">
      {/* Output Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getOutputLabel()}
        </label>
        <div className="flex items-center gap-3">
          {/* Study Mode Toggle (for symmetric encryption only) */}
          {isSymmetric && mode === 'encrypt' && output && (
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={studyModeEnabled}
                onChange={onToggleStudyMode}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              Study Mode
            </label>
          )}
        </div>
      </div>

      {/* Output Textarea */}
      <div className="relative">
        <textarea
          id="crypto-output"
          value={output}
          readOnly
          rows={mode === 'hash' ? 3 : 6}
          placeholder={isProcessing ? 'Processing...' : 'Output will appear here...'}
          className={`
            w-full p-3 rounded-lg border font-mono text-sm
            bg-gray-50 dark:bg-gray-900
            text-gray-900 dark:text-gray-100
            border-gray-300 dark:border-gray-600
            resize-y min-h-[80px]
            ${isProcessing ? 'animate-pulse' : ''}
          `}
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-900/80 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </div>
          </div>
        )}
      </div>

      {/* Hash Result Display */}
      {mode === 'hash' && hashResult && (
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-purple-700 dark:text-purple-300 font-medium">Algorithm</span>
            <span className="text-purple-900 dark:text-purple-100 font-mono">{hashResult.algorithm.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-purple-700 dark:text-purple-300 font-medium">Output Size</span>
            <span className="text-purple-900 dark:text-purple-100 font-mono">{hashResult.bytes.length * 8} bits ({hashResult.bytes.length} bytes)</span>
          </div>
          <div className="space-y-1">
            <span className="text-purple-700 dark:text-purple-300 font-medium text-xs">Hex:</span>
            <code className="block text-xs font-mono text-purple-900 dark:text-purple-100 break-all bg-purple-100 dark:bg-purple-900/40 p-2 rounded">
              {hashResult.hex}
            </code>
          </div>
          <div className="space-y-1">
            <span className="text-purple-700 dark:text-purple-300 font-medium text-xs">Base64:</span>
            <code className="block text-xs font-mono text-purple-900 dark:text-purple-100 break-all bg-purple-100 dark:bg-purple-900/40 p-2 rounded">
              {hashResult.base64}
            </code>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {output && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={onCopyOutput}>
            Copy Output
          </Button>
          {mode !== 'hash' && (
            <Button size="sm" variant="info" onClick={onMoveToInput}>
              Move to Input
            </Button>
          )}
        </div>
      )}

      {/* Study Mode: Output Anatomy */}
      {studyModeEnabled && outputAnatomy && mode === 'encrypt' && (
        <OutputAnatomyDisplay anatomy={outputAnatomy} output={output} />
      )}

      {/* OpenSSL Command (for symmetric encryption/decryption) */}
      {isSymmetric && opensslCommand && output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              OpenSSL Verification Command
            </span>
            <button
              type="button"
              onClick={onCopyOpenSSLCommand}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Copy
            </button>
          </div>
          <div className="p-3 bg-gray-900 dark:bg-black rounded-lg overflow-x-auto">
            <code className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
              {opensslCommand}
            </code>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Use this command in your terminal to verify the result with OpenSSL.
          </p>
        </div>
      )}
    </div>
  );
};

export default OutputZone;
