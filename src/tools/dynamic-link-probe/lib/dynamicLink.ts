/**
 * © 2025 MyDebugger Contributors – MIT License
 * OneLink Deep Link Inspector - AppsFlyer OneLink analysis for TrueApp
 */

// ============================================================================
// TrueApp Configuration (Editable)
// ============================================================================

export interface AppDeepLinkConfig {
  name: string;
  expectedScheme: string;
  expectedHost: string;
  expectedDeepLinkPrefix: string;
  expectedIosStoreUrlPrefix: string;
  expectedAndroidStoreUrlPrefix: string;
  expectedWebFallbackPrefix: string;
  requiredParams: Record<string, string[]>;
}

export const TRUE_APP_CONFIG: AppDeepLinkConfig = {
  name: 'TrueApp',
  expectedScheme: 'trueapp',
  expectedHost: 'app.true.th',
  expectedDeepLinkPrefix: 'trueapp://app.true.th/',
  expectedIosStoreUrlPrefix: 'https://apps.apple.com/',
  expectedAndroidStoreUrlPrefix: 'https://play.google.com/store/apps/details',
  expectedWebFallbackPrefix: 'https://app.true.th/',
  requiredParams: {
    default: ['entry'],
    home: ['entry'],
    campaign: ['campaignId', 'channel'],
    promotion: ['promoId'],
    payment: ['billId'],
  },
};

// ============================================================================
// Types
// ============================================================================

export type DynamicLinkProvider =
  | 'appsflyer'
  | 'branch'
  | 'firebase'
  | 'adjust'
  | 'singular'
  | 'kochava'
  | 'bitly'
  | 'rebrandly'
  | 'unknown';

export interface ProviderInfo {
  id: DynamicLinkProvider;
  name: string;
  description: string;
  docsUrl: string;
  color: string;
}

export interface ParsedParameter {
  key: string;
  value: string;
  decodedValue: string;
  category: 'utm' | 'deeplink' | 'tracking' | 'provider' | 'custom';
  description?: string;
}

export interface DeepLinkInfo {
  scheme: string;
  host: string;
  path: string;
  fullUrl: string;
}

export interface DynamicLinkAnalysis {
  originalUrl: string;
  normalizedUrl: string;
  provider: ProviderInfo;
  parameters: ParsedParameter[];
  utmParams: ParsedParameter[];
  deepLink: DeepLinkInfo | null;
  trackingId: string | null;
  timestamp: number;
  isValid: boolean;
  warnings: string[];
}

// ============================================================================
// Provider Detection
// ============================================================================

export const PROVIDERS: Record<DynamicLinkProvider, ProviderInfo> = {
  appsflyer: {
    id: 'appsflyer',
    name: 'AppsFlyer OneLink',
    description: 'Mobile attribution and deep linking platform',
    docsUrl: 'https://support.appsflyer.com/hc/en-us/articles/207032366-OneLink-overview',
    color: '#12B76A',
  },
  branch: {
    id: 'branch',
    name: 'Branch.io',
    description: 'Mobile linking platform for attribution and deep linking',
    docsUrl: 'https://docs.branch.io/',
    color: '#0A7AFF',
  },
  firebase: {
    id: 'firebase',
    name: 'Firebase Dynamic Links',
    description: 'Google Firebase deep linking service',
    docsUrl: 'https://firebase.google.com/docs/dynamic-links',
    color: '#FFCA28',
  },
  adjust: {
    id: 'adjust',
    name: 'Adjust',
    description: 'Mobile measurement and fraud prevention',
    docsUrl: 'https://help.adjust.com/en/',
    color: '#0072FF',
  },
  singular: {
    id: 'singular',
    name: 'Singular',
    description: 'Marketing analytics and attribution',
    docsUrl: 'https://support.singular.net/',
    color: '#6366F1',
  },
  kochava: {
    id: 'kochava',
    name: 'Kochava',
    description: 'Mobile attribution and analytics',
    docsUrl: 'https://support.kochava.com/',
    color: '#FF6B35',
  },
  bitly: {
    id: 'bitly',
    name: 'Bitly',
    description: 'URL shortening service',
    docsUrl: 'https://dev.bitly.com/',
    color: '#EE6123',
  },
  rebrandly: {
    id: 'rebrandly',
    name: 'Rebrandly',
    description: 'Custom URL shortener',
    docsUrl: 'https://developers.rebrandly.com/',
    color: '#0066FF',
  },
  unknown: {
    id: 'unknown',
    name: 'Unknown Provider',
    description: 'Provider could not be detected',
    docsUrl: '',
    color: '#6B7280',
  },
};

