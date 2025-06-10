# MyDebugger Tools

## Crypto Lab

```
import {
  aes256CbcEncryptRandomIV,
  aes256CbcDecryptRandomIV,
  aes256GcmEncryptRandomIV,
  aes256GcmDecryptRandomIV,
  generateAesKey,
  generateRsaKeyPair,
  rsaOaepEncrypt,
  rsaOaepDecrypt,
} from '../model/aes';

const aesKey = generateAesKey();
const encrypted = await aes256CbcEncryptRandomIV(aesKey, 'hello');
const decrypted = await aes256CbcDecryptRandomIV(aesKey, encrypted);

const { publicKey, privateKey } = await generateRsaKeyPair();
const enc = await rsaOaepEncrypt(publicKey, 'secret');
const dec = await rsaOaepDecrypt(privateKey, enc);
```

Use the Crypto Lab tool to experiment with AES-CBC, AES-GCM, and RSA-OAEP. You can generate keys and key pairs with a button and switch between encrypt and decrypt modes in real time.
