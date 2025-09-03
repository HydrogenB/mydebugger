/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import useGuitarTuner from './hooks/useGuitarTuner';
import GuitarTunerPanel from './components/GuitarTunerPanel';
import { ToolLayout } from '@design-system';

const GuitarTunerPage: React.FC = () => {
  const vm = useGuitarTuner();
  const tool = getToolByRoute('/guitar-tuner');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Online Guitar Tuner',
    url: 'https://mydebugger.vercel.app/guitar-tuner',
    applicationCategory: 'MusicApplication',
    description: 'Free online guitar tuner that uses your microphone for accurate pitch detection.',
    operatingSystem: 'Any',
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <ToolLayout
        tool={tool!}
        title="Online Guitar Tuner"
        description="Free guitar tuner using your microphone for precise pitch detection"
        showRelatedTools
      >
        <GuitarTunerPanel {...vm} />
      </ToolLayout>
    </>
  );
};

export default GuitarTunerPage;

