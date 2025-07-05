// i18n.js (exemple simplifié)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: {/* ... */} },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

export default i18n;
