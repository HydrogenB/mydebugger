/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useBase64ImageDebugger from '../../../viewmodel/useBase64ImageDebugger';
import Base64ImageDebuggerView from '../../../view/Base64ImageDebuggerView';

const Base64ImageDebuggerPage: React.FC = () => {
  const vm = useBase64ImageDebugger();
  return <Base64ImageDebuggerView {...vm} />;
};

export default Base64ImageDebuggerPage;
