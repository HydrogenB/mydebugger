/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useFetchRender from '../../../viewmodel/useFetchRender';
import FetchRenderView from '../../../view/FetchRenderView';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';

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
