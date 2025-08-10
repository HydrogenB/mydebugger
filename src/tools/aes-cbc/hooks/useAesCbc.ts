/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState, useEffect } from 'react';
import {
  aes256CbcEncryptRandomIV,
  aes256CbcDecryptRandomIV,
  aes256GcmEncryptRandomIV,
  aes256GcmDecryptRandomIV,
  generateAesKey,
  generateRsaKeyPair,
  rsaOaepEncrypt,
  rsaOaepDecrypt,
  generateGpgKeyPair,
  gpgEncrypt,
  gpgDecrypt,
  base64ToBytes,
  bytesToBase64,
} from '../lib/aes';

export type AesMode = 'encrypt' | 'decrypt';
export type CryptoAlgorithm = 'aes-cbc' | 'aes-gcm' | 'rsa-oaep' | 'gpg-rsa-2048';
export type OutputFormat = 'base64' | 'hex' | 'utf-8';

export interface AesExample {
  label: string;
  key: string;
  plaintext: string;
}

const examples: AesExample[] = [
  {
    label: 'AES-256 (Random Key)',
    key: generateAesKey(32),
    plaintext: 'hello world',
  },
  {
    label: 'AES-128 (Predefined)',
    key: '1234567890abcdef',
    plaintext: 'test data',
  },
  {
    label: 'CBC Mode (Template)',
    key: 'abcdefghijklmnop',
    plaintext: 'sample text',
  },
];

export const useAesCbc = () => {
  const [key, setKey] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<AesMode>('encrypt');
  const [error, setError] = useState('');
  const [exampleIndex, setExampleIndex] = useState<number | null>(null);
  const [algorithm, setAlgorithm] = useState<CryptoAlgorithm>('aes-cbc');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const [savedKeyPairs, setSavedKeyPairs] = useState<{ publicKey: string; privateKey: string }[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('base64');
  const [toastMessage, setToastMessage] = useState('');


  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setError('');
      if (!input) {
        setOutput('');
        setError('Input is required');
        return;
      }
      try {
        let result = '';
        if (algorithm === 'aes-cbc') {
          if (!key) throw new Error('Key must not be empty');
          if (![16, 24, 32].includes(key.length))
            throw new Error('Key must be 16, 24, or 32 characters');
          result =
            mode === 'encrypt'
              ? await aes256CbcEncryptRandomIV(key, input)
              : await aes256CbcDecryptRandomIV(key, input);
        } else if (algorithm === 'aes-gcm') {
          if (!key) throw new Error('Key must not be empty');
          if (![16, 24, 32].includes(key.length))
            throw new Error('Key must be 16, 24, or 32 characters');
          result =
            mode === 'encrypt'
              ? await aes256GcmEncryptRandomIV(key, input)
              : await aes256GcmDecryptRandomIV(key, input);
        } else if (algorithm === 'rsa-oaep') {
          if (mode === 'encrypt') {
            if (!publicKey) throw new Error('Public key is required');
            result = await rsaOaepEncrypt(publicKey, input);
          } else {
            if (!privateKey) throw new Error('Private key is required');
            result = await rsaOaepDecrypt(privateKey, input);
          }
        } else if (algorithm === 'gpg-rsa-2048') {
          if (mode === 'encrypt') {
            if (!publicKey) throw new Error('Public key is required');
            result = await gpgEncrypt(publicKey, input);
          } else {
            if (!privateKey) throw new Error('Private key is required');
            result = await gpgDecrypt(privateKey, input);
          }
        }

        if (!cancelled) {
          const bytes =
            mode === 'encrypt' && algorithm !== 'gpg-rsa-2048'
              ? base64ToBytes(result)
              : new TextEncoder().encode(result);
          let formatted = result;
          if (outputFormat === 'hex') {
            formatted = Array.from(bytes)
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
          } else if (outputFormat === 'base64') {
            formatted = algorithm === 'gpg-rsa-2048' && mode === 'encrypt'
              ? bytesToBase64(bytes)
              : result;
            if (mode === 'decrypt' || algorithm === 'gpg-rsa-2048') {
              formatted = bytesToBase64(bytes);
            }
          } else if (outputFormat === 'utf-8') {
            formatted = new TextDecoder().decode(bytes);
          }
          setOutput(formatted);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [key, publicKey, privateKey, input, mode, algorithm, outputFormat]);

  useEffect(() => {
    if (exampleIndex === null || algorithm !== 'aes-cbc') return;

    const ex = examples[exampleIndex];
    setKey(ex.key);
    setError('');
    if (mode === 'encrypt') {
      setInput(ex.plaintext);
    } else {
      aes256CbcEncryptRandomIV(ex.key, ex.plaintext).then(setInput);
    }
  }, [exampleIndex, mode, algorithm]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const t = setTimeout(() => setToastMessage(''), 2000);
    return () => clearTimeout(t);
  }, [toastMessage]);


  const toggleMode = () => {
    setMode(prev => (prev === 'encrypt' ? 'decrypt' : 'encrypt'));
    setInput('');
    setOutput('');
    setError('');
  };

  const generateKeyPair = async () => {
    setError('');
    if (algorithm === 'rsa-oaep') {
      const { publicKey: pub, privateKey: priv } = await generateRsaKeyPair();
      setPublicKey(pub);
      setPrivateKey(priv);
    } else if (algorithm === 'gpg-rsa-2048') {
      const { publicKey: pub, privateKey: priv } = await generateGpgKeyPair();
      setPublicKey(pub);
      setPrivateKey(priv);
    } else {
      setKey(generateAesKey(32));
    }
  };

  const saveCurrentKey = () => {
    if (algorithm === 'rsa-oaep' || algorithm === 'gpg-rsa-2048') {
      if (!publicKey || !privateKey) return;
      setSavedKeyPairs(prev => [...prev, { publicKey, privateKey }]);
    } else if (key) {
      setSavedKeys(prev => [...prev, key]);
    }
    setToastMessage('Key saved to session');
  };

  const selectSavedKey = (idx: number) => {
    if (algorithm === 'rsa-oaep' || algorithm === 'gpg-rsa-2048') {
      const kp = savedKeyPairs[idx];
      if (!kp) return;
      setPublicKey(kp.publicKey);
      setPrivateKey(kp.privateKey);
    } else {
      const k = savedKeys[idx];
      if (!k) return;
      setKey(k);
    }
    setError('');
  };

  const discardSavedKey = (idx: number) => {
    if (algorithm === 'rsa-oaep' || algorithm === 'gpg-rsa-2048') {
      setSavedKeyPairs(prev => prev.filter((_, i) => i !== idx));
    } else {
      setSavedKeys(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setToastMessage('Output copied');
    } catch {
      setToastMessage('Clipboard access denied');
    }
  };


  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
    setExampleIndex(null);
    setPublicKey('');
    setPrivateKey('');
    setToastMessage('');

  };

  return {
    key,
    input,
    output,
    mode,
    algorithm,
    error,
    publicKey,
    privateKey,

    setKey,
    setInput,
    examples,
    exampleIndex,
    setExampleIndex,
    toggleMode,
    setAlgorithm,
    setPublicKey,
    setPrivateKey,
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

    clear,
  };
};

export default useAesCbc;
