import { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en';
import bn from '../locales/bn';

const LanguageContext = createContext();

const dictionaries = {
  en,
  bn
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('app_language');
    if (storedLang && dictionaries[storedLang]) {
      setLanguage(storedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key) => {
    return dictionaries[language]?.[key] || dictionaries['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
