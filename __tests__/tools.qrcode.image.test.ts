/**
 * © 2026 MyDebugger Contributors – MIT License
 */

import { wrapText } from '../src/tools/qrcode/lib/qrImage';

describe('wrapText', () => {
  const measure = (s: string) => s.length; // 1 unit per char

  it('keeps short text on one line', () => {
    expect(wrapText('abc', 10, measure)).toEqual(['abc']);
  });

  it('wraps long URLs without spaces by character', () => {
    expect(wrapText('trueapp://app/x', 6, measure)).toEqual(['trueap', 'p://ap', 'p/x']);
  });

  it('returns no lines for empty text', () => {
    expect(wrapText('', 10, measure)).toEqual([]);
  });
});
