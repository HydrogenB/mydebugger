/**
 * Random generators used by the Random Password Generator tool.
 * All generation happens locally using the Web Crypto API.
 */

import { WORDLIST } from './wordlist';

export type PasswordOptions = {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  customChars?: string;
};

export type PassphraseOptions = {
  wordCount: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
};

export type PinOptions = {
  length: number;
};

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+[]{}|;:,.<>?/~-";
const AMBIGUOUS = "O0oIl1|S5B8G6Z2"; // characters users often confuse

export type EntropySource = {
  bytes: Uint8Array;
  cursor: { value: number };
};

export const createEntropySource = (entropy?: Uint8Array): EntropySource | undefined => {
  if (!entropy || entropy.length === 0) return undefined;
  return { bytes: entropy, cursor: { value: 0 } };
};

/**
 * Fill a typed array with cryptographically strong random bytes, optionally
 * XORing each byte with the next value from a user-supplied entropy source.
 * The entropy source never weakens the stream — it only diffuses additional
 * randomness drawn from pointer events.
 */
function fillRandom(buffer: Uint32Array | Uint8Array, source?: EntropySource): void {
  if (globalThis.crypto && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(buffer);
  } else {
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < buffer.length; i += 1) {
      buffer[i] = Math.floor(Math.random() * 0x100000000);
    }
  }
  if (source && source.bytes.length > 0) {
    const view = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    for (let i = 0; i < view.length; i += 1) {
      const { value } = source.cursor;
      view[i] ^= source.bytes[value % source.bytes.length];
      source.cursor.value = value + 1;
    }
  }
}

/**
 * Create a cryptographically strong random integer in [0, maxExclusive),
 * optionally diffused with bytes from a user-entropy source.
 */
function secureRandInt(maxExclusive: number, source?: EntropySource): number {
  if (maxExclusive <= 0) return 0;
  // Use rejection sampling to avoid modulo bias
  const maxUint = 0xffffffff;
  const maxUnbiased = Math.floor(maxUint / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    fillRandom(buffer, source);
    const value = buffer[0];
    if (value < maxUnbiased) {
      return value % maxExclusive;
    }
  }
}

/** Build the literal character pool for the selected classes, ambiguity filter applied. */
function buildPasswordPool(options: {
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}): string {
  const { includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeAmbiguous } = options;
  let pool = "";
  if (includeUppercase) pool += UPPERCASE;
  if (includeLowercase) pool += LOWERCASE;
  if (includeNumbers) pool += NUMBERS;
  if (includeSymbols) pool += SYMBOLS;
  if (excludeAmbiguous) {
    pool = [...pool].filter((c) => !AMBIGUOUS.includes(c)).join("");
  }
  return pool;
}

/**
 * Size of the pool the generator actually draws from for a given set of
 * options — mirrors generatePassword's own pool construction (including its
 * customChars short-circuit, which ignores excludeAmbiguous) so entropy is
 * computed from what was really drawn, not from characters observed in the
 * output string.
 */
function passwordPoolSize(options: PasswordOptions): number {
  if (options.customChars && options.customChars.length > 0) {
    return options.customChars.length;
  }
  return buildPasswordPool(options).length;
}

