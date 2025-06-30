/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useStayAwake from '../../../viewmodel/useStayAwake';
import StayAwakeView from '../../../view/StayAwakeView';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';

const StayAwakePage: React.FC = () => {
  const vm = useStayAwake();
  const tool = getToolByRoute('/stayawake');

  return (
    <ToolLayout tool={tool!} title="Stay Awake Toggle" description="Prevent the screen from sleeping." showRelatedTools={false}>
      <StayAwakeView {...vm} />
    </ToolLayout>
  );
};

export default StayAwakePage;
