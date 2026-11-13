// Post-build gate for ./site: CSP (no inline executable scripts), internal links, and a
// privacy scan so internal hosts, addresses and secrets never ship. Exits 1 on any failure.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../site/', import.meta.url));
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { if (f !== 'pagefind') walk(p); }
    else if (/\.(html|xml|txt|js|css|json|webmanifest)$/.test(f)) files.push(p);
  }
})(ROOT);

const errors = [];
const rel = (p) => relative(ROOT, p).split(sep).join('/');

const PRIVATE = [
  [/\b(?:10|127|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\.?\d{0,3}\b/, 'private IP address'],
  ...(process.env.WM_FORBIDDEN ? [[new RegExp(process.env.WM_FORBIDDEN), 'forbidden string (WM_FORBIDDEN)']] : []),
  [/gitlab\.fkt|jira\.faktura|patchapi|\bFA-\d{3,}/i, 'internal Faktura reference'],
  [/(?:ghp_|github_pat_|glpat-|xox[bp]-)[A-Za-z0-9_]{10,}/, 'token-like string'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
];

for (const f of files) {
  const s = readFileSync(f, 'utf8');
  const name = rel(f);
  for (const [re, what] of PRIVATE) if (re.test(s)) errors.push(`${name}: ${what} (${s.match(re)[0]})`);
  if (!f.endsWith('.html')) continue;

  for (const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    if (/\bsrc=/.test(attrs) || /type="?application\/ld\+json/.test(attrs)) continue;
    if (m[2].trim()) errors.push(`${name}: inline <script> blocked by CSP`);
  }
  for (const m of s.matchAll(/\s(?:href|src)="(\/[^"#?]*)/g)) {
    const url = decodeURI(m[1]);
    if (url.startsWith('//')) continue;
    const target = join(ROOT, url);
    const ok = existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html')));
    if (!ok) errors.push(`${name}: broken internal link ${url}`);
  }
}

const pages = files.filter((f) => f.endsWith('index.html')).length;
if (errors.length) {
  console.error(`check-site: ${errors.length} problem(s)\n` + [...new Set(errors)].slice(0, 80).join('\n'));
  process.exit(1);
}
console.log(`check-site ok: ${pages} pages, ${files.length} files scanned`);
