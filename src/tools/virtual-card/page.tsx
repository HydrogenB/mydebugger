/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import useVirtualCard from '../../../viewmodel/useVirtualCard';
import VirtualCardView from '../../../view/VirtualCardView';

const VirtualCardPage: React.FC = () => {
  const vm = useVirtualCard();
  return (
    <>
      <Helmet>
        <title>{vm.fullName ? `${vm.fullName} – Digital Contact Card` : 'Virtual Business Card Generator'}</title>
        <meta name="description" content="Create and share a digital contact card with QR and vCard download." />
        <meta property="og:title" content={vm.fullName ? `${vm.fullName} – vCard` : 'Virtual Business Card Generator'} />
        <meta property="og:description" content="Save this digital business card." />
      </Helmet>
      <VirtualCardView {...vm} />
    </>
  );
};

export default VirtualCardPage;
