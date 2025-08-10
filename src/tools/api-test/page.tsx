/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';
import useApiRepeater from './hooks/useApiRepeater';
import ApiRepeaterView from './components/ApiRepeaterPanel';

const ApiTestPage: React.FC = () => {
  const vm = useApiRepeater();
  const tool = getToolByRoute('/api-test');
  return (
    <ToolLayout tool={tool!}>
      <ApiRepeaterView {...vm} />
    </ToolLayout>
  );
};

export default ApiTestPage;
