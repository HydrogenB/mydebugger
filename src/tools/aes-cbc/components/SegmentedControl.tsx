/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Segmented Control Component
 * Toggle between Encrypt / Decrypt / Hash modes
 */

import React from 'react';
import type { CryptoMode } from '../types';

interface SegmentedControlProps {
  value: CryptoMode;
  onChange: (mode: CryptoMode) => void;
  showHash?: boolean;
  disabled?: boolean;
}

const MODE_CONFIG: Record<CryptoMode, {
  label: string;
  icon: string;
  activeClass: string;
}> = {
  encrypt: {
    label: 'Encrypt',
    icon: '🔒',
    activeClass: 'bg-amber-500 text-white border-amber-500',
  },
  decrypt: {
    label: 'Decrypt',
    icon: '🔓',
    activeClass: 'bg-teal-500 text-white border-teal-500',
  },
  hash: {
    label: 'Hash',
    icon: '#',
    activeClass: 'bg-purple-500 text-white border-purple-500',
  },
};

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  value,
  onChange,
  showHash = true,
  disabled = false,
}) => {
  const modes: CryptoMode[] = showHash ? ['encrypt', 'decrypt', 'hash'] : ['encrypt', 'decrypt'];

  return (
    <div
      className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
      role="group"
      aria-label="Operation mode"
    >
      {modes.map((mode) => {
        const config = MODE_CONFIG[mode];
        const isActive = value === mode;

        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(mode)}
            className={`
              px-4 py-2 text-sm font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isActive
                ? config.activeClass
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              ${mode !== modes[modes.length - 1] ? 'border-r border-gray-300 dark:border-gray-600' : ''}
            `}
          >
            <span className="mr-1.5">{config.icon}</span>
            {config.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
