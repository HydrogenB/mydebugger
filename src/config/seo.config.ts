// Centralized SEO configuration for pages

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  og: {
    title: string;
    description: string;
    type: string;
    image: string;
    siteName: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
    creator: string;
  };
  structuredData?: Record<string, unknown>;
}

const commonKeywords = [
  'developer tools',
  'debugging',
  'utilities',
  'jwt',
  'qrcode',
  'encoding',
  'decoding',
  'web tools',
  'performance',
  'security'
];

export const pageSEO: Record<string, SEOConfig> = {
  home: {
    title: 'Developer Tool Hub | MyDebugger',
    description:
      'MyDebugger is a developer tool hub with 50+ utilities for debugging, encoding/decoding, API testing, JWT, QR, and more. Fast, privacy-friendly, client-side.',
    keywords: [...commonKeywords, 'tool hub', 'productivity'],
    author: 'MyDebugger Team',
    og: {
      title: 'Developer Tool Hub | MyDebugger',
      description:
        'Explore 50+ developer tools for debugging, testing, and productivity. Privacy-first and fast.',
      type: 'website',
      image: 'https://mydebugger.vercel.app/og/home.jpg',
      siteName: 'MyDebugger'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Developer Tool Hub | MyDebugger',
      description: '50+ developer tools. Privacy-first. Client-side.',
      image: 'https://mydebugger.vercel.app/twitter/home.jpg',
      creator: '@jirads'
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': ['WebSite', 'SoftwareApplication'],
      name: 'MyDebugger',
      description:
        'Developer tool hub with 50+ utilities for debugging, testing, and productivity',
      url: 'https://mydebugger.vercel.app/'
    }
  },
  privacy: {
    title: 'Privacy Policy - MyDebugger',
    description:
      'Learn how MyDebugger protects your privacy. Client-side processing, no data leaves your device, GDPR-friendly.',
    keywords: [...commonKeywords, 'privacy', 'gdpr', 'data protection'],
    author: 'MyDebugger Team',
    og: {
      title: 'Privacy Policy - MyDebugger',
      description:
        'Comprehensive privacy policy. Client-side processing and no data collection.',
      type: 'website',
      image: 'https://mydebugger.vercel.app/og/privacy.jpg',
      siteName: 'MyDebugger'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Privacy Policy - MyDebugger',
      description: 'Client-side processing. No tracking. GDPR-friendly.',
      image: 'https://mydebugger.vercel.app/twitter/privacy.jpg',
      creator: '@jirads'
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Privacy Policy - MyDebugger',
      url: 'https://mydebugger.vercel.app/privacy'
    }
  }
};

export type { SEOConfig as TSEOConfig };


