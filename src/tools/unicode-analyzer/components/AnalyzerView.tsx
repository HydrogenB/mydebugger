/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import React from 'react';
import { AnalysisResult, AnalyzedCodePoint } from '../types';
import { TOOL_PANEL_CLASS, Button, LoadingSpinner } from '@design-system';
import * as Switch from '@radix-ui/react-switch';

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
  { key: 'zwjFamily', preview: '👨‍👩‍👧‍👦' },
  { key: 'rainbowFlag', preview: '🏳️‍🌈' },
  { key: 'keycap', preview: '1️⃣' },
  { key: 'doctorDark', preview: '👩🏿‍⚕️' },
  { key: 'hiddenChars', preview: 'A\u200BB' },
];

/**
 * Get badge style for a code point category
 */
const getCategoryStyle = (category: string): string => {
  const styles: Record<string, string> = {
    emoji: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
    zwj: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
    zwnj: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
    zwsp: 'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700',
    vs: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
    skin_tone: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
    bom: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
    control: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
    format: 'bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 border-violet-300 dark:border-violet-700',
    whitespace: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700',
    printable: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
  };
  return styles[category] || styles.printable;
};

/**
 * Check if category is a hidden/invisible character
 */
const isHiddenCategory = (category: string): boolean => {
  return ['zwj', 'zwnj', 'zwsp', 'vs', 'bom', 'control', 'format'].includes(category);
};

/**
 * Compact inline badge for a code point
 */
