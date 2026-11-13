// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static build straight into ./site — the folder deploy/deploy.sh ships (build output is committed).
export default defineConfig({
  site: 'https://wonmor.io',
  outDir: './site',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto', assets: 'assets' },
  compressHTML: true,
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', uz: 'uz-Latn', ru: 'ru' } },
      filter: (page) => !/\/search\/$/.test(page),
    }),
  ],
  // No inline scripts: the site ships a strict CSP (script-src 'self').
  vite: { build: { assetsInlineLimit: 0 } },
});
