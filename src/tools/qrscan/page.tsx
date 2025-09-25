/**
 * ? 2025 MyDebugger Contributors � MIT License
 */
import React from 'react';
import { ToolLayout } from '@design-system';
import { getToolByRoute } from '../index';
import useQrscan from './hooks/useQrscan';
import QRScannerPanel from './components/QRScannerPanel';

const QrscanPage: React.FC = () => {
  const vm = useQrscan();
  const tool = getToolByRoute('/qrscan');

  return (
    <ToolLayout
      tool={tool!}
      title="QR Scanner"
      description="Scan QR codes with live camera preview, import images, and manage a persistent scan history."
      showRelatedTools
    >
      <QRScannerPanel {...vm} />
    </ToolLayout>
  );
};

export default QrscanPage;
