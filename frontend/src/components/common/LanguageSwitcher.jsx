import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const current = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const next = current === 'vi' ? 'en' : 'vi';
  const nextName = t(`language.${next}`);

  const toggleLanguage = () => {
    // Brief fade on the app root; CSS is skipped for reduced-motion users.
    const root = document.documentElement;
    root.classList.add('i18n-switching');
    window.setTimeout(() => root.classList.remove('i18n-switching'), 250);
    i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t('language.switchTo', { lang: nextName })}
      title={t('language.switchTo', { lang: nextName })}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <Globe className="h-5 w-5" aria-hidden="true" />
      <span className="text-sm font-medium" lang={next}>
        {next.toUpperCase()}
      </span>
    </button>
  );
}
