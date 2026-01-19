/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Lab View Panel Component
 * Shows cryptographic internals (Salt, IV, Derived Key) for educational purposes
 */

import React from 'react';
import type { LabViewState, CryptoAlgorithm } from '../types';
import { ITERATION_PRESETS, type IterationPreset } from '../lib/crypto-worker';

interface LabViewPanelProps {
  labView: LabViewState;
  algorithm: CryptoAlgorithm;
  onSaltChange: (salt: string) => void;
  onRegenerateSalt: () => void;
  onIterationsChange: (iterations: number) => void;
  onIVChange: (iv: string) => void;
  onRegenerateIV: () => void;
  disabled?: boolean;
}

const HexInput: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onRegenerate?: () => void;
  maxLength?: number;
  readOnly?: boolean;
  warning?: boolean;
  warningMessage?: string;
  description?: string;
  disabled?: boolean;
}> = ({
  id,
  label,
  value,
  onChange,
  onRegenerate,
  maxLength,
  readOnly = false,
  warning = false,
  warningMessage,
  description,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow hex characters
    const cleaned = e.target.value.toLowerCase().replace(/[^0-9a-f]/g, '');
    onChange(cleaned);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
        {onRegenerate && !readOnly && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={disabled}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            Regenerate
          </button>
        )}
      </div>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          readOnly={readOnly}
          disabled={disabled}
          className={`
            w-full px-3 py-2 rounded-md font-mono text-xs
            ${readOnly
              ? 'bg-gray-100 dark:bg-gray-900 cursor-default'
              : 'bg-white dark:bg-gray-800'
            }
            ${warning
              ? 'border-2 border-yellow-500 dark:border-yellow-400'
              : 'border border-gray-300 dark:border-gray-600'
            }
            text-gray-900 dark:text-gray-100
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-50
          `}
        />
        {maxLength && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {warning && warningMessage && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
          <span>&#9888;</span> {warningMessage}
        </p>
      )}
      {description && !warning && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

export const LabViewPanel: React.FC<LabViewPanelProps> = ({
  labView,
  algorithm,
  onSaltChange,
  onRegenerateSalt,
  onIterationsChange,
  onIVChange,
  onRegenerateIV,
  disabled = false,
}) => {
  const ivLength = algorithm === 'aes-256-gcm' ? 24 : 32; // hex chars (12 or 16 bytes)

  const handlePresetSelect = (preset: IterationPreset) => {
    onIterationsChange(ITERATION_PRESETS[preset].value);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <span>&#128300;</span> Lab View
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Cryptographic Internals
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Salt */}
        <HexInput
          id="lab-salt"
          label="Salt (16 bytes)"
          value={labView.salt}
          onChange={onSaltChange}
          onRegenerate={onRegenerateSalt}
          maxLength={32}
          disabled={disabled}
          description="Random value for PBKDF2 key derivation"
        />

        {/* IV */}
        <HexInput
          id="lab-iv"
          label={`IV (${algorithm === 'aes-256-gcm' ? '12' : '16'} bytes)`}
          value={labView.iv}
          onChange={onIVChange}
          onRegenerate={onRegenerateIV}
          maxLength={ivLength}
          warning={labView.ivReuseWarning}
          warningMessage="IV reuse detected! This weakens security."
          disabled={disabled}
          description="Initialization Vector for encryption"
        />
      </div>

      {/* Iterations */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="lab-iterations" className="text-xs font-medium text-gray-600 dark:text-gray-400">
            PBKDF2 Iterations
          </label>
          <div className="flex gap-1">
            {(Object.keys(ITERATION_PRESETS) as IterationPreset[]).slice(0, 3).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                disabled={disabled}
                className={`
                  px-2 py-0.5 text-xs rounded
                  ${labView.iterations === ITERATION_PRESETS[preset].value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }
                  disabled:opacity-50 transition-colors
                `}
              >
                {preset === 'fast' ? '10K' : preset === 'standard' ? '100K' : '310K'}
              </button>
            ))}
          </div>
        </div>
        <input
          id="lab-iterations"
          type="number"
          min={1}
          max={10000000}
          value={labView.iterations}
          onChange={(e) => onIterationsChange(parseInt(e.target.value, 10) || 100000)}
          disabled={disabled}
          className="
            w-full px-3 py-2 rounded-md font-mono text-sm
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            text-gray-900 dark:text-gray-100
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-50
          "
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Higher iterations = slower but more secure key derivation
        </p>
      </div>

      {/* Derived Key (Read-only) */}
      {labView.derivedKey && (
        <HexInput
          id="lab-derived-key"
          label="Derived Key (256-bit)"
          value={labView.derivedKey}
          onChange={() => {}}
          readOnly
          description="The actual AES key derived from passphrase + salt"
        />
      )}

      {/* Educational Note */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>How it works:</strong> Your passphrase is combined with a random salt through {labView.iterations.toLocaleString()} iterations of PBKDF2-SHA256 to derive a 256-bit key. The IV ensures each encryption produces unique ciphertext even with the same key and plaintext.
        </p>
      </div>
    </div>
  );
};

export default LabViewPanel;
