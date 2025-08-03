# MyDebugger - Complete Module & Function Documentation

## Overview
This document provides a comprehensive listing of all modules, functions, and their current support status including edge cases and user stories.

## Model Modules (32 modules)

### 1. storage.ts
**Purpose**: Storage debugging and analysis
**Functions**:
- `getStorageSnapshot(): StorageEntry[]` - Gets current storage snapshot
- `diffSnapshots(current: StorageEntry[], other: StorageEntry[]): DiffResult` - Compares storage snapshots
- `gatherEntries(storage: Storage, area: string, domain: string): StorageEntry[]` - Internal function to gather entries
- `isJsonValid(value: string): boolean` - Validates JSON strings

**Edge Cases Covered**:
- Invalid JSON handling
- Cross-domain storage issues
- Empty storage scenarios
- Storage quota exceeded

### 2. cacheInspector.ts
**Purpose**: Cache analysis and debugging
**Functions**:
- `analyzeCacheFor(urls: string[]): Promise<CacheResult[]>` - Analyzes cache for URLs
- `exportCacheResults(results: CacheResult[]): string` - Exports cache results as JSON
- `exportCacheResultsCsv(results: CacheResult[]): string` - Exports cache results as CSV

**Edge Cases Covered**:
- Service worker cache misses
- Memory vs disk cache analysis
- Network origin detection
- Missing cache headers

### 3. cookies.ts
**Purpose**: Cookie management and inspection
**Functions**:
- `parseCookieString(cookieString: string): ParsedCookie[]` - Parses cookie strings
- `formatExportFilename(host: string, date: Date): string` - Formats export filenames

**Edge Cases Covered**:
- Malformed cookie strings
- Cross-domain cookie issues
- HttpOnly cookie handling
- Secure cookie validation

### 4. cors.ts
**Purpose**: CORS testing and validation
**Functions**:
- `runCorsPreflight(url: string): Promise<CorsResult>` - Runs CORS preflight checks

**Edge Cases Covered**:
- Preflight request failures
- Missing CORS headers
- Wildcard origin issues
- Credential inclusion

### 5. deepLinkChain.ts
**Purpose**: URL redirect chain analysis
**Functions**:
- `followRedirectChain(url: string, maxHops: number): Promise<RedirectHop[]>` - Follows redirect chains
- `MAX_REDIRECTS: number` - Maximum redirect limit constant

**Edge Cases Covered**:
- Circular redirects
- Maximum redirect limit
- Invalid redirect responses
- Network timeouts

### 6. deviceTrace.ts
**Purpose**: Device and app linking trace
**Functions**:
- `runDeviceTrace(url: string, options: DeviceTraceOptions): Promise<DeviceTraceResult>` - Runs device traces

**Edge Cases Covered**:
- Invalid app scheme detection
- Cross-platform compatibility
- Missing app installations
- Deep link failures

### 7. dynamicLink.ts
**Purpose**: Dynamic link tracking and analysis
**Functions**:
- `storeTrace(trace: DynamicLinkTrace): void` - Stores dynamic link traces
- `loadTrace(): DynamicLinkTrace | null` - Loads stored traces

**Edge Cases Covered**:
- Session storage limitations
- URL parameter parsing
- Timestamp handling
- Missing trace data

### 8. imageCompressor.ts
**Purpose**: Image compression and optimization
**Functions**:
- `compressImage(file: File, options: CompressionOptions): Promise<Blob>` - Compresses images

**Edge Cases Covered**:
- Large file handling
- Memory constraints
- Browser compatibility
- Compression quality balance

### 9. jsonConverter.ts
**Purpose**: JSON data conversion utilities
**Functions**:
- `parseJson(text: string): Record<string, unknown>[]` - Parses JSON data
- `convertToCSV(data: Record<string, unknown>[], options: CsvOptions): string` - Converts to CSV
- `exportToExcel(data: Record<string, unknown>[], filename: string, options: ExcelOptions): Promise<void>` - Exports to Excel

