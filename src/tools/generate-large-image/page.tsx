/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import GenerateLargeImageView from '../../../view/GenerateLargeImageView';
import { useGenerateLargeImage } from '../../../viewmodel/useGenerateLargeImage';

const GenerateLargeImagePage: React.FC = () => {
  const vm = useGenerateLargeImage();
  const tool = getToolByRoute('/generate-large-image');
  return (
    <ToolLayout tool={tool!}>
      <GenerateLargeImageView {...vm} />
    </ToolLayout>
  );
};

export default GenerateLargeImagePage;
