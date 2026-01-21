/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import React from 'react';
import { AnalysisResult } from '../types';
import { TOOL_PANEL_CLASS, Button } from '@design-system';

interface AnalyzerViewProps {
  input: string;
  setInput: (value: string) => void;
  decomposeEmojis: boolean;
  setDecomposeEmojis: (value: boolean) => void;
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  clear: () => void;
  loadExample: (key: string) => void;
  copyResults: () => Promise<void>;
  copied: boolean;
}

const EXAMPLES = [
  { key: 'hiddenChars', label: 'Hidden ZW', preview: 'A\u200BB' },
  { key: 'zwjFamily', label: 'Family', preview: '👨‍👩‍👧‍👦' },
  { key: 'rainbowFlag', label: 'Flag', preview: '🏳️‍🌈' },
  { key: 'doctorDark', label: 'Emoji', preview: '👩🏿‍⚕️' },
];

/**
 * Check if category is a hidden/invisible character
 */
const isHiddenCategory = (category: string): boolean => {
  return ['zwj', 'zwnj', 'zwsp', 'vs', 'bom', 'control', 'format'].includes(category);
};

/**
 * Simple inline view - shows text with hidden chars as inline badges
 */
export const AnalyzerView: React.FC<AnalyzerViewProps> = ({
  input,
  setInput,
  result,
  clear,
  loadExample,
  copyResults,
  copied,
}) => {
  return (
    <div className="space-y-4">
      {/* Input */}
      <div className={TOOL_PANEL_CLASS}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text here to reveal hidden Unicode characters..."
          className="w-full h-24 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          style={{ fontFamily: 'system-ui, "Noto Color Emoji", sans-serif' }}
        />

        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.key}
                type="button"
                onClick={() => loadExample(ex.key)}
                className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                {ex.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={copyResults} disabled={!result}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="secondary" size="sm" onClick={clear} disabled={!input}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Output - Inline text with hidden char badges */}
      {result && result.graphemes.length > 0 && (
        <div className={TOOL_PANEL_CLASS}>
          {/* Inline result display */}
          <div
            className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-lg leading-relaxed break-all"
            style={{ fontFamily: 'system-ui, "Noto Color Emoji", sans-serif' }}
          >
            {result.graphemes.map((grapheme, idx) => {
              // Check if this grapheme has any hidden characters
              const hiddenCps = grapheme.codePoints.filter(cp => isHiddenCategory(cp.category));

              if (hiddenCps.length > 0) {
                // Has hidden chars - show visible parts + badges for hidden
                return (
                  <React.Fragment key={idx}>
                    {grapheme.codePoints.map((cp, cpIdx) => {
                      if (isHiddenCategory(cp.category)) {
                        // Render as inline badge
                        return (
                          <span
                            key={cpIdx}
                            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono font-bold bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 border border-purple-400 dark:border-purple-600"
                            title={`${cp.name}\nUTF-8: ${cp.utf8Bytes.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}`}
                          >
                            {cp.unicode}
                          </span>
                        );
                      } else {
                        // Render normally
                        return <span key={cpIdx}>{cp.char}</span>;
                      }
                    })}
                  </React.Fragment>
                );
              } else {
                // No hidden chars - render as-is
                return <span key={idx}>{grapheme.grapheme}</span>;
              }
            })}
          </div>

          {/* Stats line */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{result.stats.graphemeCount}</span> characters, {' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{result.stats.utf8ByteCount}</span> bytes
            {result.stats.hiddenCharCount > 0 && (
              <span className="ml-2 text-red-600 dark:text-red-400">
                (<span className="font-semibold">{result.stats.hiddenCharCount}</span> hidden)
              </span>
            )}
          </div>

          {/* Hidden chars detail for devs */}
          {result.stats.hiddenCharCount > 0 && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-xs font-mono">
              <div className="text-red-700 dark:text-red-400 font-semibold mb-1">Hidden characters detected:</div>
              {result.graphemes.flatMap((g, gIdx) =>
                g.codePoints
                  .filter(cp => isHiddenCategory(cp.category))
                  .map((cp, i) => (
                    <div key={`${gIdx}-${i}`} className="text-red-800 dark:text-red-300">
                      Position {gIdx}: <span className="font-bold">{cp.unicode}</span> {cp.name}
                      <span className="text-red-600 dark:text-red-400 ml-2">
                        (UTF-8: {cp.utf8Bytes.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' ')})
                      </span>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm">Paste text above to reveal hidden Unicode characters</p>
        </div>
      )}
    </div>
  );
};

export default AnalyzerView;
