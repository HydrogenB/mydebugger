import { lazy } from 'react';

// Tool category types - Expanded with more specific categories
export type ToolCategory = 
  | 'Encoding' 
  | 'Security' 
  | 'Testing' 
  | 'Utilities' 
  | 'Conversion' 
  | 'Formatters';

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
  id: string;               // Unique identifier
  route: string;            // URL route
  title: string;            // Display title
  description: string;      // Short description
  longDescription?: string; // Extended description for tool page
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  category: ToolCategory;
  icon: React.FC<IconProps>; // Icon component
  isNew?: boolean;          // Flag for new tools
  isBeta?: boolean;         // Flag for beta tools
  isPopular?: boolean;      // Flag for popular tools
  metadata: {
    keywords: string[];
    learnMoreUrl?: string;
    relatedTools?: string[]; // IDs of related tools
  };
  uiOptions?: {
    theme?: 'light' | 'dark' | 'system'; // Tool-specific theme
    fullWidth?: boolean;      // Whether tool uses full width
    showExamples?: boolean;   // Whether to show examples
  };
}

// Import icons from design system
import { 
  SecurityIcon, 
  EncodingIcon, 
  TestingIcon, 
  UtilitiesIcon, 
  ConversionIcon,
  FormattersIcon,  JwtIcon,
  UrlIcon, 
  HeadersIcon,
  RegexIcon,
  DnsIcon,
  QrCodeIcon,
  ClickJackingIcon,
  LinkTracerIcon,
  Base64ImageIcon,
  CookieIcon
} from '../design-system/icons/tool-icons';

// Category definitions with icons for consistent UI
export const categories: Record<ToolCategory, { icon: React.FC<IconProps>, description: string }> = {
  'Encoding': { 
    icon: EncodingIcon,
    description: 'Transform data between different encoding formats'
  },
  'Security': { 
    icon: SecurityIcon,
    description: 'Tools for security testing, token validation, and encryption'
  },
  'Testing': { 
    icon: TestingIcon,
    description: 'Validate and test various network configurations and responses'
  },
  'Utilities': { 
    icon: UtilitiesIcon,
    description: 'General purpose developer utilities'
  },
  'Conversion': { 
    icon: ConversionIcon,
    description: 'Convert between different data formats'
  },
  'Formatters': { 
    icon: FormattersIcon,
    description: 'Format and prettify code and data'
  }
};

