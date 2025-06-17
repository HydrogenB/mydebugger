/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useVirtualCard from '../../../viewmodel/useVirtualCard';
import VirtualCardView from '../../../view/VirtualCardView';

const VirtualCardPage: React.FC = () => {
  const vm = useVirtualCard();
  return <VirtualCardView {...vm} />;
};

export default VirtualCardPage;
