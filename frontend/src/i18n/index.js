import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import vi from './locales/vi.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    supportedLngs: ['vi', 'en'],
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Browser language is intentionally not used: default must be Vietnamese.
      order: ['localStorage'],
      caches: ['localStorage'],
    },
  });

// Keep <html lang> in sync for screen readers and hyphenation.
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
