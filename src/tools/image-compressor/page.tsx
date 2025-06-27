/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import ImageCompressorView from '../../../view/ImageCompressorView';
import { useImageCompressor } from '../../../viewmodel/useImageCompressor';

const ImageCompressorPage: React.FC = () => {
  const vm = useImageCompressor();
  const tool = getToolByRoute('/image-compressor');
  return (
    <ToolLayout tool={tool!} title="Image Compressor" description="Compress images entirely in the browser." showRelatedTools>
      <ImageCompressorView {...vm} />
    </ToolLayout>
  );
};

export default ImageCompressorPage;
