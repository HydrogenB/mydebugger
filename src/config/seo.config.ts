export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  og: {
    title: string;
    description: string;
    type: string;
    url: string;
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
  structuredData: any;
}

export const baseSEO: SEOConfig = {
  title: "MyDebugger - Advanced Debugging Tools & Technical Solutions",
  description: "Professional debugging platform with JWT decoder, QR code generator, code analysis tools, and comprehensive technical utilities. Debug, decode, and analyze with precision.",
  keywords: [
    "debugging tools",
    "JWT decoder",
    "QR code generator",
    "code analysis",
    "technical utilities",
    "developer tools",
    "debug platform",
    "encoding decoding",
    "programming tools",
    "web development",
    "API testing",
    "data visualization",
    "performance monitoring",
    "error tracking",
    "code profiler"
  ],
  author: "Jirad Srirattana-arporn",
  og: {
    title: "MyDebugger - Professional Debugging & Development Tools",
    description: "Advanced debugging platform with comprehensive technical utilities for developers",
    type: "website",
    url: "https://mydebugger.vercel.app",
    image: "https://mydebugger.vercel.app/og-image.jpg",
    siteName: "MyDebugger"
  },
  twitter: {
    card: "summary_large_image",
    title: "MyDebugger - Advanced Debugging Tools",
    description: "Professional debugging platform with comprehensive technical utilities",
    image: "https://mydebugger.vercel.app/twitter-card.jpg",
    creator: "@jirads"
  },
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MyDebugger",
    "description": "Advanced debugging platform with comprehensive technical utilities",
    "url": "https://mydebugger.vercel.app",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Jirad Srirattana-arporn"
    },
    "featureList": [
      "JWT Decoder",
      "QR Code Generator",
      "Code Analysis",
      "Performance Monitoring",
      "Error Tracking",
      "Data Visualization",
      "API Testing",
      "Encoding/Decoding Tools"
    ]
  }
};

export const pageSEO = {
  home: {
    ...baseSEO,
    title: "MyDebugger - Advanced Debugging Tools for Developers",
    description: "Comprehensive debugging platform with JWT decoder, QR code generator, code analysis tools, and 50+ technical utilities. Professional-grade debugging solutions.",
    keywords: [...baseSEO.keywords, "home", "main page", "developer dashboard"]
  },
  tools: {
    title: "MyDebugger Tools - Professional Development Utilities",
    description: "Explore 50+ professional debugging and development tools including JWT decoder, QR code generator, code analysis, and performance monitoring utilities.",
    keywords: [...baseSEO.keywords, "tools", "utilities", "development tools"]
  },
  privacy: {
    title: "Privacy Policy - MyDebugger Data Protection",
    description: "Learn how MyDebugger protects your privacy and handles data collection, usage, and protection in compliance with GDPR and privacy standards.",
    keywords: [...baseSEO.keywords, "privacy", "data protection", "GDPR"]
  },
  terms: {
    title: "Terms of Service - MyDebugger Usage Agreement",
    description: "Read the complete terms of service for using MyDebugger debugging platform, including usage rights, limitations, and service agreements.",
    keywords: [...baseSEO.keywords, "terms", "service agreement", "usage policy"]
  }
};