export function generatePassword(
  options: PasswordOptions,
  entropy?: Uint8Array,
): string {
  const {
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    customChars
  } = options;

  const source = createEntropySource(entropy);

  if (customChars && customChars.length > 0) {
    const chars: string[] = [];
    for (let i = 0; i < length; i++) {
      chars.push(customChars[secureRandInt(customChars.length, source)]);
    }
    return chars.join("");
  }

  const pool = buildPasswordPool({ includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeAmbiguous });

  if (!pool) return "";

  // Ensure at least one character from each selected set
  const requiredSets: string[] = [];
  if (includeUppercase) requiredSets.push(UPPERCASE);
  if (includeLowercase) requiredSets.push(LOWERCASE);
  if (includeNumbers) requiredSets.push(NUMBERS);
  if (includeSymbols) requiredSets.push(SYMBOLS);

  const chars: string[] = [];
  // If requested length is smaller than the number of required sets,
  // choose a subset of sets at random to keep exact length
  const setsToUse = requiredSets.slice();

  // Apply ambiguity filter to sets
  const filteredSets = setsToUse.map(set =>
    excludeAmbiguous ? [...set].filter(c => !AMBIGUOUS.includes(c)).join("") : set
  ).filter(s => s.length > 0);

  if (length < filteredSets.length) {
    // shuffle and keep first N
    for (let i = filteredSets.length - 1; i > 0; i--) {
      const j = secureRandInt(i + 1, source);
      [filteredSets[i], filteredSets[j]] = [filteredSets[j], filteredSets[i]];
    }
    filteredSets.length = length;
  }

  for (const set of filteredSets) {
    chars.push(set[secureRandInt(set.length, source)]);
  }

  const remaining = Math.max(0, length - chars.length);
  for (let i = 0; i < remaining; i++) {
    chars.push(pool[secureRandInt(pool.length, source)]);
  }

  // Shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandInt(i + 1, source);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

export function generatePassphrase(options: PassphraseOptions): string {
  const { wordCount, separator, capitalize, includeNumber } = options;
  const words: string[] = [];
  
  for (let i = 0; i < wordCount; i++) {
    let word = WORDLIST[secureRandInt(WORDLIST.length)];
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  if (includeNumber) {
    const num = secureRandInt(10000).toString(); // 0-9999
    // insert at random position
    const pos = secureRandInt(words.length + 1);
    words.splice(pos, 0, num);
  }

  return words.join(separator);
}

export function generatePIN(options: PinOptions): string {
  const { length } = options;
  let pin = "";
  for (let i = 0; i < length; i++) {
    pin += NUMBERS[secureRandInt(10)];
  }
  return pin;
}

type StrengthLabel = "Very weak" | "Weak" | "Good" | "Strong" | "Very strong";

function isPassphraseOptions(
  options: PasswordOptions | PassphraseOptions,
): options is PassphraseOptions {
  return "wordCount" in options;
}

function passwordStrengthLabel(entropy: number): { label: StrengthLabel; score: number } {
  let label: StrengthLabel = "Very weak";
  if (entropy > 100) label = "Very strong";
  else if (entropy > 80) label = "Strong";
  else if (entropy > 60) label = "Good";
  else if (entropy > 40) label = "Weak";
  const score = Math.min(100, Math.round((entropy / 128) * 100));
  return { label, score };
}

function passphraseStrengthLabel(entropy: number): { label: StrengthLabel; score: number } {
  let label: StrengthLabel = "Very weak";
  if (entropy > 80) label = "Very strong";
  else if (entropy > 60) label = "Strong";
  else if (entropy > 50) label = "Good";
  else if (entropy > 30) label = "Weak";
  const score = Math.min(100, Math.round((entropy / 100) * 100));
  return { label, score };
}

/** Pool size inferred from character classes actually present in the string. Only
 * used when the caller can't tell us what generated the password (options === null). */
function observedPoolSize(password: string): number {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
  return poolSize;
}

export function estimateStrength(
  options: PasswordOptions | PassphraseOptions | null,
  password: string,
): { entropy: number; label: StrengthLabel; score: number } {
  if (!password) return { entropy: 0, label: "Very weak", score: 0 };

  if (options !== null && isPassphraseOptions(options)) {
    // Passphrase entropy: log2(wordlistSize) bits per word, drawn straight
    // from the wordlist the generator actually samples from.
    const bitsPerWord = Math.log2(WORDLIST.length);
    const entropy = options.wordCount * bitsPerWord;
    return { entropy, ...passphraseStrengthLabel(entropy) };
  }

  // Password entropy: pool the generator actually drew from, times length.
  const poolSize = options !== null ? passwordPoolSize(options) : observedPoolSize(password);
  const entropy = Math.log2(Math.max(1, poolSize)) * password.length;
  return { entropy, ...passwordStrengthLabel(entropy) };
}


export function generateUUIDv4(entropy?: Uint8Array): string {
  // When the user has seeded the pool, derive the UUID from a
  // crypto+entropy mix so the variant/version bits still come from a
  // known-good stream. When no seed is provided, prefer the native
  // randomUUID (same CSPRNG, simpler path).
  if (
    (!entropy || entropy.length === 0) &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  const source = createEntropySource(entropy);
  const bytes = new Uint8Array(16);
  fillRandom(bytes, source);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return (
    [...bytes].map(toHex).join("")
      .replace(/^(........)(....)(....)(....)(............)$/,
        "$1-$2-$3-$4-$5")
  );
}

export type KeyOptions = {
  bits: 128 | 192 | 256;
  format: "hex" | "base64";
};

export function generateKey(
  { bits, format }: KeyOptions,
  entropy?: Uint8Array,
): string {
  const bytes = bits / 8;
  const buf = new Uint8Array(bytes);
  const source = createEntropySource(entropy);
  fillRandom(buf, source);
  if (format === "hex") {
    return [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // base64
  let bin = "";
  for (const b of buf) bin += String.fromCharCode(b);
  return btoa(bin);
}