const CodePointBadge: React.FC<{ cp: AnalyzedCodePoint; showCode?: boolean }> = ({ cp, showCode = false }) => {
  const isHidden = isHiddenCategory(cp.category);
  const style = getCategoryStyle(cp.category);

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-mono ${style}`}
      title={`${cp.name}\n${cp.unicode}\nUTF-8: ${cp.utf8Bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}`}
    >
      {isHidden ? (
        <span className="font-bold">{cp.label}</span>
      ) : (
        <span style={{ fontFamily: 'system-ui, "Noto Color Emoji", sans-serif' }}>{cp.char}</span>
      )}
      {(showCode || isHidden) && (
        <span className="ml-1 opacity-70 text-[10px]">{cp.unicode}</span>
      )}
    </span>
  );
};

/**
 * Main analyzer view component - Compact mobile-first design
 */
export const AnalyzerView: React.FC<AnalyzerViewProps> = ({
  input,
  setInput,
  decomposeEmojis,
  setDecomposeEmojis,
  result,
  isAnalyzing,
  clear,
  loadExample,
  copyResults,
  copied,
}) => {
  return (
    <div className="space-y-3">
      {/* Input Section - Compact */}
      <div className={TOOL_PANEL_CLASS}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="decompose-toggle"
              className="text-xs text-gray-600 dark:text-gray-400"
            >
              Decompose
            </label>
            <Switch.Root
              id="decompose-toggle"
              checked={decomposeEmojis}
              onCheckedChange={setDecomposeEmojis}
              className={`w-8 h-4 rounded-full relative transition-colors ${
                decomposeEmojis ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <Switch.Thumb
                className={`block w-3 h-3 rounded-full bg-white shadow transition-transform ${
                  decomposeEmojis ? 'translate-x-[18px]' : 'translate-x-0.5'
                }`}
              />
            </Switch.Root>
          </div>
          <div className="flex gap-1">
            <Button variant="outline-primary" size="sm" onClick={copyResults} disabled={!result}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="secondary" size="sm" onClick={clear} disabled={!input}>
              Clear
            </Button>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text to analyze..."
          className="w-full h-20 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-base resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          style={{ fontFamily: 'system-ui, "Noto Color Emoji", sans-serif' }}
        />

        {/* Compact examples */}
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.key}
              type="button"
              onClick={() => loadExample(ex.key)}
              className="px-2 py-0.5 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              {ex.preview}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isAnalyzing && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      )}

      {/* Results - Compact */}
      {result && !isAnalyzing && (
        <>
          {/* Stats - Single line */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm">
            <span>
              <strong className="text-primary-600 dark:text-primary-400">{result.stats.graphemeCount}</strong>
              <span className="text-gray-500 dark:text-gray-400 ml-1">chars</span>
            </span>
            <span>
              <strong className="text-blue-600 dark:text-blue-400">{result.stats.codePointCount}</strong>
              <span className="text-gray-500 dark:text-gray-400 ml-1">code points</span>
            </span>
            <span>
              <strong className="text-green-600 dark:text-green-400">{result.stats.utf8ByteCount}</strong>
              <span className="text-gray-500 dark:text-gray-400 ml-1">bytes</span>
            </span>
            {result.stats.emojiCount > 0 && (
              <span>
                <strong className="text-amber-600 dark:text-amber-400">{result.stats.emojiCount}</strong>
                <span className="text-gray-500 dark:text-gray-400 ml-1">emoji</span>
              </span>
            )}
            {result.stats.hiddenCharCount > 0 && (
              <span>
                <strong className="text-red-600 dark:text-red-400">{result.stats.hiddenCharCount}</strong>
                <span className="text-gray-500 dark:text-gray-400 ml-1">hidden</span>
              </span>
            )}
          </div>

          {/* Character Breakdown - Inline flow */}
          <div className={TOOL_PANEL_CLASS}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Breakdown
                {decomposeEmojis && <span className="ml-1 text-xs text-gray-500">(decomposed)</span>}
              </h3>
            </div>

            {result.graphemes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                No characters
              </p>
            ) : (
              <div className="flex flex-wrap gap-1 items-center">
                {result.graphemes.map((grapheme, gIdx) => (
                  <React.Fragment key={gIdx}>
                    {decomposeEmojis ? (
                      // Decomposed: show each code point
                      grapheme.codePoints.map((cp, cpIdx) => (
                        <React.Fragment key={`${gIdx}-${cpIdx}`}>
                          <CodePointBadge cp={cp} showCode={isHiddenCategory(cp.category)} />
                          {cpIdx < grapheme.codePoints.length - 1 && (
                            <span className="text-gray-400 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      // Standard: show grapheme with hidden indicator
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded border text-sm ${
                          grapheme.hasHiddenChars
                            ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700'
                            : grapheme.isEmoji
                            ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                        title={grapheme.codePoints.map(cp => `${cp.name} (${cp.unicode})`).join('\n')}
                      >
                        <span style={{ fontFamily: 'system-ui, "Noto Color Emoji", sans-serif' }}>
                          {grapheme.grapheme}
                        </span>
                        {grapheme.hasHiddenChars && (
                          <span className="ml-1 text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                            {grapheme.codePoints
                              .filter(cp => isHiddenCategory(cp.category))
                              .map(cp => cp.unicode)
                              .join('+')}
                          </span>
                        )}
                        {grapheme.codePoints.length > 1 && !grapheme.hasHiddenChars && (
                          <span className="ml-1 text-[10px] text-gray-500 dark:text-gray-400">
                            ×{grapheme.codePoints.length}
                          </span>
                        )}
                      </span>
                    )}
                    {gIdx < result.graphemes.length - 1 && !decomposeEmojis && (
                      <span className="text-gray-300 dark:text-gray-600 mx-0.5">·</span>
                    )}
                    {gIdx < result.graphemes.length - 1 && decomposeEmojis && (
                      <span className="text-gray-400 dark:text-gray-500 mx-1">|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Detailed view for dev - only show if hidden chars exist */}
          {result.stats.hiddenCharCount > 0 && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                Hidden Characters Found:
              </h4>
              <div className="font-mono text-xs text-red-800 dark:text-red-300 space-y-0.5">
                {result.graphemes
                  .flatMap((g, gIdx) =>
                    g.codePoints
                      .filter(cp => isHiddenCategory(cp.category))
                      .map((cp, cpIdx) => ({ cp, gIdx, cpIdx }))
                  )
                  .map(({ cp, gIdx }, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-red-500">[{gIdx}]</span>
                      <span className="font-bold">{cp.unicode}</span>
                      <span className="text-red-600 dark:text-red-400">{cp.name}</span>
                      <span className="text-red-500/70">
                        UTF-8: {cp.utf8Bytes.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state - Compact */}
      {!result && !isAnalyzing && (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Paste text to analyze Unicode & hidden characters
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyzerView;
