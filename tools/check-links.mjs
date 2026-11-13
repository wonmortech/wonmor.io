// Link check over the built site: every internal href/src must resolve to a file in site/, and every
// #fragment must exist on its target page. External URLs are written to site-external-links.txt (not
// published, gitignored) so they can be checked from a machine with open internet.
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, sep } from 'node:path';

const ROOT = 'site';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(ROOT).filter((f) => f.endsWith('.html') && !f.startsWith(join(ROOT, 'pagefind') + sep));
const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(file);
};
const target = (path) => {
  const p = decodeURIComponent(path.split('?')[0]);
  const f = join(ROOT, p);
  if (p.endsWith('/')) return existsSync(join(f, 'index.html')) ? join(f, 'index.html') : null;
  return existsSync(f) && statSync(f).isFile() ? f : existsSync(join(f, 'index.html')) ? join(f, 'index.html') : null;
};

const broken = [];
const external = new Map();
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const here = '/' + file.slice(ROOT.length + 1).replace(/\\/g, '/').replace(/index\.html$/, '');
  for (const [, attr, raw] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    const url = raw.replace(/&amp;/g, '&');
    if (/^(mailto:|tel:|data:|javascript:)/.test(url)) continue;
    if (/^https?:\/\//.test(url)) {
      if (/^https?:\/\/wonmor\.io(\/|$)/.test(url)) continue; // canonical, hreflang, og: same site
      if (!external.has(url)) external.set(url, here);
      continue;
    }
    const [pathPart, frag] = url.split('#');
    const abs = pathPart === '' ? here : pathPart.startsWith('/') ? pathPart : new URL(pathPart, `http://x${here}`).pathname;
    const t = target(abs);
    if (!t) { broken.push(`${here} -> ${url} (${attr}: missing)`); continue; }
    if (frag && t.endsWith('.html') && !idsOf(t).has(decodeURIComponent(frag))) broken.push(`${here} -> ${url} (#${frag} missing)`);
  }
}
writeFileSync('site-external-links.txt', [...external.keys()].sort().join('\n') + '\n');
if (broken.length) {
  console.error(`check-links: ${broken.length} broken\n` + [...new Set(broken)].slice(0, 80).join('\n'));
  process.exit(1);
}
console.log(`check-links ok: ${pages.length} pages, ${external.size} external URLs listed in site-external-links.txt`);
