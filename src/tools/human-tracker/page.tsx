/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import useHumanTracker from '../../../viewmodel/useHumanTracker';
import HumanTrackerView from '../../../view/HumanTrackerView';

const HumanTrackerPage: React.FC = () => {
  const vm = useHumanTracker();
  const tool = getToolByRoute('/human-tracker');
  return (
    <ToolLayout
      tool={tool!}
      title="Human Tracker"
      description="Real-time pose, hand, and people detection via TensorFlow.js"
    >
      <HumanTrackerView {...vm} />
    </ToolLayout>
  );
};

export default HumanTrackerPage;
