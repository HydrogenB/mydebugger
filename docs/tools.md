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

## Pentest Validator Suite

```tsx
import PentestSuitePage from '../src/tools/pentest/page';
```

The Pentest Validator Suite runs a set of lightweight client‑side checks against any public URL. It tests HTTPS redirection, basic CORS policy, open redirects, reflected XSS and clickjacking protections. Results may be inconclusive when a site blocks cross‑origin access.
Each validator is displayed on a single page with preview iframes so you can observe redirects and payload reflection directly in the browser.
You can tweak the open redirect parameter and the XSS payload, and expand per-test logs for more detail.

## Header Scanner

```tsx
import HeaderScannerPage from '../src/tools/header-scanner/page';
```

The Header Scanner fetches a URL and analyzes common security headers like CSP, X-Frame-Options and HSTS. Results are shown with status chips and quick fix tips. You can copy header values or export the full report as JSON for audits.
