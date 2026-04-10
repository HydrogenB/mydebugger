/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { usePermissionTester } from './hooks/usePermissionTester';
import { PermissionTesterPanel } from './components/PermissionTesterPanel';

const PermissionTesterPage: React.FC = () => {
  const vm = usePermissionTester();
  return <PermissionTesterPanel {...vm} />;
};

export default PermissionTesterPage;