const PROVIDER_PATTERNS: Array<{ pattern: RegExp; provider: DynamicLinkProvider }> = [
  { pattern: /onelink\.to|appsflyer\.com|af-link/i, provider: 'appsflyer' },
  { pattern: /app\.link|bnc\.lt|branch\.io/i, provider: 'branch' },
  { pattern: /page\.link|goo\.gl\/app|firebase/i, provider: 'firebase' },
  { pattern: /adjust\.com|adj\.st|app\.adjust/i, provider: 'adjust' },
  { pattern: /sng\.link|singular\.net/i, provider: 'singular' },
  { pattern: /kochava\.com|control\.kochava/i, provider: 'kochava' },
  { pattern: /bit\.ly|bitly\.com|j\.mp/i, provider: 'bitly' },
  { pattern: /rebrand\.ly|rebrandly/i, provider: 'rebrandly' },
];

export function detectProvider(url: string): ProviderInfo {
  for (const { pattern, provider } of PROVIDER_PATTERNS) {
    if (pattern.test(url)) {
      return PROVIDERS[provider];
    }
  }
  return PROVIDERS.unknown;
}

// ============================================================================
// Parameter Parsing
// ============================================================================

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];

const DEEPLINK_PARAMS = [
  'deep_link_value', 'deep_link_sub1', 'deep_link_sub2', 'deep_link_sub3',
  'af_dp', 'af_web_dp', 'af_ios_url', 'af_android_url',
  '$deeplink_path', '$desktop_url', '$ios_url', '$android_url',
  'link', 'apn', 'ibi', 'isi', 'ofl',
];

const TRACKING_PARAMS = [
  'pid', 'c', 'af_c_id', 'af_adset', 'af_ad', 'af_sub1', 'af_sub2', 'af_sub3', 'af_sub4', 'af_sub5',
  'campaign_id', 'adset_id', 'ad_id', 'fbclid', 'gclid', 'ttclid', 'msclkid',
  'clickid', 'click_id', 'ref', 'referrer',
];

const PARAM_DESCRIPTIONS: Record<string, string> = {
  utm_source: 'Traffic source (e.g., google, facebook)',
  utm_medium: 'Marketing medium (e.g., cpc, email)',
  utm_campaign: 'Campaign name',
  utm_term: 'Paid search keywords',
  utm_content: 'Ad content or A/B test variant',
  pid: 'Partner/Media source ID',
  c: 'Campaign name (short)',
  af_dp: 'AppsFlyer deep link path',
  deep_link_value: 'Deep link destination value',
  fbclid: 'Facebook click identifier',
  gclid: 'Google click identifier',
  ttclid: 'TikTok click identifier',
};

function categorizeParam(key: string): ParsedParameter['category'] {
  const lowerKey = key.toLowerCase();
  if (UTM_PARAMS.includes(lowerKey)) return 'utm';
  if (DEEPLINK_PARAMS.some(p => lowerKey.includes(p.toLowerCase()))) return 'deeplink';
  if (TRACKING_PARAMS.some(p => lowerKey.includes(p.toLowerCase()))) return 'tracking';
  if (lowerKey.startsWith('af_') || lowerKey.startsWith('$')) return 'provider';
  return 'custom';
}

