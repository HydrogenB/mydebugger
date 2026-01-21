/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import React from 'react';
import { ToolLayout } from '@design-system';
import { getToolByRoute } from '../index';
import { useUnicodeAnalyzer } from './hooks';
import { AnalyzerView } from './components';

/**
 * Unicode & Emoji Analyzer Tool
 *
 * A web-based utility that reveals non-printable characters, hidden control codes,
 * and complex Emoji sequences within a text string.
 */
const UnicodeAnalyzerPage: React.FC = () => {
  const tool = getToolByRoute('/unicode-analyzer');
  const vm = useUnicodeAnalyzer();

  if (!tool) {
    return null;
  }

  return (
    <ToolLayout tool={tool}>
      <AnalyzerView {...vm} />
    </ToolLayout>
  );
};

export default UnicodeAnalyzerPage;
