/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import useQrscan from '../../../viewmodel/useQrscan';
import QrscanView from '../../../view/QrscanView';
import { ToolLayout } from '../../design-system/components/layout';

const QrscanPage: React.FC = () => {
  const vm = useQrscan();
  const tool = getToolByRoute('/qrscan');
  return (
    <ToolLayout tool={tool!} title="QR Scanner" description="Scan QR codes using your device camera" showRelatedTools>
      <QrscanView {...vm} />
    </ToolLayout>
  );
};

export default QrscanPage;
