/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import usePreRenderingTester from '../../../viewmodel/usePreRenderingTester';
import PreRenderingTesterView from '../../../view/PreRenderingTesterView';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';

const PreRenderingTesterPage: React.FC = () => {
  const vm = usePreRenderingTester();
  const tool = getToolByRoute('/pre-rendering-tester');
  return (
    <ToolLayout
      tool={tool!}
      title="Pre-rendering & SEO Meta Tester"
      description="Test how Googlebot, Bingbot, Facebook, and real users see your web content — including title, description and H1 rendering."
    >
      <PreRenderingTesterView {...vm} />
    </ToolLayout>
  );
};

export default PreRenderingTesterPage;
