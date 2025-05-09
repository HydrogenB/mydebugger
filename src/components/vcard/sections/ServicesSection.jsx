import React, { useState, useEffect } from 'react';
import { Button, TextInput, TextArea } from '../../../design-system/components/inputs';
import { Card } from '../../../design-system/components/layout';
import { LoadingSpinner } from '../../../design-system/components/feedback';
import { Alert } from '../../../design-system/components/feedback/Alert';

// Icons for services
const SERVICE_ICONS = [
  { value: '/asset/icons/code.svg', label: 'Code' },
  { value: '/asset/icons/design.svg', label: 'Design' },
  { value: '/asset/icons/web.svg', label: 'Web' },
  { value: '/asset/icons/mobile.svg', label: 'Mobile' },
  { value: '/asset/icons/consulting.svg', label: 'Consulting' },
  { value: '/asset/icons/marketing.svg', label: 'Marketing' },
  { value: '/asset/icons/writing.svg', label: 'Writing' },
  { value: '/asset/icons/analytics.svg', label: 'Analytics' },
];

const ServicesSection = ({ vcard, onSave }) => {
  const [services, setServices] = useState([{ title: '', description: '', icon: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Load existing services
  useEffect(() => {
    if (vcard?.services?.length) {
      setServices(vcard.services.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        icon: service.icon || ''
      })));
    }
  }, [vcard]);
  
  const handleAddService = () => {
    setServices([...services, { title: '', description: '', icon: '' }]);
  };
  
  const handleRemoveService = (index) => {
    const newServices = [...services];
    newServices.splice(index, 1);
    setServices(newServices);
  };
  
  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setServices(updatedServices);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Filter out incomplete services
      const filteredServices = services.filter(service => service.title && service.description);
      
      // Save changes
      await onSave({ services: filteredServices });
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
          <h2 className="text-lg font-medium">Services</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddService}
          >
            Add Service
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Showcase the professional services you offer to clients or employers.
        </p>
        
        {services.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No services added. Click "Add Service" to get started.
          </div>
        ) : (
          <div className="space-y-6">
            {services.map((service, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Service #{index + 1}</h3>
                  <Button
                    type="button"
                    variant="light"
                    size="sm"
                    onClick={() => handleRemoveService(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor={`title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Service Title
                    </label>
                    <TextInput
                      id={`title-${index}`}
                      value={service.title}
                      onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                      placeholder="e.g., Web Development, UI/UX Design, Consulting"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <TextArea
                      id={`description-${index}`}
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      placeholder="Describe the service you offer..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`icon-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Icon (Optional)
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {SERVICE_ICONS.map((icon) => (
                        <div 
                          key={icon.value}
                          className={`
                            cursor-pointer border rounded-md p-2 flex flex-col items-center justify-center
                            ${service.icon === icon.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                          `}
                          onClick={() => handleServiceChange(index, 'icon', icon.value)}
                        >
                          <img src={icon.value} alt={icon.label} className="w-6 h-6 mb-1" />
                          <span className="text-xs text-gray-500">{icon.label}</span>
                        </div>
                      ))}
                      <div 
                        className={`
                          cursor-pointer border rounded-md p-2 flex flex-col items-center justify-center
                          ${!service.icon ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                        `}
                        onClick={() => handleServiceChange(index, 'icon', '')}
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

export default ServicesSection;
