/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Crypto Lab Panel
 * Main component for the educational cryptography tool
 */

import React from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { Button } from '../../../design-system/components/inputs';
import { InfoBox } from '../../../design-system/components/display/InfoBox';
import InputZone from './InputZone';
import MechanismZone from './MechanismZone';
import OutputZone from './OutputZone';
import type { EducationalError, OutputAnatomy, HashResult, CryptoAlgorithm } from '../types';

interface CryptoLabPanelProps {
  // Mode & Algorithm
  mode: 'encrypt' | 'decrypt' | 'hash';
  algorithm: string;
  onModeChange: (mode: 'encrypt' | 'decrypt' | 'hash') => void;
  onAlgorithmChange: (algo: string) => void;

  // Input
  inputText: string;
  inputBytes: number;
  onInputChange: (value: string) => void;

  // Key Management (Symmetric)
  passphrase: string;
  showPassphrase: boolean;
  onPassphraseChange: (value: string) => void;
  onToggleShowPassphrase: () => void;

  // Key Management (Asymmetric)
  publicKey: string;
  privateKey: string;
  onPublicKeyChange: (value: string) => void;
  onPrivateKeyChange: (value: string) => void;
  onGenerateKeyPair: () => void;

  // Lab View
  labView: {
    enabled: boolean;
    salt: string;
    saltMode: 'random' | 'custom';
    iterations: number;
    derivedKey: string;
    iv: string;
    ivMode: 'random' | 'custom';
    ivHistory: string[];
    ivReuseWarning: boolean;
  };
  onToggleLabView: () => void;
  onSaltChange: (salt: string) => void;
  onRegenerateSalt: () => void;
  onIterationsChange: (iterations: number) => void;
  onIVChange: (iv: string) => void;
  onRegenerateIV: () => void;

  // Output
  output: string;
  outputFormat: 'base64' | 'hex';
  onOutputFormatChange: (format: 'base64' | 'hex') => void;
  studyModeEnabled: boolean;
  onToggleStudyMode: () => void;
  outputAnatomy: OutputAnatomy | null;
  opensslCommand: string;
  hashResult: HashResult | null;

  // Actions
  onExecute: () => void;
  onCopyOutput: () => void;
  onCopyOpenSSLCommand: () => void;
  onMoveToInput: () => void;
  onClear: () => void;
  onGenerateDemo: () => void;

  // Status
  isProcessing: boolean;
  error: EducationalError | null;
  onClearError: () => void;
  toastMessage: string;

  // Flags
  isSymmetric: boolean;
  isAsymmetric: boolean;
  isHashing: boolean;
}

