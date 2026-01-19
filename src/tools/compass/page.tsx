/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - Page Container
 *
 * Main entry point for the compass tool.
 */

import React from 'react';
import useCompass from './hooks/useCompass';
import CompassView from './components/CompassView';

const CompassPage: React.FC = () => {
  const vm = useCompass();

  return (
    <div className="max-w-lg mx-auto">
      <CompassView {...vm} />
    </div>
  );
};

export default CompassPage;
