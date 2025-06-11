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
} from '../model/aes';

export type AesMode = 'encrypt' | 'decrypt';
export type CryptoAlgorithm = 'aes-cbc' | 'aes-gcm' | 'rsa-oaep' | 'gpg-rsa-2048';

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
  const [algorithm, setAlgorithm] = useState<CryptoAlgorithm>('aes-cbc');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const [savedKeyPairs, setSavedKeyPairs] = useState<{ publicKey: string; privateKey: string }[]>([]);


  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!input) {
        setOutput('');
        return;
      }
      try {
        let result = '';
        if (algorithm === 'aes-cbc') {
          if (!key) throw new Error('Key must not be empty');
          result =
            mode === 'encrypt'
              ? await aes256CbcEncryptRandomIV(key, input)
              : await aes256CbcDecryptRandomIV(key, input);
        } else if (algorithm === 'aes-gcm') {
          if (!key) throw new Error('Key must not be empty');
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

        if (!cancelled) setOutput(result);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [key, publicKey, privateKey, input, mode, algorithm]);

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


  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
    setExampleIndex(null);
    setPublicKey('');
    setPrivateKey('');

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

    clear,
  };
};

export default useAesCbc;
