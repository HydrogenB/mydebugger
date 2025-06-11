/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useHeaderScanner from '../../../viewmodel/useHeaderScanner';
import HeaderScannerView from '../../../view/HeaderScannerView';
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
