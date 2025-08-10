/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import usePermissionTester from './hooks/usePermissionTester';
import PermissionTesterView from './components/PermissionTesterPanel';

const PermissionTesterPage: React.FC = () => {
  const vm = usePermissionTester();
  return <PermissionTesterView {...vm} />;
};

export default PermissionTesterPage;


