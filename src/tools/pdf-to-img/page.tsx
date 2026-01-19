/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { ToolLayout } from '@design-system';
import { getToolByRoute } from '../index';
import usePdfToImage from './hooks/usePdfToImage';
import PdfToImagePanel from './components/PdfToImagePanel';

const PdfToImagePage: React.FC = () => {
  const vm = usePdfToImage();
  const tool = getToolByRoute('/pdf-to-img');

  return (
    <ToolLayout
      tool={tool!}
      title="PDF to Image Converter"
      description="Convert PDF pages to PNG, JPG, or WebP images directly in your browser. No upload required."
      showRelatedTools
    >
      <PdfToImagePanel {...vm} />
    </ToolLayout>
  );
};

export default PdfToImagePage;