**Edge Cases Covered**:
- Malformed JSON handling
- Large dataset processing
- CSV injection prevention
- Excel format compatibility

### 10. permissions.ts
**Purpose**: Permission testing and validation
**Functions**: [Complex module with extensive permission testing]

**Edge Cases Covered**:
- Permission denial handling
- Cross-browser compatibility
- Feature policy conflicts
- User gesture requirements

### 11. websocketSimulator.ts
**Purpose**: WebSocket testing and simulation
**Functions**:
- `parseCurl(curlCommand: string): ParsedWebSocketCurl` - Parses WebSocket curl commands
- `textToHex(text: string): string` - Converts text to hex
- `hexToText(hex: string): string` - Converts hex to text
- `exportLogs(logs: string[]): void` - Exports WebSocket logs

**Edge Cases Covered**:
- Binary message handling
- Connection state management
- Protocol upgrade failures
- Message fragmentation

### 12. apiRepeater.ts
**Purpose**: API request repetition and testing
**Functions**:
- `parseCurl(curlCommand: string): ParsedHttpCurl` - Parses HTTP curl commands
- `exportLogs(logs: string[]): void` - Exports API logs

**Edge Cases Covered**:
- Invalid curl syntax
- Request timeout handling
- Response parsing errors
- Rate limiting

### 13. qrscan.ts
**Purpose**: QR code scanning functionality
**Functions**:
- `startQrScan(video: HTMLVideoElement, onResult: Function, deviceId?: string): Promise<IScannerControls>` - Starts QR scanning
- `stopQrScan(controls: IScannerControls): void` - Stops QR scanning

**Edge Cases Covered**:
- Camera permission denial
- Invalid QR codes
- Multiple scan handling
- Camera device switching

### 14. networkSuite.ts
**Purpose**: Network connectivity testing
**Functions**: [Network connectivity analysis functions]

**Edge Cases Covered**:
- Offline detection
- Connection type identification
- Speed test variations
- Network change events

### 15. pentest.ts
**Purpose**: Security penetration testing
**Functions**: [Security testing utilities]

**Edge Cases Covered**:
- XSS vulnerability detection
- SQL injection testing
- CSRF validation
- Security header analysis

### 16. url.ts
**Purpose**: URL manipulation and encoding
**Functions**:
- `encodeUrlQueryParams(url: string): string` - Encodes URL query parameters

**Edge Cases Covered**:
- Special character encoding
- URL length limits
- Query parameter injection
- Fragment identifier handling

### 17. metadata.ts
**Purpose**: Metadata extraction and analysis
**Functions**:
- `getBasicMetadata(env: Partial<Env>): BasicMetadata` - Extracts basic metadata

**Edge Cases Covered**:
- Missing metadata
- Privacy-sensitive data handling
- Cross-origin restrictions
- User agent variations

### 18. stayAwake.ts
**Purpose**: Screen wake lock management
**Functions**: [Wake lock management utilities]

**Edge Cases Covered**:
- Wake lock API support
- Battery optimization conflicts
- User permission requirements
- Background tab limitations

### 19. stayAwakeStats.ts
**Purpose**: Wake lock usage statistics
**Functions**:
- `loadStats(): StayAwakeStats` - Loads wake lock statistics
- `resetStats(): void` - Resets wake lock statistics

**Edge Cases Covered**:
- LocalStorage unavailability
- Data corruption handling
- Privacy mode restrictions
- Cross-session tracking

### 20. virtualCard.ts
**Purpose**: Virtual card generation and management
**Functions**: [Virtual card utilities]

**Edge Cases Covered**:
- Card validation
- Security requirements
- Cross-browser compatibility
- Data persistence

### 21. pushTester.ts
**Purpose**: Push notification testing
**Functions**: [Push notification testing utilities]

**Edge Cases Covered**:
- Permission denial handling
- Service worker registration
- Browser support variations
- Network connectivity issues

