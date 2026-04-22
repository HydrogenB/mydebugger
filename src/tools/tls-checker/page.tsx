/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useTlsChecker from './hooks/useTlsChecker';
import TlsCheckerView from './components/TlsCheckerPanel';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';

const TlsCheckerPage: React.FC = () => {
  const vm = useTlsChecker();
  const tool = getToolByRoute('/tls-checker');
  return (
    <ToolLayout tool={tool!}>
      <TlsCheckerView {...vm} />
    </ToolLayout>
  );
};

export default TlsCheckerPage;
