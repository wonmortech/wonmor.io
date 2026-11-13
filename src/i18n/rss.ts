import { getCollection } from 'astro:content';
import { href, htmlLang, type Locale } from './config';
import { home } from './home';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** RSS 2.0 feed of one language's news, research and engineering posts. */
export async function rss(locale: Locale, site: URL | undefined): Promise<Response> {
  const base = site ?? new URL('https://wonmor.io');
  const mine = (e: { id: string }) => e.id.endsWith(`/${locale}`);
  const items = [
    ...(await getCollection('news', mine)).map((n) => ({ path: `/news/${n.id.split('/')[0]}`, data: n.data })),
    ...(await getCollection('research', mine)).map((n) => ({ path: `/${n.data.kind}/${n.id.split('/')[0]}`, data: n.data })),
  ].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Wonmor</title>
<link>${new URL(href(locale, '/news'), base)}</link>
<description>${esc(home.description[locale])}</description>
<language>${htmlLang[locale]}</language>
${items.map((n) => {
  const url = new URL(href(locale, n.path), base).toString();
  return `<item><title>${esc(n.data.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${n.data.date.toUTCString()}</pubDate><description>${esc(n.data.description)}</description></item>`;
}).join('\n')}
</channel></rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
