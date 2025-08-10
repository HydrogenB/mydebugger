/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import ImageCompressorView from './components/ImageCompressorPanel';
import { useImageCompressor } from './hooks/useImageCompressor';

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
