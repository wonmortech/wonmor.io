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

const fs = 'node_modules/@fontsource';
copyFileSync(`${fs}/noto-serif/files/noto-serif-latin-400-normal.woff2`, `${out}/fonts/noto-serif-400.woff2`);
for (const w of [400, 500, 600, 700]) copyFileSync(`${fs}/manrope/files/manrope-latin-${w}-normal.woff2`, `${out}/fonts/manrope-${w}.woff2`);
copyFileSync(`${fs}/noto-serif/LICENSE`, `${out}/fonts/LICENSE-noto-serif.txt`);
copyFileSync(`${fs}/manrope/LICENSE`, `${out}/fonts/LICENSE-manrope.txt`);
