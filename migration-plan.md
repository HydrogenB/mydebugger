# 1) Master Refactor Prompt (tailored to *mydebugger*)

```prompt
You are a senior frontend refactor engineer working on the “mydebugger” repo.

## Goal
Migrate from MVVM-style folders (`/model`, `/view`, `/viewmodel`) to a simple **pages + components + hooks + lib** structure **inside each tool** under `src/tools/{tool}/`. Keep functionality identical. Keep SPA (Vite) routing via `src/app/routes.tsx`. No server code. Client-only.

## Repo Reality
- Vite + React 18 + Tailwind (not Next.js)
- Routes live in `src/app/routes.tsx`, and per-tool pages already exist at `src/tools/{tool}/page.tsx`
- Current MVVM remnants: 
  - `/model/*.ts` (shared domain logic per feature)
  - `/view/*.tsx` (UI screens)
  - `/viewmodel/use*.ts` (feature hooks)
- A design system exists: `src/design-system/*` + `src/shared/*`
- Tools are already scaffolded: `src/tools/{tool}/(index.ts|page.tsx|...)`

## Target Structure (per tool)
- `src/tools/{tool}/page.tsx`               ⟵ remains orchestrator
- `src/tools/{tool}/components/*`           ⟵ from `/view/*` (split big screens into components if needed)
- `src/tools/{tool}/hooks/use{Feature}.ts`  ⟵ from `/viewmodel/use*.ts`
- `src/tools/{tool}/lib/*.ts`               ⟵ from `/model/*.ts` (pure utils)
- `src/tools/{tool}/types.ts`               ⟵ optional, for feature-specific types
- `__tests__` stay but fix imports

## Mapping Rules
- **ViewModel → hooks**
  - `viewmodel/useAesCbc.ts` → `src/tools/aes-cbc/hooks/useAesCbc.ts`
  - `viewmodel/useHeaderScanner.ts` → `src/tools/header-scanner/hooks/useHeaderScanner.ts`
  - …repeat for all `use*.ts`
  - No classes. Return `{ state, derived, actions }`. Keep debounce ≤300ms in the hook.
- **Model → lib**
  - `model/aes.ts` → `src/tools/aes-cbc/lib/aes.ts`
  - `model/headerScanner.ts` → `src/tools/header-scanner/lib/headerScanner.ts`
  - `model/qrscan.ts` → `src/tools/qrscan/lib/qrscan.ts`
  - Keep functions pure and tested.
- **View → components**
  - `view/AesCbcView.tsx` → `src/tools/aes-cbc/components/AesCbcPanel.tsx`
  - `view/HeaderScannerView.tsx` → `src/tools/header-scanner/components/HeaderScannerPanel.tsx`
  - Page files should compose hook + components; no business logic in components.
- **Shared**
  - Keep `src/design-system/*`, `src/shared/*` as-is.
  - Deprecate `src/shared/hoc/withToolPage.tsx` in favor of plain layout composition in `page.tsx` or `ToolLayout`.

## Page Contract
Each `src/tools/{tool}/page.tsx`:
- Imports the tool hook from `./hooks/*`
- Wires state/actions into components in `./components/*`
- Assembles layout (left input / right preview where applicable)
- Encodes share-state in URL query when useful (e.g., `?input=...`)

## Testing
- Update imports in `__tests__/*` to the new paths.
- Keep vitest/jest setup intact; do not change config unless import paths break.

## Deliverables
1) Moved files with updated import paths
2) Removal of `/viewmodel`, `/view` after migration
3) PR summary of replacements (old → new)
4) Zero behavior changes; visuals unchanged

Proceed folder-by-folder. When unsure which tool owns a file, inspect current consumers (grep) and place under that tool. If multiple tools share a model util, put it in `src/lib/shared/{domain}.ts` and update both.
```

---

# 2) Per-Tool Converter Prompt (use repeatedly)

````prompt
Convert the following feature to pages+components+hooks inside `src/tools/{tool}`.

### Constraints
- Keep `page.tsx` as the only orchestrator.
- Move pure logic to `lib/*`. Keep hook thin.
- Components are stateless/dumb. Props in, events out.

### Output files
1) `src/tools/{tool}/hooks/use{Feature}.ts`
2) `src/tools/{tool}/components/{Feature}Panel.tsx` (split further if >200 lines)
3) `src/tools/{tool}/lib/*.ts` (extracted pure helpers)
4) Updated `src/tools/{tool}/page.tsx` wiring
5) Updated tests (paths fixed)

### Hook API
Return:
```ts
{
  state: {...},
  derived: {...}, // memoized computed
  actions: { onChangeX(...), run(...), reset() }
}
````

### Notes

* Debounce I/O and heavy compute inside the hook (≤300ms).
* Keep copy buttons with “✓ Copied” feedback.
* Keep ARIA labels and keyboard support.
* Keep URL param sync if existed (read on mount, write on change).

````

---

# 3) PowerShell Move Script (scaffold + safe moves)

> Runs on Windows, mirrors your listing style. It moves **known** features. Adjust or extend the `$map` as needed.

```powershell
# Run from repo root
$ErrorActionPreference = "Stop"

# 1) Ensure per-tool subfolders exist
$tools = @(
  "aes-cbc","api-simulator","api-test","cache-inspector","clickjacking",
  "cookie-inspector","cookie-scope","cors-tester","csvtomd","deep-link-chain",
  "device-trace","dynamic-link-probe","fetch-render","generate-large-image",
  "header-scanner","headers","image-compressor","json-converter","jwt",
  "jwtplayground","linktracer","metadata-echo","networksuit","pentest",
  "permission-tester","pre-rendering-tester","push-tester","qrcode","qrscan",
  "regex","stayawake","storage-sync","thong-thai","url","virtual-card"
)

foreach ($t in $tools) {
  New-Item -ItemType Directory -Force -Path "src\tools\$t\components" | Out-Null
  New-Item -ItemType Directory -Force -Path "src\tools\$t\hooks" | Out-Null
  New-Item -ItemType Directory -Force -Path "src\tools\$t\lib" | Out-Null
}

# 2) File mapping (add to this table as you go)
$map = @{
  # ViewModel -> hooks
  "viewmodel\useAesCbc.ts"          = "src\tools\aes-cbc\hooks\useAesCbc.ts";
  "viewmodel\useHeaderScanner.ts"   = "src\tools\header-scanner\hooks\useHeaderScanner.ts";
  "viewmodel\useQrscan.ts"          = "src\tools\qrscan\hooks\useQrscan.ts";
  "viewmodel\useJsonConverter.ts"   = "src\tools\json-converter\hooks\useJsonConverter.ts";
  "viewmodel\useCorsTester.ts"      = "src\tools\cors-tester\hooks\useCorsTester.ts";
  "viewmodel\useCookieInspector.ts" = "src\tools\cookie-inspector\hooks\useCookieInspector.ts";
  "viewmodel\useCookieScope.ts"     = "src\tools\cookie-scope\hooks\useCookieScope.ts";
  "viewmodel\useApiRepeater.ts"     = "src\tools\api-test\hooks\useApiRepeater.ts";
  "viewmodel\useDeviceTrace.ts"     = "src\tools\device-trace\hooks\useDeviceTrace.ts";
  "viewmodel\usePentestSuite.ts"    = "src\tools\pentest\hooks\usePentestSuite.ts";
  "viewmodel\usePermissionTester.ts"= "src\tools\permission-tester\hooks\usePermissionTester.ts";
  "viewmodel\useStorageDebugger.ts" = "src\tools\storage-sync\hooks\useStorageDebugger.ts";
  "viewmodel\useStayAwake.ts"       = "src\tools\stayawake\hooks\useStayAwake.ts";
  "viewmodel\useHeaderScanner.ts"   = "src\tools\header-scanner\hooks\useHeaderScanner.ts";
  "viewmodel\useDeepLinkChain.ts"   = "src\tools\deep-link-chain\hooks\useDeepLinkChain.ts";
  "viewmodel\useFetchRender.ts"     = "src\tools\fetch-render\hooks\useFetchRender.ts";
  "viewmodel\useGenerateLargeImage.ts" = "src\tools\generate-large-image\hooks\useGenerateLargeImage.ts";
  "viewmodel\useImageCompressor.ts" = "src\tools\image-compressor\hooks\useImageCompressor.ts";
  "viewmodel\useMetadataEcho.ts"    = "src\tools\metadata-echo\hooks\useMetadataEcho.ts";
  "viewmodel\useNetworkSuite.ts"    = "src\tools\networksuit\hooks\useNetworkSuite.ts";
  "viewmodel\usePreRenderingTester.ts" = "src\tools\pre-rendering-tester\hooks\usePreRenderingTester.ts";
  "viewmodel\usePushTester.ts"      = "src\tools\push-tester\hooks\usePushTester.ts";
  "viewmodel\useQrscan.ts"          = "src\tools\qrscan\hooks\useQrscan.ts";
  "viewmodel\useJsonConverter.ts"   = "src\tools\json-converter\hooks\useJsonConverter.ts";
  "viewmodel\useUrl?.ts"            = "src\tools\url\hooks\useUrl.ts";   # adjust if present

  # Model -> lib
  "model\aes.ts"                    = "src\tools\aes-cbc\lib\aes.ts";
  "model\headerScanner.ts"          = "src\tools\header-scanner\lib\headerScanner.ts";
  "model\qrscan.ts"                 = "src\tools\qrscan\lib\qrscan.ts";
  "model\qrcode.ts"                 = "src\tools\qrcode\lib\qrcode.ts";
  "model\qrcodePresets.ts"          = "src\tools\qrcode\lib\qrcodePresets.ts";
  "model\qrStylePresets.ts"         = "src\tools\qrcode\lib\qrStylePresets.ts";
  "model\csvtomd.ts"                = "src\tools\csvtomd\lib\csvtomd.ts";
  "model\jsonConverter.ts"          = "src\tools\json-converter\lib\jsonConverter.ts";
  "model\jsonConverterTypes.ts"     = "src\tools\json-converter\types.ts";
  "model\cors.ts"                   = "src\tools\cors-tester\lib\cors.ts";
  "model\cookies.ts"                = "src\tools\cookie-inspector\lib\cookies.ts";
  "model\cookieScope.ts"            = "src\tools\cookie-scope\lib\cookieScope.ts";
  "model\deviceTrace.ts"            = "src\tools\device-trace\lib\deviceTrace.ts";
  "model\permissions.ts"            = "src\tools\permission-tester\lib\permissions.ts";
  "model\storage.ts"                = "src\tools\storage-sync\lib\storage.ts";
  "model\url.ts"                    = "src\tools\url\lib\url.ts";
  "model\imageCompressor.ts"        = "src\tools\image-compressor\lib\imageCompressor.ts";
  "model\metadata.ts"               = "src\tools\metadata-echo\lib\metadata.ts";
  "model\networkSuite.ts"           = "src\tools\networksuit\lib\networkSuite.ts";
  "model\prerender.ts"              = "src\tools\pre-rendering-tester\lib\prerender.ts";
  "model\pushTester.ts"             = "src\tools\push-tester\lib\pushTester.ts";
  "model\websocketSimulator.ts"     = "src\tools\api-simulator\lib\websocketSimulator.ts"; # if used there
  "model\apiRepeater.ts"            = "src\tools\api-test\lib\apiRepeater.ts";
  "model\virtualCard.ts"            = "src\tools\virtual-card\lib\virtualCard.ts";

  # View -> components
  "view\AesCbcView.tsx"             = "src\tools\aes-cbc\components\AesCbcPanel.tsx";
  "view\HeaderScannerView.tsx"      = "src\tools\header-scanner\components\HeaderScannerPanel.tsx";
  "view\QrscanView.tsx"             = "src\tools\qrscan\components\QrscanPanel.tsx";
  "view\JsonConverterView.tsx"      = "src\tools\json-converter\components\JsonConverterPanel.tsx";
  "view\CorsTesterView.tsx"         = "src\tools\cors-tester\components\CorsTesterPanel.tsx";
  "view\CookieInspectorView.tsx"    = "src\tools\cookie-inspector\components\CookieInspectorPanel.tsx";
  "view\CookieScopeView.tsx"        = "src\tools\cookie-scope\components\CookieScopePanel.tsx";
  "view\DeviceTraceView.tsx"        = "src\tools\device-trace\components\DeviceTracePanel.tsx";
  "view\EnhancedQRScannerView.tsx"  = "src\tools\qrscan\components\EnhancedQRScannerPanel.tsx";
  "view\FetchRenderView.tsx"        = "src\tools\fetch-render\components\FetchRenderPanel.tsx";
  "view\ImageCompressorView.tsx"    = "src\tools\image-compressor\components\ImageCompressorPanel.tsx";
  "view\MetadataEchoView.tsx"       = "src\tools\metadata-echo\components\MetadataEchoPanel.tsx";
  "view\PreRenderingTesterView.tsx" = "src\tools\pre-rendering-tester\components\PreRenderingTesterPanel.tsx";
  "view\PushTester.tsx"             = "src\tools\push-tester\components\PushTesterPanel.tsx";
  "view\StorageDebuggerView.tsx"    = "src\tools\storage-sync\components\StorageDebuggerPanel.tsx";
}

# Move files
foreach ($k in $map.Keys) {
  if (Test-Path $k) {
    $dest = $map[$k]
    $destDir = Split-Path $dest -Parent
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    git mv $k $dest 2>$null; if ($LASTEXITCODE -ne 0) { Move-Item -Force $k $dest }
  }
}

Write-Host "Files moved. Next: fix imports and remove empty /view and /viewmodel."
````

---

# 4) Example Rewrite (Header Scanner)

**Before**

* Hook: `viewmodel/useHeaderScanner.ts`
* Model: `model/headerScanner.ts`
* View:  `view/HeaderScannerView.tsx`
* Page:  `src/tools/header-scanner/page.tsx`

**After**

* `src/tools/header-scanner/hooks/useHeaderScanner.ts` (moved)
* `src/tools/header-scanner/lib/headerScanner.ts` (moved)
* `src/tools/header-scanner/components/HeaderScannerPanel.tsx` (moved/renamed)
* `src/tools/header-scanner/page.tsx` (imports hook + panel and wires props)

Update `page.tsx` imports, e.g.:

```tsx
import { useHeaderScanner } from "./hooks/useHeaderScanner";
import { HeaderScannerPanel } from "./components/HeaderScannerPanel";

export default function Page() {
  const { state, derived, actions } = useHeaderScanner();
  return (
    <HeaderScannerPanel
      value={state.input}
      result={derived.analysis}
      onChange={actions.onChange}
      onScan={actions.scan}
    />
  );
}
```

---

# 5) Repo-wide Import Fix Prompt

```prompt
Do a path rewrite across the repo:

- from: ^(\.\.\/)?(viewmodel\/use[A-Za-z0-9_]+)
  to:   ./hooks/$2  (with “viewmodel/” stripped)
- from: ^(\.\.\/)?model\/([A-Za-z0-9_]+)
  to:   ./lib/$2
- from component references that pointed to `view/*.tsx`
  rename symbol to `*Panel` and import from `./components/*Panel`

Then:
- Delete empty `view/` and `viewmodel/` dirs.
- Ensure all tool pages compile.
- Run tests and fix remaining import paths in `__tests__`.
Return changed files and a summary.
```

---

# 6) Acceptance Checklist (quick)

* [ ] All tool pages still render and behave the same
* [ ] No imports from `/view` or `/viewmodel`
* [ ] All domain logic lives under each tool’s `lib/` (or `src/lib/shared` when truly shared)
* [ ] Hooks expose `{ state, derived, actions }`
* [ ] Components are dumb/presentational
* [ ] Tests pass with updated paths
* [ ] `src/app/routes.tsx` unchanged (or simplified), SPA build still works on Vercel

---

# Migration Plan: MVVM to Feature-based Structure

## Overview
This document outlines the step-by-step plan to migrate from an MVVM folder structure to a feature-based organization within the `src/tools/` directory.

## Current Structure
```
src/
  view/              # UI components
  viewmodel/         # Hooks and state management
  tools/             # Tool-specific code
    {tool}/
      page.tsx       # Page components
```

## Target Structure
```
src/
  tools/
    {tool}/
      page.tsx        # Page orchestrator
      components/     # UI components (from /view/)
      hooks/          # Custom hooks (from /viewmodel/)
      lib/            # Pure utility functions
      types.ts        # TypeScript types
      __tests__/      # Test files
```

## Migration Strategy
1. **Directory Structure**: Create `components/`, `hooks/`, and `lib/` directories for each tool
2. **File Movement**:
   - Move `viewmodel/use{Tool}.ts` → `tools/{tool}/hooks/use{Tool}.ts`
   - Move `view/{Tool}View.tsx` → `tools/{tool}/components/{Tool}Panel.tsx`
   - Move any utility functions to `lib/`
3. **Update Imports**:
   - Update relative imports in moved files
   - Update imports in `page.tsx` and test files
4. **Testing**: Run tests after migrating each tool
5. **Cleanup**: Remove empty `view/` and `viewmodel/` directories after all migrations are complete

## Migration Phases

### Phase 1: Preparation (1 day)
1. Create new directory structure for all tools
2. Set up path aliases if needed
3. Document current component/hook dependencies

### Phase 2: Tool-by-Tool Migration (2-3 days)
For each tool in `src/tools/`:
1. Create target directories:
   - `components/`
   - `hooks/`
   - `lib/`
   - `types.ts`

2. Move and update files:
   - `viewmodel/use{Tool}.ts` → `tools/{tool}/hooks/use{Tool}.ts`
   - `model/{tool}.ts` → `tools/{tool}/lib/{tool}.ts`
   - `view/{Tool}View.tsx` → `tools/{tool}/components/{Tool}Panel.tsx`

3. Update imports in `page.tsx` and test files

### Phase 3: Cleanup (1 day)
1. Remove empty `model/`, `view/`, `viewmodel/` directories
2. Update any remaining import paths
3. Verify all tests pass

## Tools to Migrate

### 1. AES-CBC Tool
- [ ] Create directory structure
- [ ] Move `viewmodel/useAesCbc.ts` → `tools/aes-cbc/hooks/useAesCbc.ts`
- [ ] Move `view/AesCbcView.tsx` → `tools/aes-cbc/components/AesCbcPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 2. API Repeater Tool
- [ ] Create directory structure
- [ ] Move `viewmodel/useApiRepeater.ts` → `tools/api-test/hooks/useApiRepeater.ts`
- [ ] Move `view/ApiRepeaterView.tsx` → `tools/api-test/components/ApiRepeaterPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 3. Cache Inspector
- [ ] Create directory structure
- [ ] Move `viewmodel/useCacheInspector.ts` → `tools/cache-inspector/hooks/useCacheInspector.ts`
- [ ] Move `view/CacheInspectorView.tsx` → `tools/cache-inspector/components/CacheInspectorPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 4. Cookie Inspector
- [ ] Create directory structure
- [ ] Move `viewmodel/useCookieInspector.ts` → `tools/cookie-inspector/hooks/useCookieInspector.ts`
- [ ] Move `view/CookieInspectorView.tsx` → `tools/cookie-inspector/components/CookieInspectorPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 5. Cookie Scope Tool
- [ ] Create directory structure
- [ ] Move `viewmodel/useCookieScope.ts` → `tools/cookie-scope/hooks/useCookieScope.ts`
- [ ] Move `view/CookieScopeView.tsx` → `tools/cookie-scope/components/CookieScopePanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 6. CORS Tester
- [ ] Create directory structure
- [ ] Move `viewmodel/useCorsTester.ts` → `tools/cors-tester/hooks/useCorsTester.ts`
- [ ] Move `view/CorsTesterView.tsx` → `tools/cors-tester/components/CorsTesterPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 7. CSV to Markdown
- [ ] Create directory structure
- [ ] Move `viewmodel/useCsvtomd.ts` → `tools/csvtomd/hooks/useCsvtomd.ts`
- [ ] Move `view/CsvtomdView.tsx` → `tools/csvtomd/components/CsvtomdPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 8. Deep Link Chain
- [ ] Create directory structure
- [ ] Move `viewmodel/useDeepLinkChain.ts` → `tools/deep-link-chain/hooks/useDeepLinkChain.ts`
- [ ] Move `view/DeepLinkChainView.tsx` → `tools/deep-link-chain/components/DeepLinkChainPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 9. Device Trace
- [ ] Create directory structure
- [ ] Move `viewmodel/useDeviceTrace.ts` → `tools/device-trace/hooks/useDeviceTrace.ts`
- [ ] Move `view/DeviceTraceView.tsx` → `tools/device-trace/components/DeviceTracePanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 10. Fetch & Render
- [ ] Create directory structure
- [ ] Move `viewmodel/useFetchRender.ts` → `tools/fetch-render/hooks/useFetchRender.ts`
- [ ] Move `view/FetchRenderView.tsx` → `tools/fetch-render/components/FetchRenderPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 11. Generate Large Image
- [ ] Create directory structure
- [ ] Move `viewmodel/useGenerateLargeImage.ts` → `tools/generate-large-image/hooks/useGenerateLargeImage.ts`
- [ ] Move `view/GenerateLargeImageView.tsx` → `tools/generate-large-image/components/GenerateLargeImagePanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 12. Header Scanner
- [ ] Create directory structure
- [ ] Move `viewmodel/useHeaderScanner.ts` → `tools/header-scanner/hooks/useHeaderScanner.ts`
- [ ] Move `view/HeaderScannerView.tsx` → `tools/header-scanner/components/HeaderScannerPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 13. Image Compressor
- [ ] Create directory structure
- [ ] Move `viewmodel/useImageCompressor.ts` → `tools/image-compressor/hooks/useImageCompressor.ts`
- [ ] Move `view/ImageCompressorView.tsx` → `tools/image-compressor/components/ImageCompressorPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 14. JSON Converter
- [ ] Create directory structure
- [ ] Move `viewmodel/useJsonConverter.ts` → `tools/json-converter/hooks/useJsonConverter.ts`
- [ ] Move `view/JsonConverterView.tsx` → `tools/json-converter/components/JsonConverterPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 15. Metadata Echo
- [ ] Create directory structure
- [ ] Move `viewmodel/useMetadataEcho.ts` → `tools/metadata-echo/hooks/useMetadataEcho.ts`
- [ ] Move `view/MetadataEchoView.tsx` → `tools/metadata-echo/components/MetadataEchoPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 16. Network Suite
- [ ] Create directory structure
- [ ] Move `viewmodel/useNetworkSuite.ts` → `tools/networksuit/hooks/useNetworkSuite.ts`
- [ ] Move `view/NetworkSuiteView.tsx` → `tools/networksuit/components/NetworkSuitePanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 17. Pentest Suite
- [ ] Create directory structure
- [ ] Move `viewmodel/usePentestSuite.ts` → `tools/pentest/hooks/usePentestSuite.ts`
- [ ] Move `view/EnhancedPentestSuiteView.tsx` → `tools/pentest/components/EnhancedPentestSuitePanel.tsx`
- [ ] Move `view/PentestSuiteView.tsx` → `tools/pentest/components/PentestSuitePanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 18. Permission Tester
- [ ] Create directory structure
- [ ] Move `viewmodel/usePermissionTester.ts` → `tools/permission-tester/hooks/usePermissionTester.ts`
- [ ] Move `view/EnhancedPermissionTesterView.tsx` → `tools/permission-tester/components/EnhancedPermissionTesterPanel.tsx`
- [ ] Move `view/PermissionTesterView.tsx` → `tools/permission-tester/components/PermissionTesterPanel.tsx`
- [ ] Move `view/PermissionCard.tsx` → `tools/permission-tester/components/PermissionCard.tsx`
- [ ] Move `view/PermissionCardEnhanced.tsx` → `tools/permission-tester/components/PermissionCardEnhanced.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 19. Pre-rendering Tester
- [ ] Create directory structure
- [ ] Move `viewmodel/usePreRenderingTester.ts` → `tools/pre-rendering-tester/hooks/usePreRenderingTester.ts`
- [ ] Move `view/PreRenderingTesterView.tsx` → `tools/pre-rendering-tester/components/PreRenderingTesterPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 20. Push Tester
- [ ] Create directory structure
- [ ] Move `viewmodel/usePushTester.ts` → `tools/push-tester/hooks/usePushTester.ts`
- [ ] Move `view/PushTester.tsx` → `tools/push-tester/components/PushTesterPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 21. QR Scanner
- [ ] Create directory structure
- [ ] Move `viewmodel/useQrscan.ts` → `tools/qrscan/hooks/useQrscan.ts`
- [ ] Move `view/QrscanView.tsx` → `tools/qrscan/components/QrscanPanel.tsx`
- [ ] Move `view/EnhancedQRScannerView.tsx` → `tools/qrscan/components/EnhancedQRScannerPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 22. Stay Awake
- [ ] Create directory structure
- [ ] Move `viewmodel/useStayAwake.ts` → `tools/stayawake/hooks/useStayAwake.ts`
- [ ] Move `view/StayAwakeView.tsx` → `tools/stayawake/components/StayAwakePanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

### 23. Storage Debugger
- [ ] Create directory structure
- [ ] Move `viewmodel/useStorageDebugger.ts` → `tools/storage-sync/hooks/useStorageDebugger.ts`
- [ ] Move `view/StorageDebuggerView.tsx` → `tools/storage-sync/components/StorageDebuggerPanel.tsx`
- [ ] Update imports in `page.tsx`
- [ ] Update tests

## Shared Utilities
- Keep shared utilities in `src/shared/`
- Move tool-specific utilities to respective `tools/{tool}/lib/`
- Update imports accordingly

## Testing Strategy
1. Run tests after migrating each tool
2. Verify UI functionality manually
3. Check for any console errors
4. Ensure all TypeScript types are correct

## Success Criteria
- All tests pass
- No console errors
- Identical functionality to production
- Clean, consistent imports
- Removed all MVVM-specific folders