export function parseUrl(urlString: string): { url: URL | null; error: string | null } {
  try {
    // Try to parse as-is
    const url = new URL(urlString);
    return { url, error: null };
  } catch {
    try {
      // Try adding https://
      const url = new URL(`https://${urlString}`);
      return { url, error: null };
    } catch {
      return { url: null, error: 'Invalid URL format' };
    }
  }
}

export function parseParameters(url: URL): ParsedParameter[] {
  const params: ParsedParameter[] = [];
  
  url.searchParams.forEach((value, key) => {
    let decodedValue = value;
    try {
      decodedValue = decodeURIComponent(value);
      // Try double decode for nested encoding
      if (decodedValue.includes('%')) {
        decodedValue = decodeURIComponent(decodedValue);
      }
    } catch {
      // Keep original if decode fails
    }

    params.push({
      key,
      value,
      decodedValue,
      category: categorizeParam(key),
      description: PARAM_DESCRIPTIONS[key.toLowerCase()],
    });
  });

  return params.sort((a, b) => {
    const order = { utm: 0, deeplink: 1, tracking: 2, provider: 3, custom: 4 };
    return order[a.category] - order[b.category];
  });
}

// ============================================================================
// Deep Link Extraction
// ============================================================================

export function extractDeepLink(params: ParsedParameter[]): DeepLinkInfo | null {
  const deepLinkKeys = [
    'deep_link_value', 'af_dp', '$deeplink_path', 'link',
    'af_web_dp', 'af_ios_url', 'af_android_url', '$ios_url', '$android_url',
  ];

  for (const key of deepLinkKeys) {
    const param = params.find(p => p.key.toLowerCase() === key.toLowerCase());
    if (param?.decodedValue) {
      const value = param.decodedValue;
      
      // Check if it's a full URL
      if (value.includes('://')) {
        try {
          const url = new URL(value);
          return {
            scheme: url.protocol.replace(':', ''),
            host: url.host,
            path: url.pathname + url.search,
            fullUrl: value,
          };
        } catch {
          // Not a valid URL, treat as path
        }
      }
      
      // Treat as path/scheme
      if (value.startsWith('/')) {
        return {
          scheme: 'app',
          host: '',
          path: value,
          fullUrl: `app://${value}`,
        };
      }
      
      return {
        scheme: 'custom',
        host: '',
        path: value,
        fullUrl: value,
      };
    }
  }

  return null;
}

// ============================================================================
// Main Analysis Function
// ============================================================================

export function analyzeDynamicLink(urlString: string): DynamicLinkAnalysis {
  const warnings: string[] = [];
  const timestamp = Date.now();

  // Parse URL
  const { url, error } = parseUrl(urlString.trim());
  
  if (!url || error) {
    return {
      originalUrl: urlString,
      normalizedUrl: urlString,
      provider: PROVIDERS.unknown,
      parameters: [],
      utmParams: [],
      deepLink: null,
      trackingId: null,
      timestamp,
      isValid: false,
      warnings: [error || 'Invalid URL'],
    };
  }

  // Detect provider
  const provider = detectProvider(url.href);
  
  // Parse parameters
  const parameters = parseParameters(url);
  const utmParams = parameters.filter(p => p.category === 'utm');
  
  // Extract deep link
  const deepLink = extractDeepLink(parameters);
  
  // Extract tracking ID
  const trackingParam = parameters.find(p => 
    ['pid', 'c', 'campaign_id', 'af_c_id'].includes(p.key.toLowerCase())
  );
  const trackingId = trackingParam?.value || null;

  // Generate warnings
  if (utmParams.length === 0) {
    warnings.push('No UTM parameters found - tracking may be incomplete');
  }
  if (!deepLink) {
    warnings.push('No deep link destination detected');
  }
  if (provider.id === 'unknown') {
    warnings.push('Unknown link provider - some features may not work');
  }

  return {
    originalUrl: urlString,
    normalizedUrl: url.href,
    provider,
    parameters,
    utmParams,
    deepLink,
    trackingId,
    timestamp,
    isValid: true,
    warnings,
  };
}

