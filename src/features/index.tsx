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

// Placeholder manifests if files are missing
const placeholderManifest = (id: string, title: string): Tool => ({
  id,
  title,
  description: `Description for ${title}`,
  category: 'Utilities' as ToolCategory, // Cast if ToolCategory is a string literal union
  icon: CogIcon,
  route: `/${id}`,
  component: lazy(() => Promise.resolve({ default: () => (<div>{title} Placeholder</div>) })),
  metadata: { keywords: [id] },
});

const urlEncoder = placeholderManifest('url-encoder', 'URL Encoder');
const regex = placeholderManifest('regex-tester', 'Regex Tester');
const qrcode = placeholderManifest('qrcode-generator', 'QR Code Generator');
const jwt = placeholderManifest('jwt-toolkit', 'JWT Toolkit'); // Assuming jwt/manifest.ts exports default
const dnsLookup = placeholderManifest('dns-lookup', 'DNS Lookup');
const headerAnalyzer = placeholderManifest('headers-analyzer', 'Headers Analyzer');
const clickjacking = placeholderManifest('clickjacking-validator', 'Clickjacking Validator');
const linkTracer = placeholderManifest('link-tracer', 'Link Tracer');
const markdownPreview = placeholderManifest('markdown-preview', 'Markdown Preview');
const componentsDemo = placeholderManifest('components-demo', 'Components Demo');
const sequenceDiagram = placeholderManifest('sequence-diagram', 'Sequence Diagram');

export const features: Tool[] = [
  urlEncoder,
  regex,
  qrcode,
  jwt,
  dnsLookup,
  headerAnalyzer,
  clickjacking,
  linkTracer,
  markdownPreview,
  componentsDemo,
  sequenceDiagram,
  // Add other tools here
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
  {
    id: 'sequence-diagram',
    name: 'Sequence Diagrams',
    route: '/sequence-diagram',
    icon: DocumentTextIcon,
    description: 'Create and edit sequence diagrams'
  }
  // Add more features as needed
];

export default featureRegistry;
