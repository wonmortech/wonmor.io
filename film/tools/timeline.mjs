// The wonmor brand film as data. One source of truth for the browser renderer (MP4) and the After Effects script.
// Usage: node film/tools/timeline.mjs  -> out/data/timeline_9x16.json, timeline_16x9.json
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, COLORS as K, MARK, polyContour, transform, wordmark, wordB, lockup, bbox } from '../lib/geo.mjs';
import { DIAMOND, CAP, V_OUTER, V, V_NOTCH, CAP_UNION, W, CAP_R, V_R, W_R, MARK_W, MARK_H, OFFSET, CAP_BOTTOM, V_TOP, FACET_L, FACET_R } from '../lib/markB.mjs';

const MW0 = MARK_W, MC = [MARK_W / 2, MARK_H / 2], HO = OFFSET / 2;
const CB = CAP_BOTTOM, VT = V_TOP, MH = MARK_H;
const [N1, N2, N3] = V_NOTCH;

const FPS = 30;
const DUR = 19.4;
const E = { out: [0.16, 1, 0.3, 1], inout: [0.65, 0, 0.35, 1], in: [0.7, 0, 0.84, 0], soft: [0.4, 0, 0.2, 1], lin: 'linear', hold: 'hold' };
const kf = (...keys) => ({ k: keys });

const CURSOR = [polyContour([[0, 0], [0, 17.5], [4.2, 13.6], [7.1, 20.4], [9.8, 19.3], [7, 12.6], [12.6, 12.6]])];
const square = (s) => [polyContour([[-s, -s], [s, -s], [s, s], [-s, s]])];
const circle = (r) => {
  const c = 0.5523 * r;
  return [[
    [[r, 0], [r, c], [c, r], [0, r]], [[0, r], [-c, r], [-r, c], [-r, 0]],
    [[-r, 0], [-r, -c], [-c, -r], [0, -r]], [[0, -r], [c, -r], [r, -c], [r, 0]],
  ]];
};
const lineC = (pts) => [pts.slice(1).map((p, i) => { const a = pts[i]; return [a, [a[0] + (p[0] - a[0]) / 3, a[1] + (p[1] - a[1]) / 3], [a[0] + 2 * (p[0] - a[0]) / 3, a[1] + 2 * (p[1] - a[1]) / 3], p]; })];
const rect = (x0, y0, x1, y1) => [polyContour([[x0, y0], [x1, y0], [x1, y1], [x0, y1]])];
const shift = (c, dx, dy = 0) => transform(c, 1, dx, dy);
const DIGITS = (s) => wordmark(s, 0).letters.flatMap((l) => l.contours);

