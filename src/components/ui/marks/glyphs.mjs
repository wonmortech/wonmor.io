// Wonmor area marks: one glyph family, drawn as filled shapes on a 40 x 40 grid.
// Every mark loops through four frames: its hero form (the subject, resolved into flat diamond facets with a cut
// between them, like the brand mark) -> an ink drop -> the drop growing into cells -> a second view of the subject.
// All frames of one mark share the same path structure (same subpaths, same point count, cubic segments only),
// so CSS can interpolate the `d` property between them. tools/gen-marks.mjs turns this file into marks.css.

const r1 = (n) => { const v = Math.round(n * 10) / 10; return Object.is(v, -0) ? 0 : v; };
const TAU = Math.PI * 2;

/** Resample a closed polygon (clockwise on screen, starting at its first vertex) to n points. */
function resample(v, n) {
  if (n % v.length === 0) {
    const k = n / v.length, out = [];
    v.forEach((a, i) => { const b = v[(i + 1) % v.length]; for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]); });
    return out;
  }
  const seg = v.map((a, i) => { const b = v[(i + 1) % v.length]; return Math.hypot(b[0] - a[0], b[1] - a[1]); });
  const total = seg.reduce((s, x) => s + x, 0), out = [];
  for (let j = 0; j < n; j++) {
    let t = (total * j) / n, i = 0;
    while (t > seg[i] && i < seg.length - 1) { t -= seg[i]; i++; }
    const a = v[i], b = v[(i + 1) % v.length], f = seg[i] ? t / seg[i] : 0;
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  return out;
}

// Shapes. Each returns { p: points, s: smoothing } where s = 0 draws straight edges and s > 0 a Catmull-Rom curve.
const poly = (v, n = v.length) => ({ p: resample(v, n), s: 0 });
const quad = (x, y, w, h, n = 4) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], n);
const dia = (cx, cy, rx, ry = rx, n = 4) => poly([[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], n);
const bar = (x1, y1, x2, y2, w, n = 4) => {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = (-(y2 - y1) / L) * (w / 2), ny = ((x2 - x1) / L) * (w / 2);
  return poly([[x1 - nx, y1 - ny], [x2 - nx, y2 - ny], [x2 + nx, y2 + ny], [x1 + nx, y1 + ny]], n);
};
const circleS = (n) => { const t = TAU / n; return (4 * Math.tan(t / 4)) / Math.sin(t); };
const ell = (cx, cy, rx, ry, n = 8, rot = 0) => ({ p: Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + rot + (TAU * i) / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; }), s: circleS(n) });
const circ = (cx, cy, r, n = 8, rot = 0) => ell(cx, cy, r, r, n, rot);
/** radii: one per point (cycled), smooth outline: petals, cogs, blots */
const blob = (cx, cy, radii, n, rot = 0, s = 1) => ({ p: Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + rot + (TAU * i) / n, r = radii[i % radii.length]; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }), s });
/** the shared ink drop: a round body with its tip pulled up */
const drop = (n) => ({ p: Array.from({ length: n }, (_, i) => { const t = (TAU * i) / n; return [20 + 12.4 * Math.sin(t) * Math.sin(t / 2), 20 - 13.6 * Math.cos(t)]; }), s: 1 });
/** a part hidden inside the drop: all points on one spot, so it grows out of the ink */
const dot = (n, x = 20, y = 23.5) => ({ p: Array.from({ length: n }, () => [x, y]), s: 0 });
/** reverse the winding (keeping the start point) so the subpath cuts a hole under the nonzero fill rule */
const hole = (sp) => ({ p: [sp.p[0], ...sp.p.slice(1).reverse()], s: sp.s });
const polar = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

