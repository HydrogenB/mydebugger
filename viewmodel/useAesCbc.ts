/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState, useEffect } from 'react';
import {
  aes256CbcEncryptRandomIV,
  aes256CbcDecryptRandomIV,
} from '../model/aes';

export type AesMode = 'encrypt' | 'decrypt';

export interface AesExample {
  label: string;
  key: string;
  plaintext: string;
}

const examples: AesExample[] = [
  {
    label: 'Example (32 byte key)',
    key: '12345678901234567890123456789012',
    plaintext: 'hello world',
  },
  {
    label: 'Example (16 byte key)',
    key: '1234567890abcdef',
    plaintext: 'test data',
  },
];

export const useAesCbc = () => {
  const [key, setKey] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<AesMode>('encrypt');
  const [error, setError] = useState('');
  const [exampleIndex, setExampleIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!key || !input) {
        setOutput('');
        return;
      }
      try {
        const result =
          mode === 'encrypt'
            ? await aes256CbcEncryptRandomIV(key, input)
            : await aes256CbcDecryptRandomIV(key, input);
        if (!cancelled) setOutput(result);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [key, input, mode]);

  useEffect(() => {
    if (exampleIndex === null) return;
    const ex = examples[exampleIndex];
    setKey(ex.key);
    setError('');
    if (mode === 'encrypt') {
      setInput(ex.plaintext);
    } else {
      aes256CbcEncryptRandomIV(ex.key, ex.plaintext).then(setInput);
    }
  }, [exampleIndex, mode]);

  const toggleMode = () => {
    setMode(prev => (prev === 'encrypt' ? 'decrypt' : 'encrypt'));
    setInput('');
    setOutput('');
    setError('');
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return {
    key,
    input,
    output,
    mode,
    error,
    setKey,
    setInput,
    examples,
    exampleIndex,
    setExampleIndex,
    toggleMode,
    clear,
  };
};

export default useAesCbc;
