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
- [QR Scanner](#qr-scanner)
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
- [Stay Awake Toggle](#stay-awake-toggle)
- [URL Encoder / Decoder](#url-encoder--decoder)
- [Virtual Name Card](#virtual-name-card)
- [Web Permission Tester](#web-permission-tester)
- [Generate Large Image](#generate-large-image)
- [API Simulator](#api-simulator)
- [API Request Repeater](#api-request-repeater)
- [Network Test Suite](#network-test-suite)
- [Image Compressor](#image-compressor)
- [Metadata Echo](#metadata-echo)
- [WebSocket Simulator](#websocket-simulator)
- [CSV to Markdown Converter](#csv-to-markdown-converter)
- [JSON to CSV / Excel Converter](#json-to-csv--excel-converter)

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

## Click Jacking Validator

```tsx
import ClickJackingValidator from "../src/tools/clickjacking";
```

Check whether a website can be safely embedded in an iframe. The tool fetches the target URL, evaluates `X-Frame-Options` and `Content-Security-Policy` headers and attempts to load the page in a sandboxed frame. Results highlight potential vulnerabilities and can be exported as JSON.

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

## Stay Awake Toggle

```tsx
import StayAwakePage from "../src/tools/stayawake/page";
```

Prevent your screen from sleeping using the Wake Lock API. Set a timer from quick presets or a custom duration and watch the progress ring count down. Awake minutes are tracked in local storage so you can review today's and this week's totals. Access this tool at `/stayawake`.


## Header Scanner

```tsx
import HeaderScannerPage from "../src/tools/header-scanner/page";
```

The Header Scanner fetches a URL and analyzes common security headers like CSP, X-Frame-Options and HSTS. Results are shown with status chips and quick fix tips. You can copy header values or export the full report as JSON for audits.

## HTTP Headers Analyzer

```tsx
import HeadersAnalyzer from "../src/tools/headers";
```

Inspect request and response headers for any endpoint. The analyzer groups headers by category, lets you filter by name and provides quick descriptions of what each header does. Results can be copied or saved as JSON.

## JWT Toolkit

```tsx
import JwtToolkit from "../src/tools/jwt/JwtToolkit";
```

Decode, build and verify JSON Web Tokens right in the browser. Load JWKS or secret keys, edit claims with a guided wizard and benchmark different algorithms. The toolkit is fully client side so no token data ever leaves your browser.

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

## Web Permission Tester

```tsx
import PermissionTesterPage from "../src/tools/permission-tester/page";
```

Request and inspect browser permissions such as geolocation, notifications or clipboard access. The tester logs permission state changes, generates copyable code snippets and allows retrying denied permissions.

## Pre-rendering & SEO Meta Tester

```tsx
import PreRenderingTesterPage from "../src/tools/pre-rendering-tester/page";
```

Analyze how Googlebot, Bingbot, FacebookBot and real browsers render your page metadata. Fetch HTML snapshots, compare title, description and H1 consistency, then export results or raw markup for further debugging.

## Regex Tester

```tsx
import RegexTester from "../src/tools/regex";
```

Test and debug regular expressions with instant feedback. Enter a pattern and sample text to see all matches with index positions and capture groups. Invalid patterns display clear error messages.

## Fetch & Render Tool

```tsx
import FetchRenderPage from "../src/tools/fetch-render/page";
```

Simulate JavaScript rendering in a sandboxed iframe. Set a timeout before capture, inspect console output and export the rendered DOM to clipboard or file for further analysis.

## Deep-Link QR Generator

```tsx
import QRCodeGeneratorPage from "../src/tools/qrcode/QRCodeGenerator";
```

Generate QR codes for links or other data types like plain text, phone numbers, Wi-Fi credentials, geographic coordinates and calendar events. The tool auto-encodes URLs, shows a real-time preview and lets you open or share the link instantly. Choose from ten visual presets, tweak dot/eye styles, gradients and upload a center logo. Export your QR in **PNG**, **SVG** or **PDF**. Access it at `/qrcode`.

This generator now ships with **40 curated style presets** for instant visual theming. Choose a preset to apply matching colors in one click.

## QR Scanner

```tsx
import QrscanPage from "../src/tools/qrscan/page";
```

Use your device camera to scan QR codes directly in the browser. The scanner works offline and supports flipping between available cameras. Access it at `/qrscan`.

## URL Encoder / Decoder

```tsx
import UrlEncoderPage from "../src/tools/url/UrlEncoder";
```

Quickly encode or decode URL components. Choose between `encodeURIComponent`, `encodeURI` or legacy `escape`. Batch mode processes each line separately. Access it at `/url-encoder`.

## PWA Push Tester

```tsx
import PushTesterPage from "../src/tools/push-tester/page";
```

Verify browser support for Service Workers and Web Push, create a push subscription with your own VAPID public key and send a test notification via an in-house edge function. Access this tool at `/push-tester`.

## Generate Large Image

```tsx
import GenerateLargeImagePage from "../src/tools/generate-large-image/page";
```

Generate dummy image files of 1MB, 5MB or 10MB for testing upload limits. Upload any small JPG or PNG (≤1MB) and expand it right in the browser. Access this tool at `/generate-large-image`.
The interface now features a drag‑and‑drop upload area, a progress bar for generation and improved layout on larger screens.

## API Simulator

```html
<!-- pages/index.html -->
```

Simulate API responses entirely in the browser. Encode JSON to Base64, adjust delay and status codes, or enable random error injection. A preset dropdown lets you instantly load common scenarios. The page also generates a ready-to-run cURL command. Access it at `/api-simulator` when deployed to Vercel or served locally.

## API Request Repeater

```tsx
import ApiTestPage from "../src/tools/api-test/page";
```

Paste a full HTTP `curl` command, set a delay and repeatedly send the request using `fetch` in the browser. Requests and responses are logged live and can be exported to a `.txt` file. Access this tool at `/api-test`.

## Network Test Suite

```tsx
import NetworkSuitePage from '../src/tools/networksuit/page';
```

Run quick network diagnostics entirely in the browser. It detects your connection type and technology tier, measures round-trip ping latency and estimates download throughput using a small test file. Access this tool at `/networksuit`.
The UI integrates card components with progress bars and badges for a streamlined experience.
## Image Compressor

```tsx
import ImageCompressorPage from "../src/tools/image-compressor/page";
```

Compress JPG or PNG files entirely in the browser. Choose a target file size in kilobytes,
resize the resolution or reduce color depth before downloading the optimized image.
The tool also reveals the Base64 representation of the compressed output. Access it at `/image-compressor`.

## Metadata Echo

```tsx
import MetadataEchoPage from "../src/tools/metadata-echo/page";
```

Display client metadata such as user agent, platform, timezone and screen resolution. Optionally load advanced details like network connection, battery status or geolocation. Access it at `/metadata-echo`.
Unavailable fields show a short error reason instead of being hidden.

## WebSocket Simulator

```tsx
import WebsocketSimulatorPage from "../src/tools/websocket-simulator";
```

Paste a `curl wss://...` command and emulate NATS-style PUB messages in the browser. 
Input payloads in text or HEX, queue multiple messages and transmit on a set interval. 
Sent and received data are logged live and can be exported as a `.txt` file. 
The last used profile is saved to `localStorage` for convenience.

## CSV to Markdown Converter

```tsx
import CsvtomdPage from "../src/tools/csvtomd/page";
```

Upload or paste a CSV and convert it to a GitHub-flavored Markdown table. Each
column's alignment can be toggled between left, center and right. The generated
Markdown can be copied or downloaded as a `.md` file. Access this tool at
`/csvtomd`.

## JSON to CSV / Excel Converter

```tsx
import JsonConverterPage from "../src/tools/json-converter/page";
```

Paste or upload JSON data and convert it into CSV or Excel. Advanced output
options let you pick delimiters, quote style, and date formatting. You can
flatten nested objects, suppress newlines and choose line endings. The converted
data can be copied or downloaded as `.csv` or `.xlsx` at `/json-converter`.
Files over **20MB** are rejected with an error. While parsing big JSON you will
see a spinner, and only the first 50 rows are previewed when data exceeds 10k
entries.
