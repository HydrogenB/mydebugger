/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { AesMode, AesExample, CryptoAlgorithm } from '../viewmodel/useAesCbc';

interface Props {
  keyValue: string;
  publicKey: string;
  privateKey: string;
  input: string;
  output: string;
  mode: AesMode;
  algorithm: CryptoAlgorithm;

  error: string;
  examples: AesExample[];
  exampleIndex: number | null;
  setKey: (v: string) => void;
  setPublicKey: (v: string) => void;
  setPrivateKey: (v: string) => void;
  setInput: (v: string) => void;
  setExampleIndex: (i: number | null) => void;
  setAlgorithm: (a: CryptoAlgorithm) => void;
  generateKeyPair: () => Promise<void>;
  saveCurrentKey: () => void;
  selectSavedKey: (index: number) => void;
  discardSavedKey: (index: number) => void;
  savedKeys: string[];
  savedKeyPairs: { publicKey: string; privateKey: string }[];

  toggleMode: () => void;
  clear: () => void;
}

export function AesCbcView({
  keyValue,
  publicKey,
  privateKey,
  input,
  output,
  mode,
  algorithm,

  error,
  examples,
  exampleIndex,
  setKey,
  setPublicKey,
  setPrivateKey,
  setInput,
  setExampleIndex,
  setAlgorithm,
  generateKeyPair,
  saveCurrentKey,
  selectSavedKey,
  discardSavedKey,
  savedKeys,
  savedKeyPairs,

  toggleMode,
  clear,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Crypto Lab</h2>
      <div className="mb-4 flex flex-col gap-2">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="algo" className="text-gray-700 dark:text-gray-300">Algorithm</label>
        <select
          id="algo"
          value={algorithm}
          onChange={e => setAlgorithm(e.target.value as CryptoAlgorithm)}
          className="border rounded p-2 dark:bg-gray-700 dark:text-gray-200"
        >
          <option value="aes-cbc">AES-256-CBC</option>
          <option value="aes-gcm">AES-256-GCM</option>
          <option value="rsa-oaep">RSA-OAEP</option>
          <option value="gpg-rsa-2048">GPG RSA-2048</option>
        </select>
      </div>
      {algorithm === 'rsa-oaep' || algorithm === 'gpg-rsa-2048' ? (
        <>
          <div className="mb-4 flex flex-col gap-2">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="public" className="text-gray-700 dark:text-gray-300">Public Key</label>
            <textarea
              id="public"
              className="w-full h-24 p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
              value={publicKey}
              onChange={e => setPublicKey(e.target.value)}
            />
          </div>
          <div className="mb-4 flex flex-col gap-2">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="private" className="text-gray-700 dark:text-gray-300">Private Key</label>
            <textarea
              id="private"
              className="w-full h-24 p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
              value={privateKey}
              onChange={e => setPrivateKey(e.target.value)}
            />
          </div>
          {savedKeyPairs.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {/* eslint-disable react/no-array-index-key */}
              {savedKeyPairs.map((_, idx) => (
                <span
                  key={`kp-${idx}`}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded flex items-center gap-1 text-sm"
                >
                  <button type="button" onClick={() => selectSavedKey(idx)} className="focus:outline-none">
                    Key {idx + 1}
                  </button>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => discardSavedKey(idx)}
                    className="text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-2">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="key" className="text-gray-700 dark:text-gray-300">Key</label>
            <input
              id="key"
              type="text"
              value={keyValue}
              onChange={e => setKey(e.target.value)}
              className="border rounded p-2 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div className="mb-4 flex flex-col gap-2">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="example" className="text-gray-700 dark:text-gray-300">Examples</label>
            <select
              id="example"
              value={exampleIndex ?? ''}
              onChange={e =>
                setExampleIndex(e.target.value === '' ? null : Number(e.target.value))
              }
              className="border rounded p-2 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="">Custom...</option>
              {examples.map((ex, idx) => (
                <option key={ex.label} value={idx}>
                  {ex.label}
                </option>
              ))}
            </select>
          </div>
          {savedKeys.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {/* eslint-disable react/no-array-index-key */}
              {savedKeys.map((k, idx) => (
                <span
                  key={`k-${idx}`}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded flex items-center gap-1 text-sm"
                >
                  <button type="button" onClick={() => selectSavedKey(idx)} className="focus:outline-none">
                    {k.slice(0, 8)}...
                  </button>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => discardSavedKey(idx)}
                    className="text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <div className="mb-4 flex flex-col gap-2">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="input" className="text-gray-700 dark:text-gray-300">
          {mode === 'encrypt' ? 'Plain Text' : 'Encrypted Text'}
        </label>
        <textarea
          id="input"
          className="w-full h-32 p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}
      <div className="mb-4 flex flex-col gap-2">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="output" className="text-gray-700 dark:text-gray-300">Output</label>
        <textarea
          id="output"
          readOnly
          className="w-full h-32 p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:text-gray-200"
          value={output}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={toggleMode}
        >
          Switch to {mode === 'encrypt' ? 'Decrypt' : 'Encrypt'}
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={generateKeyPair}
        >
          {algorithm === 'aes-cbc' || algorithm === 'aes-gcm'
            ? 'Generate Key'
            : 'Generate Keys'}
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={saveCurrentKey}
        >
          Save Key
        </button>
        <button
          type="button"

          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          onClick={clear}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default AesCbcView;