export const CryptoLabPanel: React.FC<CryptoLabPanelProps> = ({
  mode,
  algorithm,
  onModeChange,
  onAlgorithmChange,
  inputText,
  inputBytes,
  onInputChange,
  passphrase,
  showPassphrase,
  onPassphraseChange,
  onToggleShowPassphrase,
  publicKey,
  privateKey,
  onPublicKeyChange,
  onPrivateKeyChange,
  onGenerateKeyPair,
  labView,
  onToggleLabView,
  onSaltChange,
  onRegenerateSalt,
  onIterationsChange,
  onIVChange,
  onRegenerateIV,
  output,
  outputFormat,
  onOutputFormatChange,
  studyModeEnabled,
  onToggleStudyMode,
  outputAnatomy,
  opensslCommand,
  hashResult,
  onExecute,
  onCopyOutput,
  onCopyOpenSSLCommand,
  onMoveToInput,
  onClear,
  onGenerateDemo,
  isProcessing,
  error,
  onClearError,
  toastMessage,
  isSymmetric,
  isAsymmetric,
  isHashing,
}) => {
  // Determine execute button text and color based on mode
  const getExecuteButtonProps = () => {
    if (isHashing) {
      return { text: 'Compute Hash', variant: 'info' as const };
    }
    if (mode === 'encrypt') {
      return { text: 'Encrypt', variant: 'warning' as const };
    }
    return { text: 'Decrypt', variant: 'success' as const };
  };

  const executeButtonProps = getExecuteButtonProps();

  return (
    <div className={`${TOOL_PANEL_CLASS} space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold heading-gradient">Crypto Lab</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Educational cryptography with transparent mechanics
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onGenerateDemo} disabled={isProcessing}>
            Generate Example
          </Button>
          <Button size="sm" variant="secondary" onClick={onClear} disabled={isProcessing}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-20 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out"
        >
          {toastMessage}
        </div>
      )}

      {/* Educational Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                {error.title}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error.why}
              </p>
              {error.causes.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">
                    Possible causes:
                  </p>
                  <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside mt-1">
                    {error.causes.map((cause, idx) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 italic">
                {error.suggestion}
              </p>
            </div>
            <button
              type="button"
              onClick={onClearError}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Input & Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Input Zone */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <InputZone
              value={inputText}
              onChange={onInputChange}
              mode={mode}
              byteCount={inputBytes}
              disabled={isProcessing}
            />
          </div>

          {/* Mechanism Zone */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <MechanismZone
              mode={mode}
              algorithm={algorithm as CryptoAlgorithm}
              onModeChange={onModeChange}
              onAlgorithmChange={onAlgorithmChange}
              passphrase={passphrase}
              showPassphrase={showPassphrase}
              onPassphraseChange={onPassphraseChange}
              onToggleShowPassphrase={onToggleShowPassphrase}
              publicKey={publicKey}
              privateKey={privateKey}
              onPublicKeyChange={onPublicKeyChange}
              onPrivateKeyChange={onPrivateKeyChange}
              onGenerateKeyPair={onGenerateKeyPair}
              labView={labView}
              onToggleLabView={onToggleLabView}
              onSaltChange={onSaltChange}
              onRegenerateSalt={onRegenerateSalt}
              onIterationsChange={onIterationsChange}
              onIVChange={onIVChange}
              onRegenerateIV={onRegenerateIV}
              outputFormat={outputFormat}
              onOutputFormatChange={onOutputFormatChange}
              isSymmetric={isSymmetric}
              isAsymmetric={isAsymmetric}
              isHashing={isHashing}
              isProcessing={isProcessing}
            />
          </div>

          {/* Execute Button */}
          <Button
            variant={executeButtonProps.variant}
            onClick={onExecute}
            disabled={isProcessing || !inputText.trim()}
            className="w-full py-3 text-lg font-semibold"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              executeButtonProps.text
            )}
          </Button>
        </div>

        {/* Right Column: Output & Study */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <OutputZone
              output={output}
              mode={mode}
              isProcessing={isProcessing}
              studyModeEnabled={studyModeEnabled}
              outputAnatomy={outputAnatomy}
              opensslCommand={opensslCommand}
              hashResult={hashResult}
              onCopyOutput={onCopyOutput}
              onCopyOpenSSLCommand={onCopyOpenSSLCommand}
              onMoveToInput={onMoveToInput}
              onToggleStudyMode={onToggleStudyMode}
              isSymmetric={isSymmetric}
            />
          </div>

          {/* Educational Info Box */}
          {!output && !isProcessing && (
            <InfoBox title="How to Use" variant="info">
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Select an operation mode (Encrypt, Decrypt, or Hash)</li>
                <li>Choose your algorithm from the dropdown</li>
                <li>
                  {isHashing
                    ? 'Enter text to compute its hash value'
                    : isAsymmetric
                    ? 'Generate or paste your key pair, then enter text'
                    : 'Enter a passphrase and your text to process'
                  }
                </li>
                <li>Click the execute button to see the result</li>
                {isSymmetric && (
                  <li>Toggle &quot;Lab View&quot; to see cryptographic internals (Salt, IV, Derived Key)</li>
                )}
              </ol>
            </InfoBox>
          )}

          {/* Quick Tips */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                Encryption Tip
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                AES-256-GCM includes authentication - it will detect if ciphertext has been tampered with.
              </p>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <h4 className="text-xs font-semibold text-teal-800 dark:text-teal-200 mb-1">
                Decryption Tip
              </h4>
              <p className="text-xs text-teal-700 dark:text-teal-300">
                OpenSSL format includes the salt in the output, so you only need the passphrase to decrypt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoLabPanel;
