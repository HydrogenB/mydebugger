import React from 'react';
import { Button } from '../../../design-system/components/inputs';

interface SocialLink {
  platform: string;
  url: string;
  displayOrder?: number;
}

interface SocialLinksSectionProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

const socialPlatforms = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'medium', label: 'Medium' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'behance', label: 'Behance' },
  { value: 'stackoverflow', label: 'Stack Overflow' },
  { value: 'other', label: 'Other' }
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Social Media Links</h2>
        <Button 
          variant="light" 
          size="sm"
          onClick={addLink}
        >
          Add Link
        </Button>
      </div>
      
      {links.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No social links added yet. Click "Add Link" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-1/3">
                <select
                  value={link.platform}
                  onChange={(e) => updateLink(index, 'platform', e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                >
                  <option value="">Select Platform</option>
                  {socialPlatforms.map(platform => (
                    <option key={platform.value} value={platform.value}>{platform.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                />
              </div>
              
              <Button
                variant="light"
                size="sm"
                onClick={() => removeLink(index)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
