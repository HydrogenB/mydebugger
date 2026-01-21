/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import React from 'react';
import { AnalysisResult } from '../types';
import { GraphemeCard } from './GraphemeCard';
import { StatsPanel } from './StatsPanel';
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
  { key: 'zwjFamily', label: 'Family', preview: '👨‍👩‍👧‍👦' },
  { key: 'rainbowFlag', label: 'Flag', preview: '🏳️‍🌈' },
  { key: 'keycap', label: 'Keycap', preview: '1️⃣' },
  { key: 'skinTone', label: 'Skin Tone', preview: '👋🏽' },
  { key: 'doctorDark', label: 'Doctor', preview: '👩🏿‍⚕️' },
  { key: 'hiddenChars', label: 'Hidden', preview: 'Hello‍World' },
  { key: 'mixedContent', label: 'Mixed', preview: 'Hello 👋🏽' },
];

/**
 * Main analyzer view component
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
    <div className="space-y-6">
      {/* Input Section */}
      <div className={TOOL_PANEL_CLASS}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Input Text
          </h2>
          <div className="flex items-center gap-4">
            {/* Decompose Toggle */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="decompose-toggle"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Decompose Emojis
              </label>
              <Switch.Root
                id="decompose-toggle"
                checked={decomposeEmojis}
                onCheckedChange={setDecomposeEmojis}
                className={`
                  w-11 h-6 rounded-full relative
                  transition-colors duration-200
                  ${decomposeEmojis
                    ? 'bg-primary-500'
                    : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <Switch.Thumb
                  className={`
                    block w-5 h-5 rounded-full bg-white shadow-md
                    transition-transform duration-200
                    ${decomposeEmojis ? 'translate-x-[22px]' : 'translate-x-0.5'}
                  `}
                />
              </Switch.Root>
            </div>
          </div>
        </div>

        {/* Text Input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter or paste text to analyze Unicode characters and emojis..."
          className="w-full h-32 p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans text-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          style={{ fontFamily: 'system-ui, "Noto Color Emoji", sans-serif' }}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 self-center mr-2">
              Try:
            </span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.key}
                type="button"
                onClick={() => loadExample(ex.key)}
                className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                title={ex.preview}
              >
                {ex.preview} {ex.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={copyResults}
              disabled={!result}
            >
              {copied ? 'Copied!' : 'Copy Results'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={clear}
              disabled={!input}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Results Section */}
      {result && !isAnalyzing && (
        <>
          {/* Statistics Panel */}
          <div className={TOOL_PANEL_CLASS}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Statistics
            </h2>
            <StatsPanel stats={result.stats} />
          </div>

          {/* Grapheme Visualization */}
          <div className={TOOL_PANEL_CLASS}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Character Breakdown
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                {decomposeEmojis ? '(Decomposed)' : '(Standard)'}
              </span>
            </h2>

            {result.graphemes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No characters to display
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {result.graphemes.map((grapheme, index) => (
                  <GraphemeCard
                    key={`${grapheme.grapheme}-${index}`}
                    grapheme={grapheme}
                    decompose={decomposeEmojis}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className={TOOL_PANEL_CLASS}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Legend
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <LegendItem
                color="bg-amber-400"
                borderColor="border-amber-400"
                label="Emoji"
                description="Emoji characters"
              />
              <LegendItem
                color="bg-purple-400"
                borderColor="border-purple-400"
                label="ZWJ / Joiner"
                description="Zero Width Joiner characters"
              />
              <LegendItem
                color="bg-blue-400"
                borderColor="border-blue-400"
                label="Variation Selector"
                description="Emoji/text presentation"
              />
              <LegendItem
                color="bg-orange-400"
                borderColor="border-orange-400"
                label="Skin Tone"
                description="Fitzpatrick modifiers"
              />
              <LegendItem
                color="bg-pink-400"
                borderColor="border-pink-400"
                label="Zero Width Space"
                description="Invisible separator"
              />
              <LegendItem
                color="bg-red-400"
                borderColor="border-red-400"
                label="Control / BOM"
                description="Control characters, BOM"
              />
              <LegendItem
                color="bg-cyan-400"
                borderColor="border-cyan-400"
                label="Whitespace"
                description="Spaces, tabs, newlines"
              />
              <LegendItem
                color="bg-green-400"
                borderColor="border-green-400"
                label="Printable"
                description="Normal visible characters"
              />
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!result && !isAnalyzing && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            <span role="img" aria-label="magnifying glass">🔍</span>
          </div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter text to analyze
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Paste any text containing Unicode characters, emojis, or hidden control codes to see a detailed breakdown.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Legend item component
 */
interface LegendItemProps {
  color: string;
  borderColor: string;
  label: string;
  description: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, borderColor, label, description }) => (
  <div className="flex items-start gap-2">
    <span className={`w-4 h-4 rounded mt-0.5 border-2 ${color} ${borderColor}`} />
    <div>
      <div className="font-medium text-gray-900 dark:text-gray-100">{label}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
    </div>
  </div>
);

export default AnalyzerView;
