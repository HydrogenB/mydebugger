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
  "viewmodel\useAesCbc.ts"            = "src\tools\aes-cbc\hooks\useAesCbc.ts";
  "viewmodel\useHeaderScanner.ts"     = "src\tools\header-scanner\hooks\useHeaderScanner.ts";
  "viewmodel\useQrscan.ts"            = "src\tools\qrscan\hooks\useQrscan.ts";
  "viewmodel\useJsonConverter.ts"     = "src\tools\json-converter\hooks\useJsonConverter.ts";
  "viewmodel\useCorsTester.ts"        = "src\tools\cors-tester\hooks\useCorsTester.ts";
  "viewmodel\useCookieInspector.ts"   = "src\tools\cookie-inspector\hooks\useCookieInspector.ts";
  "viewmodel\useCookieScope.ts"       = "src\tools\cookie-scope\hooks\useCookieScope.ts";
  "viewmodel\useApiRepeater.ts"       = "src\tools\api-test\hooks\useApiRepeater.ts";
  "viewmodel\useDeviceTrace.ts"       = "src\tools\device-trace\hooks\useDeviceTrace.ts";
  "viewmodel\usePentestSuite.ts"      = "src\tools\pentest\hooks\usePentestSuite.ts";
  "viewmodel\usePermissionTester.ts"  = "src\tools\permission-tester\hooks\usePermissionTester.ts";
  "viewmodel\useStorageDebugger.ts"   = "src\tools\storage-sync\hooks\useStorageDebugger.ts";
  "viewmodel\useStayAwake.ts"         = "src\tools\stayawake\hooks\useStayAwake.ts";
  "viewmodel\useDeepLinkChain.ts"     = "src\tools\deep-link-chain\hooks\useDeepLinkChain.ts";
  "viewmodel\useFetchRender.ts"       = "src\tools\fetch-render\hooks\useFetchRender.ts";
  "viewmodel\useGenerateLargeImage.ts"= "src\tools\generate-large-image\hooks\useGenerateLargeImage.ts";
  "viewmodel\useImageCompressor.ts"   = "src\tools\image-compressor\hooks\useImageCompressor.ts";
  "viewmodel\useMetadataEcho.ts"      = "src\tools\metadata-echo\hooks\useMetadataEcho.ts";
  "viewmodel\useNetworkSuite.ts"      = "src\tools\networksuit\hooks\useNetworkSuite.ts";
  "viewmodel\usePreRenderingTester.ts"= "src\tools\pre-rendering-tester\hooks\usePreRenderingTester.ts";
  "viewmodel\usePushTester.ts"        = "src\tools\push-tester\hooks\usePushTester.ts";
  "viewmodel\useDynamicLinkProbe.ts"  = "src\tools\dynamic-link-probe\hooks\useDynamicLinkProbe.ts";

  # Model -> lib
  "model\aes.ts"                      = "src\tools\aes-cbc\lib\aes.ts";
  "model\headerScanner.ts"            = "src\tools\header-scanner\lib\headerScanner.ts";
  "model\qrscan.ts"                   = "src\tools\qrscan\lib\qrscan.ts";
  "model\qrcode.ts"                   = "src\tools\qrcode\lib\qrcode.ts";
  "model\qrcodePresets.ts"            = "src\tools\qrcode\lib\qrcodePresets.ts";
  "model\qrStylePresets.ts"           = "src\tools\qrcode\lib\qrStylePresets.ts";
  "model\csvtomd.ts"                  = "src\tools\csvtomd\lib\csvtomd.ts";
  "model\jsonConverter.ts"            = "src\tools\json-converter\lib\jsonConverter.ts";
  "model\jsonConverterTypes.ts"       = "src\tools\json-converter\types.ts";
  "model\cors.ts"                     = "src\tools\cors-tester\lib\cors.ts";
  "model\cookies.ts"                  = "src\tools\cookie-inspector\lib\cookies.ts";
  "model\cookieScope.ts"              = "src\tools\cookie-scope\lib\cookieScope.ts";
  "model\deviceTrace.ts"              = "src\tools\device-trace\lib\deviceTrace.ts";
  "model\permissions.ts"              = "src\tools\permission-tester\lib\permissions.ts";
  "model\storage.ts"                  = "src\tools\storage-sync\lib\storage.ts";
  "model\url.ts"                      = "src\tools\url\lib\url.ts";
  "model\imageCompressor.ts"          = "src\tools\image-compressor\lib\imageCompressor.ts";
  "model\metadata.ts"                 = "src\tools\metadata-echo\lib\metadata.ts";
  "model\networkSuite.ts"             = "src\tools\networksuit\lib\networkSuite.ts";
  "model\prerender.ts"                = "src\tools\pre-rendering-tester\lib\prerender.ts";
  "model\pushTester.ts"               = "src\tools\push-tester\lib\pushTester.ts";
  "model\websocketSimulator.ts"       = "src\tools\api-simulator\lib\websocketSimulator.ts";
  "model\apiRepeater.ts"              = "src\tools\api-test\lib\apiRepeater.ts";
  "model\virtualCard.ts"              = "src\tools\virtual-card\lib\virtualCard.ts";
  "model\cacheInspector.ts"           = "src\tools\cache-inspector\lib\cacheInspector.ts";
  "model\deepLinkChain.ts"            = "src\tools\deep-link-chain\lib\deepLinkChain.ts";
  "model\pentest.ts"                  = "src\tools\pentest\lib\pentest.ts";
  "model\stayAwake.ts"                = "src\tools\stayawake\lib\stayAwake.ts";
  "model\stayAwakeStats.ts"           = "src\tools\stayawake\lib\stayAwakeStats.ts";
  "model\dynamicLink.ts"              = "src\tools\dynamic-link-probe\lib\dynamicLink.ts";
  "model\ical.ts"                     = "src\tools\qrcode\lib\ical.ts";

  # View -> components
  "view\AesCbcView.tsx"               = "src\tools\aes-cbc\components\AesCbcPanel.tsx";
  "view\HeaderScannerView.tsx"        = "src\tools\header-scanner\components\HeaderScannerPanel.tsx";
  "view\QrscanView.tsx"               = "src\tools\qrscan\components\QrscanPanel.tsx";
  "view\JsonConverterView.tsx"        = "src\tools\json-converter\components\JsonConverterPanel.tsx";
  "view\CorsTesterView.tsx"           = "src\tools\cors-tester\components\CorsTesterPanel.tsx";
  "view\CookieInspectorView.tsx"      = "src\tools\cookie-inspector\components\CookieInspectorPanel.tsx";
  "view\CookieScopeView.tsx"          = "src\tools\cookie-scope\components\CookieScopePanel.tsx";
  "view\DeviceTraceView.tsx"          = "src\tools\device-trace\components\DeviceTracePanel.tsx";
  "view\EnhancedQRScannerView.tsx"    = "src\tools\qrscan\components\EnhancedQRScannerPanel.tsx";
  "view\FetchRenderView.tsx"          = "src\tools\fetch-render\components\FetchRenderPanel.tsx";
  "view\ImageCompressorView.tsx"      = "src\tools\image-compressor\components\ImageCompressorPanel.tsx";
  "view\MetadataEchoView.tsx"         = "src\tools\metadata-echo\components\MetadataEchoPanel.tsx";
  "view\PreRenderingTesterView.tsx"   = "src\tools\pre-rendering-tester\components\PreRenderingTesterPanel.tsx";
  "view\PushTester.tsx"               = "src\tools\push-tester\components\PushTesterPanel.tsx";
  "view\StorageDebuggerView.tsx"      = "src\tools\storage-sync\components\StorageDebuggerPanel.tsx";
  "view\ApiRepeaterView.tsx"          = "src\tools\api-test\components\ApiRepeaterPanel.tsx";
  "view\StayAwakeView.tsx"            = "src\tools\stayawake\components\StayAwakePanel.tsx";
  "view\PermissionTesterView.tsx"     = "src\tools\permission-tester\components\PermissionTesterPanel.tsx";
  "view\PermissionTesterViewEnhanced.tsx" = "src\tools\permission-tester\components\EnhancedPermissionTesterPanel.tsx";
  "view\EnhancedPermissionTesterView.tsx" = "src\tools\permission-tester\components\EnhancedPermissionTesterPanel.tsx";
  "view\PermissionCard.tsx"           = "src\tools\permission-tester\components\PermissionCard.tsx";
  "view\PermissionCardEnhanced.tsx"   = "src\tools\permission-tester\components\PermissionCardEnhanced.tsx";
}

# Move files safely
foreach ($k in $map.Keys) {
  if (Test-Path $k) {
    $dest = $map[$k]
    $destDir = Split-Path $dest -Parent
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    git mv $k $dest 2>$null; if ($LASTEXITCODE -ne 0) { Move-Item -Force $k $dest }
  }
}

Write-Host "Files moved. Next: fix imports and remove empty /view and /viewmodel if fully migrated."