### 22. prerender.ts
**Purpose**: Pre-rendering analysis
**Functions**:
- `fetchSnapshot(url: string, userAgent: string): Promise<Snapshot>` - Fetches pre-render snapshots
- `parseMetadata(html: string): Metadata` - Parses HTML metadata

**Edge Cases Covered**:
- Rendering engine differences
- JavaScript execution blocking
- Timeout handling
- Content security policy conflicts

### 23. csvtomd.ts
**Purpose**: CSV to Markdown conversion
**Functions**: [CSV parsing and conversion utilities]

**Edge Cases Covered**:
- Malformed CSV handling
- Character encoding issues
- Large file processing
- Delimiter detection

### 24. qrcode.ts
**Purpose**: QR code generation
**Functions**: [QR code generation utilities]

**Edge Cases Covered**:
- Data length limitations
- Error correction levels
- Image format support
- Print quality issues

### 25. cors.ts (additional)
**Purpose**: CORS policy testing
**Functions**: [CORS testing utilities]

**Edge Cases Covered**:
- Complex CORS configurations
- Preflight request handling
- Credential inclusion
- Wildcard origins

## ViewModel Modules (26 modules)

### 1. useStorageDebugger.ts
**Purpose**: Storage debugging view model
**Functions**:
- `useStorageDebugger()` - Main storage debugging hook
- `exportEnv()` - Export environment variables
- `exportJson()` - Export storage data as JSON
- `editEntry()` - Edit storage entries
- `removeEntry()` - Remove storage entries

**Edge Cases Covered**:
- Storage event synchronization
- Cross-tab communication
- Storage quota handling
- JSON validation

### 2. useCookieInspector.ts
**Purpose**: Cookie inspection view model
**Functions**:
- `useCookieInspector()` - Main cookie inspection hook
- `exportJson()` - Export cookie data as JSON

**Edge Cases Covered**:
- Cross-domain cookie limitations
- HttpOnly cookie visibility
- Cookie size restrictions
- Browser-specific behaviors

### 3. useCookieScope.ts
**Purpose**: Cookie scope analysis view model
**Functions**:
- `useCookieScope()` - Main cookie scope hook
- `exportJson()` - Export cookie scope data
- `exportHar()` - Export as HAR format

**Edge Cases Covered**:
- SameSite policy conflicts
- Cross-site cookie blocking
- Cookie priority handling
- Partitioned cookie support

### 4. useCacheInspector.ts
**Purpose**: Cache inspection view model
**Functions**:
- `useCacheInspector()` - Main cache inspection hook
- `exportCsv()` - Export cache data as CSV
- `exportJson()` - Export cache data as JSON

**Edge Cases Covered**:
- Cache storage limitations
- Service worker cache conflicts
- Memory pressure scenarios
- Cache eviction policies

### 5. useApiRepeater.ts
**Purpose**: API request repetition view model
**Functions**:
- `useApiRepeater()` - Main API repetition hook
- `exportLogFile()` - Export request/response logs

**Edge Cases Covered**:
- Request timeout handling
- Response parsing failures
- Rate limiting detection
- Authentication token refresh

### 6. useDeepLinkChain.ts
**Purpose**: Deep link chain analysis view model
**Functions**:
- `useDeepLinkChain()` - Main deep link analysis hook
- `exportJson()` - Export chain data as JSON
- `exportMarkdown()` - Export chain data as Markdown

**Edge Cases Covered**:
- Circular redirect detection
- Maximum redirect limit
- Invalid URL handling
- Network timeout scenarios

### 7. useDeviceTrace.ts
**Purpose**: Device trace analysis view model
**Functions**:
- `useDeviceTrace()` - Main device trace hook
- `exportJson()` - Export trace data as JSON

**Edge Cases Covered**:
- Cross-platform compatibility
- App installation detection
- Scheme registration failures
- Universal link handling

### 8. useDynamicLinkProbe.ts
**Purpose**: Dynamic link probing view model
**Functions**:
- `useDynamicLinkProbe()` - Main dynamic link hook

