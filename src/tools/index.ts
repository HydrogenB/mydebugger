import { lazy } from "react";

// Tool category types - Expanded with more specific categories
export type ToolCategory =
  | "Encoding"
  | "Security"
  | "Testing"
  | "Utilities"
  | "Conversion"
  | "Formatters";

// Icons for tools and categories
export interface IconProps {
  className?: string;
}

// Component interfaces
export interface ToolIcon {
  name: string;
  component: React.FC<IconProps>;
}

// Tool interface definition with expanded properties for better UX
export interface Tool {
  id: string; // Unique identifier
  route: string; // URL route
  title: string; // Display title
  description: string; // Short description
  longDescription?: string; // Extended description for tool page
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  category: ToolCategory;
  icon: React.FC<IconProps>; // Icon component
  isNew?: boolean; // Flag for new tools
  isBeta?: boolean; // Flag for beta tools
  isPopular?: boolean; // Flag for popular tools
  metadata: {
    keywords: string[];
    learnMoreUrl?: string;
    relatedTools?: string[]; // IDs of related tools
  };
  uiOptions?: {
    theme?: "light" | "dark" | "system"; // Tool-specific theme
    fullWidth?: boolean; // Whether tool uses full width
    showExamples?: boolean; // Whether to show examples
  };
}

// Import icons from design system
import {
  SecurityIcon,
  EncodingIcon,
  TestingIcon,
  UtilitiesIcon,
  ConversionIcon,
  FormattersIcon,
  JwtIcon,
  UrlIcon,
  HeadersIcon,
  RegexIcon,
  QrCodeIcon,
  ClickJackingIcon,
  LinkTracerIcon,
  CookieIcon,
  CacheIcon,
  PushIcon,
  ContactCardIcon,
  ImageCompressIcon,
  ThongThaiIcon,
} from "../design-system/icons/tool-icons";

// Category definitions with icons for consistent UI
export const categories: Record<
  ToolCategory,
  { icon: React.FC<IconProps>; description: string }
