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
import CookieInspectorPage from "../src/tools/cookie-inspector";
```

Use the Cookie Inspector to quickly view and filter cookies available to your session. You can export the visible cookies to a JSON file for debugging or QA reports.
Click any cookie name or value to copy it. Long values can be expanded inline, and exports are named using the current hostname and timestamp.

## Cache Inspector

```tsx
import CacheInspectorPage from "../src/tools/cache-inspector";
```

Use the Cache Inspector to analyze caching behaviour for resources loaded in your session. It now shows cache freshness badges (`FRESH`, `STALE`, `EXPIRED`, `NO-CACHE`), lists matching Service Worker cache names, and annotates whether a resource came from the network or memory. Results can be exported to a timestamped JSON file grouped by domain.

## Cookie Scope

```tsx
import CookieScopePage from "../src/tools/cookie-scope";
```

Cookie Scope visualizes cookies from `document.cookie` directly in the browser. It highlights cookies with the same name across different paths or domains and detects SameSite inconsistencies.
Use the debounced search bar to filter, toggle visibility of HttpOnly cookies, and copy or export the table as JSON or HAR without any network requests.

## Pentest Validator Suite

```tsx
import PentestSuitePage from "../src/tools/pentest/page";
```

The Pentest Validator Suite runs a set of lightweight client‑side checks against any public URL. It tests HTTPS redirection, basic CORS policy, open redirects, reflected XSS and clickjacking protections. Results may be inconclusive when a site blocks cross‑origin access.
Each validator is displayed on a single page with preview iframes so you can observe redirects and payload reflection directly in the browser.
You can tweak the open redirect parameter and the XSS payload, and expand per-test logs for more detail.

## Storage Sync Debugger

```tsx
import StorageSyncPage from "../src/tools/storage-sync";
```

Use the Storage Sync Debugger to inspect and modify `localStorage` and `sessionStorage` in real time. Entries update live across tabs thanks to the browser `storage` event. Data can be exported as JSON for further analysis.

Advanced features include a live sync monitor across tabs, inline JSON validation, `.env` export and a diff mode that compares your storage with another tab using the BroadcastChannel API.

## Header Scanner

```tsx
import HeaderScannerPage from "../src/tools/header-scanner/page";
```

The Header Scanner fetches a URL and analyzes common security headers like CSP, X-Frame-Options and HSTS. Results are shown with status chips and quick fix tips. You can copy header values or export the full report as JSON for audits.

## CORS Tester

```tsx
import CorsTesterPage from "../src/tools/cors-tester";
```

Use the CORS Tester to simulate preflight requests and inspect the `Access-Control-*` headers returned by a server. Enter a target URL, HTTP method and custom headers to see how the server responds and whether your origin is permitted.
Common CORS mistakes are highlighted with inline tips and a list of browsers that would block the request. You can quickly add preset headers from a dropdown and copy a generated `curl` command to reproduce the request locally.

## Dynamic Link Tracker

```tsx
import DynamicLinkProbePage from "../src/tools/dynamic-link-probe/page";
```

Parse query parameters from any URL and save them to `sessionStorage` for later debugging. Open a page with `?debug=true` to display an overlay containing the tracked parameters and current route. Useful for QA when testing marketing links or QR codes.

## Deep Link Chain

```tsx
import DeepLinkChainPage from "../src/tools/deep-link-chain/page";
```

Follow and visualize the redirect chain for any URL entirely in the browser. The tool lists each hop with status codes and headers, highlights the final destination and extracts any UTM parameters present. Long chains collapse automatically with an option to expand. If fetch is blocked by CORS the tool attempts a browser-only fallback. The final URL displays an Open Graph preview when accessible. Results can be exported or copied as a Markdown table.

## Dynamic-Link Probe

```tsx
import DeviceTracePage from "../src/tools/device-trace/page";
```

Simulate how OneLink or custom dynamic URLs behave across iOS and Android with or without your app installed. Provide optional app identifiers and a deep-link scheme to verify that redirects land on the correct store page or launch the app as expected.
Results can be copied to the clipboard or downloaded as JSON for further analysis. Access this tool at `/device-trace`.

## Virtual Name Card

```tsx
import VirtualCardPage from "../src/tools/virtual-card/page";
```

Create a shareable contact card completely in-browser. The tool generates a `.vcf` download, QR code, and URL with base64 encoded data that pre-fills the form when opened.
Access this tool at `/vcard`.
## Pre-rendering Tester

```tsx
import PreRenderingTesterPage from '../src/tools/pre-rendering-tester/page';
```

Fetch HTML snapshots for any URL using multiple user-agent headers. Compare the page title, description and first H1 tag across crawlers or browsers. Results can be exported as raw markup or JSON.

## Fetch & Render Tool

```tsx
import FetchRenderPage from '../src/tools/fetch-render/page';
```

Simulate JavaScript rendering in a sandboxed iframe. Set a timeout before capture, inspect console output and export the rendered DOM to clipboard or file for further analysis.