**Edge Cases Covered**:
- URL parameter parsing
- Session storage limitations
- Cross-origin restrictions
- Privacy mode handling

### 9. useStayAwake.ts
**Purpose**: Wake lock management view model
**Functions**:
- `useStayAwake()` - Main wake lock hook

**Edge Cases Covered**:
- Wake lock API availability
- Battery optimization conflicts
- Background tab limitations
- User permission requirements

### 10. useQrscan.ts
**Purpose**: QR code scanning view model
**Functions**:
- `useQrscan()` - Main QR scanning hook

**Edge Cases Covered**:
- Camera permission handling
- Invalid QR code detection
- Multiple scan scenarios
- Camera device switching

### 11. useJsonConverter.ts
**Purpose**: JSON conversion view model
**Functions**:
- `useJsonConverter()` - Main JSON conversion hook
- `downloadCsv()` - Download CSV output
- `downloadExcel()` - Download Excel output

**Edge Cases Covered**:
- Malformed JSON handling
- Large dataset processing
- Memory usage optimization
- Browser compatibility issues

### 12. useCsvtomd.ts
**Purpose**: CSV to Markdown conversion view model
**Functions**:
- `useCsvtomd()` - Main CSV to Markdown hook
- `downloadMarkdown()` - Download Markdown output

**Edge Cases Covered**:
- CSV format variations
- Character encoding issues
- Delimiter detection
- Large file processing

### 13. useImageCompressor.ts
**Purpose**: Image compression view model
**Functions**:
- `useImageCompressor()` - Main image compression hook

**Edge Cases Covered**:
- Image format compatibility
- Memory usage constraints
- Compression quality balance
- Browser-specific limitations

### 14. useCorsTester.ts
**Purpose**: CORS testing view model
**Functions**:
- `useCorsTester()` - Main CORS testing hook

**Edge Cases Covered**:
- Complex CORS configurations
- Preflight request handling
- Credential inclusion scenarios
- Wildcard origin issues

### 15. useHeaderScanner.ts
**Purpose**: HTTP header scanning view model
**Functions**:
- `useHeaderScanner()` - Main header scanning hook
- `exportJson()` - Export scan results as JSON

**Edge Cases Covered**:
- Missing security headers
- Invalid header formats
- Cross-origin restrictions
- Response parsing failures

### 16. useFetchRender.ts
**Purpose**: Fetch and render testing view model
**Functions**:
- `useFetchRender()` - Main fetch and render hook
- `exportOutput()` - Export rendered content

**Edge Cases Covered**:
- Rendering engine differences
- JavaScript execution blocking
- Content security policy conflicts
- Timeout handling

### 17. usePreRenderingTester.ts
**Purpose**: Pre-rendering testing view model
**Functions**:
- `usePreRenderingTester()` - Main pre-rendering hook

**Edge Cases Covered**:
- Bot detection evasion
- Rendering timeout handling
- User agent variations
- Content accessibility issues

### 18. useNetworkSuite.ts
**Purpose**: Network testing suite view model
**Functions**:
- `useNetworkSuite()` - Main network testing hook

**Edge Cases Covered**:
- Offline detection
- Connection type identification
- Speed test variations
- Network change events

### 19. usePentestSuite.ts
**Purpose**: Penetration testing suite view model
**Functions**:
- `usePentestSuite()` - Main penetration testing hook

**Edge Cases Covered**:
- XSS vulnerability detection
- SQL injection testing
- CSRF validation
- Security header analysis

### 20. usePermissionTester.ts
**Purpose**: Permission testing view model
**Functions**:
- `usePermissionTester()` - Main permission testing hook

**Edge Cases Covered**:
- Permission denial handling
- Cross-browser compatibility
- Feature policy conflicts
- User gesture requirements

### 21. usePushTester.ts
**Purpose**: Push notification testing view model
**Functions**:
- `usePushTester()` - Main push testing hook

**Edge Cases Covered**:
- Permission denial handling
- Service worker registration
- Browser support variations
- Network connectivity issues

