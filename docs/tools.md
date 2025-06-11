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
  generateGpgKeyPair,
  gpgEncrypt,
  gpgDecrypt,
} from '../model/aes';

const aesKey = generateAesKey();
const encrypted = await aes256CbcEncryptRandomIV(aesKey, 'hello');
const decrypted = await aes256CbcDecryptRandomIV(aesKey, encrypted);

const { publicKey, privateKey } = await generateRsaKeyPair();
const enc = await rsaOaepEncrypt(publicKey, 'secret');
const dec = await rsaOaepDecrypt(privateKey, enc);

const gpg = await generateGpgKeyPair();
const encGpg = await gpgEncrypt(gpg.publicKey, 'secret');
const decGpg = await gpgDecrypt(gpg.privateKey, encGpg);
```

Use the Crypto Lab tool to experiment with AES-CBC, AES-GCM, RSA-OAEP, and GPG RSA‑2048. Keys can be generated and saved as reusable chips during your session for quick switching between algorithms.

## Cookie Inspector

```tsx
import CookieInspectorPage from '../src/tools/cookie-inspector';
```

Use the Cookie Inspector to quickly view and filter cookies available to your session. You can export the visible cookies to a JSON file for debugging or QA reports.
Click any cookie name or value to copy it. Long values can be expanded inline, and exports are named using the current hostname and timestamp.
