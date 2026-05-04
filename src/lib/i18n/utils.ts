import type { Locale } from '../site';

export function localeTag(locale: Locale) {
  return locale === 'ja' ? 'ja-JP' : 'zh-CN';
}

export function formatDate(date: Date, locale: Locale, options?: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString(localeTag(locale), options);
}
