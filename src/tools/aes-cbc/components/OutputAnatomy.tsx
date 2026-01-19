/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Output Anatomy Component
 * Color-coded breakdown of encrypted output for educational purposes
 */

import React from 'react';
import type { OutputAnatomy as OutputAnatomyType, OutputSection } from '../types';

interface OutputAnatomyProps {
  anatomy: OutputAnatomyType;
  output: string;
}

const SectionBadge: React.FC<{ section: OutputSection }> = ({ section }) => {
  return (
    <div className={`p-2 rounded-md ${section.colorClass}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold">{section.label}</span>
        <span className="text-xs opacity-75">{section.bytes} bytes</span>
      </div>
      <code className="text-xs font-mono break-all block">
        {section.hex.length > 64 ? `${section.hex.slice(0, 64)}...` : section.hex}
      </code>
      <p className="text-xs mt-1 opacity-75">{section.description}</p>
    </div>
  );
};

export const OutputAnatomy: React.FC<OutputAnatomyProps> = ({ anatomy }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Output Anatomy
        </h4>
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-0.5 rounded ${anatomy.opensslCompatible ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
            {anatomy.opensslCompatible ? 'OpenSSL Format' : 'Raw Format'}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {anatomy.totalBytes} bytes total
          </span>
        </div>
      </div>

      {/* Visual Breakdown */}
      <div className="flex flex-wrap gap-1 text-xs">
        {anatomy.sections.map((section, idx) => (
          <div
            key={idx}
            className={`px-2 py-1 rounded ${section.colorClass}`}
            style={{ flex: `${section.bytes} 0 auto`, minWidth: '60px' }}
          >
            <span className="font-semibold">{section.label}</span>
            <span className="opacity-75 ml-1">({section.bytes}B)</span>
          </div>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="space-y-2">
        {anatomy.sections.map((section, idx) => (
          <SectionBadge key={idx} section={section} />
        ))}
      </div>

      {/* Format Legend */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md text-xs">
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Legend:</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-purple-200 dark:bg-purple-800"></span>
            <span className="text-gray-600 dark:text-gray-400">Magic Header</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-800"></span>
            <span className="text-gray-600 dark:text-gray-400">Salt (PBKDF2)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-200 dark:bg-green-800"></span>
            <span className="text-gray-600 dark:text-gray-400">Initialization Vector</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600"></span>
            <span className="text-gray-600 dark:text-gray-400">Ciphertext</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputAnatomy;
