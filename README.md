# MyDebugger – Free Online Developer Tools

**MyDebugger** bundles dozens of browser‑based utilities for debugging, QA and DevOps workflows. From JWT decoding and URL encoding to HTTP header analysis and regex testing, every tool runs fully client side. The site is statelessly deployed on Vercel so you can debug faster without installing anything.

Explore **25+ free debugging tools** right in your browser to troubleshoot web apps, harden security and boost your SEO performance.

## Table of Contents
- [Feature Highlights](#feature-highlights)
- [Project Architecture](#project-architecture)
- [Directory Layout](#directory-layout)
- [Quick Start](#quick-start)
- [Common Scripts](#common-scripts)
- [Testing & Quality Gate](#testing--quality-gate)
- [Adding a New Tool](#adding-a-new-tool)
- [Contributing](#contributing)
- [License](#license)

## Feature Highlights
- **JWT Toolkit** – decode, build and verify JSON Web Tokens
- **URL Encoder / Decoder** – encode or decode URL components
- **HTTP Headers Analyzer** – inspect request and response headers
- **Regex Tester** – live test regular expressions
- **Deep-Link QR Generator** – create QR codes for links or deep links
- **Click Jacking Validator** – detect frame busting issues
- **Dynamic-Link Probe** – simulate app links on iOS and Android
- **Dynamic Link Tracker** – capture UTM parameters in an overlay
- **Deep Link Chain** – follow redirects and export the chain
- **Cookie Inspector** – view, filter and export cookies
- **Cache Inspector** – analyze browser caching behaviour
- **Storage Sync Debugger** – inspect `localStorage` and `sessionStorage`
- **Virtual Name Card** – generate a shareable vCard and QR code
- **Cookie Scope** – visualize `document.cookie` with duplicates detection
- **CORS Tester** – debug CORS preflight responses
- **Crypto Lab** – experiment with AES, RSA and GPG routines
- **Pentest Validator Suite** – run basic security checks for any site
- **Header Scanner** – report on common security headers
- **Pre-rendering & SEO Meta Tester** – see how bots render your page
- **Fetch & Render Tool** – capture DOM after JS execution
- **Web Permission Tester** – request and inspect browser permissions

Read more in [docs/tools.md](docs/tools.md).

## Tools Overview
Below is a high‑signal map of each tool: route, primary files, and key capabilities. All paths are relative to `src/tools/{tool}`.

- AES‑CBC (`/aes-cbc`)
  - page: `aes-cbc/page.tsx`
  - hook: `aes-cbc/hooks/useAesCbc.ts`
  - lib: `aes-cbc/lib/aes.ts`
  - tests: `__tests__/aes.test.ts`, `__tests__/gpg.test.ts`
  - features: AES‑CBC/GCM, RSA, GPG, base64 utils, random IV

- Header Scanner (`/header-scanner`)
  - page: `header-scanner/page.tsx`
  - hook: `header-scanner/hooks/useHeaderScanner.ts`
  - lib: `header-scanner/lib/headerScanner.ts`
  - tests: `__tests__/headerScanner.test.ts`, models suites
  - features: Security headers (HSTS, CSP, XFO, XCTO), copy/export

- Deep Link Chain (`/deep-link-chain`)
  - page: `deep-link-chain/page.tsx`
  - hook: `deep-link-chain/hooks/useDeepLinkChain.ts`
  - lib: `deep-link-chain/lib/deepLinkChain.ts`
  - tests: `__tests__/deepLinkChain.test.ts`
  - features: Follow redirects, UTM parsing, OpenGraph probe

- Dynamic Link Probe (`/dynamic-link-probe`)
  - page: `dynamic-link-probe/page.tsx`
  - hook: `dynamic-link-probe/hooks/useDynamicLinkProbe.ts`
  - lib: `dynamic-link-probe/lib/dynamicLink.ts`
  - tests: `__tests__/dynamicLinkProbe.test.ts`
  - features: Firebase/branch‑style deep links, per‑platform resolution

- QR Code Generator (`/qrcode`)
  - page: `qrcode/QRCodeGenerator.tsx`
  - lib: `qrcode/lib/*` (styles, presets, png→pdf)
  - tests: `__tests__/qrcodePresets.test.ts`, `__tests__/qrStylePresets.test.ts`
  - features: text/URL/Wi‑Fi/phone/calendar iCal, batch, export PNG/SVG/PDF

- QR Scanner (`/qrscan`)
  - page: `qrscan/page.tsx`
  - hook: `qrscan/hooks/useQrscan.ts`
  - lib: `qrscan/lib/qrscan.ts`
  - tests: `__tests__/qrscan.test.ts`
  - features: camera scanning, file upload, history

- URL Utilities (`/url`)
  - page: `url/page.tsx`
  - lib: `url/lib/url.ts`
  - tests: `__tests__/url.test.ts`
  - features: safe query encoding, fragment preservation

- JSON Converter (`/json-converter`)
  - page: `json-converter/page.tsx`
  - hook: `json-converter/hooks/useJsonConverter.ts`
  - lib: `json-converter/lib/jsonConverter.ts`, `types.ts`
  - tests: `__tests__/jsonConverter.test.ts`
  - features: JSON→CSV/XML/YAML, flatten, Excel export

- CSV→Markdown (`/csvtomd`)
  - page: `csvtomd/page.tsx`
  - hook: `csvtomd/hooks/useCsvtomd.ts`
  - lib: `csvtomd/lib/csvtomd.ts`
  - tests: `__tests__/csvtomd.test.ts`
  - features: detect delimiter, render Markdown tables

- Cookie Inspector (`/cookie-inspector`)
  - page: `cookie-inspector/page.tsx`
  - hook: `cookie-inspector/hooks/useCookieInspector.ts`
  - lib: `cookie-inspector/lib/cookies.ts`
  - tests: `__tests__/cookies.test.ts`
  - features: list, filter, export cookies

- Cookie Scope (`/cookie-scope`)
  - page: `cookie-scope/page.tsx`
  - hook: `cookie-scope/hooks/useCookieScope.ts`
  - lib: `cookie-scope/lib/cookieScope.ts`
  - tests: `__tests__/cookieScope.test.ts`
  - features: parse `document.cookie`, detect duplicates

- Cache Inspector (`/cache-inspector`)
  - hook: `cache-inspector/hooks/useCacheInspector.ts`
  - lib: `cache-inspector/lib/cacheInspector.ts`
  - tests: `__tests__/cacheInspector.test.ts`
  - features: Cache API listing, export

- CORS Tester (`/cors-tester`)
  - page: `cors-tester/page.tsx`
  - hook: `cors-tester/hooks/useCorsTester.ts`
  - lib: `cors-tester/lib/cors.ts`
  - tests: `__tests__/cors.test.ts`
  - features: preflight OPTIONS, analysis, curl generation

- Storage Sync Debugger (`/storage-sync`)
  - page: `storage-sync/page.tsx`
  - hook: `storage-sync/hooks/useStorageDebugger.ts`
  - lib: `storage-sync/lib/storage.ts`
  - tests: `__tests__/storage.test.ts`, `useStorageDebugger.integration.test.tsx`
  - features: inspect local/session storage, diff/export/import

- Image Compressor (`/image-compressor`)
  - page: `image-compressor/page.tsx`
  - hook: `image-compressor/hooks/useImageCompressor.ts`
  - lib: `image-compressor/lib/imageCompressor.ts`
  - tests: `__tests__/imageCompressor.test.ts`
  - features: resize/quality, canvas fallback, JPEG/PNG

- Fetch & Render (`/fetch-render`)
  - page: `fetch-render/page.tsx`
  - hook: `fetch-render/hooks/useFetchRender.ts`
  - lib: uses `pre-rendering-tester/lib/prerender.ts`
  - tests: covered in integration suites
  - features: snapshot DOM with user‑agent, capture HTML + screenshot

- Pre‑rendering Tester (`/pre-rendering-tester`)
  - page: `pre-rendering-tester/page.tsx`
  - hook: `pre-rendering-tester/hooks/usePreRenderingTester.ts`
  - lib: `pre-rendering-tester/lib/prerender.ts`
  - tests: `__tests__/prerender.test.ts`
  - features: bot UA matrix, support detection

- Permission Tester (`/permission-tester`)
  - page: `permission-tester/page.tsx`
  - hook: `permission-tester/hooks/usePermissionTester.ts`
  - lib: `permission-tester/lib/permissions.ts`
  - tests: `__tests__/permissionTester.test.ts`
  - features: request/revoke guidance, live results

- Stay Awake (`/stayawake`)
  - page: `stayawake/page.tsx`
  - hook: `stayawake/hooks/useStayAwake.ts`
  - lib: `stayawake/lib/stayAwake.ts`, `stayawake/lib/stayAwakeStats.ts`
  - tests: `__tests__/stayAwake*.test.ts`
  - features: screen wake lock, usage stats, reset

- Linktracer / Device Trace (`/linktracer`, `/device-trace`)
  - hooks: `linktracer/hooks/useDeviceTrace.ts`
  - lib: `device-trace/lib/deviceTrace.ts`
  - tests: `__tests__/deviceTrace.test.ts`
  - features: environment, device/network info aggregation

- Pentest Suite (`/pentest`)
  - page: `pentest/page.tsx`
  - hook: `pentest/hooks/usePentestSuite.ts`
  - lib: `pentest/lib/pentest.ts`
  - tests: `__tests__/pentest.test.ts`
  - features: HTTPS redirect, headers, CORS, clickjacking checks

- JWT Toolkit (`/jwt`)
  - page: `jwt/page.tsx`, worker: `jwt/workers/cryptoWorker.ts`
  - tests: `__tests__/jwt.crypto.worker.test.ts`, `jwt.toolkit.test.tsx`
  - features: decode/verify/sign (HS/RS/ES), JWKS probe

- API Test / Repeater (`/api-test`)
  - page: `api-test/page.tsx`
  - hook: `api-test/hooks/useApiRepeater.ts`
  - lib: `api-test/lib/apiRepeater.ts`
  - tests: `__tests__/apiRepeater.test.ts`, `useApiRepeater.test.ts`
  - features: curl parsing, replay, log export

- API Simulator / WebSocket (`/api-simulator`)
  - lib: `api-simulator/lib/websocketSimulator.ts`
  - tests: `__tests__/websocketSimulator.test.ts`
  - features: payload conversion, hex/text

- Metadata Echo (`/metadata-echo`)
  - hook: `metadata-echo/hooks/useMetadataEcho.ts`
  - lib: `metadata-echo/lib/metadata.ts`
  - tests: `__tests__/metadata.test.ts`
  - features: basic/advanced metadata capture

- Networksuit (`/networksuit`)
  - hook: `networksuit/hooks/useNetworkSuite.ts`
  - lib: `networksuit/lib/networkSuite.ts`
  - tests: `__tests__/networkSuite.test.ts`
  - features: simple latency/throughput/availability checks

- Virtual Card (`/virtual-card`)
  - page: `virtual-card/page.tsx`
  - lib: `virtual-card/lib/virtualCard.ts`
  - tests: `__tests__/virtualCard.test.ts`
  - features: vCard generation, QR export

## Project Architecture
The codebase follows a feature‑first, per‑tool structure. Each tool is self‑contained under `src/tools/{tool}` with clear boundaries and minimal coupling. No server code – everything runs in the browser.

- pages: top‑level orchestrator for the tool route (e.g., `src/tools/aes-cbc/page.tsx`)
- components: presentational UI parts for that tool only
- hooks: stateful React hooks that contain tool logic and side effects
- lib: pure TypeScript utilities and business logic for that tool
- types: optional shared types for that tool

Shared systems:
- design‑system: reusable UI primitives and layout components
- shared: cross‑tool utilities, icons, helpers
- app/routes.tsx: SPA route table mapping tool routes to their pages

## Directory Layout
- src/tools/{tool}/
  - page.tsx
  - components/
  - hooks/
  - lib/
  - types.ts (optional)
- src/design-system/
- src/shared/
- src/app/routes.tsx
- __tests__/ (Vitest/Jest tests)

## Quick Start
1. Install **Node.js 18** and [**pnpm**](https://pnpm.io/) 8 or newer.
2. Clone this repository and install dependencies:
   ```bash
   pnpm install
   ```
3. Launch the development server:
   ```bash
   pnpm dev
   ```
4. Open <http://localhost:3000> and explore the tools under `/tools`.

Environment notes:
- Vite + React 18 + Tailwind CSS
- Fully client‑side; deployable on Vercel or any static host

## Common Scripts
```bash
pnpm build       # create a production build
pnpm preview     # locally preview the build
pnpm lint        # run ESLint
pnpm typecheck   # strict TypeScript checking
pnpm test        # run unit tests with coverage
```

Targeted testing during migration:
```bash
# run tests only for a specific tool by directory pattern
pnpm test -i -- src/tools/aes-cbc

# or by test name pattern
pnpm test -i -- --testPathPattern "(header-scanner|__tests__/headerScanner)"
```

## Testing & Quality Gate
Run the following commands before committing changes:
```bash
pnpm lint
pnpm typecheck
pnpm test --coverage
```

Success criteria:
- All tests pass (`pnpm test`)
- No console errors/warnings in `pnpm dev` across all tool pages
- Identical functionality vs production for each tool (manual smoke tests)
- Clean, consistent relative imports (no references to deprecated `model/`, `viewmodel/`, `view/`)

## Adding a New Tool
Create a new folder under `src/tools/{tool}` with this minimal structure:
```
src/tools/my-tool/
  page.tsx                 # orchestrator – imports hook + components
  hooks/useMyTool.ts       # state + actions, return { state, derived, actions }
  components/MyToolPanel.tsx
  lib/myTool.ts            # pure utility functions
  types.ts                 # (optional) local types
```

Routing: add your route in `src/app/routes.tsx` (path → page component).

Guidelines:
- Keep business logic in `lib/` and state transitions in `hooks/`
- Components should remain presentational; pass only the data and callbacks they need
- Prefer colocated types in `types.ts` when they are tool‑specific
- Reuse primitives from `src/design-system` and utilities from `src/shared`

Testing:
- Place unit tests in `__tests__/` targeting the new `lib/` and components
- For heavy UI, add provider wrappers or mocks as needed

## Contributing
Pull requests are welcome! For substantial changes, open an issue to discuss your idea first. Ensure the following pass before pushing:
```bash
pnpm lint
pnpm typecheck
pnpm test --coverage
```

Code style:
- Strongly typed public APIs (no `any` leaks)
- Meaningful names; early returns; guard edge cases first
- Keep components lean; move logic to hooks or `lib/`
- Avoid deep nesting; prefer smaller functions

## License
MIT