> = {
  Encoding: {
    icon: EncodingIcon,
    description: "Transform data between different encoding formats",
  },
  {
    id: "random-password-generator",
    route: "/random-password-generator",
    title: "Random Password Generator",
    description: "Create strong passwords, UUIDs, and cryptographic keys locally.",
    icon: SecurityIcon,
    component: lazy(() => import("./random-password-generator/page")),
    category: "Security",
    isNew: true,
    metadata: {
      keywords: [
        "password generator",
        "random password",
        "uuid",
        "key generator",
        "crypto",
        "secure",
        "local",
      ],
      learnMoreUrl: "https://www.avast.com/random-password-generator#pc",
      relatedTools: ["jwt-toolkit"],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: "json-compare",
    route: "/json-compare",
    title: "JSON Compare",
    description: "Compare two JSON documents and export a diff report.",
    icon: FormattersIcon,
    component: lazy(() => import("./json-compare/page")),
    category: "Formatters",
    isNew: true,
    metadata: {
      keywords: ["json", "diff", "compare", "delta", "added", "removed", "modified"],
      relatedTools: ["json-converter", "csv-to-markdown"],
    },
    uiOptions: { showExamples: false, fullWidth: true },
  },
  Security: {
    icon: SecurityIcon,
    description: "Tools for security testing, token validation, and encryption",
  },
  Testing: {
    icon: TestingIcon,
    description:
      "Validate and test various network configurations and responses",
  },
  Utilities: {
    icon: UtilitiesIcon,
    description: "General purpose developer utilities",
  },
  Conversion: {
    icon: ConversionIcon,
    description: "Convert between different data formats",
  },
  Formatters: {
    icon: FormattersIcon,
    description: "Format and prettify code and data",
  },
};

// Tool registry - central list of all available tools
// This drives routes, homepage, SEO, and navigation
const toolRegistry: Tool[] = [
  {
    id: "jwt-toolkit",
    route: "/jwt",
    title: "JWT Toolkit",
    description:
      "Comprehensive toolkit for JWT: decode, build, inspect, verify and benchmark tokens.",
    longDescription:
      "Complete JWT toolkit for developers: decode, create, inspect, verify and benchmark JSON Web Tokens with security analysis and JWKS support.",
    icon: JwtIcon,
    component: lazy(() => import("./jwt/JwtToolkit")),
    category: "Security",
    isPopular: true,
    metadata: {
      keywords: [
        "jwt",
        "token",
        "generator",
        "decoder",
        "verification",
        "json web token",
        "authentication",
        "verify",
        "jwks",
        "security analysis",
        "jwt inspector",
        "jwt benchmark",
      ],
      learnMoreUrl: "https://jwt.io/introduction",
      relatedTools: ["url-encoder", "headers-analyzer"],
    },
    uiOptions: {
      showExamples: true,
    },
  },
  {
    id: "url-encoder",
    route: "/url-encoder",
    title: "URL Encoder/Decoder",
    description: "Encode or decode URL components safely.",
    icon: UrlIcon,
    component: lazy(() => import("./url/UrlEncoder")),
    category: "Encoding",
    isPopular: true,
    metadata: {
      keywords: ["url", "encoding", "decoding", "uri", "querystring"],
      learnMoreUrl:
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent",
      relatedTools: ["jwt-toolkit"],
    },
    uiOptions: {
      showExamples: true,
    },
  },
  {
    id: "headers-analyzer",
    route: "/headers",
    title: "HTTP Headers Analyzer",
    description: "Analyze and understand HTTP request/response headers.",
    icon: HeadersIcon,
    component: lazy(() => import("./headers/HeadersAnalyzer")),
    category: "Testing",
    isBeta: true,
    metadata: {
      keywords: ["http", "headers", "request", "response", "analyze"],
      learnMoreUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
      relatedTools: ["jwt-toolkit", "url-encoder", "clickjacking-validator"],
    },
  },
  {
    id: "regex-tester",
    route: "/regex",
    title: "Regex Tester",
    description: "Test and debug regular expressions with real-time matching.",
    icon: RegexIcon,
    component: lazy(() => import("./regex/RegexTester")),
    category: "Utilities",
    isBeta: true,
    metadata: {
      keywords: ["regex", "regular expression", "pattern", "test", "match"],
      learnMoreUrl:
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions",
      relatedTools: ["url-encoder"],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "qrcode-generator",
    route: "/qrcode",
    title: "Deep-Link Tester & QR Generator",
    description:
      "Generate QR codes for any link or deeplink, test them directly and share with your team.",
    icon: QrCodeIcon,
    component: lazy(() => import("./qrcode/QRCodeGenerator")),
    category: "Utilities",
    isPopular: true,
    metadata: {
      keywords: [
        "qr code",
        "qrcode",
        "generator",
        "scanner",
        "mobile",
        "deeplink",
        "app link",
        "url testing",
      ],
      learnMoreUrl: "https://en.wikipedia.org/wiki/QR_code",
      relatedTools: ["url-encoder", "headers-analyzer"],
    },
    uiOptions: {
      showExamples: true,
    },
  },
  {
    id: "qrscan",
    route: "/qrscan",
    title: "QR Scanner",
    description: "Scan QR codes using your device camera.",
    icon: QrCodeIcon,
    component: lazy(() => import("./qrscan/index")),
    category: "Utilities",
    metadata: {
      keywords: ["qr", "scanner", "camera", "qr code"],
      relatedTools: ["qrcode-generator"],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: "clickjacking-validator",
    route: "/clickjacking",
    title: "Click Jacking Validator",
    description:
      "Check if websites are vulnerable to click jacking attacks by analyzing headers and iframe loading.",
    icon: ClickJackingIcon,
    component: lazy(() => import("./clickjacking/ClickJackingValidator")),
    category: "Security",
    metadata: {
      keywords: [
        "clickjacking",
        "security",
        "x-frame-options",
        "csp",
        "iframe",
        "vulnerability",
        "content-security-policy",
        "frame-ancestors",
      ],
      learnMoreUrl: "https://owasp.org/www-community/attacks/Clickjacking",
      relatedTools: ["headers-analyzer", "jwt-toolkit"],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "device-trace",
    route: "/device-trace",
    title: "Dynamic-Link Probe",
    description:
      "Test how App Flyer/OneLink URLs behave across different device contexts and installation states.",
    icon: LinkTracerIcon, // Reusing the same icon for now
    component: lazy(() => import("./device-trace/page")),
    category: "Testing",
    metadata: {
      keywords: [
        "app flyer",
        "one link",
        "dynamic link",
        "deep link",
        "device probe",
        "app store",
        "play store",
        "universal link",
      ],
      learnMoreUrl:
        "https://support.appsflyer.com/hc/en-us/articles/207032366-OneLink-overview",
      relatedTools: ["headers-analyzer"],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "dynamic-link-probe",
    route: "/dynamic-link-probe",
    title: "Dynamic Link Tracker",
    description: "Parse dynamic link parameters and display a debug overlay.",
    icon: LinkTracerIcon,
    component: lazy(() => import("./dynamic-link-probe/page")),
    category: "Testing",
    metadata: {
      keywords: ["dynamic link", "debug", "utm", "tracking"],
      relatedTools: ["deep-link-chain"],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "deep-link-chain",
    route: "/deep-link-chain",
    title: "Deep Link Chain",
    description:
      "Follow redirects and extract UTM parameters entirely in the browser.",
    icon: LinkTracerIcon,
    component: lazy(() => import("./deep-link-chain/page")),
    category: "Testing",
    metadata: {
      keywords: ["redirect", "utm", "deep link", "link trace", "url"],
      learnMoreUrl:
        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections",
      relatedTools: ["url-encoder"],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "cookie-inspector",
    route: "/cookies",
    title: "Cookie Inspector",
    description: "View cookies for this session and export them.",
    icon: CookieIcon,
    component: lazy(() => import("./cookie-inspector/page")),
    category: "Testing",
    metadata: {
      keywords: ["cookie", "debug", "browser", "httpOnly", "session"],
      relatedTools: [],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "cache-inspector",
    route: "/cache-inspector",
    title: "Cache Inspector",
    description: "Inspect browser caching for loaded resources.",
    icon: CacheIcon,
    component: lazy(() => import("./cache-inspector/page")),
    category: "Testing",
    metadata: {
      keywords: ["cache", "http", "service worker", "resource timing"],
      relatedTools: ["headers-analyzer"], // Assuming standard related tools
    },
    uiOptions: {
      showExamples: false, // Assuming standard UI options
    },
  },
  {
    id: "storage-sync-debugger",
    route: "/storage-sync",
    title: "Storage Sync Debugger",
    description:
      "Inspect localStorage and sessionStorage with live sync events.",
    icon: UtilitiesIcon,
    component: lazy(() => import("./storage-sync/page")),
    category: "Utilities",
    metadata: {
      keywords: ["localStorage", "sessionStorage", "debug", "storage"],
      relatedTools: [],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "virtual-card",
    route: "/vcard",
    title: "Virtual Name Card",
    description:
      "Generate and share a digital contact card with QR code and download.",
    icon: ContactCardIcon,
    component: lazy(() => import("./virtual-card/page")),
    category: "Utilities",
    metadata: {
      keywords: ["vcard", "contact", "qr", "vcf", "share"],
      relatedTools: ["qrcode-generator"],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "cookie-scope",
    route: "/cookie-scope",
    title: "Cookie Scope",
    description: "Visualize document cookies and highlight duplicates.",
    icon: CookieIcon,
    component: lazy(() => import("./cookie-scope/page")),
    category: "Testing",
    metadata: {
      keywords: ["cookie", "scope", "document.cookie", "browser"],
      relatedTools: ["cookie-inspector"],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "cors-tester",
    route: "/cors-tester",
    title: "CORS Tester",
    description: "Debug CORS preflight responses.",
    icon: HeadersIcon,
    component: lazy(() => import("./cors-tester/page")),
    category: "Testing",
    metadata: {
      keywords: ["cors", "preflight", "debug", "headers"],
      relatedTools: ["headers-analyzer"],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "crypto-lab",
    route: "/crypto-lab",
    title: "Crypto Lab",
    description:
      "Play with AES and RSA encryption, generate keys, and test algorithms.",

    icon: SecurityIcon,
    component: lazy(() => import("./aes-cbc/page")),
    category: "Security",
    metadata: {
      keywords: [
        "aes",
        "gcm",
        "rsa",
        "encryption",
        "decryption",
        "crypto",
        "cbc",
        "security",
      ],

      relatedTools: [],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "pentest-suite",
    route: "/pentest-suite",
    title: "Pentest Validator Suite",
    description:
      "Run basic security checks like HTTPS enforcement and clickjacking detection.",
    icon: SecurityIcon,
    component: lazy(() => import("./pentest/page")),
    category: "Security",
    metadata: {
      keywords: [
        "pentest",
        "security",
        "https",
        "cors",
        "xss",
        "open redirect",
        "clickjacking",
      ],
      relatedTools: ["clickjacking-validator", "headers-analyzer"],
    },
    uiOptions: {
      showExamples: false,
    },
  },
  {
    id: "header-scanner",
    route: "/header-scanner",
    title: "Header Scanner",
    description: "Scan security headers and get fix tips.",
    icon: HeadersIcon,
    component: lazy(() => import("./header-scanner/page")),
    category: "Security",
    metadata: {
      keywords: ["security headers", "csp", "hsts", "referrer-policy"],
      relatedTools: ["headers-analyzer", "pentest-suite"],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: "pre-rendering-tester",
    route: "/pre-rendering-tester",
    title: "Pre-rendering & SEO Meta Tester",
    description:
      "Test how Googlebot, Bingbot, Facebook, and real users see your web content — including title, description and H1 rendering.",
    icon: TestingIcon,
    component: lazy(() => import("./pre-rendering-tester/page")),
    category: "Testing",
    metadata: {
      keywords: [
        "seo",
        "prerender",
        "crawler",
        "meta description",
        "user-agent",
      ],
      relatedTools: ["fetch-render"],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: "fetch-render",
    route: "/fetch-render",
    title: "Fetch & Render",
    description: "Emulate JS rendering and capture DOM.",
    icon: TestingIcon,
    component: lazy(() => import("./fetch-render/page")),
    category: "Testing",
    metadata: {
      keywords: ["seo", "render", "javascript", "dom snapshot"],
      relatedTools: ["pre-rendering-tester"],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: "permission-tester",
    route: "/permission-tester",
    title: "Web Permission Tester",
    description:
      "Request, inspect, and test browser permissions with live previews and code snippets.",
    icon: SecurityIcon,
    component: lazy(() => import("./permission-tester/page")),
    category: "Testing",
    isNew: true,
    metadata: {
      keywords: [
        "permissions",
        "browser permissions",
        "geolocation",
        "camera",
        "microphone",
        "notifications",
        "clipboard",
        "api testing",
        "web api",
        "permission state",
      ],
      learnMoreUrl:
        "https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API",
      relatedTools: ["headers-analyzer", "cors-tester"],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: "push-tester",
    route: "/push-tester",
    title: "PWA Push Tester",
    description: "Verify Web Push capability end-to-end.",
    icon: PushIcon,
    component: lazy(() => import("./push-tester/page")),
    category: "Testing",
    metadata: {
      keywords: ["push", "notification", "service worker"],
      relatedTools: ["permission-tester"],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: "generate-large-image",
    route: "/generate-large-image",
    title: "Generate Large Image",
    description: "Create dummy images for upload testing.",
    icon: UtilitiesIcon,
    component: lazy(() => import("./generate-large-image/page")),
    category: "Testing",
    metadata: {
      keywords: ["image", "upload", "test", "dummy"],
      relatedTools: [],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: 'api-simulator',
    route: '/api-simulator',
    title: 'API Simulator',
    description: 'Encode JSON to Base64 and test API responses.',
    icon: TestingIcon,
    component: lazy(() => import('./api-simulator/page')),
    category: 'Testing',
    metadata: {
      keywords: ['api', 'testing', 'mock', 'delay', 'status'],
      relatedTools: ['headers-analyzer', 'cors-tester']
    },
  uiOptions: { showExamples: false }
},
  {
    id: 'api-test',
    route: '/api-test',
    title: 'API Request Repeater',
    description: 'Repeat HTTP requests from a curl command.',
    icon: TestingIcon,
    component: lazy(() => import('./api-test/page')),
    category: 'Testing',
    isNew: true,
    metadata: {
      keywords: ['curl', 'http', 'testing', 'repeater'],
      relatedTools: ['api-simulator', 'websocket-simulator']
    },
    uiOptions: { showExamples: false }
  },
  {
    id: 'network-suit',
    route: '/networksuit',
    title: 'Network Test Suite',
    description: 'Check connection type, ping and download speed.',
    icon: TestingIcon,
    component: lazy(() => import('./networksuit/page')),
    category: 'Testing',
    metadata: {
      keywords: ['network', 'ping', 'speed', 'connection'],
      relatedTools: []
    },
  uiOptions: { showExamples: false }
  },
  {
    id: "image-compressor",
    route: "/image-compressor",
    title: "Image Compressor",
    description: "Resize and compress images client-side.",
    icon: ImageCompressIcon,
    component: lazy(() => import("./image-compressor/page")),
    category: "Utilities",
    metadata: {
      keywords: ["image", "compress", "resize", "optimize"],
      relatedTools: ["generate-large-image"],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: "thong-thai",
    route: "/thong-thai",
    title: "Thong Thai Flag Creator",
    description: "Create, animate, and export the Thai national flag.",
    icon: ThongThaiIcon,
    component: lazy(() => import("./thong-thai/page")),
    category: "Utilities",
    isNew: true,
    metadata: {
      keywords: [
        "thai",
        "flag",
        "animation",
        "canvas",
        "webm",
        "png",
        "export",
        "wave",
        "thai flag",
      ],
      relatedTools: ["image-compressor", "generate-large-image", "qrcode-generator"],
    },
    uiOptions: { showExamples: false, fullWidth: true },
  },
  {
    id: "metadata-echo",
    route: "/metadata-echo",
    title: "Metadata Echo",
    description: "Display browser metadata for debugging.",
    icon: UtilitiesIcon,
    component: lazy(() => import("./metadata-echo/page")),
    category: "Utilities",
    metadata: {
      keywords: ["browser", "metadata", "user agent", "device"],
      relatedTools: [],
    },
    uiOptions: { showExamples: false },
  },
  /*{
    id: "websocket-simulator",
    route: "/websocket-simulator",
    title: "WebSocket Simulator",
    description: "Send PUB messages over WebSocket at intervals.",
    icon: UtilitiesIcon,
    component: lazy(() => import("./websocket-simulator/page.tsx")),
    category: "Utilities",
    metadata: {
      keywords: ["websocket", "nats", "testing", "binary"],
      relatedTools: [],
    },
    uiOptions: { showExamples: false },
  },*/
  {
    id: "csv-to-markdown",
    route: "/csvtomd",
    title: "CSV to Markdown",
    description: "Convert CSV tables to GitHub-flavored Markdown.",
    icon: ConversionIcon,
    component: lazy(() => import("./csvtomd/page")),
    category: "Conversion",
    metadata: {
      keywords: ["csv", "markdown", "table", "convert"],
      relatedTools: [],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: "json-converter",
    route: "/json-converter",
    title: "JSON to CSV / Excel Converter",
    description: "Convert JSON data to CSV or Excel spreadsheets.",
    icon: ConversionIcon,
    component: lazy(() => import("./json-converter/page")),
    category: "Conversion",
    metadata: {
      keywords: ["json", "csv", "excel", "convert"],
      relatedTools: ["csv-to-markdown"],
    },
    uiOptions: { showExamples: false },
  },
  {
    id: "stayawake",
    route: "/stayawake",
    title: "Stay Awake Toggle",
    description: "Prevent the screen from sleeping.",
    icon: UtilitiesIcon,
    component: lazy(() => import("./stayawake/page")),
    category: "Utilities",
    metadata: {
      keywords: ["wake lock", "screen", "sleep"],
      relatedTools: [],
    },
    uiOptions: { showExamples: false },
  },
];

export default toolRegistry;

// Export a function to get all tools
// Returns the list of tools shown on the Home screen
// JWT Toolkit remains available via direct route but is hidden from listings
export const getTools = (): Tool[] =>
  toolRegistry.filter((tool) => tool.id !== "jwt-toolkit");

// Helper functions to work with the tool registry
export const getToolByRoute = (route: string): Tool | undefined =>
  toolRegistry.find((tool) => tool.route === route);

export const getToolById = (id: string): Tool | undefined => {
  return toolRegistry.find((tool) => tool.id === id);
};

export const getToolsByCategory = (category: ToolCategory): Tool[] =>
  getTools().filter((tool) => tool.category === category);

export const getRelatedTools = (toolId: string): Tool[] => {
  const tool = getToolById(toolId);
  if (!tool || !tool.metadata.relatedTools) return [];

  return tool.metadata.relatedTools
    .map((relatedId) => getToolById(relatedId))
    .filter((tool): tool is Tool => tool !== undefined);
};

export const getPopularTools = (): Tool[] =>
  getTools().filter((tool) => tool.isPopular);

export const getNewTools = (): Tool[] =>
  getTools().filter((tool) => tool.isNew);

export const getBetaTools = (): Tool[] =>
  getTools().filter((tool) => tool.isBeta);

export const getAllTools = (): Tool[] => {
  return toolRegistry;
};

export const getAllCategories = (): ToolCategory[] => {
  const categorySet = new Set<ToolCategory>();
  getTools().forEach((tool) => categorySet.add(tool.category));
  return Array.from(categorySet);
};
