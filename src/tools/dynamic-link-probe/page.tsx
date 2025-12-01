/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';
import OneLinkInspector from './components/OneLinkInspector';

const DynamicLinkProbePage: React.FC = () => {
  const tool = getToolByRoute('/dynamic-link-probe');
  return (
    <ToolLayout
      tool={tool!}
      title="OneLink Deep Link Inspector"
      description="Analyze AppsFlyer OneLink URLs, validate deep links for TrueApp, and track QA tests"
      showRelatedTools
    >
      <OneLinkInspector />
    </ToolLayout>
  );
};

export default DynamicLinkProbePage;
