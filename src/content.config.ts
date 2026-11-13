import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* News: one folder per post, one file per language — src/content/news/<slug>/<en|uz|ru>.md.
   Every post is a dated fact with at least one source. Planned items never go here. */
const news = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['announcements', 'product', 'research', 'engineering', 'company']),
    product: z.string().optional(),
    links: z.array(z.object({
      label: z.string(),
      text: z.string(),
      href: z.string(),
      kind: z.enum(['external', 'download', 'internal']).default('external'),
    })).default([]),
    source: z.array(z.string()).min(1),
    featured: z.boolean().default(false),
  }),
});

/* Research and engineering posts: src/content/research/<slug>/<en|uz|ru>.md.
   kind decides the URL (/research/<slug> or /engineering/<slug>); area links the post to a research area page. */
export const areas = ['agents', 'language', 'infrastructure', 'supply-chain', 'interfaces', 'faith-society', 'digital-assets'] as const;
const research = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['research', 'engineering']),
    area: z.enum(areas),
    featured: z.boolean().default(false),
    source: z.array(z.string()).min(1),
    reproduce: z.object({
      repo: z.string().url().optional(),
      commit: z.string().optional(),
      note: z.string().optional(),
      commands: z.array(z.string()).default([]),
    }).optional(),
  }),
});

export const collections = { news, research };