export function build(fmt) {
  const portrait = fmt === '9x16';
  const Wd = portrait ? 1080 : 1920;
  const Hd = portrait ? 1920 : 1080;
  const cx = Wd / 2;
  const cy = portrait ? Hd * 0.48 : Hd * 0.5;
  const layers = [];
  let n = 0;
  const L = (o) => { const l = { id: 'L' + (++n), parent: null, in: 0, out: DUR, unit: 1, anchor: [0, 0], x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, ...o }; layers.push(l); return l.id; };
  const group = (o) => L({ type: 'group', ...o });
  const shape = (o) => L({ type: 'shape', fill: null, stroke: null, strokeWidth: 1.5, ...o });
  const img = (o) => L({ type: 'image', ...o });
  const seq = (o) => L({ type: 'seq', ...o });

  // ---------- background (one layer, colour cut per shot)
  const BG = [
    [0, K.ink], [4.60, K.ink], [5.57, K.paper], [6.57, K.ink], [11.07, K.paper], [12.07, K.ink],
    [15.57, K.blue], [16.07, K.ink], [16.57, K.paper], [18.13, K.blue], [18.93, K.ink],
  ];
  L({ type: 'solid', name: 'BG', w: Wd, h: Hd, color: kf(...BG.map(([t, c]) => [t, c, E.hold])) });

  // ---------- S01 + S28: small blue glass diamond (31-frame seamless spin)
  const GEM_W = 380;
  for (const [a, b, f0] of [[0, 0.57, 0], [18.93, DUR, 17]]) {
    seq({ name: 'Gem spin', in: a, out: b, dir: 'render/gem', count: 31, iw: 512, ih: 512, anchor: [256, 256], x: cx, y: cy, unit: GEM_W / 512,
      frame: kf([a, f0, E.lin], [b, f0 + Math.round((b - a) * FPS), E.lin]) });
  }
  // selection box + handles + cursor around the gem
  const selG = group({ name: 'Gem selection', in: 0.1, out: 0.9, x: cx, y: cy });
  shape({ name: 'Sel box', parent: selG, contours: rect(-132, -118, 132, 118), stroke: '#9AA7C7', strokeWidth: 1.2, opacity: 0.85 });
  [[-132, -118], [0, -118], [132, -118], [132, 0], [132, 118], [0, 118], [-132, 118], [-132, 0]].forEach(([x, y], i) =>
    shape({ name: 'Handle ' + (i + 1), parent: selG, contours: square(4.5), fill: K.white, stroke: K.blue, strokeWidth: 1.2, x, y }));

  // ---------- S02-S08: construction in diamond units (diamond 0..100 wide), anchor = centre of the diamond
  const U = 2.55 * 100 / MH;
  const con = group({ name: 'Construction', in: 0.57, out: 4.60, x: cx, y: cy, unit: U, anchor: [50, MH / 2],
    scale: kf([0.57, 1, E.hold], [0.95, 1, E.out], [1.45, 1.62, E.hold]) });
  const NAVY = { fill: K.navy, fillOpacity: 0.62, stroke: K.blue, strokeWidth: 2 };
  shape({ name: 'Diamond outline', parent: con, in: 0.57, out: 1.60, contours: [polyContour(DIAMOND)], ...NAVY });
  DIAMOND.forEach(([x, y], i) => shape({ name: 'Anchor ' + (i + 1), parent: con, in: 0.6 + i * 0.02, out: 1.60, contours: square(1.9), fill: K.white, stroke: K.blue, strokeWidth: 1, x, y }));
  shape({ name: 'Top edge highlight', parent: con, in: 0.95, out: 1.60, contours: lineC([DIAMOND[0], DIAMOND[1]]), stroke: K.white, strokeWidth: 3, trimEnd: kf([0.95, 0, E.inout], [1.35, 1, E.hold]) });
  shape({ name: 'Cut line', parent: con, in: 1.36, out: 2.33, contours: lineC([[-6, CB], [106, CB]]), stroke: K.white, strokeWidth: 1.6, trimEnd: kf([1.36, 0, E.out], [1.58, 1, E.hold]) });

  // crown + lower piece separate (S04)
  const crownSharp = shape({ name: 'Crown (sharp)', parent: con, in: 1.60, out: 3.25, contours: [polyContour(CAP)], ...NAVY });
  const lower = shape({ name: 'Lower piece', parent: con, in: 1.60, out: 3.0, contours: [polyContour(V_OUTER)], ...NAVY,
    y: kf([1.60, CB - VT, E.hold], [1.70, CB - VT, E.out], [2.10, 0, E.hold]) });
  shape({ name: 'Dim line', parent: con, in: 1.62, out: 2.40, contours: lineC([[-10, 0], [-10, CB]]), stroke: K.blue, strokeWidth: 1.4, trimEnd: kf([1.62, 0, E.out], [1.85, 1, E.hold]) });
  shape({ name: 'Dim tick top', parent: con, in: 1.62, out: 2.40, contours: lineC([[-13, 0], [-7, 0]]), stroke: K.blue, strokeWidth: 1.4 });
  shape({ name: 'Dim tick bottom', parent: con, in: 1.62, out: 2.40, contours: lineC([[-13, CB], [-7, CB]]), stroke: K.blue, strokeWidth: 1.4 });
  shape({ name: 'Label 10', parent: con, in: 1.66, out: 2.40, contours: DIGITS('10'), fill: K.blue, unit: 0.045, x: 45, y: -4 });
  shape({ name: 'Gap bracket', parent: con, in: 1.80, out: 2.45, contours: lineC([[106, CB], [106, VT]]), stroke: K.measure, strokeWidth: 1.4 });
  shape({ name: 'Label 4.4', parent: con, in: 1.80, out: 2.05, contours: DIGITS('4.4'), fill: K.measure, unit: 0.04, x: 109, y: (CB + VT) / 2 + 6.5 });
  shape({ name: 'Label 5', parent: con, in: 2.05, out: 2.45, contours: DIGITS('5'), fill: K.measure, unit: 0.04, x: 109, y: (CB + VT) / 2 + 6.5 });

  // V notch (S05)
  [[...N1, 2.36], [...N3, 2.44], [...N2, 2.54]].forEach(([x, y, t], i) =>
    shape({ name: 'Notch anchor ' + (i + 1), parent: con, in: t, out: 3.12, contours: square(1.9), fill: K.white, stroke: K.blue, strokeWidth: 1, x, y }));
  shape({ name: 'Notch path', parent: con, in: 2.58, out: 3.02, contours: lineC([N1, N2, N3]), stroke: K.white, strokeWidth: 2.2, trimEnd: kf([2.58, 0, E.inout], [2.95, 1, E.hold]) });
  shape({ name: 'Helper L', parent: con, in: 2.62, out: 3.10, contours: lineC([[N1[0] - 12 * (N2[0] - N1[0]) / (N2[1] - N1[1]), N1[1] - 12], [N2[0] + 12 * (N2[0] - N1[0]) / (N2[1] - N1[1]), N2[1] + 12]]), stroke: K.blue, strokeWidth: 1, opacity: 0.55 });
  shape({ name: 'Helper R', parent: con, in: 2.66, out: 3.10, contours: lineC([[N3[0] + 12 * (N2[0] - N1[0]) / (N2[1] - N1[1]), N3[1] - 12], [N2[0] - 12 * (N2[0] - N1[0]) / (N2[1] - N1[1]), N2[1] + 12]]), stroke: K.blue, strokeWidth: 1, opacity: 0.55 });
  const vSharp = shape({ name: 'V (sharp)', parent: con, in: 3.0, out: 3.25, contours: [polyContour(V)], ...NAVY });

  // corner rounding (S06)
  shape({ name: 'Radius handle', parent: con, in: 3.10, out: 3.45, contours: circle(2.6), stroke: K.white, strokeWidth: 1.4, x: kf([3.1, CAP[0][0], E.out], [3.3, CAP[0][0] + 4, E.hold]), y: kf([3.1, 0, E.out], [3.3, 4, E.hold]) });
  shape({ name: 'Crown', parent: con, in: 3.25, out: 4.60, ...NAVY,
    contours: kf([3.25, [polyContour(CAP, CAP_R)], E.hold], [3.55, [polyContour(CAP, CAP_R)], E.out], [4.15, shift([polyContour(CAP_UNION, CAP_R)], -HO), E.hold]) });

  // V doubles into W (S07)
  const vR = [polyContour(V, V_R)];
  shape({ name: 'V left', parent: con, in: 3.25, out: 4.18, contours: vR, ...NAVY, x: kf([3.25, 0, E.hold], [3.55, 0, E.out], [4.15, -HO, E.hold]) });
  shape({ name: 'V right (copy)', parent: con, in: 3.50, out: 4.18, contours: vR, ...NAVY, x: kf([3.50, 0, E.hold], [3.55, 0, E.out], [4.15, HO, E.hold]) });
  shape({ name: 'W', parent: con, in: 4.15, out: 4.60, contours: shift([polyContour(W, W_R)], -HO), ...NAVY });
  shape({ name: 'W selection', parent: con, in: 3.42, out: 4.40, contours: kf([3.42, rect(-3, VT - 3, 103, MH + 3), E.hold], [3.55, rect(-3, VT - 3, 103, MH + 3), E.out], [4.15, rect(-HO - 3, -3, 100 + HO + 3, MH + 3), E.hold]), stroke: '#9AA7C7', strokeWidth: 1.2, opacity: 0.85 });

  // cursor through the construction
  shape({ name: 'Cursor', in: 0.0, out: 4.45, contours: CURSOR, fill: K.white, stroke: '#111', strokeWidth: 1, unit: 1.45,
    x: kf([0, cx + 150, E.soft], [0.55, cx + 170, E.soft], [0.95, cx - 120, E.inout], [1.35, cx + 115, E.soft], [1.65, cx + 20, E.soft], [2.10, cx + 30, E.soft], [2.36, cx - 120, E.inout], [2.6, cx - 120, E.inout], [2.95, cx + 120, E.soft], [3.15, cx - 175, E.soft], [3.5, cx + 40, E.inout], [4.15, cx + 210, E.soft]),
    y: kf([0, cy - 150, E.soft], [0.55, cy - 165, E.soft], [0.95, cy - 205, E.inout], [1.35, cy - 205, E.soft], [1.65, cy + 40, E.soft], [2.10, cy + 60, E.soft], [2.36, cy - 40, E.inout], [2.6, cy - 40, E.inout], [2.95, cy - 40, E.soft], [3.15, cy - 200, E.soft], [3.5, cy + 60, E.inout], [4.15, cy + 70, E.soft]) });

  // ---------- S08/S09: blue metal fill, sweep, scale-down (Blender seq, transparent)
  const MW = MW0 * U * 1.62; // W width on screen at the end of construction
  const metalUnit = MW / (1100 * 0.8 * ((MW0 / 100) / 1.95));
  seq({ name: 'Metal mark', in: 4.43, out: 5.57, dir: 'render/metal', count: 34, iw: 880, ih: 608, anchor: [440, 304], x: cx, y: cy,
    opacity: kf([4.43, 0, E.lin], [4.60, 1, E.hold]), unit: metalUnit,
    scale: kf([4.60, 1, E.out], [5.0, 0.43, E.soft], [5.57, 0.41, E.hold]), frame: kf([4.43, 0, E.lin], [5.57, 33, E.hold]) });

  // ---------- S10: paper, faceted blue/dark mark, crown darkens
  const MU = 300 / MW0; // small mark: 300 px wide
  const pm = group({ name: 'Paper mark', in: 5.57, out: 6.57, x: cx, y: cy, unit: MU, anchor: MC, scale: kf([5.57, 1, E.lin], [6.57, 1.04, E.hold]) });
  shape({ name: 'Crown', parent: pm, contours: [polyContour(CAP_UNION, CAP_R)], fill: kf([5.57, K.blue, E.hold], [6.05, K.blue, E.inout], [6.45, K.ink, E.hold]) });
  shape({ name: 'W gradient', parent: pm, contours: [polyContour(W, W_R)], fill: K.blue, gradient: { x0: MC[0], y0: VT, x1: MC[0], y1: MH, c0: K.blue, c1: K.navy } });
  shape({ name: 'W facet L', parent: pm, contours: [polyContour(FACET_L)], fill: '#000000', fillOpacity: 0.22 });
  shape({ name: 'W facet R', parent: pm, contours: [polyContour(FACET_R)], fill: '#FFFFFF', fillOpacity: 0.10 });

  // ---------- S11-S13: giant lockup outline, letter by letter, then fill + scale-down
  const LK = lockup();
  const LU = 1.95;
  const LS = 440 / (LK.width * LU);
  const markC = LK.markW / 2;
  const lk = group({ name: 'Lockup build', in: 6.57, out: 11.07, unit: LU, anchor: [0, -50], y: cy,
    x: kf([6.57, cx - markC * LU, E.hold], [6.75, cx - markC * LU, E.out], [7.35, 60, E.lin], [10.03, -60, E.out], [10.50, cx - (LK.width / 2) * LU * LS, E.hold]),
    scale: kf([10.03, 1, E.out], [10.50, LS, E.hold]) });
  shape({ name: 'Mark outline', parent: lk, out: 10.03, contours: LK.mark, stroke: '#9AA3B5', strokeWidth: 1.5 });
  shape({ name: 'Mark fill', parent: lk, in: 10.03, contours: LK.mark, fill: kf([10.03, K.white, E.hold], [10.55, K.blue, E.hold]) });
  LK.letters.forEach((l, i) => {
    const t = 7.42 + i * 0.36;
    shape({ name: `Letter ${l.ch} outline`, parent: lk, in: t, out: 10.07, contours: l.contours, stroke: '#C9CED8', strokeWidth: 1.5, trimEnd: kf([t, 0, [0.3, 0, 0.2, 1]], [t + 0.42, 1, E.hold]) });
    shape({ name: `Letter ${l.ch} fill`, parent: lk, in: 10.03, contours: l.contours, fill: K.white });
    const pts = l.contours.flatMap((c) => c.filter((_, j) => j % 3 === 0).map((s) => s[0])).slice(0, 9);
    pts.forEach((p, j) => shape({ name: `Letter ${l.ch} anchor ${j + 1}`, parent: lk, in: t + 0.08 + j * 0.025, out: t + 0.95, contours: square(1.4 / LU * 3.2), fill: j % 4 === 3 ? K.measure : K.white, stroke: K.blue, strokeWidth: 1, x: p[0], y: p[1] }));
  });
  const letterX = (i) => (LK.letters[i].x0 + LK.letters[i].x1) / 2;
  const cursorPath = LK.letters.map((_, i) => [7.42 + i * 0.36, letterX(i), -95 + (i % 2) * 40]);
  shape({ name: 'Cursor A', parent: lk, in: 6.6, out: 10.03, contours: CURSOR, fill: K.white, stroke: '#111', strokeWidth: 1, unit: 1.45 / LU,
    x: kf([6.6, 60, E.soft], ...cursorPath.map(([t, x]) => [t + 0.2, x + 20, E.inout])), y: kf([6.6, -120, E.soft], ...cursorPath.map(([t, , y]) => [t + 0.2, y, E.inout])) });
  shape({ name: 'Cursor B', parent: lk, in: 7.8, out: 10.03, contours: CURSOR, fill: K.white, stroke: '#111', strokeWidth: 1, unit: 1.45 / LU,
    x: kf(...cursorPath.map(([t, x]) => [t + 0.55, x - 30, E.inout])), y: kf(...cursorPath.map(([t, , y]) => [t + 0.55, y + 90, E.inout])) });

  // ---------- S14: light lockup
  const L2U = 540 / LK.width;
  const lk2 = group({ name: 'Lockup light', in: 11.07, out: 12.07, unit: L2U, anchor: [LK.width / 2, -50], x: cx, y: cy, scale: kf([11.07, 1, E.lin], [12.07, 1.06, E.hold]) });
  shape({ name: 'Mark', parent: lk2, contours: LK.mark, fill: K.blue });
  shape({ name: 'Wordmark', parent: lk2, contours: LK.letters.flatMap((l) => l.contours), fill: K.ink });

  // ---------- S15: giant white type, mark over it, blue dot grows (match cut to avatar)
  const WM = wordB();
  const GU = (portrait ? 5.2 : 4.4);
  shape({ name: 'Giant wordmark', in: 12.07, out: 13.07, contours: WM.letters.flatMap((l) => l.contours), fill: K.white, unit: GU, anchor: [0, -50], y: cy,
    x: kf([12.07, cx - 0.30 * WM.width * GU, E.lin], [13.07, cx - 0.62 * WM.width * GU, E.hold]) });
  const gm = group({ name: 'Mark over type', in: 12.07, out: 13.07, unit: 300 / MW0, anchor: MC, x: cx, y: cy });
  shape({ name: 'Mark solid', parent: gm, out: 12.35, contours: [...MARK.crownW, ...MARK.w], fill: K.blue });
  shape({ name: 'Mark outline', parent: gm, in: 12.35, out: 12.95, contours: [...MARK.crownW, ...MARK.w], stroke: K.blue, strokeWidth: 2 });
  let av = portrait ? { x: 300, y: 560, r: 95, w: 1080, h: 1920 } : { x: 700, y: 420, r: 80, w: 1920, h: 1080 };
  const avFile = path.join(ROOT, 'out', 'render', portrait ? 'phone' : 'phone_16x9', 'avatar.json');
  if (fs.existsSync(avFile)) av = JSON.parse(fs.readFileSync(avFile, 'utf8'));
  const avs = Wd / av.w;
  shape({ name: 'Blue dot', in: 12.40, out: 13.07, contours: circle(1), fill: K.blue,
    x: kf([12.40, cx, E.hold], [12.90, cx, E.inout], [13.07, av.x * avs, E.hold]), y: kf([12.40, cy, E.hold], [12.90, cy, E.inout], [13.07, av.y * avs, E.hold]),
    scale: kf([12.40, 2, E.inout], [12.90, 230, E.inout], [13.07, av.r * avs * 0.87, E.hold]) });

  // ---------- S16/S17: phone + hoodie plates
  const plate = (name, dir, a, b, s0, s1, extra = {}) => img({ name, in: a, out: b, src: `render/${dir}${portrait ? '' : '_16x9'}/0000.png`, iw: Wd, ih: Hd, anchor: [Wd / 2, Hd / 2], x: Wd / 2, y: Hd / 2, scale: kf([a, s0, E.lin], [b, s1, E.hold]), ...extra });
  img({ name: 'Phone', in: 13.07, out: 14.07, src: `render/phone${portrait ? '' : '_16x9'}/0000.png`, iw: Wd, ih: Hd, anchor: [av.x * avs, av.y * avs], x: av.x * avs, y: av.y * avs,
    scale: kf([13.07, 1, E.soft], [14.07, 1.05, E.hold]) });
  plate('Hoodie', 'hoodie', 14.07, 15.07, 1.0, 1.05, { y: kf([14.07, Hd / 2, E.lin], [15.07, Hd / 2 - 25, E.hold]) });

  // ---------- S18: lone white mark, glow, 1-frame dip
  shape({ name: 'White mark glow', in: 15.07, out: 15.57, contours: [...MARK.crownW, ...MARK.w], fill: K.white, unit: 330 / MW0, anchor: MC, x: cx, y: cy,
    glow: { r: 34, color: K.white, alpha: 0.55 }, opacity: kf([15.07, 1, E.hold], [15.30, 0.12, E.hold], [15.334, 1, E.hold]), scale: kf([15.07, 1, E.lin], [15.57, 1.03, E.hold]) });

  // ---------- S19/S20: 3D renders
  seq({ name: '3D float (blue)', in: 15.57, out: 16.07, dir: 'render/float', count: 15, iw: 800, ih: 800, anchor: [400, 400], x: cx, y: cy + 20, unit: 520 / (800 * 0.44), frame: kf([15.57, 0, E.lin], [16.07, 14, E.hold]) });
  seq({ name: '3D dark', in: 16.07, out: 16.57, dir: 'render/dark3d', count: 15, iw: 960, ih: 960, anchor: [480, 480], x: cx, y: cy, unit: (portrait ? 860 : 900) / (960 * 0.57), frame: kf([16.07, 0, E.lin], [16.57, 14, E.hold]) });

  // ---------- S21: isometric outline (front + back + connectors)
  const IU = 380 / MW0;
  const iso = group({ name: 'Iso outline', in: 16.57, out: 17.07, unit: IU, anchor: MC, x: cx, y: cy, rotation: kf([16.57, -1.5, E.lin], [17.07, 1.5, E.hold]) });
  const dx = 9, dy = -8;
  const markRaw = [CAP_UNION, W];
  shape({ name: 'Back', parent: iso, contours: shift([polyContour(CAP_UNION, CAP_R), polyContour(W, W_R)], dx, dy), fill: K.paper, stroke: K.ink, strokeWidth: 1.6 });
  markRaw.forEach((poly, pi) => poly.forEach(([x, y], i) => shape({ name: `Edge ${pi}.${i}`, parent: iso, contours: lineC([[x, y], [x + dx, y + dy]]), stroke: K.ink, strokeWidth: 1.6 })));
  shape({ name: 'Front', parent: iso, contours: [polyContour(CAP_UNION, CAP_R), polyContour(W, W_R)], fill: K.paper, stroke: K.ink, strokeWidth: 1.8 });

  // ---------- S22-S25: embroidery, black solid, notebook, badge
  plate('Embroidery', 'embroidery', 17.07, 17.33, 1.0, 1.03);
  shape({ name: 'Black solid mark', in: 17.33, out: 17.57, contours: [...MARK.crownW, ...MARK.w], fill: K.ink, unit: 330 / MW0, anchor: MC, x: cx, y: cy });
  plate('Notebook', 'notebook', 17.57, 17.83, 1.0, 1.02, { rotation: kf([17.57, 0, E.lin], [17.83, -0.6, E.hold]) });
  shape({ name: 'Badge circle', in: 17.83, out: 18.13, contours: circle(1), x: cx, y: cy,
    fill: kf([17.83, K.ink, E.hold], [18.07, K.blue, E.hold]), scale: kf([17.83, 235, E.hold], [18.07, 235, E.in], [18.13, Math.hypot(Wd, Hd) * 0.62, E.hold]) });
  shape({ name: 'Badge mark', in: 17.83, out: 18.07, contours: [...MARK.crownW, ...MARK.w], fill: K.blue, unit: 270 / MW0, anchor: [MC[0], MC[1] - 4], x: cx, y: cy });

  // ---------- S27: clear glass diamond on blue
  seq({ name: 'Glass diamond (blue)', in: 18.13, out: 18.93, dir: 'render/glassblue', count: 24, iw: 800, ih: 800, anchor: [400, 400], x: cx, y: cy, unit: 700 / (800 * 0.55),
    scale: kf([18.13, 1.08, E.soft], [18.93, 0.96, E.hold]), frame: kf([18.13, 0, E.lin], [18.93, 23, E.hold]) });

  // ---------- film grain (adjustment)
  L({ type: 'grain', name: 'Grain', w: Wd, h: Hd, amount: 0.035, tiles: 6 });

  // Snap every cut and key to a frame start so motion-blur sub-samples never straddle a cut.
  const q = (t) => Math.round(t * FPS) / FPS;
  const snap = (v) => { if (v && typeof v === 'object' && Array.isArray(v.k)) v.k.forEach((k) => { k[0] = q(k[0]); }); };
  for (const l of layers) {
    l.in = q(l.in); l.out = q(l.out);
    for (const key of Object.keys(l)) snap(l[key]);
  }
  return { fps: FPS, duration: DUR, width: Wd, height: Hd, format: fmt, colors: K, layers };
}

for (const fmt of ['9x16', '16x9']) {
  const t = build(fmt);
  fs.writeFileSync(path.join(ROOT, 'out', 'data', `timeline_${fmt}.json`), JSON.stringify(t));
  console.log(fmt, t.layers.length, 'layers');
}
