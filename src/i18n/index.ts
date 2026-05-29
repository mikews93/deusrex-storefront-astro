import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import { LOCALE } from '@/runtime/public-api-config';

/**
 * i18n for the storefront islands. Resources are the `storefront.*` / `common.*`
 * subtrees copied from the dashboard so the published flow reads the same keys.
 * `LOCALE` is the per-org build-time constant injected by the generator.
 * Side-effect init (initReactI18next) makes `useTranslation()` work globally —
 * no provider needed in each island.
 */
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: LOCALE,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
