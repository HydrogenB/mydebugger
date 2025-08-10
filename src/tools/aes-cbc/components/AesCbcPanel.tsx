/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { Button, TextInput, SelectInput } from '../../../design-system/components/inputs';
import { InfoBox } from '../../../design-system/components/display/InfoBox';
import {
  AesMode,
  AesExample,
  CryptoAlgorithm,
  OutputFormat,
} from '../hooks/useAesCbc';

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

  outputFormat: OutputFormat;
  setOutputFormat: (f: OutputFormat) => void;
  toastMessage: string;
  copyOutput: () => void;

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

  outputFormat,
  setOutputFormat,
  toastMessage,
  copyOutput,

  toggleMode,
  clear,
}: Props) {
  return (
    <div className={`${TOOL_PANEL_CLASS} space-y-4`}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Crypto Lab</h2>
      {toastMessage && (
        <div
          role="status"
          className="fixed top-20 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out"
        >
          {toastMessage}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <SelectInput
          id="algo"
          label="Algorithm"
          value={algorithm}
          onChange={v => setAlgorithm(v as CryptoAlgorithm)}
          options={[
            { value: 'aes-cbc', label: 'AES-256-CBC' },
            { value: 'aes-gcm', label: 'AES-256-GCM' },
            { value: 'rsa-oaep', label: 'RSA-OAEP' },
            { value: 'gpg-rsa-2048', label: 'GPG RSA-2048' },
          ]}
        />
        <SelectInput
          id="format"
          label="Output Format"
          value={outputFormat}
          onChange={v => setOutputFormat(v as OutputFormat)}
          options={[
            { value: 'base64', label: 'Base64' },
            { value: 'hex', label: 'Hex' },
            { value: 'utf-8', label: 'UTF-8' },
          ]}
        />
      </div>
      {algorithm === 'rsa-oaep' || algorithm === 'gpg-rsa-2048' ? (
        <>
          <div className="space-y-4">
            <div>
            <label htmlFor="public" className="sr-only">
              Public Key
              <textarea
                id="public"
                className="w-full h-32 resize-y p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                placeholder="Paste public key PEM"
                value={publicKey}
                onChange={e => setPublicKey(e.target.value)}
              />
            </label>
            </div>
            <div>
            <label htmlFor="private" className="sr-only">
              Private Key
              <textarea
                id="private"
                className="w-full h-32 resize-y p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                placeholder="Paste private key PEM"
                value={privateKey}
                onChange={e => setPrivateKey(e.target.value)}
              />
            </label>
            </div>
          </div>
          {savedKeyPairs.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {savedKeyPairs.map((kp, idx) => (
                <span
                  key={kp.publicKey}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded flex items-center gap-1 text-sm"
                >
                  <button
                    type="button"
                    onClick={() => selectSavedKey(idx)}
                    className="focus:outline-none"
                    aria-label={`Use saved key ${idx + 1}`}
                    title={`Use saved key ${idx + 1}`}
                  >
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
          <TextInput
            id="key"
            label="Key"
            value={keyValue}
            onChange={e => setKey(e.target.value)}
            placeholder="32 character key"
            fullWidth
          />
          <SelectInput
            id="example"
            label="Examples"
            value={exampleIndex === null ? '' : exampleIndex.toString()}
            onChange={v => setExampleIndex(v === '' ? null : Number(v))}
            options={examples.map((ex, idx) => ({ value: idx.toString(), label: ex.label }))}
            placeholder="Custom..."
          />
          {savedKeys.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {savedKeys.map((k, idx) => (
                <span
                  key={k}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded flex items-center gap-1 text-sm"
                >
                  <button
                    type="button"
                    onClick={() => selectSavedKey(idx)}
                    className="focus:outline-none"
                    aria-label={`Use saved key ${idx + 1}`}
                    title={`Use saved key ${idx + 1}`}
                  >
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
        <label htmlFor="input" className="text-gray-700 dark:text-gray-300">
          {mode === 'encrypt' ? 'Plain Text' : 'Encrypted Text'}
          <textarea
            id="input"
            className="w-full min-h-[8rem] resize-y p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <InfoBox title="Error" variant="error" className="mb-4">
          {error}
        </InfoBox>
      )}
      <div className="mb-4 flex flex-col gap-2">
        <span className="font-semibold text-gray-700 dark:text-gray-300">Mode: {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</span>
        <label htmlFor="output" className="text-gray-700 dark:text-gray-300">
          Output
          <textarea
            id="output"
            readOnly
            className="w-full min-h-[8rem] resize-y p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:text-gray-200"
            value={output}
          />
        </label>
        <Button variant="secondary" size="sm" onClick={copyOutput} className="self-start">
          📋 Copy
        </Button>
      </div>
      <div className="flex flex-col gap-2 flex-wrap md:flex-nowrap md:flex-row">
        <Button variant="primary" onClick={toggleMode}>
          Switch to {mode === 'encrypt' ? 'Decrypt' : 'Encrypt'}
        </Button>
        <Button variant="success" onClick={generateKeyPair}>
          {algorithm === 'aes-cbc' || algorithm === 'aes-gcm' ? 'Generate Key' : 'Generate Keys'}
        </Button>
        <Button variant="info" onClick={saveCurrentKey}>Save Key</Button>
        <Button variant="secondary" onClick={clear}>Clear</Button>
      </div>
    </div>
  );
}

export default AesCbcView;
