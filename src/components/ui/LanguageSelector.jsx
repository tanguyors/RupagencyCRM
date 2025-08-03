import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'fr', name: t('french'), flag: '🇫🇷' },
    { code: 'en', name: t('english'), flag: '🇬🇧' },
    { code: 'id', name: t('indonesian'), flag: '🇮🇩' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="appearance-none bg-white dark:bg-dark-800 border border-dark-300 dark:border-dark-600 rounded-lg px-3 py-2 pr-8 text-sm text-dark-900 dark:text-cream-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-dark-400" />
      </div>
    </div>
  );
};

export default LanguageSelector; 