/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';
import ImageToSvgPanel from './components/ImageToSvgPanel';
import { useImageToSvg } from './hooks/useImageToSvg';

const ImageToSvgPage: React.FC = () => {
  const vm = useImageToSvg();
  const tool = getToolByRoute('/img-to-svg');

  return (
    <ToolLayout
      tool={tool!}
      title="Image to SVG Converter"
      description="Convert raster images (JPG, PNG, WebP) to scalable vector graphics using advanced path tracing."
      showRelatedTools
    >
      <ImageToSvgPanel {...vm} />
    </ToolLayout>
  );
};

export default ImageToSvgPage;
