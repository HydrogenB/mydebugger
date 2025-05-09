import React from 'react';
import { SOCIAL_ICONS } from '../../../features/namecard/utils/iconMappings';

interface PlatformIconSelectorProps {
  selectedPlatform: string;
  onSelect: (platform: string) => void;
  className?: string;
}

/**
 * A component for selecting a platform and displaying its associated icon
 */
export default function PlatformIconSelector({
  selectedPlatform,
  onSelect,
  className = ''
}: PlatformIconSelectorProps) {
  // Get array of platform entries [key, value]
  const platformEntries = Object.entries(SOCIAL_ICONS);
  
  return (
    <div className={`grid grid-cols-3 sm:grid-cols-5 gap-2 ${className}`}>
      {platformEntries.map(([platform, iconPath]) => (
        <div
          key={platform}
          onClick={() => onSelect(platform)}
          className={`
            flex flex-col items-center p-2 border rounded-md cursor-pointer transition
            ${selectedPlatform === platform 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <img 
            src={iconPath} 
            alt={platform} 
            className="w-8 h-8 mb-1" 
          />
          <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">
            {platform === 'default' ? 'Other' : platform}
          </span>
        </div>
      ))}
    </div>
  );
}
