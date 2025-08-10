/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useCorsTester from './hooks/useCorsTester';
import CorsTesterView from './components/CorsTesterPanel';

const CorsTesterPage: React.FC = () => {
  const vm = useCorsTester();
  return <CorsTesterView {...vm} />;
};

export default CorsTesterPage;