// ============================================================================
// History Management
// ============================================================================

const HISTORY_KEY = 'dynamic_link_probe_history';
const MAX_HISTORY = 20;

export interface HistoryItem {
  url: string;
  provider: DynamicLinkProvider;
  timestamp: number;
}

export function saveToHistory(analysis: DynamicLinkAnalysis): void {
  if (!analysis.isValid) return;
  
  try {
    const history = loadHistory();
    const newItem: HistoryItem = {
      url: analysis.originalUrl,
      provider: analysis.provider.id,
      timestamp: analysis.timestamp,
    };
    
    // Remove duplicate
    const filtered = history.filter(h => h.url !== newItem.url);
    filtered.unshift(newItem);
    
    // Keep max items
    const trimmed = filtered.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage errors
  }
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore
  }
}

// ============================================================================
// URL Builder
// ============================================================================

export interface LinkBuilderParams {
  baseUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  deepLink?: string;
  customParams?: Record<string, string>;
}

export function buildDynamicLink(params: LinkBuilderParams): string {
  const { url, error } = parseUrl(params.baseUrl);
  if (!url || error) return params.baseUrl;

  if (params.utmSource) url.searchParams.set('utm_source', params.utmSource);
  if (params.utmMedium) url.searchParams.set('utm_medium', params.utmMedium);
  if (params.utmCampaign) url.searchParams.set('utm_campaign', params.utmCampaign);
  if (params.utmTerm) url.searchParams.set('utm_term', params.utmTerm);
  if (params.utmContent) url.searchParams.set('utm_content', params.utmContent);
  if (params.deepLink) url.searchParams.set('deep_link_value', params.deepLink);
  
  if (params.customParams) {
    Object.entries(params.customParams).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  return url.href;
}

// ============================================================================
// OneLink Analysis (AppsFlyer-specific)
// ============================================================================

export interface AppsFlyerParams {
  af_dp?: string;
  af_ios_url?: string;
  af_android_url?: string;
  af_web_dp?: string;
  deep_link_value?: string;
  deep_link_sub1?: string;
  deep_link_sub2?: string;
  deep_link_sub3?: string;
  deep_link_sub4?: string;
  deep_link_sub5?: string;
  pid?: string;
  c?: string;
  af_channel?: string;
  af_adset?: string;
  af_ad?: string;
  is_retargeting?: string;
}

export interface ValidationResult {
  schemeOk: boolean;
  hostOk: boolean;
  prefixOk: boolean;
  missingParams: string[];
  hasDeepLink: boolean;
  overallStatus: 'pass' | 'warn' | 'fail';
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
  }>;
}

export interface OneLinkAnalysis {
  baseUrl: string;
  query: Record<string, string>;
  afParams: AppsFlyerParams;
  effectiveDeepLink?: string;
  derivedDeepLink?: string;
  validation: ValidationResult;
  isAppsFlyer: boolean;
}

