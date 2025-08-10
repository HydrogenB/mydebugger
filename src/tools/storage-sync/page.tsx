/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useStorageDebugger from './hooks/useStorageDebugger';
import StorageDebuggerView from './components/StorageDebuggerPanel';

const StorageSyncPage: React.FC = () => {
  const vm = useStorageDebugger();
  return <StorageDebuggerView {...vm} />;
};

export default StorageSyncPage;
