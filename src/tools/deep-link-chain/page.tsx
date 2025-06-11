/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useDeepLinkChain from '../../../viewmodel/useDeepLinkChain';
import DeepLinkChainView from '../../../view/DeepLinkChainView';

const DeepLinkChainPage: React.FC = () => {
  const vm = useDeepLinkChain();
  return <DeepLinkChainView {...vm} />;
};

export default DeepLinkChainPage;

