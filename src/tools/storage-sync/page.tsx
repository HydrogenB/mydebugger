/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useStorageDebugger from '../../../viewmodel/useStorageDebugger';
import StorageDebuggerView from '../../../view/StorageDebuggerView';

const StorageSyncPage: React.FC = () => {
  const vm = useStorageDebugger();
  return <StorageDebuggerView {...vm} />;
};

export default StorageSyncPage;
