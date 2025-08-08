import React from 'react';
import { useTranslation } from '../context/TranslationContext';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
      aria-label={t('header.language', 'Language')}
    >
      <Globe size={16} />
      <span className="uppercase font-semibold">
        {language === 'en' ? 'EN' : 'TH'}
      </span>
    </button>
  );
};

export default LanguageToggle;
