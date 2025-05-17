import React from 'react';
import { ImageInfo } from '../types';

interface ImagePreviewProps {
  imageUrl: string;
  imageInfo: ImageInfo | null;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, imageInfo }) => {
  if (!imageUrl) return null;
  
  return (
    <div className="border rounded-lg p-4 mt-4">
      <h3 className="text-lg font-medium mb-3">Image Preview</h3>
      <div className="flex flex-col lg:flex-row">
        <div className="mb-4 lg:mb-0 lg:mr-4 lg:w-1/2">
          <div className="border rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-2">
            <img 
              src={imageUrl} 
              alt="Base64 preview" 
              className="max-w-full max-h-[300px] object-contain" 
            />
          </div>
        </div>
        <div className="lg:w-1/2">
          <h4 className="text-md font-medium mb-2">Image Information</h4>
          {imageInfo && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm">
              <p><span className="font-medium">Format:</span> {imageInfo.type}</p>
              <p><span className="font-medium">Dimensions:</span> {imageInfo.width}x{imageInfo.height}px</p>
              <p><span className="font-medium">File Size:</span> {imageInfo.sizeFormatted}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
