/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import useCacheInspector from '../../../viewmodel/useCacheInspector';
import CacheInspectorView from '../../../view/CacheInspectorView';
import { ToolLayout } from '../../design-system/components/layout';

const CacheInspectorPage: React.FC = () => {
  const vm = useCacheInspector();
  const tool = getToolByRoute('/cache-inspector');
  return (
    <ToolLayout tool={tool!} title="Cache Inspector" description="Inspect browser caching for loaded resources." showRelatedTools>
      <CacheInspectorView {...vm} />
    </ToolLayout>
  );
};

export default CacheInspectorPage;
