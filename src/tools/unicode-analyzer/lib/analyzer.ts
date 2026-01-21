/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Core Unicode and Emoji analysis logic
 */

import {
  AnalyzedCodePoint,
  GraphemeCluster,
  AnalysisResult,
  CharacterCategory,
} from '../types';

import {
  categorizeCodePoint,
  getCharacterInfo,
  isEmojiCodePoint,
} from './unicode-data';

// Type declaration for Intl.Segmenter (ES2022+)
interface SegmenterSegment {
  segment: string;
  index: number;
  input: string;
}

interface Segmenter {
  segment(input: string): Iterable<SegmenterSegment>;
}

interface SegmenterConstructor {
  new(locale?: string | string[], options?: { granularity?: 'grapheme' | 'word' | 'sentence' }): Segmenter;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Intl {
    const Segmenter: SegmenterConstructor;
  }
}

/**
 * Convert a code point to UTF-8 bytes
 */
export function codePointToUtf8Bytes(codePoint: number): number[] {
  if (codePoint <= 0x7F) {
    return [codePoint];
  }
  if (codePoint <= 0x7FF) {
    return [
      0xC0 | (codePoint >> 6),
      0x80 | (codePoint & 0x3F),
    ];
  }
  if (codePoint <= 0xFFFF) {
    return [
      0xE0 | (codePoint >> 12),
      0x80 | ((codePoint >> 6) & 0x3F),
      0x80 | (codePoint & 0x3F),
    ];
  }
  return [
    0xF0 | (codePoint >> 18),
    0x80 | ((codePoint >> 12) & 0x3F),
    0x80 | ((codePoint >> 6) & 0x3F),
    0x80 | (codePoint & 0x3F),
  ];
}

/**
 * Convert a code point to UTF-16 code units
 */
export function codePointToUtf16Units(codePoint: number): number[] {
  if (codePoint <= 0xFFFF) {
    return [codePoint];
  }
  // Surrogate pair
  const offset = codePoint - 0x10000;
  const high = 0xD800 + (offset >> 10);
  const low = 0xDC00 + (offset & 0x3FF);
  return [high, low];
}

/**
 * Format a code point as U+XXXX
 */
export function formatUnicode(codePoint: number): string {
  const hex = codePoint.toString(16).toUpperCase();
  if (codePoint <= 0xFFFF) {
    return `U+${hex.padStart(4, '0')}`;
  }
  return `U+${hex}`;
}

/**
 * Analyze a single code point
 */
export function analyzeCodePoint(char: string, codePoint: number): AnalyzedCodePoint {
  const { name, label } = getCharacterInfo(codePoint);
  const category = categorizeCodePoint(codePoint);

  return {
    char,
    codePoint,
    unicode: formatUnicode(codePoint),
    name,
    label,
    category,
    utf8Bytes: codePointToUtf8Bytes(codePoint),
    utf16Units: codePointToUtf16Units(codePoint),
  };
}

/**
 * Check if a grapheme contains any emoji code points
 */
function hasEmojiContent(codePoints: number[]): boolean {
  return codePoints.some(cp => isEmojiCodePoint(cp) || cp === 0xFE0F);
}

/**
 * Check if a grapheme contains hidden characters
 */
function hasHiddenContent(categories: CharacterCategory[]): boolean {
  const hiddenCategories: CharacterCategory[] = [
    'zwj', 'zwnj', 'zwsp', 'vs', 'bom', 'control', 'format', 'surrogate'
  ];
  return categories.some(cat => hiddenCategories.includes(cat));
}

/**
 * Analyze a string and return structured results
 * Uses Intl.Segmenter for accurate grapheme splitting
 */
export function analyzeText(input: string): AnalysisResult {
  if (!input) {
    return {
      input: '',
      graphemes: [],
      stats: {
        graphemeCount: 0,
        codePointCount: 0,
        utf16Length: 0,
        utf8ByteCount: 0,
        emojiCount: 0,
        hiddenCharCount: 0,
        categoryBreakdown: {} as Record<CharacterCategory, number>,
      },
    };
  }

  const graphemes: GraphemeCluster[] = [];
  const categoryBreakdown: Record<CharacterCategory, number> = {
    emoji: 0,
    zwj: 0,
    zwnj: 0,
    zwsp: 0,
    vs: 0,
    skin_tone: 0,
    bom: 0,
    control: 0,
    format: 0,
    private_use: 0,
    surrogate: 0,
    whitespace: 0,
    printable: 0,
  };

  let totalCodePoints = 0;
  let totalUtf8Bytes = 0;
  let emojiCount = 0;
  let hiddenCharCount = 0;

  // Use Intl.Segmenter for accurate grapheme clustering
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const segments = segmenter.segment(input);

  let index = 0;
  for (const segment of segments) {
    const grapheme = segment.segment;

    // Extract code points using Array.from to handle surrogates correctly
    const codePoints = Array.from(grapheme).map((char: string) => char.codePointAt(0)!);

    // Analyze each code point
    const analyzedCodePoints: AnalyzedCodePoint[] = [];
    const categories: CharacterCategory[] = [];

    for (const cp of codePoints) {
      const char = String.fromCodePoint(cp);
      const analyzed = analyzeCodePoint(char, cp);
      analyzedCodePoints.push(analyzed);
      categories.push(analyzed.category);

      // Update category breakdown
      categoryBreakdown[analyzed.category]++;

      // Count UTF-8 bytes
      totalUtf8Bytes += analyzed.utf8Bytes.length;
      totalCodePoints++;

      // Track hidden characters
      const hiddenCategories: CharacterCategory[] = [
        'zwj', 'zwnj', 'zwsp', 'vs', 'bom', 'control', 'format'
      ];
      if (hiddenCategories.includes(analyzed.category)) {
        hiddenCharCount++;
      }
    }

    const isEmoji = hasEmojiContent(codePoints);
    const hasHidden = hasHiddenContent(categories);

    if (isEmoji) {
      emojiCount++;
    }

    graphemes.push({
      grapheme,
      codePoints: analyzedCodePoints,
      isEmoji,
      hasHiddenChars: hasHidden,
      index: index++,
    });
  }

  return {
    input,
    graphemes,
    stats: {
      graphemeCount: graphemes.length,
      codePointCount: totalCodePoints,
      utf16Length: input.length,
      utf8ByteCount: totalUtf8Bytes,
      emojiCount,
      hiddenCharCount,
      categoryBreakdown,
    },
  };
}

/**
 * Get a summary of the analysis for display
 */
export function getAnalysisSummary(result: AnalysisResult): string {
  const { stats } = result;
  const parts: string[] = [];

  parts.push(`${stats.graphemeCount} visual character${stats.graphemeCount !== 1 ? 's' : ''}`);
  parts.push(`${stats.codePointCount} code point${stats.codePointCount !== 1 ? 's' : ''}`);
  parts.push(`${stats.utf8ByteCount} UTF-8 byte${stats.utf8ByteCount !== 1 ? 's' : ''}`);

  if (stats.emojiCount > 0) {
    parts.push(`${stats.emojiCount} emoji`);
  }

  if (stats.hiddenCharCount > 0) {
    parts.push(`${stats.hiddenCharCount} hidden char${stats.hiddenCharCount !== 1 ? 's' : ''}`);
  }

  return parts.join(' | ');
}