function subpath({ p, s }) {
  const n = p.length, at = (i) => p[(i + n) % n];
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = at(i), b = at(i + 1), pa = at(i - 1), nb = at(i + 2);
    const c1 = [a[0] + ((b[0] - pa[0]) * s) / 6, a[1] + ((b[1] - pa[1]) * s) / 6];
    const c2 = [b[0] - ((nb[0] - a[0]) * s) / 6, b[1] - ((nb[1] - a[1]) * s) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(b[0])} ${r1(b[1])}`;
  }
  return d + 'Z';
}
export const toPath = (frame) => frame.map(subpath).join('');

// ---------------------------------------------------------------- the marks
// Frame order in every entry: [hero, drop, grow, alt]. The hero is the still frame (reduced motion, no CSS `d`).
const node = (deg, r) => polar(20, 21, r, deg);
const AG = [-90, 30, 150];

const agents = [
  [dia(20, 21, 6.6, 6.6, 8), ...AG.map((a) => dia(...node(a, 13), 4.3, 4.3, 8)), ...AG.map((a) => bar(20, 21, ...node(a, 13), 2.3))],
  [drop(8), dot(8), dot(8), dot(8), dot(4), dot(4), dot(4)],
  [circ(20, 21, 7.2), ...AG.map((a) => circ(...node(a, 9.4), 4.2)), ...AG.map((a) => bar(20, 21, ...node(a, 9.4), 3.4))],
  [circ(20, 21, 4.4), ...AG.map((a) => circ(...node(a + 60, 14.6), 3.7)), ...AG.map((a) => bar(20, 21, ...node(a + 60, 14.6), 1.3))],
];

const language = [
  // a letter A from two strokes and a diamond facet, with the okina the Uzbek alphabet needs
  [bar(18.4, 7, 8.6, 33.5, 4.4), bar(21.6, 7, 31.4, 33.5, 4.4), dia(20, 24.2, 4.4), { p: drop(8).p.map(([x, y]) => [x * 0.3 + 26, y * 0.3 + 1.5]), s: 1 }],
  [dot(4), dot(4), dot(4), drop(8)],
  // three ink strokes landing
  [{ ...ell(10.5, 22, 3.4, 10.5, 4), s: 1.5 }, { ...ell(19.5, 17.5, 3.4, 10.5, 4), s: 1.5 }, { ...ell(28.5, 22, 3.4, 10.5, 4), s: 1.5 }, circ(30, 6.5, 2.4)],
  // lines of text and a cursor
  [bar(7, 12, 33, 12, 3.8), bar(7, 20, 29, 20, 3.8), bar(7, 28, 21, 28, 3.8), circ(27.5, 28, 2.4)],
];

const chev = (y) => [[6, y], [20, y + 5.6], [34, y], [34, y + 3.6], [20, y + 9.2], [6, y + 3.6]];
const infrastructure = [
  [poly([[6, 10.4], [20, 4.8], [34, 10.4], [20, 16]], 12), poly(chev(17.6), 12), poly(chev(25), 12)],
  [dot(12, 20, 12), drop(12), dot(12, 20, 30)],
  [circ(20, 10.5, 5.2, 12), circ(20, 20.5, 6.8, 12), circ(20, 30.5, 5.2, 12)],
  [quad(7, 6.5, 26, 7.4, 12), quad(7, 16.3, 26, 7.4, 12), quad(7, 26.1, 26, 7.4, 12)],
];

const supplyChain = [
  [dia(10, 30, 5.6, 5.6, 8), dia(20, 20, 7, 7, 8), dia(30, 10, 5.6, 5.6, 8), bar(10, 30, 20, 20, 2.2), bar(20, 20, 30, 10, 2.2)],
  [dot(8), drop(8), dot(8), dot(4), dot(4)],
  [circ(14.4, 25.6, 6.2), circ(20, 20, 6.8), circ(25.6, 14.4, 6.2), bar(14.4, 25.6, 20, 20, 3), bar(20, 20, 25.6, 14.4, 3)],
  [quad(4.5, 16, 8, 8, 8), quad(16, 16, 8, 8, 8), quad(27.5, 16, 8, 8, 8), bar(12, 20, 16.5, 20, 1.8), bar(23.5, 20, 28, 20, 1.8)],
];

const interfaces = [
  // a window: title bar, two panes and a pointer facet
  [quad(6, 6, 28, 4.6, 8), quad(6, 13, 12.4, 21, 8), quad(20.6, 13, 13.4, 8.6, 8), dia(27.3, 28.2, 5.8, 5.8, 8)],
  [dot(8, 20, 12), drop(8), dot(8, 24, 20), dot(8, 24, 26)],
  [quad(6, 6, 28, 3.2, 8), quad(6, 12, 8.4, 22, 8), quad(15.8, 12, 8.4, 16, 8), quad(25.6, 12, 8.4, 10, 8)],
  [quad(6, 6, 13, 13, 8), quad(21, 6, 13, 13, 8), quad(6, 21, 13, 13, 8), quad(21, 21, 13, 13, 8)],
];

// an eight-point star from two squares (girih); the concave corners sit at R * cos 45 / cos 22.5
const star = (R) => ({ p: Array.from({ length: 16 }, (_, i) => polar(20, 20, i % 2 ? R * 0.7654 : R, -90 + i * 22.5)), s: 0 });
const arch = [[20, 4.5], [23.9, 6.4], [27.4, 9.6], [30, 13.6], [31, 18.4], [31, 24], [31, 29.5], [31, 35], [20, 35], [9, 35], [9, 29.5], [9, 24], [9, 18.4], [10, 13.6], [12.6, 9.6], [16.1, 6.4]];
const niche = [[20, 11.2], [23.6, 14.2], [25.6, 19.4], [25.6, 31], [20, 31], [14.4, 31], [14.4, 19.4], [16.4, 14.2]];
const faithSociety = [
  [star(16), hole(dia(20, 20, 4.6, 4.6, 8))],
  [drop(16), dot(8)],
  [blob(20, 20, [13.4, 8.6], 16), hole(circ(20, 20, 3))],
  [poly(arch), hole(poly(niche))],
];

const oct = (cx, cy, R) => ({ p: Array.from({ length: 8 }, (_, i) => polar(cx, cy, R, -90 + 22.5 + i * 45)), s: 0 });
const digitalAssets = [
  // a faceted coin with a diamond cut, on the edge of the next coin
  [oct(20, 16.5, 12.6), hole(dia(20, 16.5, 4.8)), bar(9, 33, 31, 33, 3.4, 8)],
  [drop(8), dot(4), dot(8, 20, 30)],
  // a Silk Road coin: round, with a square hole
  [circ(20, 18.5, 12.6), hole(quad(17, 15.5, 6, 6)), dot(8, 20, 30)],
  // a stack seen from the side
  [ell(20, 11, 12, 4.6), hole(dia(20, 11, 3.4, 1.6)), poly([[8, 16.4], [20, 20.8], [32, 16.4], [32, 23], [32, 29.6], [20, 34], [8, 29.6], [8, 23]])],
];

const gear = () => ({ p: Array.from({ length: 6 }, (_, t) => { const a = -90 + t * 60; return [polar(20, 20, 11.2, a - 21), polar(20, 20, 15.6, a - 10), polar(20, 20, 15.6, a + 10), polar(20, 20, 11.2, a + 21)]; }).flat(), s: 0 });
const hexagon = poly([polar(20, 20, 14.6, -90), polar(20, 20, 14.6, -30), polar(20, 20, 14.6, 30), polar(20, 20, 14.6, 90), polar(20, 20, 14.6, 150), polar(20, 20, 14.6, 210)], 24);
// start the hexagon a little before the top so its points line up with the gear teeth
hexagon.p = [...hexagon.p.slice(-1), ...hexagon.p.slice(0, -1)];
const engineering = [
  [gear(), hole(dia(20, 20, 5.2, 5.2, 8))],
  [drop(24), dot(8)],
  [blob(20, 20, [10.6, 13.6, 13.6, 10.6], 24, -21 * Math.PI / 180), hole(circ(20, 20, 3.6))],
  [hexagon, hole(circ(20, 20, 5.6))],
];

const shrink = (v, f) => { const c = v.reduce((a, p) => [a[0] + p[0] / v.length, a[1] + p[1] / v.length], [0, 0]); return v.map(([x, y]) => [c[0] + (x - c[0]) * f, c[1] + (y - c[1]) * f]); };
const T = [20, 6], Rr = [32.1, 13], Cc = [20, 20], Ll = [7.9, 13], BR = [32.1, 27], B = [20, 34], BL = [7.9, 27];
const research = [
  // a cube from three diamond facets
  [poly(shrink([Ll, T, Rr, Cc], 0.88), 8), poly(shrink([Ll, Cc, B, BL], 0.88), 8), poly(shrink([Cc, Rr, BR, B], 0.88), 8)],
  [drop(8), dot(8), dot(8)],
  [circ(20, 13, 6.4), circ(13.4, 25.4, 6.4), circ(26.6, 25.4, 6.4)],
  [poly([[14, 10], [20, 4], [26, 10], [20, 16]], 8), poly([[5, 27], [11, 21], [17, 27], [11, 33]], 8), poly([[23, 27], [29, 21], [35, 27], [29, 33]], 8)],
];

const news = [
  [poly([[8, 5], [25, 5], [32, 12], [32, 35], [8, 35]], 10), hole(bar(12.5, 17.5, 27.5, 17.5, 2.6)), hole(bar(12.5, 24, 23.5, 24, 2.6))],
  [drop(10), dot(4), dot(4)],
  [circ(20, 20, 13.6, 10), hole(bar(13, 17.5, 27, 17.5, 2.6)), hole(bar(14, 23.5, 26, 23.5, 2.6))],
  [poly([[6, 7], [27, 7], [34, 7], [34, 33], [6, 33]], 10), hole(bar(10, 12.5, 30, 12.5, 2.6)), hole(quad(10, 17.5, 20, 11))],
];

const changelog = [
  [bar(4.5, 20, 35, 20, 2.4, 8), dia(8.6, 20, 3.6), dia(18.4, 20, 4.6), dia(29.4, 20, 6.4)],
  [drop(8), dot(4), dot(4), dot(4)],
  [quad(5, 30.5, 30, 3.6, 8), quad(6.5, 22.5, 7.4, 6.4), quad(16.3, 15.5, 7.4, 13.4), quad(26.1, 7.5, 7.4, 21.4)],
  [bar(11, 5, 11, 35, 2.4, 8), dia(11, 10, 4), dia(11, 20, 4), dia(11, 30, 4)],
];

export const GLYPHS = {
  agents, language, infrastructure, 'supply-chain': supplyChain, interfaces, 'faith-society': faithSociety,
  'digital-assets': digitalAssets, engineering, research, news, changelog,
};

/** Throws when a mark's frames do not share one structure (CSS could not interpolate them). */
export function validate() {
  for (const [name, frames] of Object.entries(GLYPHS)) {
    if (frames.length !== 4) throw new Error(`mark ${name}: expected 4 frames`);
    const shape = (f) => f.map((sp) => sp.p.length).join(',');
    frames.forEach((f, i) => { if (shape(f) !== shape(frames[0])) throw new Error(`mark ${name}: frame ${i} has [${shape(f)}], frame 0 has [${shape(frames[0])}]`); });
  }
}

// Keyframe stops: hero, drop, grow, alt, each held briefly, then back to the hero. 12 s per loop.
const STOPS = [[0, 9], [24, 31], [46, 54], [69, 77]];
export function css() {
  validate();
  let out = '/* Generated by tools/gen-marks.mjs from src/components/ui/marks/glyphs.mjs. Do not edit by hand. */\n@media (prefers-reduced-motion:no-preference){\n';
  for (const [name, frames] of Object.entries(GLYPHS)) {
    const ps = frames.map(toPath);
    const ks = STOPS.map(([a, b], i) => `${a}%,${b}%{d:path("${ps[i]}")}`).join('');
    out += `@keyframes mk-${name}{${ks}100%{d:path("${ps[0]}")}}\n.aicon--${name} .aicon__p{animation-name:mk-${name}}\n`;
  }
  return out + '}\n';
}
export const hero = (name) => toPath(GLYPHS[name][0]);
