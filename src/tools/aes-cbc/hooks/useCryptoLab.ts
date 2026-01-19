/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Crypto Lab - State Management Hook
 * Educational cryptography tool with visible internals
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  CryptoMode,
  CryptoAlgorithm,
  OutputFormat,
  EducationalError,
  LabViewState,
  OutputAnatomy,
  HashResult,
  EncryptionResult,
  DecryptionResult,
} from '../types';
import {
  DEFAULT_ITERATIONS,
  AES_IV_HEX_LENGTH,
  DEFAULT_LAB_VIEW_STATE,
  isSymmetricAlgorithm,
  isAsymmetricAlgorithm,
  isHashAlgorithm,
  EDUCATIONAL_ERRORS,
} from '../types';
import {
  aes256CbcEncryptWithInternals,
  aes256CbcDecryptWithInternals,
  aes256GcmEncryptWithInternals,
  aes256GcmDecryptWithInternals,
  generateRandomHex,
  hexToBytes,
  generateRsaKeyPair,
  rsaOaepEncrypt,
  rsaOaepDecrypt,
  generateGpgKeyPair,
  gpgEncrypt,
  gpgDecrypt,
} from '../lib/aes';
import { computeHash } from '../lib/hash';
import { analyzeOutputAnatomy, generateOpenSSLCommand } from '../lib/openssl-format';

// ============================================
// Hook State Interface
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
// Initial State
// ============================================

const initialState: CryptoLabState = {
  mode: 'encrypt',
  algorithm: 'aes-256-cbc',

  inputText: '',
  inputBytes: 0,

  passphrase: '',
  showPassphrase: false,

  publicKey: '',
  privateKey: '',

  labView: { ...DEFAULT_LAB_VIEW_STATE },

  output: '',
  outputFormat: 'base64',
  studyModeEnabled: true,
  outputAnatomy: null,
  opensslCommand: '',

  hashResult: null,

  isProcessing: false,
  error: null,
  toastMessage: '',

  savedKeys: [],
  savedKeyPairs: [],
};

// ============================================
// Main Hook
// ============================================

