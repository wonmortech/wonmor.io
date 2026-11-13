import { href, type Locale } from './config';
import { pageByKey, type NavItem } from './pages';

export interface Link { label: string; href: string; external: boolean; key?: string }

/** Resolve a nav item (page key or explicit link) to a localised link. */
export function resolve(item: NavItem, locale: Locale): Link {
  if ('key' in item) {
    const p = pageByKey[item.key];
    if (!p) throw new Error(`Unknown page key in navigation: ${item.key}`);
    return { label: p.title[locale], href: href(locale, p.path), external: false, key: p.key };
  }
  return { label: item.label[locale], href: item.external ? item.href : href(locale, item.href), external: !!item.external };
}
