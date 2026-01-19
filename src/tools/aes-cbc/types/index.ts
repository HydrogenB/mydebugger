/**
 * Crypto Lab Types
 * Educational cryptography tool with transparent mechanics
 */

// ============================================
// Algorithm Types
// ============================================

export type CryptoMode = 'encrypt' | 'decrypt' | 'hash';

export type SymmetricAlgorithm = 'aes-256-cbc' | 'aes-256-gcm';
export type AsymmetricAlgorithm = 'rsa-oaep' | 'gpg-rsa-2048';
export type HashAlgorithm = 'sha-256' | 'sha-512' | 'md5';

export type CryptoAlgorithm = SymmetricAlgorithm | AsymmetricAlgorithm | HashAlgorithm;

export const ALGORITHM_CATEGORIES = {
  symmetric: ['aes-256-cbc', 'aes-256-gcm'] as const,
  asymmetric: ['rsa-oaep', 'gpg-rsa-2048'] as const,
  hashing: ['sha-256', 'sha-512', 'md5'] as const,
} as const;

export const ALGORITHM_LABELS: Record<CryptoAlgorithm, string> = {
  'aes-256-cbc': 'AES-256-CBC',
  'aes-256-gcm': 'AES-256-GCM',
  'rsa-oaep': 'RSA-OAEP (2048-bit)',
  'gpg-rsa-2048': 'OpenPGP RSA-2048',
  'sha-256': 'SHA-256',
  'sha-512': 'SHA-512',
  'md5': 'MD5 (Legacy)',
};

export const ALGORITHM_DESCRIPTIONS: Record<CryptoAlgorithm, string> = {
  'aes-256-cbc': 'Industry standard symmetric encryption with CBC mode',
  'aes-256-gcm': 'Authenticated encryption with GCM mode (includes integrity check)',
  'rsa-oaep': 'Asymmetric encryption using RSA with OAEP padding',
  'gpg-rsa-2048': 'OpenPGP-compatible RSA encryption',
  'sha-256': 'Cryptographic hash function (256-bit output)',
  'sha-512': 'Cryptographic hash function (512-bit output)',
  'md5': 'Legacy hash function - NOT secure for cryptographic purposes',
};

// ============================================
// Output Format Types
// ============================================

export type OutputFormat = 'base64' | 'hex';

export const OUTPUT_FORMAT_LABELS: Record<OutputFormat, string> = {
  base64: 'Base64',
  hex: 'Hexadecimal',
};

// ============================================
// Educational Error Types
// ============================================

export interface EducationalError {
  title: string;
  why: string;
  causes: string[];
  suggestion: string;
  technicalDetail?: string;
}

export const EDUCATIONAL_ERRORS: Record<string, EducationalError> = {
  BAD_DECRYPT: {
    title: 'Decryption Failed',
    why: 'The ciphertext could not be decrypted with the provided key.',
    causes: [
      'Incorrect passphrase or key',
      'Corrupted or modified ciphertext',
      'Wrong algorithm selected',
      'IV/Salt mismatch with original encryption',
    ],
    suggestion: 'Verify that you are using the exact same passphrase, algorithm, and IV/Salt that were used for encryption.',
  },
  EMPTY_KEY: {
    title: 'Key Required',
    why: 'Encryption and decryption operations require a secret key.',
    causes: ['No passphrase entered', 'Key field was cleared'],
    suggestion: 'Enter a passphrase in the key field. The passphrase will be derived into a 256-bit key using PBKDF2.',
  },
  EMPTY_INPUT: {
    title: 'Input Required',
    why: 'There is no data to process.',
    causes: ['Input field is empty'],
    suggestion: 'Enter text to encrypt, ciphertext to decrypt, or data to hash.',
  },
  INVALID_CIPHERTEXT: {
    title: 'Invalid Ciphertext Format',
    why: 'The input does not appear to be valid encrypted data.',
    causes: [
      'Text is not properly Base64 encoded',
      'Data is corrupted or truncated',
      'Input is plain text, not ciphertext',
    ],
    suggestion: 'Ensure you are pasting the complete ciphertext output from a previous encryption operation.',
  },
  INVALID_HEX: {
    title: 'Invalid Hexadecimal',
    why: 'The value contains characters that are not valid hexadecimal digits.',
    causes: ['Non-hex characters (0-9, a-f only)', 'Odd number of characters'],
    suggestion: 'Hex values should only contain characters 0-9 and a-f, with an even number of characters.',
  },
  IV_TOO_SHORT: {
    title: 'IV Too Short',
    why: 'The Initialization Vector (IV) must be exactly 16 bytes (32 hex characters) for AES.',
    causes: ['IV field has fewer than 32 hex characters'],
    suggestion: 'Click "Regenerate" to generate a proper random IV, or enter exactly 32 hex characters.',
  },
  SALT_TOO_SHORT: {
    title: 'Salt Too Short',
    why: 'The salt should be at least 8 bytes (16 hex characters) for secure key derivation.',
    causes: ['Salt field has fewer than 16 hex characters'],
    suggestion: 'Click "Regenerate" to generate a proper random salt, or enter at least 16 hex characters.',
  },
  RSA_KEY_REQUIRED: {
    title: 'RSA Key Required',
    why: 'RSA encryption requires a public key, and decryption requires the corresponding private key.',
    causes: ['Public key not provided for encryption', 'Private key not provided for decryption'],
    suggestion: 'Click "Generate Key Pair" to create a new RSA key pair, or paste existing PEM-formatted keys.',
  },
  GPG_KEY_REQUIRED: {
    title: 'OpenPGP Key Required',
    why: 'OpenPGP encryption requires an armored public key, and decryption requires the private key.',
    causes: ['Public key not provided', 'Private key not provided'],
    suggestion: 'Click "Generate Key Pair" to create a new OpenPGP key pair.',
  },
};

