import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/translation.json';
import hiTranslations from './locales/hi/translation.json';
import guTranslations from './locales/gu/translation.json';
import mrTranslations from './locales/mr/translation.json';
import paTranslations from './locales/pa/translation.json';
import taTranslations from './locales/ta/translation.json';
import teTranslations from './locales/te/translation.json';
import bnTranslations from './locales/bn/translation.json';
import knTranslations from './locales/kn/translation.json';
import mlTranslations from './locales/ml/translation.json';

const resources = {
  en: {
    translation: enTranslations
  },
  hi: {
    translation: hiTranslations
  },
  gu: {
    translation: guTranslations
  },
  mr: {
    translation: mrTranslations
  },
  pa: {
    translation: paTranslations
  },
  ta: {
    translation: taTranslations
  },
  te: {
    translation: teTranslations
  },
  bn: {
    translation: bnTranslations
  },
  kn: {
    translation: knTranslations
  },
  ml: {
    translation: mlTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['navigator'],
      caches: []
    },
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
