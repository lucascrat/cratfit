import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptTranslation from './locales/pt.json';
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            pt: { translation: ptTranslation },
            en: { translation: enTranslation },
            es: { translation: esTranslation }
        },
        fallbackLng: 'pt',
        detection: {
            order: ['querystring', 'localStorage', 'navigator'],
            lookupQuerystring: 'lng',
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage'],
            checkWhitelist: true
        },
        interpolation: {
            escapeValue: false // React already does escaping
        },
        // allow keys to be phrases having `:`, `.`
        nsSeparator: false,
        keySeparator: false,
    });

export default i18n;
