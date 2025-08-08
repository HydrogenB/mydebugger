import React from 'react';
import { useTranslation } from '../context/TranslationContext';

const TranslatedFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('footer.copyright', '© 2025 MyDebugger. All rights reserved.')}
            </p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a 
              href="#" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm"
            >
              {t('footer.privacy', 'Privacy Policy')}
            </a>
            <a 
              href="#" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm"
            >
              {t('footer.terms', 'Terms of Service')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default TranslatedFooter;
