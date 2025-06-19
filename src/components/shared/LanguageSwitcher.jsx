// src/components/shared/LanguageSwitcher.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = {
  en: { nativeName: 'English' },
  fr: { nativeName: 'Français' },
};

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // This effect handles closing the dropdown when you click outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 flex items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
        title={t('pages.navbar.changeLanguage')}
      >
        <Globe size={20} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 animate-fade-in-up">
          {Object.keys(languages).map((lng) => (
            <button
              key={lng}
              className={`w-full text-left px-4 py-2 text-sm ${i18n.resolvedLanguage === lng ? 'bg-slate-100 dark:bg-slate-700 font-semibold' : ''} text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
              onClick={() => handleLanguageChange(lng)}
            >
              {languages[lng].nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;