// Tool registry - central list of all available tools
// This drives routes, homepage, SEO, and navigation
const toolRegistry: Tool[] = [
  {
    id: 'jwt-toolkit',
    route: '/jwt',
    title: 'JWT Toolkit',
    description: 'Comprehensive toolkit for JWT: decode, build, inspect, verify and benchmark tokens.',
    longDescription: 'Complete JWT toolkit for developers: decode, create, inspect, verify and benchmark JSON Web Tokens with security analysis and JWKS support.',
    icon: JwtIcon,
    component: lazy(() => import('./jwt/JwtToolkit')),
    category: 'Security',
    isPopular: true,
    metadata: {
      keywords: ['jwt', 'token', 'generator', 'decoder', 'verification', 'json web token', 'authentication', 'verify', 'jwks', 'security analysis', 'jwt inspector', 'jwt benchmark'],
      learnMoreUrl: 'https://jwt.io/introduction',
      relatedTools: ['url-encoder', 'headers-analyzer'],
    },
    uiOptions: {
      showExamples: true
    }
  },
  {
    id: 'url-encoder',
    route: '/url-encoder',
    title: 'URL Encoder/Decoder',
    description: 'Encode or decode URL components safely.',
    icon: UrlIcon,
    component: lazy(() => import('./url/UrlEncoder')),
    category: 'Encoding',
    isPopular: true,
    metadata: {
      keywords: ['url', 'encoding', 'decoding', 'uri', 'querystring'],
      learnMoreUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent',
      relatedTools: ['jwt-toolkit'],
    },
    uiOptions: {
      showExamples: true
    }
  },
  {
    id: 'headers-analyzer',
    route: '/headers',
    title: 'HTTP Headers Analyzer',
    description: 'Analyze and understand HTTP request/response headers.',
    icon: HeadersIcon,
    component: lazy(() => import('./headers/HeadersAnalyzer')),
    category: 'Testing',
    isBeta: true,
    metadata: {
      keywords: ['http', 'headers', 'request', 'response', 'analyze'],
      learnMoreUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers',
      relatedTools: ['jwt-toolkit', 'url-encoder', 'clickjacking-validator'],
    }
  },
  {
    id: 'regex-tester',
    route: '/regex',
    title: 'Regex Tester',
    description: 'Test and debug regular expressions with real-time matching.',
    icon: RegexIcon,
    component: lazy(() => import('./regex/RegexTester')),
    category: 'Utilities',
    isBeta: true,
    metadata: {
      keywords: ['regex', 'regular expression', 'pattern', 'test', 'match'],
      learnMoreUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions',
      relatedTools: ['url-encoder'],
    },
    uiOptions: {
      showExamples: false
    }
  },
  {
    id: 'dns-lookup',
    route: '/dns-check',
    title: 'DNS Lookup Tool',
    description: 'Query DNS records for any domain name.',
    icon: DnsIcon,
    component: lazy(() => import('./dns/DnsLookup')),
    category: 'Testing',
    isBeta: true,
    metadata: {
      keywords: ['dns', 'lookup', 'domain', 'nameserver', 'records'],
      learnMoreUrl: 'https://www.cloudflare.com/learning/dns/what-is-dns/',
      relatedTools: ['headers-analyzer'],
    }
  },
  {
    id: 'qrcode-generator',
    route: '/qrcode',
    title: 'Deep-Link Tester & QR Generator',
    description: 'Generate QR codes for any link or deeplink, test them directly and share with your team.',
    icon: QrCodeIcon,
    component: lazy(() => import('./qrcode/QRCodeGenerator')),
    category: 'Utilities',
    isPopular: true,
    metadata: {
      keywords: ['qr code', 'qrcode', 'generator', 'scanner', 'mobile', 'deeplink', 'app link', 'url testing'],
      learnMoreUrl: 'https://en.wikipedia.org/wiki/QR_code',
      relatedTools: ['url-encoder', 'headers-analyzer'],
    },
    uiOptions: {
      showExamples: true
    }
  },
  {
    id: 'clickjacking-validator',
    route: '/clickjacking',
    title: 'Click Jacking Validator',
    description: 'Check if websites are vulnerable to click jacking attacks by analyzing headers and iframe loading.',
    icon: ClickJackingIcon,
    component: lazy(() => import('./clickjacking/ClickJackingValidator')),
    category: 'Security',
    metadata: {
      keywords: ['clickjacking', 'security', 'x-frame-options', 'csp', 'iframe', 'vulnerability', 'content-security-policy', 'frame-ancestors'],
      learnMoreUrl: 'https://owasp.org/www-community/attacks/Clickjacking',
      relatedTools: ['headers-analyzer', 'jwt-toolkit'],
    },
    uiOptions: {
      showExamples: false
    }
  },
  {
    id: 'link-tracer',
    route: '/link-tracer',
    title: 'Link Tracer',
    description: 'Trace the complete redirect path of any URL, showing each hop, status code and latency.',
    icon: LinkTracerIcon,
    component: lazy(() => import('./linktracer/LinkTracer')),
    category: 'Testing',
    metadata: {
      keywords: ['redirect', 'trace', 'url', 'link', 'shortened url', 'redirect chain', 'http status', 'redirect checker'],
      learnMoreUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections',
      relatedTools: ['headers-analyzer', 'url-encoder'],
    },
    uiOptions: {
      showExamples: false
    }
  },
  {
    id: 'device-trace',
    route: '/device-trace',
    title: 'Dynamic-Link Probe',
    description: 'Test how App Flyer/OneLink URLs behave across different device contexts and installation states.',
    icon: LinkTracerIcon, // Reusing the same icon for now
    component: lazy(() => import('./linktracer/DeviceTrace')),
    category: 'Testing',
    metadata: {
      keywords: ['app flyer', 'one link', 'dynamic link', 'deep link', 'device probe', 'app store', 'play store', 'universal link'],
      learnMoreUrl: 'https://support.appsflyer.com/hc/en-us/articles/207032366-OneLink-overview',
      relatedTools: ['link-tracer', 'headers-analyzer'],
    },
    uiOptions: {
      showExamples: false
    }
  },
  {
    id: 'components-demo',
    route: '/components-demo',
    title: 'Components Demo',
    description: 'Showcase of various UI components and their usage.',
    icon: UtilitiesIcon,
    component: lazy(() => import('./components-demo/ComponentsDemo')),
    category: 'Utilities',
    metadata: {
      keywords: ['components', 'demo', 'ui', 'showcase'],
      learnMoreUrl: 'https://reactjs.org/docs/components-and-props.html',
      relatedTools: [],
    },
    uiOptions: {
      showExamples: true
    }
  },
  {
    id: 'base64-image',
    route: '/base64-image',
    title: 'Base64 Image Debugger',
    description: 'Debug and visualize base64-encoded images with detailed information.',
    longDescription: 'Tool to visualize base64-encoded images and display detailed information about them including format, dimensions, file size and more.',
    icon: Base64ImageIcon,
    component: lazy(() => import('./base64-image/page')),
    category: 'Utilities',
    metadata: {
      keywords: ['base64', 'image', 'encoder', 'decoder', 'preview', 'debug', 'visualize', 'png', 'jpg', 'jpeg', 'gif', 'svg'],
      relatedTools: ['url-encoder'],
    },
    uiOptions: {
      showExamples: true
    }
  },
  {
    id: 'cookie-inspector',
    route: '/cookies',
    title: 'Cookie Inspector',
    description: 'View cookies for this session and export them.',
    icon: CookieIcon,
    component: lazy(() => import('./cookie-inspector/page')),
    category: 'Testing',
    metadata: {
      keywords: ['cookie', 'debug', 'browser', 'httpOnly', 'session'],
      relatedTools: [],
    },
    uiOptions: {
      showExamples: false
    }
  },
  {
    id: 'crypto-lab',
    route: '/crypto-lab',
    title: 'Crypto Lab',
    description: 'Play with AES and RSA encryption, generate keys, and test algorithms.',

    icon: SecurityIcon,
    component: lazy(() => import('./aes-cbc/page')),
    category: 'Security',
    metadata: {
      keywords: ['aes', 'gcm', 'rsa', 'encryption', 'decryption', 'crypto', 'cbc', 'security'],

      relatedTools: [],
    },
    uiOptions: {
      showExamples: false
    }
  },
];

