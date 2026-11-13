// Brand geometry → src/brand/geometry.json + public icons.
// Source of truth: brand/source/wonmor_b.json (same file the brand film and
// lockup sheet are built from). Constants mirror MONO/logo-compare/make_lockups.cjs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const J = JSON.parse(readFileSync(new URL('../brand/source/wonmor_b.json', import.meta.url)));
const B = J.variants.b;

const XT = 6.63, BASE = 23.01, OVER = 0.35;
const S = (BASE + OVER - XT) / 26.0206;
const MARK_W = (36.65 - 4.75) * S;
const GAP = 1.3;
const letters = B.letters.slice(1); // o n m o r  (the w is the mark)
const SHIFT = MARK_W + GAP - letters[0].x0;
const WORD_END = letters[letters.length - 1].x1 + SHIFT;
const VB = { x: -1.6, y: 4.8, w: WORD_END + 3.2, h: 20 };
const CUT = MARK_W + GAP / 2;
const r = (n) => +n.toFixed(4);

const geometry = {
  o: B.o,
  markTransform: `translate(0 ${XT}) scale(${r(S)}) translate(-4.75 -3)`,
  crown: J.vCrown,
  chev: J.vChev,
  vb: { x: VB.x, y: VB.y, w: r(VB.w), h: VB.h },
  markVB: `${VB.x} ${VB.y} ${r(CUT - VB.x)} ${VB.h}`,
  wordVB: `${r(CUT)} ${VB.y} ${r(VB.x + VB.w - CUT)} ${VB.h}`,
  markRatio: r((CUT - VB.x) / VB.h),
  wordRatio: r((VB.x + VB.w - CUT) / VB.h),
  shift: r(SHIFT),
  letters: letters.map((l) => ({ d: l.d, x0: r(l.x0 + SHIFT), x1: r(l.x1 + SHIFT) })),
};

const out = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
mkdirSync(out('src/brand'), { recursive: true });
writeFileSync(out('src/brand/geometry.json'), JSON.stringify(geometry, null, 2) + '\n');

// Icon: the two V's on a rounded square (same proportions as the lockup sheet).
const DARK = '#090A1E', BLUE = '#2969FF', WHITE = '#FFFFFF';
function icon({ bg, mark, radius = 0.22, pad = 0.2 }) {
  const w = 31.9, hh = 26.02, side = Math.max(w, hh) * (1 + 2 * pad);
  const ox = 4.75 - (side - w) / 2, oy = 3 - (side - hh) / 2;
  const v = (o, op) => `<g transform="translate(${o} 0)"${op ? ` opacity="${op}"` : ''}><path d="${J.vCrown}"/><path d="${J.vChev}"/></g>`;
  const rect = bg ? `<rect x="${r(ox)}" y="${r(oy)}" width="${r(side)}" height="${r(side)}" rx="${r(side * radius)}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(ox)} ${r(oy)} ${r(side)} ${r(side)}">${rect}<g fill="${mark}">${v(0, '.65')}${v(B.o)}</g></svg>\n`;
}

mkdirSync(out('public/brand'), { recursive: true });
const fav = icon({ bg: DARK, mark: BLUE });
writeFileSync(out('public/favicon.svg'), fav);
writeFileSync(out('public/brand/mark-blue.svg'), icon({ mark: BLUE, pad: 0.05 }));
writeFileSync(out('public/brand/mark-white.svg'), icon({ mark: WHITE, pad: 0.05 }));
writeFileSync(out('public/brand/icon-dark.svg'), fav);
writeFileSync(out('public/brand/icon-blue.svg'), icon({ bg: BLUE, mark: WHITE }));
writeFileSync(out('public/brand/icon-light.svg'), icon({ bg: WHITE, mark: BLUE }));

// Full lockups (static, final frame of the lockup sheet).
function lockup(text) {
  const g = geometry;
  const v = (x, op) => `<g transform="translate(${x} 0)"${op ? ` opacity="${op}"` : ''}><path d="${g.crown}"/><path d="${g.chev}"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${g.vb.x} ${g.vb.y} ${g.vb.w} ${g.vb.h}"><g transform="${g.markTransform}" fill="${BLUE}">${v(0, '.65')}${v(B.o)}</g><g fill="${text}" transform="translate(${g.shift} 0)">${letters.map((l) => `<path d="${l.d}"/>`).join('')}</g></svg>\n`;
}
writeFileSync(out('public/brand/lockup-on-light.svg'), lockup(DARK));
writeFileSync(out('public/brand/lockup-on-dark.svg'), lockup(WHITE));

// Open Graph card (1200×630): ivory page, the static lockup centred.
{
  const W = 1200, H = 630, lw = 640, lh = lw * geometry.vb.h / geometry.vb.w;
  const inner = lockup(DARK).replace('<svg xmlns="http://www.w3.org/2000/svg"', `<svg x="${r((W - lw) / 2)}" y="${r((H - lh) / 2)}" width="${lw}" height="${r(lh)}"`);
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#faf9f5"/>${inner}</svg>`;
  mkdirSync(out('public/og'), { recursive: true });
  await sharp(Buffer.from(og)).png().toFile(out('public/og/wonmor.png'));
}

await sharp(Buffer.from(icon({ bg: DARK, mark: BLUE, radius: 0 }))).resize(180, 180).png().toFile(out('public/apple-touch-icon.png'));
await sharp(Buffer.from(fav)).resize(192, 192).png().toFile(out('public/brand/icon-192.png'));
await sharp(Buffer.from(fav)).resize(512, 512).png().toFile(out('public/brand/icon-512.png'));
console.log('brand ok', { S: r(S), shift: geometry.shift, w: geometry.vb.w, markRatio: geometry.markRatio, wordRatio: geometry.wordRatio });
