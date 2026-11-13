import { products } from '../data/products';
import { pages } from './pages';
import { href, htmlLang, type Locale, type T } from './config';

export interface ChangeEntry { date: string; product: string; name: T; path: string; accent: string; text: T }

/** All product milestones (src/data/products.json), newest first. */
export const changes: ChangeEntry[] = Object.entries(products)
  .flatMap(([key, p]) => {
    const page = pages.find((x) => x.key === `p-${key}`);
    return p.milestones.map((m) => ({ date: m.date, product: key, name: page ? page.title : { en: key, uz: key, ru: key }, path: page?.path ?? '/products', accent: p.accent, text: m.text }));
  })
  .sort((a, b) => b.date.localeCompare(a.date) || a.product.localeCompare(b.product));

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** RSS 2.0 feed of the changelog in one language. */
export function changelogRss(locale: Locale, site: URL | undefined): Response {
  const base = site ?? new URL('https://wonmor.io');
  const title: T = { en: 'Wonmor changelog', uz: 'Wonmor oʻzgarishlar jurnali', ru: 'Журнал изменений Wonmor' };
  const page = new URL(href(locale, '/changelog'), base).toString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(title[locale])}</title>
<link>${page}</link>
<description>${esc(title[locale])}</description>
<language>${htmlLang[locale]}</language>
${changes.map((c) => {
  const guid = `${page}#${c.product}-${c.date}-${encodeURIComponent(c.text.en.slice(0, 24))}`;
  return `<item><title>${esc(`${c.name[locale]}: ${c.text[locale]}`)}</title><link>${new URL(href(locale, c.path), base)}</link><guid isPermaLink="false">${esc(guid)}</guid><pubDate>${new Date(`${c.date}T12:00:00Z`).toUTCString()}</pubDate><category>${esc(c.name[locale])}</category><description>${esc(c.text[locale])}</description></item>`;
}).join('\n')}
</channel></rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
