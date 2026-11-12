// Figma kit: brand sheet SVG (drag into Figma -> editable vectors), tokens.json (Tokens Studio / Variables),
// key frames of the film as PNG references. Reads out/vectors + lib/geo.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, COLORS as K, MARK, lockup, svgPath } from '../lib/geo.mjs';

const OUT = path.join(ROOT, 'out', 'figma', 'wonmor_Figma');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(ROOT, 'out', 'vectors'), path.join(OUT, 'vectors'), { recursive: true });

const tokens = {
  wonmor: {
    color: {
      blue: { value: K.blue, type: 'color', description: 'Primary. Mark, accents, full-bleed frames' },
      'blue-deep': { value: K.blueDeep, type: 'color', description: 'Shadow side of the blue mark' },
      ink: { value: K.ink, type: 'color', description: 'Dark background, wordmark on light' },
      paper: { value: K.paper, type: 'color', description: 'Light background' },
      white: { value: K.white, type: 'color', description: 'Wordmark on dark' },
      navy: { value: K.navy, type: 'color', description: 'Construction fill (film only)' },
      grey: { value: K.grey, type: 'color', description: 'Secondary text' },
      measure: { value: K.measure, type: 'color', description: 'Measurement labels (film only)' },
    },
    type: {
      wordmark: { value: { fontFamily: 'Plus Jakarta Sans', fontWeight: '700', letterSpacing: '-3%' }, type: 'typography' },
      body: { value: { fontFamily: 'Plus Jakarta Sans', fontWeight: '500', fontSize: '16', lineHeight: '150%' }, type: 'typography' },
    },
    mark: {
      ratio: { value: '164:100', type: 'other', description: 'W mark width:height' },
      'lockup-gap': { value: '0.42 x mark height', type: 'other' },
      'clear-space': { value: '0.5 x mark height on every side', type: 'other' },
      'min-size': { value: '16px mark height (screen), 6mm (print)', type: 'sizing' },
    },
    motion: {
      'ease-out': { value: 'cubic-bezier(0.16, 1, 0.3, 1)', type: 'other' },
      'ease-in-out': { value: 'cubic-bezier(0.65, 0, 0.35, 1)', type: 'other' },
      'cut-rhythm': { value: '1.0s per shot early, 0.25s per shot in the montage', type: 'other' },
    },
  },
};
fs.writeFileSync(path.join(OUT, 'tokens.json'), JSON.stringify(tokens, null, 2));
fs.copyFileSync(path.join(ROOT, 'pack', 'README_FIGMA.txt'), path.join(OUT, 'README.txt'));

// Brand sheet 1920 x 2400: mark, construction, lockups, colours, rules.
const S = [];
const W = 1920;
const g = (tx, ty, s, d, fill, extra = '') => `<path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})" d="${d}" fill="${fill}" ${extra}/>`;
const markD = svgPath([...MARK.crownW, ...MARK.w]);
const LK = lockup();
const lockD = svgPath(LK.mark);
const wordD = svgPath(LK.letters.flatMap((l) => l.contours));
const text = (x, y, s, t, fill = K.grey, w = 500) => `<text x="${x}" y="${y}" font-family="Plus Jakarta Sans, Arial" font-size="${s}" font-weight="${w}" fill="${fill}">${t}</text>`;
S.push(`<rect width="${W}" height="2400" fill="${K.paper}"/>`);
S.push(text(120, 150, 64, 'wonmor', K.ink, 700), text(120, 200, 24, 'Brand kit. One diamond. One W.'));
S.push(`<rect x="120" y="280" width="1680" height="720" rx="24" fill="${K.blue}"/>`);
S.push(g(960 - 82 * 3.4, 640 - 50 * 3.4, 3.4, markD, K.white));
S.push(text(150, 960, 20, 'Mark, white on blue', K.white));
S.push(`<rect x="120" y="1060" width="820" height="560" rx="24" fill="${K.ink}"/>`);
const cs = 3.2, cx0 = 530 - 82 * cs, cy0 = 1340 - 50 * cs;
S.push(g(cx0, cy0, cs, markD, 'none', `stroke="${K.blue}" stroke-width="${(1.5 / cs).toFixed(3)}"`));
[[0, 0], [164, 0], [0, 100], [164, 100]].forEach(([x, y]) => S.push(`<rect x="${cx0 + x * cs - 4}" y="${cy0 + y * cs - 4}" width="8" height="8" fill="${K.white}" stroke="${K.blue}"/>`));
S.push(`<line x1="${cx0 - 30}" y1="${cy0}" x2="${cx0 - 30}" y2="${cy0 + 100 * cs}" stroke="${K.measure}"/>`, text(cx0 - 90, cy0 + 50 * cs, 18, '100', K.measure));
S.push(`<line x1="${cx0}" y1="${cy0 + 100 * cs + 30}" x2="${cx0 + 164 * cs}" y2="${cy0 + 100 * cs + 30}" stroke="${K.measure}"/>`, text(cx0 + 82 * cs - 18, cy0 + 100 * cs + 60, 18, '164', K.measure));
S.push(text(150, 1590, 20, 'Construction 164 : 100', '#9AA3B5'));
const ls = 640 / LK.width;
const ly = (top) => top + 135 - (LK.top + (-LK.top) / 2) * ls; // vertically centre the lockup in a 270px card
S.push(`<rect x="980" y="1060" width="820" height="270" rx="24" fill="${K.white}"/>`);
S.push(g(1070, ly(1060), ls, lockD, K.blue), g(1070, ly(1060), ls, wordD, K.ink));
S.push(`<rect x="980" y="1350" width="820" height="270" rx="24" fill="${K.ink}"/>`);
S.push(g(1070, ly(1350), ls, lockD, K.blue), g(1070, ly(1350), ls, wordD, K.white));
const sw = [['blue', K.blue], ['blue-deep', K.blueDeep], ['ink', K.ink], ['paper', K.paper], ['white', K.white], ['grey', K.grey]];
sw.forEach(([n, c], i) => {
  const x = 120 + i * 285;
  S.push(`<rect x="${x}" y="1680" width="255" height="255" rx="20" fill="${c}" stroke="#D5DAE4"/>`);
  S.push(text(x, 1975, 22, n, K.ink, 700), text(x, 2005, 18, c.toUpperCase()));
});
S.push(text(120, 2110, 26, 'Rules', K.ink, 700));
['One diamond becomes one V; the V doubles into the W. Never show two diamonds or two crowns.',
  'No rainbow gradients, sparkles or neon glow. Blue, ink, paper, white only.',
  'Clear space: half the mark height on every side. Do not rotate, outline or stretch the mark.']
  .forEach((t, i) => S.push(text(120, 2160 + i * 40, 22, '- ' + t, K.ink)));
fs.writeFileSync(path.join(OUT, 'wonmor_brand_sheet.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="2400" viewBox="0 0 ${W} 2400">${S.join('')}</svg>`);

const kf = path.join(ROOT, 'out', 'film', 'keyframes');
if (fs.existsSync(kf)) fs.cpSync(kf, path.join(OUT, 'film_keyframes'), { recursive: true });
console.log('figma kit:', OUT);
