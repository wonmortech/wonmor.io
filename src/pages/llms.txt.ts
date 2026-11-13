import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { pages, type GroupKey } from '../i18n/pages';
import { home } from '../i18n/home';

/* /llms.txt (llmstxt.org): a plain-text map of the site for language models, generated from the
   same page list, research posts and news that build the site. English URLs; uz at /uz/, ru at /ru/. */
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://wonmor.io');
  const url = (p: string) => new URL(p.endsWith('/') ? p : `${p}/`, base).toString();
  const en = (e: { id: string }) => e.id.endsWith('/en');
  const research = (await getCollection('research', en)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const news = (await getCollection('news', en)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const section = (g: GroupKey) => pages.filter((p) => p.group === g)
    .map((p) => `- [${p.title.en}](${url(p.path)}): ${p.lede.en}`).join('\n');
  const body = `# Wonmor

> ${home.description.en}

Wonmor is a self-funded brand from Uzbekistan, not a company: no legal entity, investors or board. Pages exist in English (/), Uzbek (/uz/) and Russian (/ru/). Facts on the site are dated; anything not live yet is marked as planned.

## Products

${section('products')}

## Research and engineering

${section('research')}
${research.map((r) => `- [${r.data.title}](${url(`/${r.data.kind}/${r.id.split('/')[0]}`)}): ${r.data.description}`).join('\n')}

## Commitments

${section('commitments')}

## Company

${section('company')}

## News

${news.map((n) => `- [${n.data.title}](${url(`/news/${n.id.split('/')[0]}`)}): ${n.data.description}`).join('\n')}

## Optional

${section('legal')}
- [RSS feed](${new URL('/rss.xml', base)})
- [Sitemap](${new URL('/sitemap-index.xml', base)})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