export function analyzeOneLink(
  urlString: string,
  config: AppDeepLinkConfig = TRUE_APP_CONFIG
): OneLinkAnalysis {
  const { url, error } = parseUrl(urlString.trim());
  
  if (!url || error) {
    return {
      baseUrl: urlString,
      query: {},
      afParams: {},
      validation: {
        schemeOk: false,
        hostOk: false,
        prefixOk: false,
        missingParams: [],
        hasDeepLink: false,
        overallStatus: 'fail',
        checks: [{ name: 'URL Parse', passed: false, message: error || 'Invalid URL' }],
      },
      isAppsFlyer: false,
    };
  }

  // Parse all query params
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    // Decode the value
    try {
      params[key] = decodeURIComponent(value);
    } catch {
      params[key] = value;
    }
  });

  // Extract AppsFlyer-specific params
  const afParams: AppsFlyerParams = {
    af_dp: params['af_dp'],
    af_ios_url: params['af_ios_url'],
    af_android_url: params['af_android_url'],
    af_web_dp: params['af_web_dp'],
    deep_link_value: params['deep_link_value'],
    deep_link_sub1: params['deep_link_sub1'],
    deep_link_sub2: params['deep_link_sub2'],
    deep_link_sub3: params['deep_link_sub3'],
    deep_link_sub4: params['deep_link_sub4'],
    deep_link_sub5: params['deep_link_sub5'],
    pid: params['pid'],
    c: params['c'],
    af_channel: params['af_channel'],
    af_adset: params['af_adset'],
    af_ad: params['af_ad'],
    is_retargeting: params['is_retargeting'],
  };

  // Check if this is an AppsFlyer link
  const isAppsFlyer = /onelink\.me|appsflyer\.com|af-link/i.test(url.href);

  // Determine effective deep link
  let effectiveDeepLink: string | undefined = afParams.af_dp;
  let derivedDeepLink: string | undefined;

  // If no af_dp but deep_link_value exists, derive the deep link
  if (!effectiveDeepLink && afParams.deep_link_value) {
    const page = afParams.deep_link_value;
    const requiredKeys = config.requiredParams[page] ?? config.requiredParams['default'] ?? [];
    const queryParts: string[] = [];

    // Add entry param by default
    queryParts.push('entry=onelink');
    
    // Add any sub params
    if (afParams.deep_link_sub1) queryParts.push(`sub1=${encodeURIComponent(afParams.deep_link_sub1)}`);
    if (afParams.deep_link_sub2) queryParts.push(`sub2=${encodeURIComponent(afParams.deep_link_sub2)}`);
    if (afParams.deep_link_sub3) queryParts.push(`sub3=${encodeURIComponent(afParams.deep_link_sub3)}`);

    const query = queryParts.length ? `?${queryParts.join('&')}` : '';
    derivedDeepLink = `${config.expectedDeepLinkPrefix}${page}${query}`;
    effectiveDeepLink = derivedDeepLink;
  }

  // Validation
  const checks: ValidationResult['checks'] = [];
  let schemeOk = false;
  let hostOk = false;
  let prefixOk = false;
  const missingParams: string[] = [];
  let hasDeepLink = false;

  if (effectiveDeepLink) {
    hasDeepLink = true;
    
    try {
      const deepUrl = new URL(effectiveDeepLink);
      const actualScheme = deepUrl.protocol.replace(':', '');
      const actualHost = deepUrl.host;

      schemeOk = actualScheme === config.expectedScheme;
      hostOk = actualHost === config.expectedHost;
      prefixOk = effectiveDeepLink.startsWith(config.expectedDeepLinkPrefix);

      checks.push({
        name: 'Scheme',
        passed: schemeOk,
        message: schemeOk 
          ? `✓ Scheme is ${config.expectedScheme}://` 
          : `✗ Expected ${config.expectedScheme}://, got ${actualScheme}://`,
      });

      checks.push({
        name: 'Host',
        passed: hostOk,
        message: hostOk 
          ? `✓ Host is ${config.expectedHost}` 
          : `✗ Expected ${config.expectedHost}, got ${actualHost}`,
      });

      checks.push({
        name: 'Prefix',
        passed: prefixOk,
        message: prefixOk 
          ? `✓ Deep link starts with ${config.expectedDeepLinkPrefix}` 
          : `✗ Deep link should start with ${config.expectedDeepLinkPrefix}`,
      });

      // Check required params for the page
      const page = deepUrl.pathname.replace(/^\//, '').split('/')[0] || 'default';
      const required = config.requiredParams[page] ?? config.requiredParams['default'] ?? [];

      for (const key of required) {
        if (!deepUrl.searchParams.has(key) && !params[key]) {
          missingParams.push(key);
        }
      }

      if (missingParams.length > 0) {
        checks.push({
          name: 'Required Params',
          passed: false,
          message: `✗ Missing params: ${missingParams.join(', ')}`,
        });
      } else if (required.length > 0) {
        checks.push({
          name: 'Required Params',
          passed: true,
          message: '✓ All required params present',
        });
      }
    } catch {
      checks.push({
        name: 'Deep Link Parse',
        passed: false,
        message: '✗ Could not parse deep link URL',
      });
    }
  } else {
    checks.push({
      name: 'Deep Link',
      passed: false,
      message: '⚠ No deep link (af_dp or deep_link_value) found',
    });
  }

  // Check for AppsFlyer-specific params
  if (isAppsFlyer) {
    if (!afParams.pid) {
      checks.push({
        name: 'Media Source (pid)',
        passed: false,
        message: '⚠ No pid (media source) specified',
      });
    } else {
      checks.push({
        name: 'Media Source (pid)',
        passed: true,
        message: `✓ pid = ${afParams.pid}`,
      });
    }

    if (!afParams.c) {
      checks.push({
        name: 'Campaign (c)',
        passed: false,
        message: '⚠ No campaign name (c) specified',
      });
    } else {
      checks.push({
        name: 'Campaign (c)',
        passed: true,
        message: `✓ c = ${afParams.c}`,
      });
    }
  }

  // Calculate overall status
  const failedCritical = !schemeOk || !hostOk || !prefixOk;
  const hasWarnings = missingParams.length > 0 || !afParams.pid || !afParams.c;
  
  let overallStatus: ValidationResult['overallStatus'] = 'pass';
  if (!hasDeepLink || failedCritical) {
    overallStatus = 'fail';
  } else if (hasWarnings) {
    overallStatus = 'warn';
  }

  return {
    baseUrl: `${url.origin}${url.pathname}`,
    query: params,
    afParams,
    effectiveDeepLink,
    derivedDeepLink,
    validation: {
      schemeOk,
      hostOk,
      prefixOk,
      missingParams,
      hasDeepLink,
      overallStatus,
      checks,
    },
    isAppsFlyer,
  };
}

