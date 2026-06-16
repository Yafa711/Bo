import React, { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import * as RNLocalize from 'react-native-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ar from './ar.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeLocalization = async () => {
      try {
        const locale = RNLocalize.getLocales()[0];
        if (locale) {
          const languageTag = locale.languageCode;
          const isRTL = languageTag === 'ar'; // Arabic is RTL

          // Update i18n language
          await i18n.changeLanguage(languageTag);

          // Update RTL layout
          I18nManager.forceRTL(isRTL);
          I18nManager.allowRTL(isRTL);
        }
      } catch (error) {
        console.warn('Error initializing localization:', error);
        // Fallback to English LTR
        i18n.changeLanguage('en');
        I18nManager.forceRTL(false);
      } finally {
        setIsReady(true);
      }
    };

    initializeLocalization();
  }, []);

  if (!isReady) {
    return null; // or return a loading spinner
  }

  return children;
};

export default LocalizationProvider;