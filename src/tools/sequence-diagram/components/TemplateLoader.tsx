import React, { useState, useEffect } from 'react';

// Template definition interface
interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
}

interface TemplateLoaderProps {
  /**
   * Called when a template is selected
   */
  onSelect: (template: Template) => void;
}

/**
 * Component for selecting and loading predefined sequence diagram templates
 */
const TemplateLoader: React.FC<TemplateLoaderProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load available templates
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this could be fetched from an API
        // For now, we'll import our static templates
        const basicTemplate = await import('../assets/templates/basic.txt');
        const asyncCallTemplate = await import('../assets/templates/async-call.txt');
        
        // Build template list
        const templateList: Template[] = [
          {
            id: 'basic',
            name: 'Basic Sequence Diagram',
            description: 'Simple diagram with basic syntax elements',
            content: basicTemplate.default,
          },
          {
            id: 'async-call',
            name: 'Asynchronous API Call',
            description: 'API call flow with asynchronous processing',
            content: asyncCallTemplate.default,
          },
          // Add more templates here
        ];
        
        setTemplates(templateList);
      } catch (error) {
        console.error('Failed to load templates:', error);
        setError('Failed to load templates. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only load templates when the dropdown is opened
    if (isOpen && templates.length === 0) {
      loadTemplates();
    }
  }, [isOpen, templates.length]);
  
  // Handle template selection
  const handleSelect = (template: Template) => {
    onSelect(template);
    setIsOpen(false);
    
    // Track analytics
    if (window.gtag) {
      window.gtag('event', 'seqdiag.template_select', {
        template_id: template.id
      });
    }
  };
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                 flex items-center space-x-1"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
        <span>Templates</span>
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-md shadow-lg bg-white dark:bg-gray-800
                      border border-gray-200 dark:border-gray-700 z-10">
          <div className="py-1">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Select a Template
            </h3>
            
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                Loading templates...
              </div>
            ) : error ? (
              <div className="px-4 py-2 text-sm text-red-500 dark:text-red-400">
                {error}
              </div>
            ) : (
              <ul className="max-h-60 overflow-auto">
                {templates.map((template) => (
                  <li key={template.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(template)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                               text-gray-700 dark:text-gray-300"
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {template.description}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateLoader;