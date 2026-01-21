/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Unicode character data and ranges for categorization
 */

import { CharacterCategory } from '../types';

/**
 * Fitzpatrick skin tone modifiers (U+1F3FB - U+1F3FF)
 */
export const SKIN_TONE_MODIFIERS: Record<number, string> = {
  0x1F3FB: 'Light Skin Tone',
  0x1F3FC: 'Medium-Light Skin Tone',
  0x1F3FD: 'Medium Skin Tone',
  0x1F3FE: 'Medium-Dark Skin Tone',
  0x1F3FF: 'Dark Skin Tone',
};

/**
 * Variation selectors
 */
export const VARIATION_SELECTORS: Record<number, string> = {
  0xFE00: 'VS1',
  0xFE01: 'VS2',
  0xFE02: 'VS3',
  0xFE03: 'VS4',
  0xFE04: 'VS5',
  0xFE05: 'VS6',
  0xFE06: 'VS7',
  0xFE07: 'VS8',
  0xFE08: 'VS9',
  0xFE09: 'VS10',
  0xFE0A: 'VS11',
  0xFE0B: 'VS12',
  0xFE0C: 'VS13',
  0xFE0D: 'VS14',
  0xFE0E: 'VS15 (Text)',
  0xFE0F: 'VS16 (Emoji)',
};

/**
 * Common invisible/control characters
 */
export const SPECIAL_CHARS: Record<number, { name: string; label: string }> = {
  0x0000: { name: 'Null', label: 'NUL' },
  0x0001: { name: 'Start of Heading', label: 'SOH' },
  0x0002: { name: 'Start of Text', label: 'STX' },
  0x0003: { name: 'End of Text', label: 'ETX' },
  0x0004: { name: 'End of Transmission', label: 'EOT' },
  0x0005: { name: 'Enquiry', label: 'ENQ' },
  0x0006: { name: 'Acknowledge', label: 'ACK' },
  0x0007: { name: 'Bell', label: 'BEL' },
  0x0008: { name: 'Backspace', label: 'BS' },
  0x0009: { name: 'Horizontal Tab', label: 'TAB' },
  0x000A: { name: 'Line Feed', label: 'LF' },
  0x000B: { name: 'Vertical Tab', label: 'VT' },
  0x000C: { name: 'Form Feed', label: 'FF' },
  0x000D: { name: 'Carriage Return', label: 'CR' },
  0x000E: { name: 'Shift Out', label: 'SO' },
  0x000F: { name: 'Shift In', label: 'SI' },
  0x001B: { name: 'Escape', label: 'ESC' },
  0x007F: { name: 'Delete', label: 'DEL' },
  0x0020: { name: 'Space', label: 'SP' },
  0x00A0: { name: 'No-Break Space', label: 'NBSP' },
  0x00AD: { name: 'Soft Hyphen', label: 'SHY' },
  0x034F: { name: 'Combining Grapheme Joiner', label: 'CGJ' },
  0x061C: { name: 'Arabic Letter Mark', label: 'ALM' },
  0x115F: { name: 'Hangul Choseong Filler', label: 'HCF' },
  0x1160: { name: 'Hangul Jungseong Filler', label: 'HJF' },
  0x17B4: { name: 'Khmer Vowel Inherent Aq', label: 'KV1' },
  0x17B5: { name: 'Khmer Vowel Inherent Aa', label: 'KV2' },
  0x180E: { name: 'Mongolian Vowel Separator', label: 'MVS' },
  0x2000: { name: 'En Quad', label: 'ENQ' },
  0x2001: { name: 'Em Quad', label: 'EMQ' },
  0x2002: { name: 'En Space', label: 'ENS' },
  0x2003: { name: 'Em Space', label: 'EMS' },
  0x2004: { name: 'Three-Per-Em Space', label: '3PES' },
  0x2005: { name: 'Four-Per-Em Space', label: '4PES' },
  0x2006: { name: 'Six-Per-Em Space', label: '6PES' },
  0x2007: { name: 'Figure Space', label: 'FSP' },
  0x2008: { name: 'Punctuation Space', label: 'PSP' },
  0x2009: { name: 'Thin Space', label: 'TSP' },
  0x200A: { name: 'Hair Space', label: 'HSP' },
  0x200B: { name: 'Zero Width Space', label: 'ZWSP' },
  0x200C: { name: 'Zero Width Non-Joiner', label: 'ZWNJ' },
  0x200D: { name: 'Zero Width Joiner', label: 'ZWJ' },
  0x200E: { name: 'Left-to-Right Mark', label: 'LRM' },
  0x200F: { name: 'Right-to-Left Mark', label: 'RLM' },
  0x2028: { name: 'Line Separator', label: 'LS' },
  0x2029: { name: 'Paragraph Separator', label: 'PS' },
  0x202A: { name: 'Left-to-Right Embedding', label: 'LRE' },
  0x202B: { name: 'Right-to-Left Embedding', label: 'RLE' },
  0x202C: { name: 'Pop Directional Formatting', label: 'PDF' },
  0x202D: { name: 'Left-to-Right Override', label: 'LRO' },
  0x202E: { name: 'Right-to-Left Override', label: 'RLO' },
  0x202F: { name: 'Narrow No-Break Space', label: 'NNBS' },
  0x205F: { name: 'Medium Mathematical Space', label: 'MMS' },
  0x2060: { name: 'Word Joiner', label: 'WJ' },
  0x2061: { name: 'Function Application', label: 'FA' },
  0x2062: { name: 'Invisible Times', label: 'IT' },
  0x2063: { name: 'Invisible Separator', label: 'IS' },
  0x2064: { name: 'Invisible Plus', label: 'IP' },
  0x2066: { name: 'Left-to-Right Isolate', label: 'LRI' },
  0x2067: { name: 'Right-to-Left Isolate', label: 'RLI' },
  0x2068: { name: 'First Strong Isolate', label: 'FSI' },
  0x2069: { name: 'Pop Directional Isolate', label: 'PDI' },
  0x206A: { name: 'Inhibit Symmetric Swapping', label: 'ISS' },
  0x206B: { name: 'Activate Symmetric Swapping', label: 'ASS' },
  0x206C: { name: 'Inhibit Arabic Form Shaping', label: 'IAFS' },
  0x206D: { name: 'Activate Arabic Form Shaping', label: 'AAFS' },
  0x206E: { name: 'National Digit Shapes', label: 'NDS' },
  0x206F: { name: 'Nominal Digit Shapes', label: 'NODS' },
  0x3000: { name: 'Ideographic Space', label: 'ISP' },
  0xFEFF: { name: 'Byte Order Mark', label: 'BOM' },
  0xFFA0: { name: 'Halfwidth Hangul Filler', label: 'HHF' },
  0xFFFC: { name: 'Object Replacement Character', label: 'OBJ' },
  0xFFFD: { name: 'Replacement Character', label: 'REP' },
};

