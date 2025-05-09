/**
 * Features registry - automatically registers all features
 * This replaces the manual tool registry approach
 */
import { lazy } from 'react';
import { ToolCategory } from '@types/tools';
import * as Icons from '@shared/components/icons';

// Import all feature manifests
import jwt from './jwt/manifest';
import urlEncoder from './url-encoder/manifest';
import regex from './regex/manifest';
import qrcode from './qrcode/manifest';
import sequenceDiagram from './sequence-diagram/manifest';
import dnsLookup from './dns-lookup/manifest';
import headerAnalyzer from './headers-analyzer/manifest';
import clickjacking from './clickjacking/manifest';
import linkTracer from './link-tracer/manifest';
import markdownPreview from './markdown-preview/manifest';
import componentsDemo from './components-demo/manifest';
// Add more features here

// Combine all features
export const featureRegistry = [
  jwt,
  urlEncoder,
  regex,
  qrcode,
  sequenceDiagram,
  dnsLookup,
  headerAnalyzer,
  clickjacking,
  linkTracer,
  markdownPreview,
  componentsDemo
];

// Helper functions can stay the same
export const getFeatureByRoute = (route: string) => {
  return featureRegistry.find(feature => feature.route === route);
};

export const getFeatureById = (id: string) => {
  return featureRegistry.find(feature => feature.id === id);
};

export const getFeaturesByCategory = (category: ToolCategory) => {
  return featureRegistry.filter(feature => feature.category === category);
};
