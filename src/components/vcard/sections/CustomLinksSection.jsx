import React, { useState, useEffect } from 'react';
import { Button, TextInput } from '../../../design-system/components/inputs';
import { Card } from '../../../design-system/components/layout';
import { LoadingSpinner } from '../../../design-system/components/feedback';
import { Alert } from '../../../design-system/components/feedback/Alert';

// Icons that can be used for custom links
const LINK_ICONS = [
  { value: '/asset/icons/link.svg', label: 'Link' },
  { value: '/asset/icons/document.svg', label: 'Document' },
  { value: '/asset/icons/video.svg', label: 'Video' },
  { value: '/asset/icons/music.svg', label: 'Music' },
  { value: '/asset/icons/calendar.svg', label: 'Calendar' },
  { value: '/asset/icons/shop.svg', label: 'Shop' },
  { value: '/asset/icons/book.svg', label: 'Book' },
  { value: '/asset/icons/picture.svg', label: 'Picture' },
];

const CustomLinksSection = ({ vcard, onSave }) => {
  const [customLinks, setCustomLinks] = useState([{ title: '', url: '', icon: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Load existing custom links
  useEffect(() => {
    if (vcard?.customLinks?.length) {
      setCustomLinks(vcard.customLinks.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url,
        icon: link.icon || ''
      })));
    }
  }, [vcard]);
  
  const handleAddLink = () => {
    setCustomLinks([...customLinks, { title: '', url: '', icon: '' }]);
  };
  
  const handleRemoveLink = (index) => {
    const newLinks = [...customLinks];
    newLinks.splice(index, 1);
    setCustomLinks(newLinks);
  };
  
  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...customLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setCustomLinks(updatedLinks);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Filter out empty links
      const filteredLinks = customLinks.filter(link => link.title && link.url);
      
      // Validate URLs
      for (const link of filteredLinks) {
        try {
          // Add https:// if missing
          if (link.url && !link.url.match(/^https?:\/\//)) {
            link.url = `https://${link.url}`;
          }
        } catch (err) {
          throw new Error(`Invalid URL: ${link.url}`);
        }
      }
      
      // Save changes
      await onSave({ customLinks: filteredLinks });
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
          <h2 className="text-lg font-medium">Custom Links</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddLink}
          >
            Add Custom Link
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add custom links to your portfolio, resume, products, or any other web content.
        </p>
        
        {customLinks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No custom links added. Click "Add Custom Link" to get started.
          </div>
        ) : (
          <div className="space-y-6">
            {customLinks.map((link, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Link #{index + 1}</h3>
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
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor={`title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Link Title
                    </label>
                    <TextInput
                      id={`title-${index}`}
                      value={link.title}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                      placeholder="e.g., My Portfolio, Resume, Book a Call"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`url-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Link URL
                    </label>
                    <TextInput
                      id={`url-${index}`}
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`icon-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Icon (Optional)
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {LINK_ICONS.map((icon) => (
                        <div 
                          key={icon.value}
                          className={`
                            cursor-pointer border rounded-md p-2 flex flex-col items-center justify-center
                            ${link.icon === icon.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                          `}
                          onClick={() => handleLinkChange(index, 'icon', icon.value)}
                        >
                          <img src={icon.value} alt={icon.label} className="w-6 h-6 mb-1" />
                          <span className="text-xs text-gray-500">{icon.label}</span>
                        </div>
                      ))}
                      <div 
                        className={`
                          cursor-pointer border rounded-md p-2 flex flex-col items-center justify-center
                          ${!link.icon ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                        `}
                        onClick={() => handleLinkChange(index, 'icon', '')}
                      >
                        <div className="w-6 h-6 mb-1 flex items-center justify-center">None</div>
                        <span className="text-xs text-gray-500">No Icon</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default CustomLinksSection;
