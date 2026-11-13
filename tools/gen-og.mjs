// Per-page Open Graph images (1200x630 PNG) rendered in Chromium with the site's own fonts.
// Usage: npm run build && npx astro preview --port 4377 &  node tools/gen-og.mjs http://127.0.0.1:4377 [chromium.exe]
// then build again so public/og/p/** is copied. Base.astro uses /og/p/<page path>.png when the file exists
// and falls back to /og/wonmor.png. Re-run after adding pages or changing titles.
import { readFileSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';

const base = (process.argv[2] || 'http://127.0.0.1:4377').replace(/\/$/, '');
const exe = process.argv[3] || process.env.CHROMIUM;
const req = createRequire(process.env.PLAYWRIGHT_FROM || import.meta.url);
const { chromium } = req('playwright-core');

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const routes = walk('site').filter((f) => f.endsWith('index.html') && !/[\\/](search|_astro|pagefind)[\\/]/.test(f))
  .map((f) => '/' + f.slice(5).replace(/\\/g, '/').replace(/index\.html$/, ''));

const section = {
  en: { news: 'News', research: 'Research', engineering: 'Engineering', products: 'Products', company: 'Company', legal: 'Legal' },
  uz: { news: 'Yangiliklar', research: 'Tadqiqotlar', engineering: 'Muhandislik', products: 'Mahsulotlar', company: 'Kompaniya', legal: 'Huquqiy' },
  ru: { news: 'Новости', research: 'Исследования', engineering: 'Инженерия', products: 'Продукты', company: 'Компания', legal: 'Правовое' },
};
const commit = { en: 'Commitments', uz: 'Majburiyatlar', ru: 'Обязательства' };
const commitKeys = ['charter', 'responsible-release-policy', 'open-source', 'transparency', 'security'];
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const lockup = readFileSync('public/brand/lockup-on-light.svg', 'utf8');
const css = `
@font-face { font-family: S; src: url(/fonts/serif-latin.woff2); unicode-range: U+0000-00FF, U+02BB-02BC, U+2000-206F; }
@font-face { font-family: S; src: url(/fonts/serif-latin-ext.woff2); unicode-range: U+0100-02BA, U+02BD-02FF; }
@font-face { font-family: S; src: url(/fonts/serif-cyrillic.woff2); unicode-range: U+0400-04FF; }
@font-face { font-family: N; src: url(/fonts/sans-latin.woff2); unicode-range: U+0000-00FF, U+02BB-02BC, U+2000-206F; }
@font-face { font-family: N; src: url(/fonts/sans-latin-ext.woff2); unicode-range: U+0100-02BA, U+02BD-02FF; }
@font-face { font-family: N; src: url(/fonts/sans-cyrillic.woff2); unicode-range: U+0400-04FF; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { background: #faf9f5; color: #141413; font-family: N, sans-serif; position: relative; padding: 64px 72px; display: flex; flex-direction: column; }
.top { display: flex; justify-content: space-between; align-items: center; }
.top svg { height: 34px; width: auto; }
.eyebrow { font: 600 24px/1 N; color: #5e5d59; letter-spacing: .01em; }
h1 { margin-top: auto; font: 500 72px/1.06 S; letter-spacing: -.02em; max-width: 980px; text-wrap: balance; }
h1.long { font-size: 58px; } h1.xlong { font-size: 48px; }
.foot { margin-top: 36px; display: flex; justify-content: space-between; align-items: center; font: 500 22px/1 N; color: #87867f; }
.bar { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: #2969FF; }`;

const browser = await chromium.launch({ executablePath: exe, args: ['--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`${base}/404.html`);
let n = 0;
for (const r of routes) {
  const html = readFileSync(join('site', r, 'index.html'), 'utf8');
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || 'Wonmor').replace(/\s*·\s*Wonmor$/, '');
  const [, l1, l2] = r.match(/^\/(uz|ru)?\/?([^/]*)/) || [];
  const loc = l1 || 'en';
  const seg = l1 ? l2 : r.split('/')[1];
  const eyebrow = commitKeys.includes(seg) ? commit[loc] : section[loc][seg] || (seg ? '' : 'wonmor.io');
  const cls = title.length > 70 ? 'xlong' : title.length > 42 ? 'long' : '';
  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="top">${lockup}<span class="eyebrow">${esc(eyebrow)}</span></div>
<h1 class="${cls}">${esc(title)}</h1>
<div class="foot"><span>wonmor.io${esc(r === '/' ? '' : r.replace(/\/$/, ''))}</span><span>${loc.toUpperCase()}</span></div>
<div class="bar"></div></body></html>`;
  await page.evaluate((d) => { document.open(); document.write(d); document.close(); }, doc);
  await page.evaluate(() => document.fonts.ready);
  const out = join('public/og/p', r === '/' ? 'index.png' : `${r.replace(/^\/|\/$/g, '')}.png`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, await page.screenshot({ type: 'png' }));
  n++;
}
await browser.close();
console.log(`og: ${n} images`);
