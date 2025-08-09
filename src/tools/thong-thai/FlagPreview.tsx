/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';

interface FlagPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const FlagPreview: React.FC<FlagPreviewProps> = ({ canvasRef }) => {
  return (
    <div className="w-full overflow-auto">
      <canvas ref={canvasRef} className="border border-gray-200 dark:border-gray-700 rounded" />
    </div>
  );
};

export default FlagPreview;
