import React from 'react';
import { Button } from '@design-system'; // Assuming Button is exported from the main design system entry
import { TextInput } from '@design-system';
import { SOCIAL_ICONS } from '../../../features/namecard/utils/iconMappings';

// Simple icon components to replace heroicons
const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// Define option type for select input
interface SelectOption {
  value: string;
  label: string;
}

// Replace the missing SelectInput with a basic select element
const SelectInput = ({ 
  id, 
  name, 
  value, 
  onChange, 
  options, 
  placeholder, 
  error 
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}) => (
  <div>
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option: SelectOption) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface SocialLink {
  platform: string;
  url: string;
  displayOrder?: number;
}

interface SocialLinksSectionProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

// Define available social platforms with their icons
const SOCIAL_PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: SOCIAL_ICONS.linkedin },
  { value: 'twitter', label: 'Twitter', icon: SOCIAL_ICONS.twitter },
  { value: 'facebook', label: 'Facebook', icon: SOCIAL_ICONS.facebook },
  { value: 'instagram', label: 'Instagram', icon: SOCIAL_ICONS.instagram },
  { value: 'github', label: 'GitHub', icon: SOCIAL_ICONS.github },
  { value: 'youtube', label: 'YouTube', icon: SOCIAL_ICONS.youtube },
  { value: 'tiktok', label: 'TikTok', icon: SOCIAL_ICONS.tiktok },
  { value: 'discord', label: 'Discord', icon: SOCIAL_ICONS.discord },
  { value: 'telegram', label: 'Telegram', icon: SOCIAL_ICONS.telegram },
  { value: 'other', label: 'Other', icon: SOCIAL_ICONS.default }
];

export default function SocialLinksSection({ links, onChange }: SocialLinksSectionProps) {
  const addLink = () => {
    onChange([...links, { platform: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    onChange(newLinks);
  };

  const updateLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange(newLinks);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Social Links</h2>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={addLink} 
        className="mb-4"
      >
        Add Social Link
      </Button>
      
      {links.length > 0 && (
        <div className="space-y-4">
          {links.map((link, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Platform
                    </label>
                    <div className="relative">
                      <select
                        value={link.platform}
                        onChange={(e) => updateLink(index, 'platform', e.target.value)}
                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                      >
                        <option value="">Select a platform</option>
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <option key={platform.value} value={platform.value}>
                            {platform.label}
                          </option>
                        ))}
                      </select>
                      
                      {link.platform && (
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <img 
                            src={SOCIAL_ICONS[link.platform] || SOCIAL_ICONS.default} 
                            alt={link.platform}
                            className="w-4 h-4 mr-2" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL
                    </label>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      placeholder={link.platform === 'linkedin' ? 'https://linkedin.com/in/username' : 'https://...'}
                      className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                    />
                  </div>
                </div>
              </div>
              
              <Button
                variant="light"
                size="sm"
                onClick={() => removeLink(index)}
                aria-label="Remove link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-md font-medium mb-2">Tips</h3>
        <ul className="list-disc text-sm text-gray-600 dark:text-gray-400 pl-5">
          <li>Add links to your professional profiles and portfolios.</li>
          <li>Use full URLs including https://</li>
          <li>For "Other" platforms, include the platform name in the URL.</li>
        </ul>
      </div>
    </div>
  );
}
