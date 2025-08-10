/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useHeaderScanner from './hooks/useHeaderScanner';
import HeaderScannerView from './components/HeaderScannerPanel';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';

const HeaderScannerPage: React.FC = () => {
  const vm = useHeaderScanner();
  const tool = getToolByRoute('/header-scanner');
  return (
    <ToolLayout tool={tool!}>
      <HeaderScannerView {...vm} />
    </ToolLayout>
  );
};

export default HeaderScannerPage;
