/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import React from 'react';
import { GraphemeCluster } from '../types';
import { CharacterBadge } from './CharacterBadge';

interface GraphemeCardProps {
  grapheme: GraphemeCluster;
  decompose: boolean;
  index: number;
}

/**
 * Card component for displaying a single grapheme cluster
 */
export const GraphemeCard: React.FC<GraphemeCardProps> = ({
  grapheme,
  decompose,
  index,
}) => {
  const borderColor = grapheme.isEmoji
    ? 'border-amber-400 dark:border-amber-600'
    : grapheme.hasHiddenChars
    ? 'border-purple-400 dark:border-purple-600'
    : 'border-gray-300 dark:border-gray-600';

  const bgColor = grapheme.isEmoji
    ? 'bg-amber-50 dark:bg-amber-950/30'
    : grapheme.hasHiddenChars
    ? 'bg-purple-50 dark:bg-purple-950/30'
    : 'bg-white dark:bg-gray-800';

  return (
    <div
      className={`
        rounded-lg border-2 p-3
        transition-all duration-200
        hover:shadow-lg
        ${borderColor} ${bgColor}
      `}
    >
      {/* Header with index and quick info */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          #{index + 1}
        </span>
        <div className="flex gap-1">
          {grapheme.isEmoji && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
              Emoji
            </span>
          )}
          {grapheme.hasHiddenChars && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
              Hidden
            </span>
          )}
        </div>
      </div>

      {/* Main display */}
      {!decompose ? (
        // Standard mode: show grapheme as-is
        <div className="text-center py-4">
          <span
            className="text-4xl leading-none"
            style={{ fontFamily: 'system-ui, "Noto Color Emoji", sans-serif' }}
          >
            {grapheme.grapheme}
          </span>
        </div>
      ) : (
        // Decomposed mode: show all code points
        <div className="flex flex-wrap items-center justify-center gap-1 py-2">
          {grapheme.codePoints.map((cp, i) => (
            <React.Fragment key={`${cp.unicode}-${i}`}>
              <CharacterBadge codePoint={cp} showDetails />
              {i < grapheme.codePoints.length - 1 && (
                <span className="text-gray-400 dark:text-gray-500 text-xs">+</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Footer with code point count */}
      <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        {grapheme.codePoints.length} code point{grapheme.codePoints.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default GraphemeCard;
