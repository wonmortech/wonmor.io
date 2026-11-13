export const locales = ['en', 'uz', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export type T = Record<Locale, string>;

export const localeNames: T = { en: 'English', uz: 'Oʻzbekcha', ru: 'Русский' };
export const localeShort: T = { en: 'EN', uz: 'UZ', ru: 'RU' };
export const htmlLang: T = { en: 'en', uz: 'uz-Latn', ru: 'ru' };
export const ogLocale: T = { en: 'en_US', uz: 'uz_UZ', ru: 'ru_RU' };

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

/** Localised, base-aware href. `path` starts with "/" ("/" for home). */
export function href(locale: Locale, path: string): string {
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const p = path === '/' ? '/' : path.replace(/\/?$/, '/');
  return `${BASE}${prefix}${p}`.replace(/\/{2,}/g, '/');
}

/** Asset path (public/) that respects the base path. */
export const asset = (p: string) => `${BASE}${p}`;

/** Path of the current page without base and locale prefix, e.g. "/research/". */
export function stripLocale(pathname: string): string {
  let p = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname;
  for (const l of locales) if (l !== defaultLocale && (p === `/${l}` || p.startsWith(`/${l}/`))) p = p.slice(l.length + 1) || '/';
  // The 404 page has no translated twins; its language links lead home.
  return /^\/404(\.html|\/)?$/.test(p) ? '/' : p;
}

const months: Record<Locale, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
};

/** Date formatting without Intl data differences between build hosts. */
export function formatDate(d: Date, locale: Locale): string {
  const day = d.getUTCDate(), m = months[locale][d.getUTCMonth()], y = d.getUTCFullYear();
  if (locale === 'en') return `${m} ${day}, ${y}`;
  if (locale === 'uz') return `${y}-yil ${day}-${m}`;
  return `${day} ${m} ${y}`;
}