/**
 * Emoji Unicode ranges (simplified, common blocks)
 */
export const EMOJI_RANGES: Array<[number, number]> = [
  [0x1F300, 0x1F5FF], // Miscellaneous Symbols and Pictographs
  [0x1F600, 0x1F64F], // Emoticons
  [0x1F680, 0x1F6FF], // Transport and Map Symbols
  [0x1F700, 0x1F77F], // Alchemical Symbols
  [0x1F780, 0x1F7FF], // Geometric Shapes Extended
  [0x1F800, 0x1F8FF], // Supplemental Arrows-C
  [0x1F900, 0x1F9FF], // Supplemental Symbols and Pictographs
  [0x1FA00, 0x1FA6F], // Chess Symbols
  [0x1FA70, 0x1FAFF], // Symbols and Pictographs Extended-A
  [0x2600, 0x26FF],   // Miscellaneous Symbols
  [0x2700, 0x27BF],   // Dingbats
  [0x231A, 0x231B],   // Watch, Hourglass
  [0x23E9, 0x23F3],   // Media controls
  [0x23F8, 0x23FA],   // More media controls
  [0x25AA, 0x25AB],   // Small squares
  [0x25B6, 0x25B6],   // Play button
  [0x25C0, 0x25C0],   // Reverse button
  [0x25FB, 0x25FE],   // Squares
  [0x2614, 0x2615],   // Umbrella, hot beverage
  [0x2648, 0x2653],   // Zodiac
  [0x267F, 0x267F],   // Wheelchair
  [0x2693, 0x2693],   // Anchor
  [0x26A1, 0x26A1],   // High voltage
  [0x26AA, 0x26AB],   // Circles
  [0x26BD, 0x26BE],   // Sports balls
  [0x26C4, 0x26C5],   // Snowman, sun
  [0x26CE, 0x26CE],   // Ophiuchus
  [0x26D4, 0x26D4],   // No entry
  [0x26EA, 0x26EA],   // Church
  [0x26F2, 0x26F3],   // Fountain, golf
  [0x26F5, 0x26F5],   // Sailboat
  [0x26FA, 0x26FA],   // Tent
  [0x26FD, 0x26FD],   // Fuel pump
  [0x2702, 0x2702],   // Scissors
  [0x2705, 0x2705],   // Check mark
  [0x2708, 0x270D],   // Transport, writing
  [0x270F, 0x270F],   // Pencil
  [0x2712, 0x2712],   // Black nib
  [0x2714, 0x2714],   // Check mark
  [0x2716, 0x2716],   // X mark
  [0x271D, 0x271D],   // Cross
  [0x2721, 0x2721],   // Star of David
  [0x2728, 0x2728],   // Sparkles
  [0x2733, 0x2734],   // Eight spoked asterisk
  [0x2744, 0x2744],   // Snowflake
  [0x2747, 0x2747],   // Sparkle
  [0x274C, 0x274C],   // X mark
  [0x274E, 0x274E],   // X mark
  [0x2753, 0x2755],   // Question marks
  [0x2757, 0x2757],   // Exclamation
  [0x2763, 0x2764],   // Heart exclamation, heart
  [0x2795, 0x2797],   // Math symbols
  [0x27A1, 0x27A1],   // Arrow
  [0x27B0, 0x27B0],   // Curly loop
  [0x27BF, 0x27BF],   // Double curly loop
  [0x2934, 0x2935],   // Arrows
  [0x2B05, 0x2B07],   // Arrows
  [0x2B1B, 0x2B1C],   // Squares
  [0x2B50, 0x2B50],   // Star
  [0x2B55, 0x2B55],   // Circle
  [0x3030, 0x3030],   // Wavy dash
  [0x303D, 0x303D],   // Part alternation mark
  [0x3297, 0x3297],   // Circled ideograph
  [0x3299, 0x3299],   // Circled ideograph
  [0x00A9, 0x00A9],   // Copyright
  [0x00AE, 0x00AE],   // Registered
  [0x2122, 0x2122],   // Trademark
  [0x23CF, 0x23CF],   // Eject
  [0x23ED, 0x23EF],   // Media controls
  [0x23F1, 0x23F2],   // Stopwatch, timer
  [0x2139, 0x2139],   // Information
  [0x2194, 0x2199],   // Arrows
  [0x21A9, 0x21AA],   // Arrows
  [0x20E3, 0x20E3],   // Combining enclosing keycap (for keycap sequences)
];

