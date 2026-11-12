import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { DIAMOND, CAP, V, CAP_UNION, W, CAP_R, V_R, W_R, MARK_W, MARK_H, OFFSET } from '../../src/geometry.js';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..');

export const COLORS = {
  blue: '#1F5BFF',
  blueDeep: '#0B2FD6',
  cyan: '#7FD6FF',
  ink: '#0A0B10',
  paper: '#EEF2F8',
  white: '#F7F9FC',
  navy: '#0E1A3D',
  grey: '#8A93A6',
  measure: '#F5C84B',
};

// A contour is a list of cubic segments [p0, c1, c2, p1]; consecutive segments share points.
const line = (a, b) => [a, lerp(a, b, 1 / 3), lerp(a, b, 2 / 3), b];
const quad = (a, q, b) => [a, lerp(a, q, 2 / 3), lerp(b, q, 2 / 3), b];
function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function toward(from, to, d) {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const k = Math.min(d, len / 2) / len;
  return [from[0] + dx * k, from[1] + dy * k];
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function polyContour(points, radii = []) {
  const n = points.length;
  const corners = points.map((p, i) => {
    const r = radii[i] || 0;
    if (!r) return { a: p, b: p, q: null };
    return { a: toward(p, points[(i - 1 + n) % n], r), b: toward(p, points[(i + 1) % n], r), q: p };
  });
  const segs = [];
  for (let i = 0; i < n; i++) {
    const c = corners[i];
    if (c.q) segs.push(quad(c.a, c.q, c.b));
    const nx = corners[(i + 1) % n];
    if (dist(c.b, nx.a) > 1e-6) segs.push(line(c.b, nx.a));
  }
  return segs;
}

export function transform(contours, s, dx, dy) {
  return contours.map((c) => c.map((seg) => seg.map(([x, y]) => [x * s + dx, y * s + dy])));
}

// Mark in mark units (x 0..MARK_W, y 0..MARK_H, y down).
export const MARK = {
  diamond: [polyContour(DIAMOND)],
  crown: [polyContour(CAP, CAP_R)],
  v: [polyContour(V, V_R)],
  crownW: [polyContour(CAP_UNION, CAP_R)],
  w: [polyContour(W, W_R)],
  W: MARK_W, H: MARK_H, OFFSET,
};
export const markFinal = () => [...MARK.crownW, ...MARK.w];

const FONT_FILE = path.resolve(ROOT, '../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff');
let font;
function getFont() {
  if (!font) {
    const buf = fs.readFileSync(FONT_FILE);
    font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  }
  return font;
}

function glyphContours(cmds) {
  const out = [];
  let cur = null, start = null, pen = null;
  for (const c of cmds) {
    if (c.type === 'M') { if (cur && cur.length) out.push(cur); cur = []; start = pen = [c.x, c.y]; }
    else if (c.type === 'L') { cur.push(line(pen, [c.x, c.y])); pen = [c.x, c.y]; }
    else if (c.type === 'Q') { cur.push(quad(pen, [c.x1, c.y1], [c.x, c.y])); pen = [c.x, c.y]; }
    else if (c.type === 'C') { cur.push([pen, [c.x1, c.y1], [c.x2, c.y2], [c.x, c.y]]); pen = [c.x, c.y]; }
    else if (c.type === 'Z') { if (dist(pen, start) > 1e-6) cur.push(line(pen, start)); if (cur.length) out.push(cur); cur = null; pen = start; }
  }
  if (cur && cur.length) out.push(cur);
  return out;
}

// Letters in units where x-height = 100, baseline y = 0, y down.
export function wordmark(text = 'onmor', tracking = -0.03) {
  const f = getFont();
  const size = 1000;
  const xh = f.tables.os2.sxHeight || 520;
  const s = 100 / (xh * size / f.unitsPerEm);
  const k = size / f.unitsPerEm;
  let x = 0;
  const letters = [];
  const glyphs = f.stringToGlyphs(text);
  glyphs.forEach((g, i) => {
    const p = g.getPath(x, 0, size);
    const contours = transform(glyphContours(p.commands), s, 0, 0);
    const bb = g.getBoundingBox();
    letters.push({ ch: text[i], contours, x0: (x + bb.x1 * k) * s, x1: (x + bb.x2 * k) * s });
    let adv = g.advanceWidth * k;
    if (i < glyphs.length - 1) adv += f.getKerningValue(g, glyphs[i + 1]) * k;
    x += adv + tracking * size;
  });
  const minX = letters[0].x0;
  letters.forEach((l) => { l.contours = transform(l.contours, 1, -minX, 0); l.x0 -= minX; l.x1 -= minX; });
  return { letters, width: letters[letters.length - 1].x1, xHeight: 100 };
}

// Horizontal lockup, x-height = 100. The mark IS the letter w: mark + "onmor".
// Crown top on the x-height, W tip below the baseline (mark height 1.24 x-height), gap = one letter space.
export function lockup() {
  const wm = wordmark();
  const mh = 124;
  const ms = mh / MARK_H;
  const mw = MARK_W * ms;
  const gap = 7.2;
  const top = -100;
  const mark = transform(markFinal(), ms, 0, top);
  const letters = wm.letters.map((l) => ({ ...l, contours: transform(l.contours, 1, mw + gap, 0), x0: l.x0 + mw + gap, x1: l.x1 + mw + gap }));
  return { mark, letters, markW: mw, markH: mh, width: mw + gap + wm.width, top, bottom: top + mh };
}

export function svgPath(contours, digits = 2) {
  const n = (v) => +v.toFixed(digits);
  return contours.map((c) => 'M' + n(c[0][0][0]) + ' ' + n(c[0][0][1]) + c.map((s) => `C${n(s[1][0])} ${n(s[1][1])} ${n(s[2][0])} ${n(s[2][1])} ${n(s[3][0])} ${n(s[3][1])}`).join('') + 'Z').join('');
}

export function bbox(contours) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  contours.forEach((c) => c.forEach((s) => s.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); })));
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

export function sample(contour, perSeg = 12) {
  const pts = [];
  contour.forEach(([p0, c1, c2, p1]) => {
    const straight = dist(lerp(p0, p1, 1 / 3), c1) < 1e-6 && dist(lerp(p0, p1, 2 / 3), c2) < 1e-6;
    const steps = straight ? 1 : perSeg;
    for (let i = 0; i < steps; i++) {
      const t = i / steps, u = 1 - t;
      pts.push([
        u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
        u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
      ]);
    }
  });
  return pts;
}
