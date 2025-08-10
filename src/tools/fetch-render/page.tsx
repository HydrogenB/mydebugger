/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useFetchRender from './hooks/useFetchRender';
import FetchRenderView from './components/FetchRenderPanel';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';

const FetchRenderPage: React.FC = () => {
  const vm = useFetchRender();
  const tool = getToolByRoute('/fetch-render');
  return (
    <ToolLayout tool={tool!}>
      <FetchRenderView {...vm} />
    </ToolLayout>
  );
};

export default FetchRenderPage;
