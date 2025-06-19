/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Permission Tester Page Component
 */
import React from 'react';
import usePermissionTester from '../../../viewmodel/usePermissionTester';
import PermissionTesterView from '../../../view/PermissionTesterView';

function PermissionTesterPage() {
  const vm = usePermissionTester();
  return <PermissionTesterView {...vm} />;
}

export default PermissionTesterPage;
