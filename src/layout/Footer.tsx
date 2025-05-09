import React from 'react';
import { getIcon } from '../design-system/icons';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  // Function to handle LinkedIn navigation
  const handleLinkedInNavigation = () => {
    window.open('https://www.linkedin.com/in/jirads/', '_blank', 'noopener noreferrer');
  };

  return (
    <footer className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-inner transition-colors duration-200 mt-auto py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Company info and LinkedIn */}
          <div className="mb-4 md:mb-0 flex flex-col md:flex-row items-center md:items-start">
            <div className="flex items-center mr-6">
              <span className="mr-2 text-lg">{getIcon('code')}</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">MyDebugger</span>
            </div>
            <div className="mt-2 md:mt-0 text-center md:text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A collection of open-source developer tools.
              </p>
            </div>
          </div>
          
          {/* LinkedIn Contact */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLinkedInNavigation}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition duration-150"
              aria-label="Visit LinkedIn profile"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Developed by <button 
                onClick={handleLinkedInNavigation}
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Jirad Srirattana-arporn
              </button>
            </span>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © {currentYear} MyDebugger. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;