/**
 * Regional indicator letters for flag sequences (A-Z)
 */
export const REGIONAL_INDICATOR_START = 0x1F1E6;
export const REGIONAL_INDICATOR_END = 0x1F1FF;

/**
 * Tag characters for subdivision flags (E0020-E007F)
 */
export const TAG_SEQUENCE_START = 0xE0020;
export const TAG_SEQUENCE_END = 0xE007F;
export const TAG_CANCEL = 0xE007F;

/**
 * Check if a code point is in an emoji range
 */
export function isEmojiCodePoint(codePoint: number): boolean {
  // Check common emoji ranges
  for (const [start, end] of EMOJI_RANGES) {
    if (codePoint >= start && codePoint <= end) {
      return true;
    }
  }

  // Check regional indicators
  if (codePoint >= REGIONAL_INDICATOR_START && codePoint <= REGIONAL_INDICATOR_END) {
    return true;
  }

  // Check skin tone modifiers
  if (SKIN_TONE_MODIFIERS[codePoint]) {
    return true;
  }

  return false;
}

/**
 * Check if a code point is a skin tone modifier
 */
export function isSkinToneModifier(codePoint: number): boolean {
  return codePoint >= 0x1F3FB && codePoint <= 0x1F3FF;
}

/**
 * Check if a code point is a variation selector
 */
export function isVariationSelector(codePoint: number): boolean {
  return (codePoint >= 0xFE00 && codePoint <= 0xFE0F);
}

/**
 * Check if a code point is a regional indicator
 */