// ============================================
// Output Anatomy Types (for Study Mode)
// ============================================

export interface OutputSection {
  label: string;
  start: number;
  end: number;
  hex: string;
  bytes: number;
  colorClass: string;
  description: string;
}

export interface OutputAnatomy {
  format: 'openssl' | 'raw';
  sections: OutputSection[];
  totalBytes: number;
  opensslCompatible: boolean;
}

// ============================================
// Lab View State Types
// ============================================

export type LabFieldMode = 'random' | 'custom';

export interface LabViewState {
  enabled: boolean;
  salt: string; // hex
  saltMode: LabFieldMode;
  iterations: number;
  derivedKey: string; // hex, read-only
  iv: string; // hex
  ivMode: LabFieldMode;
  ivHistory: string[]; // track used IVs for reuse warning
  ivReuseWarning: boolean;
}

// ============================================
// Crypto Operation Result Types
// ============================================

export interface EncryptionResult {
  ciphertext: string;
  salt: Uint8Array;
  saltHex: string;
  iv: Uint8Array;
  ivHex: string;
  derivedKey: Uint8Array;
  derivedKeyHex: string;
  opensslFormat: string;
  opensslCommand: string;
}

export interface DecryptionResult {
  plaintext: string;
  salt: Uint8Array;
  saltHex: string;
  iv: Uint8Array;
  ivHex: string;
  derivedKey: Uint8Array;
  derivedKeyHex: string;
}

export interface HashResult {
  hex: string;
  base64: string;
  bytes: Uint8Array;
  algorithm: HashAlgorithm;
}

// ============================================
// Main State Type
// ============================================

export interface CryptoLabState {
  // Mode & Algorithm
  mode: CryptoMode;
  algorithm: CryptoAlgorithm;

  // Input
  inputText: string;
  inputBytes: number;

  // Key Management (Symmetric)
  passphrase: string;
  showPassphrase: boolean;

  // Key Management (Asymmetric)
  publicKey: string;
  privateKey: string;

  // Lab View
  labView: LabViewState;

  // Output
  output: string;
  outputFormat: OutputFormat;
  studyModeEnabled: boolean;
  outputAnatomy: OutputAnatomy | null;
  opensslCommand: string;

  // Hash Result
  hashResult: HashResult | null;

  // Status
  isProcessing: boolean;
  error: EducationalError | null;
  toastMessage: string;

  // Session Storage
  savedKeys: string[];
  savedKeyPairs: Array<{ publicKey: string; privateKey: string }>;
}

// ============================================
// Default Values
// ============================================

export const DEFAULT_ITERATIONS = 100000;
export const AES_IV_BYTES = 16;
export const AES_IV_HEX_LENGTH = 32;
export const SALT_BYTES = 16;
export const SALT_HEX_LENGTH = 32;
export const AES_KEY_BYTES = 32;
export const AES_KEY_HEX_LENGTH = 64;

export const DEFAULT_LAB_VIEW_STATE: LabViewState = {
  enabled: true, // Default ON for educational focus
  salt: '',
  saltMode: 'random',
  iterations: DEFAULT_ITERATIONS,
  derivedKey: '',
  iv: '',
  ivMode: 'random',
  ivHistory: [],
  ivReuseWarning: false,
};

// ============================================
// Helper Type Guards
// ============================================

export const isSymmetricAlgorithm = (algo: CryptoAlgorithm): algo is SymmetricAlgorithm =>
  ALGORITHM_CATEGORIES.symmetric.includes(algo as SymmetricAlgorithm);

export const isAsymmetricAlgorithm = (algo: CryptoAlgorithm): algo is AsymmetricAlgorithm =>
  ALGORITHM_CATEGORIES.asymmetric.includes(algo as AsymmetricAlgorithm);

export const isHashAlgorithm = (algo: CryptoAlgorithm): algo is HashAlgorithm =>
  ALGORITHM_CATEGORIES.hashing.includes(algo as HashAlgorithm);

export const requiresKeyPair = (algo: CryptoAlgorithm): boolean =>
  isAsymmetricAlgorithm(algo);

export const requiresIV = (algo: CryptoAlgorithm): boolean =>
  algo === 'aes-256-cbc' || algo === 'aes-256-gcm';

export const supportsLabView = (algo: CryptoAlgorithm): boolean =>
  isSymmetricAlgorithm(algo);
