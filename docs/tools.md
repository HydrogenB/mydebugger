# MyDebugger Tools

This page explains every built-in tool. Each lives under `src/tools/<name>` and is available in the browser at `/tools/<name>`. When running the development server (`pnpm dev`) you can browse them at <http://localhost:3000/tools>.

Every section starts with an import snippet showing the component location so you can embed it elsewhere or customize it. Use the list below to jump directly to any tool.

## Table of Contents

- [Cache Inspector](#cache-inspector)
- [Click Jacking Validator](#click-jacking-validator)
- [Cookie Inspector](#cookie-inspector)
- [Cookie Scope](#cookie-scope)
- [CORS Tester](#cors-tester)
- [Crypto Lab](#crypto-lab)
- [Deep Link Chain](#deep-link-chain)
- [Deep-Link QR Generator](#deep-link-qr-generator)
- [Dynamic Link Tracker](#dynamic-link-tracker)
- [Dynamic-Link Probe](#dynamic-link-probe)
- [Fetch & Render Tool](#fetch--render-tool)
- [Header Scanner](#header-scanner)
- [HTTP Headers Analyzer](#http-headers-analyzer)
- [JWT Toolkit](#jwt-toolkit)
- [Pentest Validator Suite](#pentest-validator-suite)
- [Pre-rendering & SEO Meta Tester](#pre-rendering--seo-meta-tester)
- [Regex Tester](#regex-tester)
- [Storage Sync Debugger](#storage-sync-debugger)
- [URL Encoder / Decoder](#url-encoder--decoder)
- [Virtual Name Card](#virtual-name-card)
- [Web Permission Tester](#web-permission-tester)
- [Generate Large Image](#generate-large-image)
- [Image Compressor](#image-compressor)

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

Use the Cache Inspector to analyze caching behaviour for resources loaded in your session. It now shows cache freshness badges (`FRESH`, `STALE`, `EXPIRED`, `NO-CACHE`), lists matching Service Worker cache names, and annotates whether a resource came from the network or memory. A summary panel highlights totals per resource type and overall freshness. Results can be exported to JSON or CSV and you can copy a sharable link to revisit the inspection later.

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
The UI now includes a debounced search box to quickly filter keys and values.

## Header Scanner

```tsx
import HeaderScannerPage from "../src/tools/header-scanner/page";
```

The Header Scanner fetches a URL and analyzes common security headers like CSP, X-Frame-Options and HSTS. Results are shown with status chips and quick fix tips. You can copy header values or export the full report as JSON for audits.

## CORS Tester

```tsx
import CorsTesterPage from "../src/tools/cors-tester";
```

The CORS Tester is a full-featured debugger for cross-origin issues. Enter a URL, choose the HTTP method and build headers in key/value or JSON format. Toggle between browser mode and a server-side curl simulation. Results are shown with color-coded badges, a header diff table and quick configuration tips. You can expand the raw request and copy a generated `curl` command for backend testing.

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
It now supports organization, title, website and address fields, renders a preview business card and can download the card as a PNG image. Opening a link with `?data=` switches to view-only mode showing just the card.
Access this tool at `/vcard`.
## Pre-rendering & SEO Meta Tester

```tsx
import PreRenderingTesterPage from '../src/tools/pre-rendering-tester/page';
```

Analyze how Googlebot, Bingbot, FacebookBot and real browsers render your page metadata. Fetch HTML snapshots, compare title, description and H1 consistency, then export results or raw markup for further debugging.

## Fetch & Render Tool

```tsx
import FetchRenderPage from '../src/tools/fetch-render/page';
```

Simulate JavaScript rendering in a sandboxed iframe. Set a timeout before capture, inspect console output and export the rendered DOM to clipboard or file for further analysis.

## Deep-Link QR Generator

```tsx
import QRCodeGeneratorPage from "../src/tools/qrcode/QRCodeGenerator";
```

Generate QR codes for links or other data types like plain text, phone numbers, Wi-Fi credentials, geographic coordinates and calendar events. The tool auto-encodes URLs, shows a real-time preview and lets you open or share the link instantly. Choose from ten visual presets, tweak dot/eye styles, gradients and upload a center logo. Export your QR in **PNG**, **SVG** or **PDF**. Access it at `/qrcode`.

This generator now ships with **40 curated style presets** for instant visual theming. Choose a preset to apply matching colors in one click.

## URL Encoder / Decoder

```tsx
import UrlEncoderPage from "../src/tools/url/UrlEncoder";
```

Quickly encode or decode URL components. Choose between `encodeURIComponent`, `encodeURI` or legacy `escape`. Batch mode processes each line separately. Access it at `/url-encoder`.

## PWA Push Tester

```tsx
import PushTesterPage from '../src/tools/push-tester/page';
```

Verify browser support for Service Workers and Web Push, create a push subscription with your own VAPID public key and send a test notification via an in-house edge function. Access this tool at `/push-tester`.


## Generate Large Image

```tsx
import GenerateLargeImagePage from '../src/tools/generate-large-image/page';
```

Generate dummy image files of 1MB, 5MB or 10MB for testing upload limits. Upload any small JPG or PNG (≤1MB) and expand it right in the browser. Access this tool at `/generate-large-image`.
The interface now features a drag‑and‑drop upload area, a progress bar for generation and improved layout on larger screens.

## Image Compressor

```tsx
import ImageCompressorPage from '../src/tools/image-compressor/page';
```

Compress JPG or PNG files entirely in the browser. Choose a target file size in kilobytes,
resize the resolution or reduce color depth before downloading the optimized image.
The tool also reveals the Base64 representation of the compressed output and shows a side-by-side preview. You can export a Flutter code snippet reflecting your chosen settings to reuse in a mobile app. Access it at `/image-compressor`.
