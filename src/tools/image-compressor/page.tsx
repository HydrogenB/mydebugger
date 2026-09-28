/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';
import ImageCompressorView from './components/ImageCompressorPanel';
import { useImageCompressor } from './hooks/useImageCompressor';

const ImageCompressorPage: React.FC = () => {
  const vm = useImageCompressor();
  const tool = getToolByRoute('/image-compressor');
  return (
    <ToolLayout
      tool={tool!}
      title="Image Compressor"
      description="Pick an output format and drop your images — we try several encoders and keep the smallest file that still looks the same. Everything runs in your browser."
      showRelatedTools
    >
      <ImageCompressorView {...vm} />
      <p className="mt-6 text-xs text-gray-500">
        Encoders: oxipng, MozJPEG, libwebp (Apache-2.0/BSD), libimagequant (GPL-3.0), gifsicle (GPL-2.0),
        UPNG.js, gifenc, gifuct-js, fflate (MIT). Images never leave your device.
      </p>
    </ToolLayout>
  );
};

export default ImageCompressorPage;
