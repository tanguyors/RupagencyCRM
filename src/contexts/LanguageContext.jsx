import React, { createContext, useContext, useState, useEffect } from 'react';
import fr from '../locales/fr';
import en from '../locales/en';
import id from '../locales/id';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to French
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'fr';
  });

  const [translations, setTranslations] = useState(fr);

  useEffect(() => {
    // Update translations when language changes
    let translations;
    switch (language) {
      case 'fr':
        translations = fr;
        break;
      case 'en':
        translations = en;
        break;
      case 'id':
        translations = id;
        break;
      default:
        translations = fr;
    }
    setTranslations(translations);
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key, params = {}) => {
    let translation = translations[key] || key;
    
    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const value = {
    language,
    translations,
    t,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 