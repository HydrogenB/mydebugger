/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Mechanism Zone Component
 * Configuration panel for algorithm, keys, and Lab View settings
 */

import React from 'react';
import { SelectInput, Button } from '../../../design-system/components/inputs';
import type { CryptoAlgorithm, OutputFormat, LabViewState } from '../types';
import { ALGORITHM_LABELS, ALGORITHM_CATEGORIES } from '../types';
import SegmentedControl from './SegmentedControl';
import LabViewPanel from './LabViewPanel';
import type { CryptoMode } from '../types';

interface MechanismZoneProps {
  // Mode & Algorithm
  mode: CryptoMode;
  algorithm: CryptoAlgorithm;
  onModeChange: (mode: CryptoMode) => void;
  onAlgorithmChange: (algo: CryptoAlgorithm) => void;

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
  labView: LabViewState;
  onToggleLabView: () => void;
  onSaltChange: (salt: string) => void;
  onRegenerateSalt: () => void;
  onIterationsChange: (iterations: number) => void;
  onIVChange: (iv: string) => void;
  onRegenerateIV: () => void;

  // Output Format
  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;

  // Flags
  isSymmetric: boolean;
  isAsymmetric: boolean;
  isHashing: boolean;
  isProcessing: boolean;
}

export const MechanismZone: React.FC<MechanismZoneProps> = ({
  mode,
  algorithm,
  onModeChange,
  onAlgorithmChange,
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
  outputFormat,
  onOutputFormatChange,
  isSymmetric,
  isAsymmetric,
  isHashing,
  isProcessing,
}) => {
  // Build algorithm options with grouping
  const algorithmOptions = [
    { value: '', label: '-- Symmetric --', disabled: true },
    ...ALGORITHM_CATEGORIES.symmetric.map(algo => ({
      value: algo,
      label: ALGORITHM_LABELS[algo],
    })),
    { value: '', label: '-- Asymmetric --', disabled: true },
    ...ALGORITHM_CATEGORIES.asymmetric.map(algo => ({
      value: algo,
      label: ALGORITHM_LABELS[algo],
    })),
    { value: '', label: '-- Hashing --', disabled: true },
    ...ALGORITHM_CATEGORIES.hashing.map(algo => ({
      value: algo,
      label: ALGORITHM_LABELS[algo],
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Operation Mode
        </span>
        <SegmentedControl
          value={mode}
          onChange={onModeChange}
          showHash={true}
          disabled={isProcessing}
        />
      </div>

      {/* Algorithm Selector */}
      <SelectInput
        id="algorithm"
        label="Algorithm"
        value={algorithm}
        onChange={(v) => onAlgorithmChange(v as CryptoAlgorithm)}
        options={algorithmOptions}
        disabled={isProcessing}
      />

      {/* Output Format */}
      <SelectInput
        id="output-format"
        label="Output Format"
        value={outputFormat}
        onChange={(v) => onOutputFormatChange(v as OutputFormat)}
        options={[
          { value: 'base64', label: 'Base64' },
          { value: 'hex', label: 'Hexadecimal' },
        ]}
        disabled={isProcessing}
      />

      {/* Symmetric Key Input */}
      {isSymmetric && (
        <div className="space-y-2">
          <label htmlFor="passphrase" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Passphrase
          </label>
          <div className="relative">
            <input
              id="passphrase"
              type={showPassphrase ? 'text' : 'password'}
              value={passphrase}
              onChange={(e) => onPassphraseChange(e.target.value)}
              placeholder="Enter your secret passphrase"
              disabled={isProcessing}
              className="
                w-full px-3 py-2 pr-20 rounded-lg border
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:opacity-50
                font-mono text-sm
              "
            />
            <button
              type="button"
              onClick={onToggleShowPassphrase}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassphrase ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onGenerateKeyPair}
              disabled={isProcessing}
            >
              Generate Random Key
            </Button>
          </div>
        </div>
      )}

      {/* Asymmetric Key Inputs */}
      {isAsymmetric && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="public-key" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Public Key {mode === 'encrypt' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id="public-key"
              value={publicKey}
              onChange={(e) => onPublicKeyChange(e.target.value)}
              placeholder={algorithm === 'gpg-rsa-2048' ? 'Paste OpenPGP public key (armored)...' : 'Paste PEM public key...'}
              disabled={isProcessing}
              rows={4}
              className="
                w-full px-3 py-2 rounded-lg border font-mono text-xs
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:opacity-50 resize-y
              "
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="private-key" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Private Key {mode === 'decrypt' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id="private-key"
              value={privateKey}
              onChange={(e) => onPrivateKeyChange(e.target.value)}
              placeholder={algorithm === 'gpg-rsa-2048' ? 'Paste OpenPGP private key (armored)...' : 'Paste PEM private key...'}
              disabled={isProcessing}
              rows={4}
              className="
                w-full px-3 py-2 rounded-lg border font-mono text-xs
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:opacity-50 resize-y
              "
            />
          </div>

          <Button
            size="sm"
            variant="success"
            onClick={onGenerateKeyPair}
            disabled={isProcessing}
          >
            Generate Key Pair
          </Button>
        </div>
      )}

      {/* Lab View Toggle & Panel (Symmetric only) */}
      {isSymmetric && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span id="lab-view-label" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span>&#128300;</span> Lab View
            </span>
            <button
              type="button"
              onClick={onToggleLabView}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${labView.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
              `}
              role="switch"
              aria-checked={labView.enabled}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${labView.enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            View and customize cryptographic parameters (Salt, IV, Iterations)
          </p>

          {labView.enabled && (
            <LabViewPanel
              labView={labView}
              algorithm={algorithm}
              onSaltChange={onSaltChange}
              onRegenerateSalt={onRegenerateSalt}
              onIterationsChange={onIterationsChange}
              onIVChange={onIVChange}
              onRegenerateIV={onRegenerateIV}
              disabled={isProcessing}
            />
          )}
        </div>
      )}

      {/* Hash Algorithm Note */}
      {isHashing && (
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-purple-800 dark:text-purple-200">
            <strong>Note:</strong> Hashing is a one-way operation. The same input always produces the same hash, but you cannot reverse the hash to get the original input.
            {algorithm === 'md5' && (
              <span className="block mt-1 text-red-600 dark:text-red-400">
                <strong>Warning:</strong> MD5 is cryptographically broken and should not be used for security purposes.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default MechanismZone;