export const useCryptoLab = () => {
  const [state, setState] = useState<CryptoLabState>(initialState);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // Toast Helper
  // ============================================

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setState(s => ({ ...s, toastMessage: message }));
    toastTimeoutRef.current = setTimeout(() => {
      setState(s => ({ ...s, toastMessage: '' }));
    }, 2000);
  }, []);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // ============================================
  // Mode & Algorithm Actions
  // ============================================

  const setMode = useCallback((mode: CryptoMode) => {
    setState(s => ({
      ...s,
      mode,
      output: '',
      error: null,
      outputAnatomy: null,
      hashResult: null,
    }));
  }, []);

  const setAlgorithm = useCallback((algorithm: CryptoAlgorithm) => {
    // Determine mode based on algorithm type
    let newMode: CryptoMode = state.mode;
    if (isHashAlgorithm(algorithm)) {
      newMode = 'hash';
    } else if (state.mode === 'hash') {
      newMode = 'encrypt';
    }

    setState(s => ({
      ...s,
      algorithm,
      mode: newMode,
      output: '',
      error: null,
      outputAnatomy: null,
      hashResult: null,
    }));
  }, [state.mode]);

  const toggleMode = useCallback(() => {
    if (isHashAlgorithm(state.algorithm)) return;

    setState(s => ({
      ...s,
      mode: s.mode === 'encrypt' ? 'decrypt' : 'encrypt',
      inputText: '',
      output: '',
      error: null,
      outputAnatomy: null,
    }));
  }, [state.algorithm]);

  // ============================================
  // Input Actions
  // ============================================

  const setInputText = useCallback((text: string) => {
    const bytes = new TextEncoder().encode(text).length;
    setState(s => ({
      ...s,
      inputText: text,
      inputBytes: bytes,
      error: null,
    }));
  }, []);

  // ============================================
  // Key Management Actions
  // ============================================

  const setPassphrase = useCallback((passphrase: string) => {
    setState(s => ({ ...s, passphrase, error: null }));
  }, []);

  const toggleShowPassphrase = useCallback(() => {
    setState(s => ({ ...s, showPassphrase: !s.showPassphrase }));
  }, []);

  const setPublicKey = useCallback((publicKey: string) => {
    setState(s => ({ ...s, publicKey, error: null }));
  }, []);

  const setPrivateKey = useCallback((privateKey: string) => {
    setState(s => ({ ...s, privateKey, error: null }));
  }, []);

  // ============================================
  // Lab View Actions
  // ============================================

  const toggleLabView = useCallback(() => {
    setState(s => ({
      ...s,
      labView: { ...s.labView, enabled: !s.labView.enabled },
    }));
  }, []);

  const setLabViewEnabled = useCallback((enabled: boolean) => {
    setState(s => ({
      ...s,
      labView: { ...s.labView, enabled },
    }));
  }, []);

  const setSalt = useCallback((salt: string) => {
    setState(s => ({
      ...s,
      labView: { ...s.labView, salt, saltMode: 'custom' },
      error: null,
    }));
  }, []);

  const regenerateSalt = useCallback(() => {
    const newSalt = generateRandomHex(16);
    setState(s => ({
      ...s,
      labView: { ...s.labView, salt: newSalt, saltMode: 'random' },
    }));
    showToast('Salt regenerated');
  }, [showToast]);

  const setIterations = useCallback((iterations: number) => {
    setState(s => ({
      ...s,
      labView: { ...s.labView, iterations: Math.max(1, iterations) },
    }));
  }, []);

  const setIV = useCallback((iv: string) => {
    setState(s => {
      // Check for IV reuse
      const ivReuseWarning = s.labView.ivHistory.includes(iv) && iv.length === AES_IV_HEX_LENGTH;
      return {
        ...s,
        labView: { ...s.labView, iv, ivMode: 'custom', ivReuseWarning },
        error: null,
      };
    });
  }, []);

  const regenerateIV = useCallback(() => {
    const ivLength = state.algorithm === 'aes-256-gcm' ? 12 : 16;
    const newIV = generateRandomHex(ivLength);
    setState(s => ({
      ...s,
      labView: { ...s.labView, iv: newIV, ivMode: 'random', ivReuseWarning: false },
    }));
    showToast('IV regenerated');
  }, [state.algorithm, showToast]);

  // ============================================
  // Output Format Actions
  // ============================================

  const setOutputFormat = useCallback((format: OutputFormat) => {
    setState(s => ({ ...s, outputFormat: format }));
  }, []);

  const toggleStudyMode = useCallback(() => {
    setState(s => ({ ...s, studyModeEnabled: !s.studyModeEnabled }));
  }, []);

  // ============================================
  // Key Generation Actions
  // ============================================

  const generateKeyPair = useCallback(async () => {
    setState(s => ({ ...s, isProcessing: true, error: null }));

    try {
      if (state.algorithm === 'rsa-oaep') {
        const { publicKey, privateKey } = await generateRsaKeyPair();
        setState(s => ({
          ...s,
          publicKey,
          privateKey,
          isProcessing: false,
        }));
        showToast('RSA key pair generated');
      } else if (state.algorithm === 'gpg-rsa-2048') {
        const { publicKey, privateKey } = await generateGpgKeyPair();
        setState(s => ({
          ...s,
          publicKey,
          privateKey,
          isProcessing: false,
        }));
        showToast('OpenPGP key pair generated');
      } else {
        // For symmetric, generate random passphrase
        const randomKey = generateRandomHex(16);
        setState(s => ({
          ...s,
          passphrase: randomKey,
          isProcessing: false,
        }));
        showToast('Random key generated');
      }
    } catch (err) {
      setState(s => ({
        ...s,
        isProcessing: false,
        error: {
          title: 'Key Generation Failed',
          why: 'Unable to generate cryptographic keys.',
          causes: ['Browser crypto API not available', 'Insufficient entropy'],
          suggestion: 'Try refreshing the page or using a different browser.',
        },
      }));
    }
  }, [state.algorithm, showToast]);

  // ============================================
  // Save/Load Key Actions
  // ============================================

  const saveCurrentKey = useCallback(() => {
    if (isAsymmetricAlgorithm(state.algorithm)) {
      if (!state.publicKey || !state.privateKey) {
        showToast('No key pair to save');
        return;
      }
      setState(s => ({
        ...s,
        savedKeyPairs: [...s.savedKeyPairs, { publicKey: s.publicKey, privateKey: s.privateKey }],
      }));
    } else {
      if (!state.passphrase) {
        showToast('No key to save');
        return;
      }
      setState(s => ({
        ...s,
        savedKeys: [...s.savedKeys, s.passphrase],
      }));
    }
    showToast('Key saved to session');
  }, [state.algorithm, state.publicKey, state.privateKey, state.passphrase, showToast]);

  const selectSavedKey = useCallback((index: number) => {
    if (isAsymmetricAlgorithm(state.algorithm)) {
      const kp = state.savedKeyPairs[index];
      if (kp) {
        setState(s => ({
          ...s,
          publicKey: kp.publicKey,
          privateKey: kp.privateKey,
          error: null,
        }));
      }
    } else {
      const key = state.savedKeys[index];
      if (key) {
        setState(s => ({
          ...s,
          passphrase: key,
          error: null,
        }));
      }
    }
  }, [state.algorithm, state.savedKeyPairs, state.savedKeys]);

  const discardSavedKey = useCallback((index: number) => {
    if (isAsymmetricAlgorithm(state.algorithm)) {
      setState(s => ({
        ...s,
        savedKeyPairs: s.savedKeyPairs.filter((_, i) => i !== index),
      }));
    } else {
      setState(s => ({
        ...s,
        savedKeys: s.savedKeys.filter((_, i) => i !== index),
      }));
    }
  }, [state.algorithm]);

  // ============================================
  // Main Execute Action
  // ============================================

  const execute = useCallback(async () => {
    setState(s => ({ ...s, isProcessing: true, error: null, output: '', outputAnatomy: null, hashResult: null }));

    try {
      // Validate input
      if (!state.inputText.trim()) {
        setState(s => ({
          ...s,
          isProcessing: false,
          error: EDUCATIONAL_ERRORS.EMPTY_INPUT,
        }));
        return;
      }

      // Handle hashing
      if (isHashAlgorithm(state.algorithm)) {
        const result = await computeHash(state.inputText, state.algorithm);
        const outputStr = state.outputFormat === 'hex' ? result.hex : result.base64;
        setState(s => ({
          ...s,
          output: outputStr,
          hashResult: result,
          isProcessing: false,
        }));
        return;
      }

      // Handle asymmetric encryption/decryption
      if (isAsymmetricAlgorithm(state.algorithm)) {
        if (state.mode === 'encrypt') {
          if (!state.publicKey) {
            setState(s => ({
              ...s,
              isProcessing: false,
              error: state.algorithm === 'gpg-rsa-2048'
                ? EDUCATIONAL_ERRORS.GPG_KEY_REQUIRED
                : EDUCATIONAL_ERRORS.RSA_KEY_REQUIRED,
            }));
            return;
          }

          let result: string;
          if (state.algorithm === 'rsa-oaep') {
            result = await rsaOaepEncrypt(state.publicKey, state.inputText);
          } else {
            result = await gpgEncrypt(state.publicKey, state.inputText);
          }

          setState(s => ({
            ...s,
            output: result,
            isProcessing: false,
          }));
        } else {
          if (!state.privateKey) {
            setState(s => ({
              ...s,
              isProcessing: false,
              error: state.algorithm === 'gpg-rsa-2048'
                ? EDUCATIONAL_ERRORS.GPG_KEY_REQUIRED
                : EDUCATIONAL_ERRORS.RSA_KEY_REQUIRED,
            }));
            return;
          }

          let result: string;
          if (state.algorithm === 'rsa-oaep') {
            result = await rsaOaepDecrypt(state.privateKey, state.inputText);
          } else {
            result = await gpgDecrypt(state.privateKey, state.inputText);
          }

          setState(s => ({
            ...s,
            output: result,
            isProcessing: false,
          }));
        }
        return;
      }

      // Handle symmetric encryption/decryption
      if (!state.passphrase) {
        setState(s => ({
          ...s,
          isProcessing: false,
          error: EDUCATIONAL_ERRORS.EMPTY_KEY,
        }));
        return;
      }

      // Prepare options
      const salt = state.labView.saltMode === 'custom' && state.labView.salt
        ? hexToBytes(state.labView.salt)
        : undefined;

      const iv = state.labView.ivMode === 'custom' && state.labView.iv
        ? hexToBytes(state.labView.iv)
        : undefined;

      const iterations = state.labView.iterations || DEFAULT_ITERATIONS;

      if (state.mode === 'encrypt') {
        let result: EncryptionResult;

        if (state.algorithm === 'aes-256-cbc') {
          result = await aes256CbcEncryptWithInternals(state.passphrase, state.inputText, {
            salt,
            iv,
            iterations,
          });
        } else {
          result = await aes256GcmEncryptWithInternals(state.passphrase, state.inputText, {
            salt,
            iv,
            iterations,
          });
        }

        // Track IV for reuse detection
        const newIvHistory = [...state.labView.ivHistory, result.ivHex].slice(-10);

        // Generate OpenSSL command
        const opensslCmd = generateOpenSSLCommand({
          algorithm: state.algorithm as 'aes-256-cbc' | 'aes-256-gcm',
          passphrase: state.passphrase,
          iterations,
          salt: result.saltHex,
          iv: result.ivHex,
          key: result.derivedKeyHex,
          mode: 'encrypt',
        });

        // Analyze output anatomy
        const anatomy = analyzeOutputAnatomy(result.opensslFormat, state.algorithm);

        setState(s => ({
          ...s,
          output: result.opensslFormat,
          labView: {
            ...s.labView,
            salt: result.saltHex,
            iv: result.ivHex,
            derivedKey: result.derivedKeyHex,
            ivHistory: newIvHistory,
          },
          outputAnatomy: anatomy,
          opensslCommand: opensslCmd,
          isProcessing: false,
        }));
      } else {
        // Decryption
        let result: DecryptionResult;

        if (state.algorithm === 'aes-256-cbc') {
          result = await aes256CbcDecryptWithInternals(state.passphrase, state.inputText, {
            salt,
            iterations,
          });
        } else {
          result = await aes256GcmDecryptWithInternals(state.passphrase, state.inputText, {
            salt,
            iterations,
          });
        }

        // Generate OpenSSL command
        const opensslCmd = generateOpenSSLCommand({
          algorithm: state.algorithm as 'aes-256-cbc' | 'aes-256-gcm',
          passphrase: state.passphrase,
          iterations,
          salt: result.saltHex,
          iv: result.ivHex,
          key: result.derivedKeyHex,
          mode: 'decrypt',
        });

        setState(s => ({
          ...s,
          output: result.plaintext,
          labView: {
            ...s.labView,
            salt: result.saltHex,
            iv: result.ivHex,
            derivedKey: result.derivedKeyHex,
          },
          opensslCommand: opensslCmd,
          isProcessing: false,
        }));
      }
    } catch (err) {
      const errorMessage = (err as Error).message || 'Unknown error';

      // Map error to educational error
      let educationalError: EducationalError;

      if (errorMessage.includes('Decryption failed') || errorMessage.includes('Bad Decrypt')) {
        educationalError = EDUCATIONAL_ERRORS.BAD_DECRYPT;
      } else if (errorMessage.includes('Invalid base64') || errorMessage.includes('Invalid ciphertext')) {
        educationalError = EDUCATIONAL_ERRORS.INVALID_CIPHERTEXT;
      } else if (errorMessage.includes('Invalid hex')) {
        educationalError = EDUCATIONAL_ERRORS.INVALID_HEX;
      } else {
        educationalError = {
          title: 'Operation Failed',
          why: errorMessage,
          causes: ['Unexpected error during cryptographic operation'],
          suggestion: 'Check your inputs and try again.',
          technicalDetail: errorMessage,
        };
      }

      setState(s => ({
        ...s,
        isProcessing: false,
        error: educationalError,
      }));
    }
  }, [state]);

  // ============================================
  // Utility Actions
  // ============================================

  const copyOutput = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.output);
      showToast('Copied to clipboard');
    } catch {
      showToast('Clipboard access denied');
    }
  }, [state.output, showToast]);

  const copyOpenSSLCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.opensslCommand);
      showToast('OpenSSL command copied');
    } catch {
      showToast('Clipboard access denied');
    }
  }, [state.opensslCommand, showToast]);

  const moveOutputToInput = useCallback(() => {
    if (!state.output) return;

    setState(s => ({
      ...s,
      inputText: s.output,
      inputBytes: new TextEncoder().encode(s.output).length,
      mode: s.mode === 'encrypt' ? 'decrypt' : 'encrypt',
      output: '',
      outputAnatomy: null,
      error: null,
    }));
    showToast('Output moved to input');
  }, [state.output, showToast]);

  const clear = useCallback(() => {
    setState(s => ({
      ...s,
      inputText: '',
      inputBytes: 0,
      output: '',
      error: null,
      outputAnatomy: null,
      hashResult: null,
      opensslCommand: '',
      labView: {
        ...s.labView,
        salt: '',
        iv: '',
        derivedKey: '',
        ivReuseWarning: false,
      },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  // ============================================
  // Generate Demo Example
  // ============================================

  const generateDemo = useCallback(async () => {
    setState(s => ({ ...s, isProcessing: true }));

    try {
      if (isHashAlgorithm(state.algorithm)) {
        const sampleText = `Sample text for hashing - ${Date.now()}`;
        setInputText(sampleText);
        showToast('Demo text generated');
      } else if (isAsymmetricAlgorithm(state.algorithm)) {
        await generateKeyPair();
        const sampleText = `Secret message ${Math.random().toString(36).slice(2, 8)}`;
        setInputText(sampleText);
        showToast('Demo key pair and text generated');
      } else {
        // Symmetric
        const randomKey = generateRandomHex(16);
        const sampleText = `Hello World! ${new Date().toISOString()}`;
        const newSalt = generateRandomHex(16);
        const ivLength = state.algorithm === 'aes-256-gcm' ? 12 : 16;
        const newIV = generateRandomHex(ivLength);

        setState(s => ({
          ...s,
          passphrase: randomKey,
          inputText: sampleText,
          inputBytes: new TextEncoder().encode(sampleText).length,
          labView: {
            ...s.labView,
            salt: newSalt,
            saltMode: 'random',
            iv: newIV,
            ivMode: 'random',
          },
          isProcessing: false,
        }));
        showToast('Demo values generated');
      }
    } catch {
      setState(s => ({ ...s, isProcessing: false }));
      showToast('Failed to generate demo');
    }

    setState(s => ({ ...s, isProcessing: false }));
  }, [state.algorithm, generateKeyPair, setInputText, showToast]);

  // ============================================
  // Return API
  // ============================================

  return {
    // State
    ...state,

    // Mode & Algorithm
    setMode,
    setAlgorithm,
    toggleMode,

    // Input
    setInputText,

    // Key Management
    setPassphrase,
    toggleShowPassphrase,
    setPublicKey,
    setPrivateKey,
    generateKeyPair,
    saveCurrentKey,
    selectSavedKey,
    discardSavedKey,

    // Lab View
    toggleLabView,
    setLabViewEnabled,
    setSalt,
    regenerateSalt,
    setIterations,
    setIV,
    regenerateIV,

    // Output
    setOutputFormat,
    toggleStudyMode,

    // Actions
    execute,
    copyOutput,
    copyOpenSSLCommand,
    moveOutputToInput,
    clear,
    clearError,
    generateDemo,

    // Computed helpers
    isSymmetric: isSymmetricAlgorithm(state.algorithm),
    isAsymmetric: isAsymmetricAlgorithm(state.algorithm),
    isHashing: isHashAlgorithm(state.algorithm),
  };
};

export default useCryptoLab;
