/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useDeepLinkChain from './hooks/useDeepLinkChain';
import DeepLinkChainView from './components/DeepLinkChainPanel';

const DeepLinkChainPage: React.FC = () => {
  const vm = useDeepLinkChain();
  return <DeepLinkChainView {...vm} />;
};

export default DeepLinkChainPage;

