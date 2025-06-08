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

// Define template content directly in the component to avoid import issues
const templates: Template[] = [
  {
    id: 'basic',
    name: 'Basic Sequence Diagram',
    description: 'Simple diagram with basic syntax elements',
    content: `title Basic Sequence Diagram

participant User
participant System
participant Database

User->System: Request data
activate System
System->Database: Query data
activate Database
Database-->System: Return results
deactivate Database
System-->User: Display data
deactivate System`,
  },
  {
    id: 'async-call',
    name: 'Asynchronous API Call',
    description: 'API call flow with asynchronous processing',
    content: `title Asynchronous API Call Flow

participant Client
participant API
participant Queue
participant Worker
participant Database

Client->API: POST /data
activate API
API->Database: Validate request
activate Database
Database-->API: Valid
deactivate Database
API->Queue: Enqueue job
activate Queue
Queue-->API: Job ID
deactivate Queue
API-->Client: 202 Accepted (Job ID)
deactivate API

note over Queue: Async processing

Queue->Worker: Process job
activate Worker
Worker->Database: Update data
activate Database
Database-->Worker: Success
deactivate Database
Worker-->Queue: Complete
deactivate Worker`,
  },
  {
    id: 'all-features',
    name: 'Syntax Reference',
    description: 'Comprehensive example showing all sequencediagram.org syntax',
    content: `title Sequence Diagram Syntax Reference

participant User as U
participant "Web Browser" as Browser
actor "Authentication Service" as Auth
participant "API Server" as API
participant "Database" as DB

note over U, DB: User authentication flow with all syntax elements

U->Browser: Enter credentials
activate Browser

Browser->Auth: POST /login
activate Auth

alt Valid credentials
  Auth->API: Validate user
  activate API
  
  API->DB: Query user
  activate DB
  DB-->API: Return user data
  deactivate DB
  
  API-->Auth: User valid
  deactivate API
  
  Auth-->Browser: 200 OK + JWT
  
else Invalid credentials
  Auth-->Browser: 401 Unauthorized
end

Browser-->U: Display result
deactivate Browser

loop Every hour
  Browser->Auth: Refresh token
  Auth-->Browser: New token
end

opt User requests profile
  U->Browser: View profile
  activate Browser
  
  Browser->API: GET /profile
  activate API
  
  API->DB: Get profile data
  activate DB
  
  par Additional data
    API->Auth: Get permissions
    Auth-->API: Permission data
  and
    DB-->API: User profile
  end
  
  deactivate DB
  
  API-->Browser: Profile data
  deactivate API
  
  Browser-->U: Display profile
  deactivate Browser
end

note right of DB: This shows all syntax elements:\n- Participants & actors\n- Activation/deactivation\n- Alt/else conditions\n- Loops and opt blocks\n- Notes\n- Parallel execution`,
  }
];

/**
 * Component for selecting and loading predefined sequence diagram templates
 */
const TemplateLoader: React.FC<TemplateLoaderProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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