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
  [0, 30], [18, 30], [50, 62], [71.5, 40.5], [64, 30], [100, 30], [92.5, 40.5],
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
export const W_R = [2.5, 0, 1.5, 0, 0, 0, 0, 1.5, 0, 2.5, 0, 0.8, 0];

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
