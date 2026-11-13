// Copies the self-hosted font subsets the site uses from node_modules into public/fonts.
// Called by `npm run assets`; src/styles/fonts.css references these exact names.
import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const nm = (p) => fileURLToPath(new URL(`../node_modules/@fontsource-variable/${p}`, import.meta.url));
const dst = (f) => fileURLToPath(new URL(`../public/fonts/${f}`, import.meta.url));
mkdirSync(dst(''), { recursive: true });

const files = [
  ['hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2', 'sans-latin.woff2'],
  ['hanken-grotesk/files/hanken-grotesk-latin-ext-wght-normal.woff2', 'sans-latin-ext.woff2'],
  ['onest/files/onest-cyrillic-wght-normal.woff2', 'sans-cyrillic.woff2'],
  ['onest/files/onest-cyrillic-ext-wght-normal.woff2', 'sans-cyrillic-ext.woff2'],
  ['source-serif-4/files/source-serif-4-latin-opsz-normal.woff2', 'serif-latin.woff2'],
  ['source-serif-4/files/source-serif-4-latin-ext-opsz-normal.woff2', 'serif-latin-ext.woff2'],
  ['source-serif-4/files/source-serif-4-cyrillic-opsz-normal.woff2', 'serif-cyrillic.woff2'],
  ['source-serif-4/files/source-serif-4-latin-opsz-italic.woff2', 'serif-latin-italic.woff2'],
  ['jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2', 'mono-latin.woff2'],
  ['jetbrains-mono/files/jetbrains-mono-cyrillic-wght-normal.woff2', 'mono-cyrillic.woff2'],
  // SIL Open Font License texts ship next to the fonts.
  ['hanken-grotesk/LICENSE', 'LICENSE-hanken-grotesk.txt'],
  ['onest/LICENSE', 'LICENSE-onest.txt'],
  ['source-serif-4/LICENSE', 'LICENSE-source-serif-4.txt'],
  ['jetbrains-mono/LICENSE', 'LICENSE-jetbrains-mono.txt'],
];
for (const [from, to] of files) copyFileSync(nm(from), dst(to));
console.log('fonts ok', files.length);
