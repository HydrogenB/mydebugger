/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useNetworkSuite from '../../../viewmodel/useNetworkSuite';
import NetworkSuiteView from '../../../view/NetworkSuiteView';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';

const NetworkSuitePage: React.FC = () => {
  const vm = useNetworkSuite();
  const tool = getToolByRoute('/networksuit');
  return (
    <ToolLayout tool={tool!}>
      <NetworkSuiteView {...vm} />
    </ToolLayout>
  );
};

export default NetworkSuitePage;
