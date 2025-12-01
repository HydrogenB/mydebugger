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

/**
 * Create a cryptographically strong random integer in [0, maxExclusive)
 */
function secureRandInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  // Use rejection sampling to avoid modulo bias
  const maxUint = 0xffffffff;
  const maxUnbiased = Math.floor(maxUint / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    (globalThis.crypto && globalThis.crypto.getRandomValues
      ? globalThis.crypto.getRandomValues(buffer)
      : buffer.fill(Math.floor(Math.random() * (maxUint + 1)))) as any;
    const value = buffer[0];
    if (value < maxUnbiased) {
      return value % maxExclusive;
    }
  }
}

export function generatePassword(options: PasswordOptions): string {
  const {
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    customChars
  } = options;

  if (customChars && customChars.length > 0) {
    const chars: string[] = [];
    for (let i = 0; i < length; i++) {
      chars.push(customChars[secureRandInt(customChars.length)]);
    }
    return chars.join("");
  }

  let pool = "";
  if (includeUppercase) pool += UPPERCASE;
  if (includeLowercase) pool += LOWERCASE;
  if (includeNumbers) pool += NUMBERS;
  if (includeSymbols) pool += SYMBOLS;
  if (excludeAmbiguous) {
    pool = [...pool].filter((c) => !AMBIGUOUS.includes(c)).join("");
  }

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
      const j = secureRandInt(i + 1);
      [filteredSets[i], filteredSets[j]] = [filteredSets[j], filteredSets[i]];
    }
    filteredSets.length = length;
  }

  for (const set of filteredSets) {
    chars.push(set[secureRandInt(set.length)]);
  }

  const remaining = Math.max(0, length - chars.length);
  for (let i = 0; i < remaining; i++) {
    chars.push(pool[secureRandInt(pool.length)]);
  }

  // Shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandInt(i + 1);
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

export function estimateStrength(options: PasswordOptions | PassphraseOptions | null, password: string) {
  // Simple entropy calculation
  if (!password) return { entropy: 0, label: "Very weak", score: 0 };

  let poolSize = 0;
  
  // Heuristic detection of type
  const isPassphrase = password.length > 20 && (password.includes('-') || password.includes(' ') || password.includes('.'));
  
  if (isPassphrase) {
    // Passphrase entropy: log2(wordlistSize^wordCount)
    // Assuming roughly based on our wordlist ~2048 (11 bits per word)
    const separators = password.match(/[- ._]/g);
    const wordCount = separators ? separators.length + 1 : 1; 
    // Roughly 11 bits per word + variations
    const entropy = wordCount * 11; 
    
    let label: "Very weak" | "Weak" | "Good" | "Strong" | "Very strong" = "Very weak";
    if (entropy > 80) label = "Very strong";
    else if (entropy > 60) label = "Strong";
    else if (entropy > 50) label = "Good";
    else if (entropy > 30) label = "Weak";
    
    const score = Math.min(100, Math.round((entropy / 100) * 100));
    return { entropy, label, score };
  }

  // Standard password entropy
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 32;

  const entropy = Math.log2(Math.max(1, poolSize)) * password.length;
  
  let label: "Very weak" | "Weak" | "Good" | "Strong" | "Very strong" = "Very weak";
  if (entropy > 100) label = "Very strong";
  else if (entropy > 80) label = "Strong";
  else if (entropy > 60) label = "Good";
  else if (entropy > 40) label = "Weak";

  const score = Math.min(100, Math.round((entropy / 128) * 100));
  return { entropy, label, score };
}


export function generateUUIDv4(): string {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return globalThis.crypto.randomUUID();
  // Fallback
  const bytes = new Uint8Array(16);
  (globalThis.crypto && globalThis.crypto.getRandomValues
    ? globalThis.crypto.getRandomValues(bytes)
    : bytes.forEach((_, i, a) => (a[i] = Math.floor(Math.random() * 256)))) as any;
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

export function generateKey({ bits, format }: KeyOptions): string {
  const bytes = bits / 8;
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  if (format === "hex") {
    return [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // base64
  let bin = "";
  for (const b of buf) bin += String.fromCharCode(b);
  return btoa(bin);
}


