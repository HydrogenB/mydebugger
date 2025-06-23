/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useTraceroute from '../../../viewmodel/useTraceroute';
import TracerouteView from '../../../view/TracerouteView';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';

const TraceroutePage: React.FC = () => {
  const vm = useTraceroute();
  const tool = getToolByRoute('/traceroute');
  return (
    <ToolLayout tool={tool!}>
      <TracerouteView {...vm} />
    </ToolLayout>
  );
};

export default TraceroutePage;
