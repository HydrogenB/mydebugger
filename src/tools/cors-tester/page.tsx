/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useCorsTester from '../../../viewmodel/useCorsTester';
import CorsTesterView from '../../../view/CorsTesterView';

const CorsTesterPage: React.FC = () => {
  const vm = useCorsTester();
  return <CorsTesterView {...vm} />;
};

export default CorsTesterPage;
