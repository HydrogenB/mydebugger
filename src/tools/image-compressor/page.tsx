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
      description="Drop images to make them smaller in the same format, or pick a format to convert to. We try several encoders and keep the smallest file that still looks the same — everything runs in your browser."
      showRelatedTools
    >
      <ImageCompressorView {...vm} />
      <p className="mt-6 text-xs text-gray-500">
        Encoders: oxipng (MIT), MozJPEG (IJG/BSD), libwebp (BSD),{' '}
        <a href="https://github.com/ImageOptim/libimagequant" target="_blank" rel="noopener noreferrer" className="underline">
          libimagequant
        </a>{' '}
        (GPL-3.0),{' '}
        <a href="https://github.com/kohler/gifsicle" target="_blank" rel="noopener noreferrer" className="underline">
          gifsicle
        </a>{' '}
        (GPL-2.0), UPNG.js, gifenc, gifuct-js, fflate (MIT). Images never leave your device.
      </p>
    </ToolLayout>
  );
};

export default ImageCompressorPage;
