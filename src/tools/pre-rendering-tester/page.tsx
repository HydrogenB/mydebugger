/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import usePreRenderingTester from '../../../viewmodel/usePreRenderingTester';
import PreRenderingTesterView from '../../../view/PreRenderingTesterView';

const PreRenderingTesterPage: React.FC = () => {
  const vm = usePreRenderingTester();
  return <PreRenderingTesterView {...vm} />;
};

export default PreRenderingTesterPage;
