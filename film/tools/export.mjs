// Writes the vector kit (SVG for Figma/AE) and geo.json (Blender, AE script, film comp).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, COLORS, MARK, markFinal, wordB, lockup, svgPath, bbox, sample } from '../lib/geo.mjs';
import { DIAMOND, CAP, V_OUTER, V, CAP_UNION, W } from '../lib/markB.mjs';

const OUT = path.join(ROOT, 'out');
const VEC = path.join(OUT, 'vectors');
fs.mkdirSync(VEC, { recursive: true });
fs.mkdirSync(path.join(OUT, 'data'), { recursive: true });

const svg = (w, h, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>\n`;
const write = (name, s) => fs.writeFileSync(path.join(VEC, name), s);

function markSvg(contours, fill, pad = 0) {
  const b = bbox(contours);
  const s = 10;
  return svg(Math.round(b.w * s + pad * 2), Math.round(b.h * s + pad * 2), `<path fill="${fill}" transform="translate(${pad - b.x0 * s} ${pad - b.y0 * s}) scale(${s})" d="${svgPath(contours, 3)}"/>`);
}

write('mark-w_blue.svg', markSvg(markFinal(), COLORS.blue));
write('mark-w_ink.svg', markSvg(markFinal(), COLORS.ink));
write('mark-w_white.svg', markSvg(markFinal(), COLORS.white));
write('mark-v_blue.svg', markSvg([...MARK.crown, ...MARK.v], COLORS.blue));
write('mark-diamond_outline.svg', svg(1040, 1040, `<path fill="${COLORS.navy}" fill-opacity=".55" stroke="${COLORS.blue}" stroke-width=".25" transform="translate(20 20) scale(10)" d="${svgPath(MARK.diamond, 3)}"/>`));

const L = lockup();
function lockupSvg(markFill, textFill, bg) {
  const s = 4, pad = 120;
  const w = Math.round(L.width * s + pad * 2), h = Math.round((L.bottom - L.top + 40) * s + pad * 2);
  const text = L.letters.map((l) => svgPath(l.contours, 2)).join('');
  return svg(w, h, `<g transform="translate(${pad} ${pad - L.top * s}) scale(${s})"><path fill="${markFill}" d="${svgPath(L.mark, 3)}"/><path fill="${textFill}" d="${text}"/></g>`, bg);
}
write('lockup_blue-ink.svg', lockupSvg(COLORS.blue, COLORS.ink));
write('lockup_blue-white.svg', lockupSvg(COLORS.blue, COLORS.white));
write('lockup_ink.svg', lockupSvg(COLORS.ink, COLORS.ink));
write('lockup_white.svg', lockupSvg(COLORS.white, COLORS.white));
write('lockup_on-paper.svg', lockupSvg(COLORS.blue, COLORS.ink, COLORS.paper));
write('lockup_on-ink.svg', lockupSvg(COLORS.blue, COLORS.white, COLORS.ink));

// Wordmark "wonmor" (variant B), also used alone for the giant type shot.
const WMK = wordB();
write('wordmark_ink.svg', svg(Math.round(WMK.width * 2 + 80), 300, `<path fill="${COLORS.ink}" transform="translate(40 250) scale(2)" d="${WMK.letters.map((l) => svgPath(l.contours, 2)).join('')}"/>`));
{
  const R = 500, m = markFinal(), b = bbox(m), s = (R * 1.1) / b.w;
  write('badge_ink.svg', svg(R * 2, R * 2, `<circle cx="${R}" cy="${R}" r="${R}" fill="${COLORS.ink}"/><path fill="${COLORS.blue}" transform="translate(${R - b.w * s / 2} ${R - b.h * s / 2 + 10}) scale(${s})" d="${svgPath(m, 3)}"/>`));
}

const letters = (ls) => ls.map((l) => ({ ch: l.ch, x0: l.x0, x1: l.x1, contours: l.contours }));
const geo = {
  units: 'mark: variant B, 141.78 x 115.65 (y down). wordmark/lockup: x-height = 100, baseline y = 0, y down.',
  colors: COLORS,
  mark: { w: MARK.W, h: MARK.H, offset: MARK.OFFSET, diamond: MARK.diamond, crown: MARK.crown, v: MARK.v, crownW: MARK.crownW, wShape: MARK.w },
  wordmark: { width: WMK.width, letters: letters(WMK.letters) },
  lockup: { width: L.width, top: L.top, bottom: L.bottom, markW: L.markW, markH: L.markH, mark: L.mark, letters: letters(L.letters) },
  raw: { diamond: DIAMOND, cap: CAP, vOuter: V_OUTER, v: V, crownW: CAP_UNION, w: W },
  polygons: {
    crownW: MARK.crownW.map((c) => sample(c, 8)),
    w: MARK.w.map((c) => sample(c, 8)),
    crown: MARK.crown.map((c) => sample(c, 8)),
    v: MARK.v.map((c) => sample(c, 8)),
    diamond: MARK.diamond.map((c) => sample(c, 1)),
  },
};
fs.writeFileSync(path.join(OUT, 'data', 'geo.json'), JSON.stringify(geo));
console.log('vectors:', fs.readdirSync(VEC).length, 'lockup width', L.width.toFixed(1));
