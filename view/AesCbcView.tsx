/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { AesMode, AesExample } from '../viewmodel/useAesCbc';

interface Props {
  keyValue: string;
  input: string;
  output: string;
  mode: AesMode;
  error: string;
  examples: AesExample[];
  exampleIndex: number | null;
  setKey: (v: string) => void;
  setInput: (v: string) => void;
  setExampleIndex: (i: number | null) => void;
  toggleMode: () => void;
  clear: () => void;
}

export function AesCbcView({
  keyValue,
  input,
  output,
  mode,
  error,
  examples,
  exampleIndex,
  setKey,
  setInput,
  setExampleIndex,
  toggleMode,
  clear,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">AES-256 CBC</h2>
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
