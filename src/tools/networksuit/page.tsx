/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useNetworkSuite from './hooks/useNetworkSuite';
import NetworkSuiteView from './components/NetworkSuitePanel';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';

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
