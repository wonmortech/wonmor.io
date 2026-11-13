import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { DIAMOND, CAP, V, CAP_UNION, W, CAP_R, V_R, W_R, MARK_W, MARK_H, OFFSET, BRAND, K as MK } from './markB.mjs';

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

// SVG path (M H V L C A Z, absolute) -> contours of cubic segments.
export function parsePath(d) {
  const tok = d.match(/[MHVLCAZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  const out = [];
  let i = 0, cmd = null, pen = [0, 0], start = [0, 0], cur = null;
  const num = () => parseFloat(tok[i++]);
  const close = () => { if (cur) { if (dist(pen, start) > 1e-6) cur.push(line(pen, start)); if (cur.length) out.push(cur); } cur = null; pen = start; };
  while (i < tok.length) {
    if (/[A-Z]/i.test(tok[i])) cmd = tok[i++];
    if (cmd === 'M') { if (cur) close(); start = pen = [num(), num()]; cur = []; cmd = 'L'; }
    else if (cmd === 'L') { const p = [num(), num()]; cur.push(line(pen, p)); pen = p; }
    else if (cmd === 'H') { const p = [num(), pen[1]]; cur.push(line(pen, p)); pen = p; }
    else if (cmd === 'V') { const p = [pen[0], num()]; cur.push(line(pen, p)); pen = p; }
    else if (cmd === 'C') { const a = [num(), num()], b = [num(), num()], p = [num(), num()]; cur.push([pen, a, b, p]); pen = p; }
    else if (cmd === 'A') { const rx = num(), ry = num(); num(); const large = num(), sweep = num(); const p = [num(), num()]; cur.push(...arcToCubics(pen, rx, ry, large, sweep, p)); pen = p; }
    else if (cmd === 'Z') { close(); }
  }
  if (cur) close();
  return out;
}

// Axis-aligned elliptical arc (no rotation) -> cubic segments of at most 90 degrees.
function arcToCubics(p0, rx, ry, large, sweep, p1) {
  const x1p = (p0[0] - p1[0]) / 2, y1p = (p0[1] - p1[1]) / 2;
  let lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  let co = Math.sqrt(Math.max(0, num / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)));
  if (large === sweep) co = -co;
  const cxp = co * (rx * y1p) / ry, cyp = co * -(ry * x1p) / rx;
  const cx = cxp + (p0[0] + p1[0]) / 2, cy = cyp + (p0[1] + p1[1]) / 2;
  const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI; else if (sweep && dt < 0) dt += 2 * Math.PI;
  const n = Math.ceil(Math.abs(dt) / (Math.PI / 2) - 1e-9);
  const segs = [];
  const step = dt / n, kk = (4 / 3) * Math.tan(step / 4);
  let a = t1, prev = p0;
  for (let j = 0; j < n; j++) {
    const b = a + step;
    const e = j === n - 1 ? p1 : [cx + rx * Math.cos(b), cy + ry * Math.sin(b)];
    segs.push([prev, [prev[0] - kk * rx * Math.sin(a), prev[1] + kk * ry * Math.cos(a)], [e[0] + kk * rx * Math.sin(b), e[1] - kk * ry * Math.cos(b)], e]);
    prev = e; a = b;
  }
  return segs;
}

// The wordmark "wonmor" (variant B, Vetric letter metrics). Units: x-height = 100, baseline y = 0, y down.
const WB = BRAND.variants.b;
const XH_TOP = 6.6303, XH_BASE = 23.0068;
const WS = 100 / (XH_BASE - XH_TOP);
export function wordB() {
  const x0 = WB.letters[0].x0;
  const letters = WB.letters.map((l) => ({ ch: l.ch, contours: transform(parsePath(l.d), WS, -x0 * WS, -XH_BASE * WS), x0: (l.x0 - x0) * WS, x1: (l.x1 - x0) * WS }));
  return { letters, width: letters[letters.length - 1].x1, xHeight: 100 };
}

// Horizontal lockup exactly as the brand file: mark + "wonmor", x-height = 100, baseline y = 0.
export function lockup() {
  const ms = (BRAND.K * WS) / MK;
  const dy = (BRAND.TY + 3 * BRAND.K - XH_BASE) * WS;
  const mark = transform(markFinal(), ms, 0, dy);
  const letters = WB.letters.map((l) => ({ ch: l.ch, contours: transform(parsePath(l.d), WS, 0, -XH_BASE * WS), x0: l.x0 * WS, x1: l.x1 * WS }));
  const mh = MARK_H * ms;
  return { mark, letters, markW: MARK_W * ms, markH: mh, width: letters[letters.length - 1].x1, top: dy, bottom: dy + mh };
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
