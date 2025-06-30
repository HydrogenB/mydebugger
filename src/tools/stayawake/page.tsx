/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useStayAwake from '../../../viewmodel/useStayAwake';
import StayAwakeView from '../../../view/StayAwakeView';

const StayAwakePage: React.FC = () => {
  const vm = useStayAwake();
  return <StayAwakeView {...vm} />;
};

export default StayAwakePage;
