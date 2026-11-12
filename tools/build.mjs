// Bundles src/ into site/assets (ES modules, three.js in its own chunk) and copies the font files.
import { build } from 'esbuild';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';

const out = 'site/assets';
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/fonts`, { recursive: true });

await build({
  entryPoints: { app: 'src/main.js' },
  outdir: out,
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,
  target: ['es2020'],
  chunkNames: 'chunk-[hash]',
  legalComments: 'none',
  logLevel: 'info',
});

for (const w of [700, 800]) {
  copyFileSync(
    `node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${w}-normal.woff2`,
    `${out}/fonts/plus-jakarta-sans-${w}.woff2`,
  );
}
copyFileSync('node_modules/@fontsource/plus-jakarta-sans/LICENSE', `${out}/fonts/LICENSE.txt`);
