import { lazy } from 'react';

// Tool category types
export type ToolCategory = 'Encoding' | 'Security' | 'Testing' | 'Utilities';

// Tool interface definition
export interface Tool {
  route: string;
  title: string;
  description: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  category: ToolCategory;
  metadata: {
    keywords: string[];
    learnMoreUrl?: string;
  };
}

// Tool registry - central list of all available tools
// This drives routes, homepage, SEO, and navigation
const toolRegistry: Tool[] = [
  {
    route: '/jwt',
    title: 'JWT Decoder',
    description: 'Decode and verify JSON Web Tokens (JWT) instantly.',
    component: lazy(() => import('./jwt/JwtDecoder')),
    category: 'Security',
    metadata: {
      keywords: ['jwt', 'token', 'decoder', 'json web token', 'authentication'],
      learnMoreUrl: 'https://jwt.io/introduction',
    },
  },
  {
    route: '/url-encoder',
    title: 'URL Encoder/Decoder',
    description: 'Encode or decode URL components safely.',
    component: lazy(() => import('./url/UrlEncoder')),
    category: 'Encoding',
    metadata: {
      keywords: ['url', 'encoding', 'decoding', 'uri', 'querystring'],
      learnMoreUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent',
    },
  },
  {
    route: '/headers',
    title: 'HTTP Headers Analyzer',
    description: 'Analyze and understand HTTP request/response headers.',
    component: lazy(() => import('./headers/HeadersAnalyzer')),
    category: 'Testing',
    metadata: {
      keywords: ['http', 'headers', 'request', 'response', 'analyze'],
      learnMoreUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers',
    },
  },
  {
    route: '/regex',
    title: 'Regex Tester',
    description: 'Test and debug regular expressions with real-time matching.',
    component: lazy(() => import('./regex/RegexTester')),
    category: 'Utilities',
    metadata: {
      keywords: ['regex', 'regular expression', 'pattern', 'test', 'match'],
      learnMoreUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions',
    },
  },
  {
    route: '/dns-check',
    title: 'DNS Lookup Tool',
    description: 'Query DNS records for any domain name.',
    component: lazy(() => import('./dns/DnsLookup')),
    category: 'Testing',
    metadata: {
      keywords: ['dns', 'lookup', 'domain', 'nameserver', 'records'],
      learnMoreUrl: 'https://www.cloudflare.com/learning/dns/what-is-dns/',
    },
  },
];

export default toolRegistry;

// Helper functions to work with the tool registry
export const getToolByRoute = (route: string): Tool | undefined => {
  return toolRegistry.find(tool => tool.route === route);
};

export const getToolsByCategory = (category: ToolCategory): Tool[] => {
  return toolRegistry.filter(tool => tool.category === category);
};

export const getAllTools = (): Tool[] => {
  return toolRegistry;
};

export const getAllCategories = (): ToolCategory[] => {
  const categories = new Set<ToolCategory>();
  toolRegistry.forEach(tool => categories.add(tool.category));
  return Array.from(categories);
};