export function isRegionalIndicator(codePoint: number): boolean {
  return codePoint >= REGIONAL_INDICATOR_START && codePoint <= REGIONAL_INDICATOR_END;
}

/**
 * Convert regional indicator to letter
 */
export function regionalIndicatorToLetter(codePoint: number): string {
  if (!isRegionalIndicator(codePoint)) return '';
  return String.fromCharCode(codePoint - REGIONAL_INDICATOR_START + 65); // 65 = 'A'
}

/**
 * Categorize a code point
 */
export function categorizeCodePoint(codePoint: number): CharacterCategory {
  // Zero Width Joiner
  if (codePoint === 0x200D) return 'zwj';

  // Zero Width Non-Joiner
  if (codePoint === 0x200C) return 'zwnj';

  // Zero Width Space
  if (codePoint === 0x200B) return 'zwsp';

  // Byte Order Mark
  if (codePoint === 0xFEFF) return 'bom';

  // Variation Selectors
  if (isVariationSelector(codePoint)) return 'vs';

  // Skin tone modifiers
  if (isSkinToneModifier(codePoint)) return 'skin_tone';

  // Emoji
  if (isEmojiCodePoint(codePoint)) return 'emoji';

  // Control characters (C0 control codes)
  if (codePoint <= 0x1F || (codePoint >= 0x7F && codePoint <= 0x9F)) {
    return 'control';
  }

  // Format characters
  if (
    (codePoint >= 0x200B && codePoint <= 0x200F) || // Zero width and directional
    (codePoint >= 0x2028 && codePoint <= 0x202F) || // Line/paragraph separators, embedding
    (codePoint >= 0x2060 && codePoint <= 0x206F) || // Word joiners, invisible operators
    codePoint === 0x00AD || // Soft hyphen
    codePoint === 0x034F || // Combining grapheme joiner
    codePoint === 0x061C || // Arabic letter mark
    codePoint === 0x180E    // Mongolian vowel separator
  ) {
    return 'format';
  }

  // Private Use Area
  if (
    (codePoint >= 0xE000 && codePoint <= 0xF8FF) ||   // BMP Private Use
    (codePoint >= 0xF0000 && codePoint <= 0xFFFFD) || // Plane 15
    (codePoint >= 0x100000 && codePoint <= 0x10FFFD) // Plane 16
  ) {
    return 'private_use';
  }

  // Surrogates (should not appear in valid strings)
  if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
    return 'surrogate';
  }

  // Common whitespace
  if (
    codePoint === 0x20 ||   // Space
    codePoint === 0x09 ||   // Tab
    codePoint === 0x0A ||   // Line Feed
    codePoint === 0x0D ||   // Carriage Return
    codePoint === 0xA0 ||   // No-Break Space
    codePoint === 0x3000 || // Ideographic Space
    (codePoint >= 0x2000 && codePoint <= 0x200A) // Various spaces
  ) {
    return 'whitespace';
  }

  // Default to printable
  return 'printable';
}

/**
 * Get character name and label
 */
export function getCharacterInfo(codePoint: number): { name: string; label: string } {
  // Check special characters first
  if (SPECIAL_CHARS[codePoint]) {
    return SPECIAL_CHARS[codePoint];
  }

  // Variation selectors
  if (VARIATION_SELECTORS[codePoint]) {
    return {
      name: `Variation Selector ${VARIATION_SELECTORS[codePoint]}`,
      label: VARIATION_SELECTORS[codePoint]
    };
  }

  // Skin tone modifiers
  if (SKIN_TONE_MODIFIERS[codePoint]) {
    return {
      name: SKIN_TONE_MODIFIERS[codePoint],
      label: `Skin ${codePoint - 0x1F3FA}` // 1-5
    };
  }

  // Regional indicators
  if (isRegionalIndicator(codePoint)) {
    const letter = regionalIndicatorToLetter(codePoint);
    return {
      name: `Regional Indicator Symbol Letter ${letter}`,
      label: `RI-${letter}`
    };
  }

  // For other characters, use the character itself as label
  const char = String.fromCodePoint(codePoint);
  const category = categorizeCodePoint(codePoint);

  if (category === 'emoji') {
    return { name: 'Emoji', label: char };
  }

  if (category === 'control' || category === 'format') {
    const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');
    return { name: `Unicode U+${hex}`, label: `U+${hex}` };
  }

  return { name: char, label: char };
}
