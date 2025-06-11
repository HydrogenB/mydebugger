/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useCacheInspector from '../../../viewmodel/useCacheInspector';
import CacheInspectorView from '../../../view/CacheInspectorView';

const CacheInspectorPage: React.FC = () => {
  const vm = useCacheInspector();
  return <CacheInspectorView {...vm} />;
};

export default CacheInspectorPage;
