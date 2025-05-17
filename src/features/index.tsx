/**
 * Features registry - automatically registers all features
 * This replaces the manual tool registry approach
 */
import React from 'react';
import {
  HomeIcon,
  ClipboardDocumentIcon,
  CogIcon,
  LockClosedIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'; // Example, adjust as needed

import { Tool, ToolCategory } from '../tools'; // Assuming ToolCategory is defined/exported in src/tools/index.ts

// Define feature interface
export interface Feature {
  id: string;
  name: string;
  route: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}

// Simple icon components
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CodeBracketIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const QrCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

// Placeholder manifests if files are missing
const placeholderManifest = (id: string, title: string): Tool => ({
  id,
  title,
  description: `Description for ${title}`,
  category: 'Utilities' as ToolCategory, // Cast if ToolCategory is a string literal union
  icon: CogIcon,
  route: `/${id}`,
  component: React.lazy(() => Promise.resolve({ default: () => (<div>{title} Placeholder</div>) })),
  metadata: { keywords: [id] },
});

const urlEncoder = placeholderManifest('url-encoder', 'URL Encoder');
const regex = placeholderManifest('regex-tester', 'Regex Tester');
const dnsLookup = placeholderManifest('dns-lookup', 'DNS Lookup');
const headerAnalyzer = placeholderManifest('headers-analyzer', 'Headers Analyzer');
const clickjacking = placeholderManifest('clickjacking-validator', 'Clickjacking Validator');
const linkTracer = placeholderManifest('link-tracer', 'Link Tracer');
// markdown preview removed
const componentsDemo = placeholderManifest('components-demo', 'Components Demo');

export const features: Tool[] = [
  urlEncoder,
  regex,
  dnsLookup,
  headerAnalyzer,
  clickjacking,
  linkTracer,  componentsDemo,
  {
    id: 'jwt',
    title: 'JWT Toolkit',
    description: 'Decode, verify, and build JSON Web Tokens',
    icon: ShieldCheckIcon,
    category: 'security',
    keywords: ['jwt', 'token', 'json web token', 'decode', 'verify'],
    route: '/jwt',
    component: React.lazy(() => Promise.resolve({ default: () => (<div>JWT Toolkit Placeholder</div>) })),
  },
  {
    id: 'code-formatter',
    title: 'Code Formatter',
    description: 'Format and beautify code in various languages',
    icon: CodeBracketIcon,
    category: 'development',
    keywords: ['format', 'beautify', 'code', 'html', 'css', 'javascript'],
    route: '/code-formatter',
    component: React.lazy(() => Promise.resolve({ default: () => (<div>Code Formatter Placeholder</div>) })),
  },
  {
    id: 'qrcode',
    title: 'QR Code Generator',
    description: 'Generate QR codes for links and text',
    icon: QrCodeIcon,
    category: 'encoding',
    keywords: ['qr', 'qrcode', 'generator', 'encode'],
    route: '/qrcode',
    component: React.lazy(() => Promise.resolve({ default: () => (<div>QR Code Generator Placeholder</div>) })),
  }
].filter(Boolean) as Tool[]; // Filter out undefined if any manifest fails to load

export const getFeatureById = (id: string): Tool | undefined =>
  features.find((feature) => feature.id === id);

export const getFeaturesByCategory = (category: ToolCategory): Tool[] =>
  features.filter((feature) => feature.category === category);

export const getFeatureCategories = (): ToolCategory[] => {
  const categories = features.map((feature) => feature.category);
  return [...new Set(categories)];
};

// Create registry of features
export const featureRegistry: Feature[] = [
  {
    id: 'jwt',
    name: 'JWT Toolkit',
    route: '/jwt',
    icon: LockClosedIcon,
    description: 'Analyze, validate, and create JWT tokens'
  },
  // Add more features as needed
];

export default featureRegistry;
