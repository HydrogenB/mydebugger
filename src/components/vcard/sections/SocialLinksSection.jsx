import React, { useState, useEffect } from 'react';
import { Button, TextInput } from '../../../design-system/components/inputs';
import { Card } from '../../../design-system/components/layout';
import { LoadingSpinner } from '../../../design-system/components/feedback';
import { Alert } from '../../../design-system/components/feedback/Alert';

const SOCIAL_PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'github', label: 'GitHub' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'discord', label: 'Discord' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'medium', label: 'Medium' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'behance', label: 'Behance' },
];

const SocialLinksSection = ({ vcard, onSave }) => {
  const [socialLinks, setSocialLinks] = useState([{ platform: '', url: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Load existing social links
  useEffect(() => {
    if (vcard?.socialLinks?.length) {
      setSocialLinks(vcard.socialLinks.map(link => ({
        id: link.id,
        platform: link.platform,
        url: link.url
      })));
    }
  }, [vcard]);
  
  const handleAddLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };
  
  const handleRemoveLink = (index) => {
    const newLinks = [...socialLinks];
    newLinks.splice(index, 1);
    setSocialLinks(newLinks);
  };
  
  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setSocialLinks(updatedLinks);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Validate that each platform is unique
      const platforms = socialLinks.map(link => link.platform).filter(Boolean);
      const hasDuplicates = platforms.length !== new Set(platforms).size;
      
      if (hasDuplicates) {
        throw new Error('Each social platform can only be added once');
      }
      
      // Filter out empty links
      const filteredLinks = socialLinks.filter(link => link.platform && link.url);
      
      // Save changes
      await onSave({ socialLinks: filteredLinks });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error" className="mb-6">{error}</Alert>}
      
      <Card className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-medium">Social Media Links</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddLink}
          >
            Add Social Link
          </Button>
        </div>
        
        {socialLinks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No social links added. Click "Add Social Link" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-1/3">
                  <select
                    value={link.platform}
                    onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  >
                    <option value="">Select Platform</option>
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <option
                        key={platform.value}
                        value={platform.value}
                        disabled={
                          platform.value && 
                          socialLinks.some(
                            (l, i) => i !== index && l.platform === platform.value
                          )
                        }
                      >
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <TextInput
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                
                <Button
                  type="button"
                  variant="light"
                  size="sm"
                  onClick={() => handleRemoveLink(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm text-gray-600 dark:text-gray-300">
          <h3 className="font-medium mb-2">Tips:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Enter the full URL including "https://"</li>
            <li>Each social platform can only be added once</li>
            <li>Use your username or profile link for each platform</li>
          </ul>
        </div>
      </Card>
      
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
};

export default SocialLinksSection;