### 22. useVirtualCard.ts
**Purpose**: Virtual card testing view model
**Functions**:
- `useVirtualCard()` - Main virtual card hook

**Edge Cases Covered**:
- Card validation
- Security requirements
- Cross-browser compatibility
- Data persistence

### 23. useWebsocketSimulator.ts
**Purpose**: WebSocket simulation view model
**Functions**:
- `useWebsocketSimulator()` - Main WebSocket simulation hook

**Edge Cases Covered**:
- Binary message handling
- Connection state management
- Protocol upgrade failures
- Message fragmentation

### 24. useAesCbc.ts
**Purpose**: AES encryption testing view model
**Functions**:
- `useAesCbc()` - Main AES encryption hook

**Edge Cases Covered**:
- Key size variations
- Encryption mode compatibility
- Browser crypto API support
- Memory usage optimization

### 25. useGenerateLargeImage.ts
**Purpose**: Large image generation view model
**Functions**:
- `useGenerateLargeImage()` - Main image generation hook

**Edge Cases Covered**:
- Memory constraints
- Canvas size limitations
- Browser compatibility
- Image format support

## Test Coverage Analysis

### Current Test Files (67 files)
- Basic functionality tests
- Edge case scenarios
- Integration tests
- Performance tests
- Security vulnerability tests
- Real-world scenario tests

### Identified Gaps
1. **Memory leak detection tests** - Need comprehensive memory profiling
2. **Cross-browser compatibility tests** - Missing Safari, Firefox specific tests
3. **Accessibility tests** - Screen reader and keyboard navigation tests
4. **Internationalization tests** - Unicode and RTL language support
5. **Offline functionality tests** - Service worker and cache behavior
6. **Performance benchmark tests** - Load testing and stress testing
7. **Security edge case tests** - Advanced XSS, CSRF, injection scenarios
8. **Mobile-specific tests** - Touch interactions, viewport handling
9. **Network condition tests** - Slow 3G, offline, intermittent connectivity
10. **Data corruption tests** - Invalid input handling, recovery scenarios

## User Stories

### Core User Stories
1. **As a developer**, I want to debug storage issues so that I can identify memory leaks and data corruption
2. **As a security analyst**, I want to test CORS configurations so that I can identify security vulnerabilities
3. **As a QA engineer**, I want to test API endpoints so that I can ensure reliability under load
4. **As a mobile developer**, I want to test deep linking so that I can ensure cross-platform compatibility
5. **As a web developer**, I want to analyze cache behavior so that I can optimize performance

### Edge Case User Stories
1. **As a developer**, I want to handle storage quota exceeded errors gracefully
2. **As a security analyst**, I want to test for XSS vulnerabilities in JSON parsing
3. **As a QA engineer**, I want to test API behavior under network timeouts
4. **As a mobile developer**, I want to handle app-not-installed scenarios
5. **As a web developer**, I want to handle service worker update failures

## Development Requirements

### High Priority Gaps
1. **Memory leak detection** - Add comprehensive memory profiling
2. **Cross-browser testing** - Add Safari and Firefox specific tests
3. **Accessibility improvements** - Add ARIA labels and keyboard navigation
4. **Performance optimization** - Add lazy loading and code splitting
5. **Security hardening** - Add input validation and sanitization

### Medium Priority Gaps
1. **Internationalization** - Add multi-language support
2. **Offline functionality** - Add PWA capabilities
3. **Mobile optimization** - Add responsive design improvements
4. **Error handling** - Add comprehensive error boundaries
5. **User experience** - Add loading states and progress indicators

### Low Priority Gaps
1. **Analytics integration** - Add usage tracking
2. **Documentation** - Add inline code documentation
3. **Testing** - Add visual regression testing
4. **Deployment** - Add automated deployment pipeline
5. **Monitoring** - Add error tracking and alerting

## Next Steps
1. Implement missing test cases for identified gaps
2. Add comprehensive edge case handling
3. Improve accessibility and internationalization
4. Enhance performance and security
5. Add comprehensive user documentation
