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

// Import icons
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
  DnsIcon,
  QrCodeIcon
} from './components/icons';

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
    id: 'jwt-playground',
    route: '/jwt',
    title: 'JWT Playground',
    description: 'Generate, decode, and verify JSON Web Tokens interactively.',
    icon: JwtIcon,
    component: lazy(() => import('./jwtplayground/JwtPlayground')),
    category: 'Security',
    isPopular: true,
    metadata: {
      keywords: ['jwt', 'token', 'generator', 'decoder', 'playground', 'json web token', 'authentication', 'verify'],
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
      relatedTools: ['jwt-playground'],
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
      relatedTools: ['jwt-playground', 'url-encoder'],
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
    title: 'QR Code Generator',
    description: 'Generate, customize, and download QR codes for any URL or text.',
    icon: QrCodeIcon,
    component: lazy(() => import('./qrcode/QRCodeGenerator')),
    category: 'Utilities',
    metadata: {
      keywords: ['qr code', 'qrcode', 'generator', 'scanner', 'mobile'],
      learnMoreUrl: 'https://en.wikipedia.org/wiki/QR_code',
      relatedTools: ['url-encoder'],
    },
    uiOptions: {
      showExamples: true
    }
  },
];

export default toolRegistry;

// Helper functions to work with the tool registry
export const getToolByRoute = (route: string): Tool | undefined => {
  return toolRegistry.find(tool => tool.route === route);
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