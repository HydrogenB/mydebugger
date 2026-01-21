/**
 * © 2025 MyDebugger Contributors – MIT License
 */

/**
 * Categories for character classification
 */
export type CharacterCategory =
  | 'emoji'
  | 'zwj'           // Zero Width Joiner
  | 'zwnj'          // Zero Width Non-Joiner
  | 'zwsp'          // Zero Width Space
  | 'vs'            // Variation Selector
  | 'skin_tone'     // Fitzpatrick skin tone modifier
  | 'bom'           // Byte Order Mark
  | 'control'       // Control characters (C0, C1)
  | 'format'        // Format characters
  | 'private_use'   // Private use area
  | 'surrogate'     // Surrogate (invalid standalone)
  | 'whitespace'    // Whitespace characters
  | 'printable';    // Normal printable character

/**
 * Represents a single analyzed code point
 */
export interface AnalyzedCodePoint {
  /** The actual character */
  char: string;
  /** The code point in decimal */
  codePoint: number;
  /** The code point as U+XXXX format */
  unicode: string;
  /** Human-readable name of the character */
  name: string;
  /** Short label for badges */
  label: string;
  /** Character category */
  category: CharacterCategory;
  /** Byte representation in UTF-8 */
  utf8Bytes: number[];
  /** Byte representation in UTF-16 */
  utf16Units: number[];
}

/**
 * Represents a grapheme cluster (user-perceived character)
 */
export interface GraphemeCluster {
  /** The grapheme as it appears visually */
  grapheme: string;
  /** Individual code points that make up this grapheme */
  codePoints: AnalyzedCodePoint[];
  /** Whether this is an emoji sequence */
  isEmoji: boolean;
  /** Whether this contains hidden characters */
  hasHiddenChars: boolean;
  /** Index in the original string */
  index: number;
}

/**
 * Overall statistics for the analyzed text
 */
export interface TextStats {
  /** Number of visual characters (graphemes) */
  graphemeCount: number;
  /** Number of Unicode code points */
  codePointCount: number;
  /** Number of UTF-16 code units (JavaScript string length) */
  utf16Length: number;
  /** Byte count in UTF-8 */
  utf8ByteCount: number;
  /** Number of emoji graphemes */
  emojiCount: number;
  /** Number of hidden/invisible characters */
  hiddenCharCount: number;
  /** Breakdown by category */
  categoryBreakdown: Record<CharacterCategory, number>;
}

/**
 * The complete analysis result
 */
export interface AnalysisResult {
  /** Original input text */
  input: string;
  /** Analyzed grapheme clusters */
  graphemes: GraphemeCluster[];
  /** Text statistics */
  stats: TextStats;
}