export default toolRegistry;

// Export a function to get all tools
export const getTools = () => {
  return toolRegistry;
};

// Helper functions to work with the tool registry
export const getToolByRoute = (route: string): Tool | undefined => {
  return getTools().find(tool => tool.route === route);
};

export const getToolById = (id: string): Tool | undefined => {
  return toolRegistry.find(tool => tool.id === id);
};

export const getToolsByCategory = (category: ToolCategory): Tool[] => {
  return toolRegistry.filter(tool => tool.category === category);
};

export const getRelatedTools = (toolId: string): Tool[] => {
  const tool = getToolById(toolId);
  if (!tool || !tool.metadata.relatedTools) return [];
  
  return tool.metadata.relatedTools
    .map(relatedId => getToolById(relatedId))
    .filter((tool): tool is Tool => tool !== undefined);
};

export const getPopularTools = (): Tool[] => {
  return toolRegistry.filter(tool => tool.isPopular);
};

export const getNewTools = (): Tool[] => {
  return toolRegistry.filter(tool => tool.isNew);
};

export const getBetaTools = (): Tool[] => {
  return toolRegistry.filter(tool => tool.isBeta);
};

export const getAllTools = (): Tool[] => {
  return toolRegistry;
};

export const getAllCategories = (): ToolCategory[] => {
  const categorySet = new Set<ToolCategory>();
  toolRegistry.forEach(tool => categorySet.add(tool.category));
  return Array.from(categorySet);
};