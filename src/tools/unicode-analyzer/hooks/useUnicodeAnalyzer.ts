/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { analyzeText, getAnalysisSummary } from '../lib';

export interface UseUnicodeAnalyzerReturn {
  /** Current input text */
  input: string;
  /** Set the input text */
  setInput: (value: string) => void;
  /** Whether to decompose emojis into constituent code points */
  decomposeEmojis: boolean;
  /** Toggle emoji decomposition mode */
  setDecomposeEmojis: (value: boolean) => void;
  /** Analysis result */
  result: AnalysisResult | null;
  /** Summary text for display */
  summary: string;
  /** Whether analysis is in progress */
  isAnalyzing: boolean;
  /** Clear the input and results */
  clear: () => void;
  /** Load example text */
  loadExample: (example: string) => void;
  /** Copy results to clipboard */
  copyResults: () => Promise<void>;
  /** Whether results were copied */
  copied: boolean;
}

const EXAMPLE_TEXTS = {
  zwjFamily: '👨‍👩‍👧‍👦',
  rainbowFlag: '🏳️‍🌈',
  keycap: '1️⃣',
  skinTone: '👋🏽',
  doctorDark: '👩🏿‍⚕️',
  hiddenChars: 'Hello\u200BWorld\uFEFF',
  mixedContent: 'Hello 👋🏽 World! 🌍🏳️‍🌈\u200B',
};

export function useUnicodeAnalyzer(): UseUnicodeAnalyzerReturn {
  const [input, setInputState] = useState<string>('');
  const [decomposeEmojis, setDecomposeEmojis] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Reset copied state after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Analyze input with debounce
  useEffect(() => {
    if (!input) {
      setResult(null);
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      const analysisResult = analyzeText(input);
      setResult(analysisResult);
      setIsAnalyzing(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [input]);

  const setInput = useCallback((value: string) => {
    setInputState(value);
  }, []);

  const summary = useMemo(() => {
    if (!result) return '';
    return getAnalysisSummary(result);
  }, [result]);

  const clear = useCallback(() => {
    setInputState('');
    setResult(null);
  }, []);

  const loadExample = useCallback((exampleKey: string) => {
    const example = EXAMPLE_TEXTS[exampleKey as keyof typeof EXAMPLE_TEXTS];
    if (example) {
      setInputState(example);
    }
  }, []);

  const copyResults = useCallback(async () => {
    if (!result) return;

    const lines: string[] = [
      `Unicode Analysis Results`,
      `========================`,
      ``,
      `Input: "${result.input}"`,
      ``,
      `Statistics:`,
      `- Visual Characters (Graphemes): ${result.stats.graphemeCount}`,
      `- Code Points: ${result.stats.codePointCount}`,
      `- UTF-16 Length (JS string): ${result.stats.utf16Length}`,
      `- UTF-8 Bytes: ${result.stats.utf8ByteCount}`,
      `- Emoji Count: ${result.stats.emojiCount}`,
      `- Hidden Characters: ${result.stats.hiddenCharCount}`,
      ``,
      `Grapheme Breakdown:`,
    ];

    for (const grapheme of result.graphemes) {
      lines.push(`  "${grapheme.grapheme}" (${grapheme.codePoints.length} code points)`);
      for (const cp of grapheme.codePoints) {
        lines.push(`    ${cp.unicode} - ${cp.name} [${cp.category}]`);
      }
    }

    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
  }, [result]);

  return {
    input,
    setInput,
    decomposeEmojis,
    setDecomposeEmojis,
    result,
    summary,
    isAnalyzing,
    clear,
    loadExample,
    copyResults,
    copied,
  };
}

export default useUnicodeAnalyzer;

export { EXAMPLE_TEXTS };
