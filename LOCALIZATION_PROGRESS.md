MyDebugger Localization Rollout Plan (EN/TH)

Goal: Centralize translations in `public/translation.json` and enable TH/EN toggle from header across all modules.

Status Legend
- [x] Done
- [ ] Not started
- [~] In progress / partial

Foundation
- [x] Translation context provider (`src/context/TranslationContext.tsx`) with `t(key, fallback)` and localStorage persistence
- [x] Header language toggle (`src/components/LanguageToggle.tsx`) and integration in `src/layout/Header.tsx`
- [x] Central translations file `public/translation.json` (EN/TH)
- [x] Footer localized (`src/layout/Footer.tsx`)

Core Pages
- [~] Home (`src/pages/Home.tsx`)
  - [x] Hero title, search placeholder/ARIA, chips and tabs, result counter, empty state, CTA
  - [x] Category names and counts
  - [x] Card tool fields (uses fallback; per-tool keys can be added later)
  - [ ] Replace remaining strings if any regress during QA
- [ ] Privacy Policy (`src/pages/PrivacyPolicy.tsx`) – hook up headings and common labels
- [ ] Terms of Service (`src/pages/TermsOfService.tsx`) – hook up headings and common labels
- [ ] 404 / NotFound page (`src/pages/NotFound.tsx`)

Design System / Layout
- [x] Tool layout meta and Learn More section (`src/design-system/components/layout/ToolLayout.tsx`)
- [x] Related tools block (`src/tools/RelatedTools.tsx`)

Tool Registry and Tool Pages
- [x] Add translation keys for each tool: `tools.<id>.title`, `tools.<id>.description` (initial set added)
  - Source: `src/tools/index.ts`
  - ToolLayout and RelatedTools now resolve titles/descriptions via `t()`

Batch 1 (Utilities)
- [ ] URL Encoder/Decoder (`src/tools/url/UrlEncoder.tsx`)
- [ ] Regex Tester (`src/tools/regex/RegexTester.tsx`)
- [ ] QR Code Generator (`src/tools/qrcode/QRCodeGenerator.tsx`)
- [ ] QR Scanner (`src/tools/qrscan/page.tsx`)
- [ ] Image Compressor (`src/tools/image-compressor/page.tsx`)
- [ ] Generate Large Image (`src/tools/generate-large-image/page.tsx`)

Batch 2 (Testing)
- [ ] HTTP Headers Analyzer (`src/tools/headers/HeadersAnalyzer.tsx`)
- [ ] Header Scanner (`src/tools/header-scanner/page.tsx`)
- [ ] Cookie Inspector (`src/tools/cookie-inspector/page.tsx`)
- [ ] Cookie Scope (`src/tools/cookie-scope/page.tsx`)
- [ ] Cache Inspector (`src/tools/cache-inspector/page.tsx`)
- [ ] CORS Tester (`src/tools/cors-tester/page.tsx`)
- [ ] Pre-rendering & SEO Meta Tester (`src/tools/pre-rendering-tester/page.tsx`)
- [ ] Fetch & Render (`src/tools/fetch-render/page.tsx`)
- [ ] Dynamic Link Tracker (`src/tools/dynamic-link-probe/page.tsx`)
- [ ] Deep Link Chain (`src/tools/deep-link-chain/page.tsx`)
- [ ] Device Trace (`src/tools/device-trace/page.tsx`)
- [ ] Network Test Suite (`src/tools/networksuit/page.tsx`)

Batch 3 (Security)
- [ ] JWT Toolkit (`src/tools/jwt/JwtToolkit.tsx`)
- [ ] Click Jacking Validator (`src/tools/clickjacking/ClickJackingValidator.tsx`)
- [ ] Pentest Validator Suite (`src/tools/pentest/page.tsx`)
- [ ] Crypto Lab / AES-CBC (`src/tools/aes-cbc/page.tsx`)

Batch 4 (Conversion)
- [ ] CSV to Markdown (`src/tools/csvtomd/page.tsx`)
- [ ] JSON Converter (`src/tools/json-converter/page.tsx`)

Batch 5 (Permissions / PWA)
- [ ] Web Permission Tester (`src/tools/permission-tester/page.tsx`)
- [ ] PWA Push Tester (`src/tools/push-tester/page.tsx`)

Batch 6 (Other)
- [ ] Storage Sync Debugger (`src/tools/storage-sync/page.tsx`)
- [ ] Virtual Name Card (`src/tools/virtual-card/page.tsx`)
- [ ] Metadata Echo (`src/tools/metadata-echo/page.tsx`)
- [ ] Thong Thai Flag Creator (`src/tools/thong-thai/page.tsx`) – use existing `thongThai.*` keys

Keys Roadmap (translation.json)
- [x] header.*, footer.*
- [x] home.* (search, tabs, labels, CTA)
- [x] categories.* (names)
- [x] toolLayout.*, relatedTools.*
- [ ] tools.<id>.title / tools.<id>.description for all tools

Testing & QA
- [ ] Snapshot pass across all routes in EN/TH
- [ ] Verify aria-labels and placeholders reflect language
- [ ] Confirm localStorage persistence of selected language
- [ ] Validate no console errors for missing keys (fallbacks in place)

Release Steps
- [ ] Complete Batch 1–6
- [ ] Run lint, typecheck, tests
- [ ] Build preview and manual QA in both languages

Changelog
- v0: Added translation provider, header toggle, footer localization
- v1: Localized Home, ToolLayout, RelatedTools; consolidated translation.json


