/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Input Zone Component
 * Text input with byte counter for Crypto Lab
 */

import React from 'react';
import type { CryptoMode } from '../types';

interface InputZoneProps {
  value: string;
  onChange: (value: string) => void;
  mode: CryptoMode;
  byteCount: number;
  disabled?: boolean;
}

const MODE_LABELS: Record<CryptoMode, { placeholder: string; label: string }> = {
  encrypt: {
    placeholder: 'Enter plaintext to encrypt...',
    label: 'Plaintext',
  },
  decrypt: {
    placeholder: 'Paste ciphertext (Base64) to decrypt...',
    label: 'Ciphertext',
  },
  hash: {
    placeholder: 'Enter text to hash...',
    label: 'Input',
  },
};

export const InputZone: React.FC<InputZoneProps> = ({
  value,
  onChange,
  mode,
  byteCount,
  disabled = false,
}) => {
  const config = MODE_LABELS[mode];

  const formatByteCount = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="crypto-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {config.label}
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {formatByteCount(byteCount)}
        </span>
      </div>

      <textarea
        id="crypto-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        disabled={disabled}
        rows={6}
        className={`
          w-full p-3 rounded-lg border font-mono text-sm
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          border-gray-300 dark:border-gray-600
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-y min-h-[120px]
          transition-colors duration-200
        `}
      />

      {value && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Clear input
          </button>
        </div>
      )}
    </div>
  );
};

export default InputZone;
