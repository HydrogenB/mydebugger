/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';

const ApiSimulatorPage: React.FC = () => {
  const tool = getToolByRoute('/api-simulator');
  return (
    <ToolLayout tool={tool!} title="API Simulator" description="Encode JSON, simulate delays and statuses." showRelatedTools>
      <iframe
        src="/api-simulator"
        title="API Simulator"
        className="w-full h-[80vh] border border-gray-200 rounded-lg"
      />
    </ToolLayout>
  );
};

export default ApiSimulatorPage;
