// wonmor mark geometry. Unit grid: one diamond is 100 wide, 100 tall.
// Diamond = cap (trapezoid) + girdle band + V. Two copies of the V offset by 64
// make the inner V arms coincide, so the union reads as one crown over a W.

export const OFFSET = 64;
export const MARK_W = 100 + OFFSET;
export const MARK_H = 100;

export const DIAMOND = [[18, 0], [82, 0], [100, 22], [100, 30], [50, 100], [0, 30], [0, 22]];
export const CAP = [[18, 0], [82, 0], [100, 22], [0, 22]];
export const BAND = [[0, 22], [100, 22], [100, 30], [0, 30]];
export const V_OUTER = [[0, 30], [100, 30], [50, 100]];
export const V_NOTCH = [[18, 30], [50, 62], [82, 30]];
export const V = [[0, 30], [18, 30], [50, 62], [82, 30], [100, 30], [50, 100]];

export const CAP_UNION = [[18, 0], [146, 0], [164, 22], [0, 22]];
export const W = [
  [0, 30], [18, 30], [50, 62], [71.5, 40.5], [82, 30], [92.5, 40.5],
  [114, 62], [146, 30], [164, 30], [114, 100], [82, 55.2], [50, 100],
];

const pt = (p) => `${+p[0].toFixed(2)} ${+p[1].toFixed(2)}`;

export function poly(points) {
  return 'M' + points.map(pt).join('L') + 'Z';
}

// Polygon path with rounded corners. radii[i] is the radius at vertex i.
export function rounded(points, radii) {
  const n = points.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const r = radii[i] || 0;
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    if (!r) {
      d += (i ? 'L' : 'M') + pt(p);
      continue;
    }
    const a = toward(p, prev, r);
    const b = toward(p, next, r);
    d += (i ? 'L' : 'M') + pt(a) + 'Q' + pt(p) + ' ' + pt(b);
  }
  return d + 'Z';
}

function toward(from, to, dist) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const k = Math.min(dist, len / 2) / len;
  return [from[0] + dx * k, from[1] + dy * k];
}

export const CAP_R = [6, 6, 2.5, 2.5];
export const V_R = [2.5, 0, 1.5, 0, 2.5, 0];
export const W_R = [2.5, 0, 1.5, 0, 1.2, 0, 1.5, 0, 2.5, 0, 0.8, 0];

export const PATHS = {
  diamond: poly(DIAMOND),
  cap: rounded(CAP, CAP_R),
  band: poly(BAND),
  vOuter: poly(V_OUTER),
  notch: poly(V_NOTCH),
  v: rounded(V, V_R),
  capUnion: rounded(CAP_UNION, CAP_R),
  w: rounded(W, W_R),
};

// Shapes for three.js extrusion (y flipped, centred on the mark, unit = 1/100).
export function markShapes(THREE) {
  const toShape = (points) => {
    const s = new THREE.Shape();
    points.forEach(([x, y], i) => {
      const X = (x - MARK_W / 2) / 100;
      const Y = (MARK_H / 2 - y) / 100;
      if (i) s.lineTo(X, Y); else s.moveTo(X, Y);
    });
    s.closePath();
    return s;
  };
  return [toShape(CAP_UNION), toShape(W)];
}

// ---------- wordmark ----------
// Rules taken from the reference construction:
//  1. one stroke weight T for every letter, matched to the arm of the mark;
//  2. letter spacing S = T / 2, the same 10 : 5 ratio as crown gap to arm;
//  3. the crown top sits on the x-height, the W tip drops below the baseline;
//  4. the mark itself is the w: the lockup reads mark + "onmor", never a second w.
// Units are mark units; baseline at y = 0, x-height at y = -X.
export const WM = { X: 80.6, T: 16.5, S: 8.25, GAP: 5.8 };
const f = (n) => +n.toFixed(2);

function letterO(x0) {
  const ro = (WM.X / 2) * 1.04;
  const ri = ro - WM.T * 1.04;
  const cx = x0 + ro;
  const cy = -WM.X / 2;
  const ring = (r, s) => `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 ${s} ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 ${s} ${f(cx - r)} ${f(cy)}Z`;
  return { d: ring(ro, 1) + ring(ri, 0), w: ro * 2, round: true };
}
function letterN(x0, a = WM.X * 0.86) {
  const { X, T } = WM;
  const r = a / 2, ri = r - T, cy = -X + r;
  return {
    d: `M${f(x0)} 0V${f(-X)}H${f(x0 + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x0 + a)} ${f(cy)}V0H${f(x0 + a - T)}V${f(cy)}A${f(ri)} ${f(ri)} 0 0 0 ${f(x0 + r)} ${f(-X + T)}H${f(x0 + T)}V0Z`,
    w: a,
  };
}
function letterM(x0, a = WM.X * 0.78) {
  const { X, T } = WM;
  const r = a / 2, ri = r - T, cy = -X + r;
  const y1 = cy - Math.sqrt(r * r - (r - T) * (r - T));
  const b = x0 + a - T;
  return {
    d: `M${f(x0)} 0V${f(-X)}H${f(x0 + r)}A${f(r)} ${f(r)} 0 0 1 ${f(b)} ${f(y1)}V${f(-X)}H${f(b + r)}A${f(r)} ${f(r)} 0 0 1 ${f(b + a)} ${f(cy)}V0H${f(b + a - T)}V${f(cy)}A${f(ri)} ${f(ri)} 0 0 0 ${f(b + r)} ${f(-X + T)}H${f(x0 + a)}V0H${f(b)}V${f(cy)}A${f(ri)} ${f(ri)} 0 0 0 ${f(x0 + r)} ${f(-X + T)}H${f(x0 + T)}V0Z`,
    w: 2 * a - T,
  };
}
function letterR(x0) {
  const { X, T } = WM;
  const ro = X * 0.4, ri = ro - T, cy = -X + ro;
  const c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
  const cx = x0 + ro;
  return {
    d: `M${f(x0)} 0V${f(-X)}H${f(cx)}A${f(ro)} ${f(ro)} 0 0 1 ${f(cx + ro * c)} ${f(cy - ro * s)}L${f(cx + ri * c)} ${f(cy - ri * s)}A${f(ri)} ${f(ri)} 0 0 0 ${f(cx)} ${f(-X + T)}H${f(x0 + T)}V0Z`,
    w: ro * (1 + c),
  };
}

// Optical spacing: straight sides get the full S, round or diagonal neighbours less.
const BUILD = [['o', letterO, 0.6], ['n', letterN, 0.8], ['m', letterM, 0.6], ['o', letterO, 0.6], ['r', letterR, 0]];
export const WORD = (() => {
  let x = 0;
  const letters = BUILD.map(([ch, fn, after]) => {
    const g = fn(x);
    const out = { ch, d: g.d, x0: x, x1: x + g.w };
    x += g.w + WM.S * (after * 2);
    return out;
  });
  return { letters, width: letters[letters.length - 1].x1, X: WM.X };
})();
export const WORD_PATH = WORD.letters.map((l) => l.d).join('');
