/**
 * Random generators used by the Random Password Generator tool.
 * All generation happens locally using the Web Crypto API.
 */

export type PasswordOptions = {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
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
  } = options;

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
  if (length < setsToUse.length) {
    // shuffle and keep first N
    for (let i = setsToUse.length - 1; i > 0; i--) {
      const j = secureRandInt(i + 1);
      [setsToUse[i], setsToUse[j]] = [setsToUse[j], setsToUse[i]];
    }
    setsToUse.length = length;
  }

  for (const set of setsToUse) {
    let s = set;
    if (excludeAmbiguous) s = [...s].filter((c) => !AMBIGUOUS.includes(c)).join("");
    if (s.length > 0) chars.push(s[secureRandInt(s.length)]);
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

export function estimateStrength(options: PasswordOptions, password: string) {
  const variety =
    Number(options.includeLowercase) +
    Number(options.includeUppercase) +
    Number(options.includeNumbers) +
    Number(options.includeSymbols);

  // Shannon entropy approximation: log2(poolSize^length)
  let poolSize = 0;
  if (options.includeLowercase) poolSize += 26;
  if (options.includeUppercase) poolSize += 26;
  if (options.includeNumbers) poolSize += 10;
  if (options.includeSymbols) poolSize += (SYMBOLS.length - (options.excludeAmbiguous ? [...SYMBOLS].filter(c => AMBIGUOUS.includes(c)).length : 0));
  if (options.excludeAmbiguous) {
    poolSize = Math.max(0, poolSize - AMBIGUOUS.length);
  }
  const entropy = Math.log2(Math.max(1, poolSize)) * password.length;

  // Simple score buckets
  let label: "Very weak" | "Weak" | "Good" | "Strong" | "Very strong" = "Very weak";
  if (entropy > 60 && variety >= 3 && password.length >= 12) label = "Good";
  if (entropy > 80 && password.length >= 14) label = "Strong";
  if (entropy > 100 && password.length >= 16) label = "Very strong";
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


