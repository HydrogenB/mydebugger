/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { ToolLayout } from '@design-system';
import { getToolByRoute } from '../index';
import useQrscan from './hooks/useQrscan';
import ARScannerView from './components/ARScannerView';

const QrscanPageFixed: React.FC = () => {
  const vm = useQrscan();
  const tool = getToolByRoute('/qrscan');

  return (
    <ToolLayout
      tool={tool!}
      title="QR Scanner"
      description="Fullscreen AR-style QR scanner with live engine performance telemetry. Tap to open decoded links instantly."
      showRelatedTools
    >
      <ARScannerView {...vm} />
    </ToolLayout>
  );
};

export default QrscanPageFixed;