// ============================================================================
// Curl Command Generator
// ============================================================================

export type Platform = 'desktop' | 'ios' | 'android';

export interface CurlCommand {
  platform: Platform;
  label: string;
  userAgent: string;
  command: string;
}

const USER_AGENTS: Record<Platform, { label: string; ua: string }> = {
  desktop: {
    label: 'Desktop (Chrome macOS)',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  ios: {
    label: 'iOS Safari (iPhone)',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  },
  android: {
    label: 'Android Chrome (Pixel)',
    ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.224 Mobile Safari/537.36',
  },
};

export function generateCurlCommands(oneLinkUrl: string): CurlCommand[] {
  const escapedUrl = oneLinkUrl.replace(/"/g, '\\"');
  
  return (['desktop', 'ios', 'android'] as Platform[]).map(platform => {
    const { label, ua } = USER_AGENTS[platform];
    return {
      platform,
      label,
      userAgent: ua,
      command: `curl -vL \\\n  -A "${ua}" \\\n  "${escapedUrl}"`,
    };
  });
}

// ============================================================================
// Test Matrix
// ============================================================================

export type AppState = 'installed' | 'not_installed';

export interface TestScenario {
  id: string;
  platform: Platform | 'desktop';
  appState: AppState | 'na';
  expectedBehavior: string;
  actualResult?: string;
  notes?: string;
  status?: 'pending' | 'pass' | 'fail' | 'skip';
}

export function generateTestMatrix(
  analysis: OneLinkAnalysis,
  config: AppDeepLinkConfig = TRUE_APP_CONFIG
): TestScenario[] {
  const deepLink = analysis.effectiveDeepLink || 'N/A';
  
  return [
    {
      id: 'ios-installed',
      platform: 'ios',
      appState: 'installed',
      expectedBehavior: `Open ${config.name} via ${deepLink}`,
      status: 'pending',
    },
    {
      id: 'ios-not-installed',
      platform: 'ios',
      appState: 'not_installed',
      expectedBehavior: `Redirect to App Store (${config.expectedIosStoreUrlPrefix}...)`,
      status: 'pending',
    },
    {
      id: 'android-installed',
      platform: 'android',
      appState: 'installed',
      expectedBehavior: `Open ${config.name} via ${deepLink}`,
      status: 'pending',
    },
    {
      id: 'android-not-installed',
      platform: 'android',
      appState: 'not_installed',
      expectedBehavior: `Redirect to Play Store (${config.expectedAndroidStoreUrlPrefix}...)`,
      status: 'pending',
    },
    {
      id: 'desktop',
      platform: 'desktop',
      appState: 'na',
      expectedBehavior: `Redirect to web fallback (${config.expectedWebFallbackPrefix}...)`,
      status: 'pending',
    },
  ];
}

// ============================================================================
// Test Matrix Persistence
// ============================================================================

const TEST_MATRIX_KEY = 'onelink_test_matrix';

export function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function saveTestMatrix(oneLinkUrl: string, scenarios: TestScenario[]): void {
  try {
    const key = `${TEST_MATRIX_KEY}:${hashUrl(oneLinkUrl)}`;
    localStorage.setItem(key, JSON.stringify({
      url: oneLinkUrl,
      scenarios,
      updatedAt: Date.now(),
    }));
  } catch {
    // Ignore
  }
}

export function loadTestMatrix(oneLinkUrl: string): TestScenario[] | null {
  try {
    const key = `${TEST_MATRIX_KEY}:${hashUrl(oneLinkUrl)}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.scenarios;
  } catch {
    return null;
  }
}

// ============================================================================
// Export Functions
// ============================================================================

export function exportAsMarkdown(
  analysis: OneLinkAnalysis,
  scenarios: TestScenario[],
  config: AppDeepLinkConfig = TRUE_APP_CONFIG
): string {
  const lines: string[] = [];
  
  lines.push(`# OneLink Analysis Report`);
  lines.push(`**App:** ${config.name}`);
  lines.push(`**Date:** ${new Date().toISOString()}`);
  lines.push('');
  
  lines.push(`## OneLink URL`);
  lines.push('```');
  lines.push(analysis.baseUrl + '?' + Object.entries(analysis.query).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'));
  lines.push('```');
  lines.push('');
  
  lines.push(`## Effective Deep Link`);
  lines.push('```');
  lines.push(analysis.effectiveDeepLink || 'N/A');
  lines.push('```');
  lines.push('');
  
  lines.push(`## Validation Status: ${analysis.validation.overallStatus.toUpperCase()}`);
  lines.push('');
  for (const check of analysis.validation.checks) {
    lines.push(`- ${check.message}`);
  }
  lines.push('');
  
  lines.push(`## AppsFlyer Parameters`);
  lines.push('| Key | Value |');
  lines.push('|-----|-------|');
  for (const [key, value] of Object.entries(analysis.afParams)) {
    if (value) {
      lines.push(`| ${key} | \`${value}\` |`);
    }
  }
  lines.push('');
  
  lines.push(`## Test Matrix`);
  lines.push('| Platform | App State | Expected | Status | Notes |');
  lines.push('|----------|-----------|----------|--------|-------|');
  for (const s of scenarios) {
    lines.push(`| ${s.platform} | ${s.appState} | ${s.expectedBehavior} | ${s.status || 'pending'} | ${s.notes || ''} |`);
  }
  lines.push('');
  
  return lines.join('\n');
}

export function exportAsJson(
  analysis: OneLinkAnalysis,
  scenarios: TestScenario[]
): string {
  return JSON.stringify({
    analysis,
    scenarios,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}
