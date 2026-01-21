/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import React from 'react';
import { CharacterCategory, AnalyzedCodePoint } from '../types';
import { Tooltip } from '@design-system';

interface CharacterBadgeProps {
  codePoint: AnalyzedCodePoint;
  showDetails?: boolean;
}

/**
 * Color schemes for different character categories
 */
const CATEGORY_STYLES: Record<CharacterCategory, { bg: string; text: string; border: string }> = {
  emoji: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-800 dark:text-amber-200',
    border: 'border-amber-400 dark:border-amber-600',
  },
  zwj: {
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-400 dark:border-purple-600',
  },
  zwnj: {
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-400 dark:border-purple-600',
  },
  zwsp: {
    bg: 'bg-pink-100 dark:bg-pink-900/40',
    text: 'text-pink-800 dark:text-pink-200',
    border: 'border-pink-400 dark:border-pink-600',
  },
  vs: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-400 dark:border-blue-600',
  },
  skin_tone: {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-400 dark:border-orange-600',
  },
  bom: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-400 dark:border-red-600',
  },
  control: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-400 dark:border-red-600',
  },
  format: {
    bg: 'bg-violet-100 dark:bg-violet-900/40',
    text: 'text-violet-800 dark:text-violet-200',
    border: 'border-violet-400 dark:border-violet-600',
  },
  private_use: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-400 dark:border-gray-600',
  },
  surrogate: {
    bg: 'bg-red-200 dark:bg-red-900/60',
    text: 'text-red-900 dark:text-red-100',
    border: 'border-red-500 dark:border-red-700',
  },
  whitespace: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/40',
    text: 'text-cyan-800 dark:text-cyan-200',
    border: 'border-cyan-400 dark:border-cyan-600',
  },
  printable: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-400 dark:border-green-600',
  },
};

/**
 * Badge component for visualizing individual code points
 */
export const CharacterBadge: React.FC<CharacterBadgeProps> = ({
  codePoint,
  showDetails = false,
}) => {
  const styles = CATEGORY_STYLES[codePoint.category];
  const isInvisible = ['zwj', 'zwnj', 'zwsp', 'vs', 'bom', 'control', 'format'].includes(
    codePoint.category
  );

  const tooltipContent = (
    <div className="text-xs space-y-1 max-w-xs">
      <div className="font-semibold">{codePoint.name}</div>
      <div>Code Point: {codePoint.unicode}</div>
      <div>Category: {codePoint.category}</div>
      <div>
        UTF-8: {codePoint.utf8Bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}
      </div>
      <div>
        UTF-16: {codePoint.utf16Units.map((u) => u.toString(16).toUpperCase().padStart(4, '0')).join(' ')}
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <span
        className={`
          inline-flex items-center justify-center
          px-2 py-1 rounded-md
          border-2
          text-sm font-mono
          cursor-help
          transition-all duration-150
          hover:scale-105 hover:shadow-md
          ${styles.bg} ${styles.text} ${styles.border}
        `}
      >
        {isInvisible ? (
          <span className="font-bold">[{codePoint.label}]</span>
        ) : (
          <>
            <span className="text-lg mr-1">{codePoint.char}</span>
            {showDetails && (
              <span className="text-xs opacity-70">{codePoint.unicode}</span>
            )}
          </>
        )}
      </span>
    </Tooltip>
  );
};

export default CharacterBadge;
