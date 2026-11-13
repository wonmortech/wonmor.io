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

export const collections = { news };
