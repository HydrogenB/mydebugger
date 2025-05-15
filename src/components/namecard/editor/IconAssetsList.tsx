import React from 'react';
import { Card } from '@design-system'; // Assuming Card is exported from the main design system entry
import { SOCIAL_ICONS } from '../../../features/namecard/utils/iconMappings';

/**
 * Component to display all available icon assets
 */
export default function IconAssetsList() {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-medium mb-4">Available Icon Assets</h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4">
        {Object.entries(SOCIAL_ICONS).map(([name, path]) => (
          <div key={name} className="flex flex-col items-center p-2 border rounded-md">
            <img src={path as string} alt={name} className="w-8 h-8 mb-2" />
            <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{name}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-blue-800 dark:text-blue-200">
        <p>Icons are located in the <code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded">asset/icons/</code> directory.</p>
        <p className="mt-1">To add new icons, place SVG files in this directory and update the <code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded">iconMappings.ts</code> file.</p>
      </div>
    </Card>
  );
}
