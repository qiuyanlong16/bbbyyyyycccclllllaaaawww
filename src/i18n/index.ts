import { createI18n } from 'vue-i18n';
import zh from './zh';
import en from './en';

const STORAGE_KEY = 'byclaw_lang';

function detectLocale(): 'zh' | 'en' {
  const saved = localStorage.getItem(STORAGE_KEY) as 'zh' | 'en' | null;
  if (saved === 'zh' || saved === 'en') return saved;
  return 'zh';
}

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { zh, en },
});

export function setLocale(locale: 'zh' | 'en') {
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
}

export function toggleLocale() {
  setLocale(i18n.global.locale.value === 'zh' ? 'en' : 'zh');
}

export default i18n;
