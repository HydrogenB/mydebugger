/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useJsonCompare from './hooks/useJsonCompare';
import JsonComparePanel from './components/JsonComparePanel';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';

const JsonComparePage: React.FC = () => {
  const vm = useJsonCompare();
  const tool = getToolByRoute('/json-compare');

  return (
    <ToolLayout
      tool={tool!}
      title="JSON Compare"
      description="Compare two JSON documents and export a diff report."
    >
      <JsonComparePanel {...vm} />
    </ToolLayout>
  );
};

export default JsonComparePage;


