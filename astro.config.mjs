// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkSteps from './tools/remark-steps.mjs';

// Static build straight into ./site — the folder deploy/deploy.sh ships (build output is committed).
export default defineConfig({
  site: 'https://wonmor.io',
  outDir: './site',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto', assets: 'assets' },
  compressHTML: true,
  markdown: {
    // remark pipeline: ```steps blocks become build-time flow diagrams (tools/remark-steps.mjs)
    processor: unified({ remarkPlugins: [remarkSteps] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: 'light', wrap: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', uz: 'uz-Latn', ru: 'ru' } },
      filter: (page) => !/\/search\/$/.test(page),
    }),
  ],
  // No inline scripts: the site ships a strict CSP (script-src 'self').
  vite: { build: { assetsInlineLimit: 0 } },
});
