// wonmor mark, variant B (chosen 2026-11-13): Vetric's own 32-grid geometry, the V duplicated and
// shifted by 9.4 so the union reads as one crown over a W. Source: film/brand/make_wonmor.py -> wonmor_b.json.
// Film units: 1 Vetric unit = 100/22.5, origin at the crown/V left edge (x 4.75) and the crown top (y 3), y down.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const BRAND = JSON.parse(fs.readFileSync(path.resolve(here, '../brand/wonmor_b.json'), 'utf8'));
const B = BRAND.variants.b;

export const K = 100 / 22.5;
const P = (x, y) => [(x - 4.75) * K, (y - 3) * K];
const isect = (p1, p2, p3, p4) => {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  const t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d;
  return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
};

const O = B.o;                       // 9.4
const TOP = 12.3411, TIP = 29.0206, CB = 9.22751;
const CT = 7.2764;                   // crown top corner (sides extended to y = 3)
const SH = 12.2611;                  // notch shoulder on the V top line
const NB = [16, 17.8836];            // notch bottom
const q = isect(NB, [32 - SH, TOP], [4.75 + O, TOP], [16 + O, TIP]);
const qm = [32 + O - q[0], q[1]];
const c = isect([27.25, TOP], [16, TIP], [4.75 + O, TOP], [16 + O, TIP]);

export const OFFSET = O * K;
export const MARK_W = (27.25 + O - 4.75) * K;
export const MARK_H = (TIP - 3) * K;
export const CAP_BOTTOM = (CB - 3) * K;
export const V_TOP = (TOP - 3) * K;

export const DIAMOND = [P(CT, 3), P(32 - CT, 3), P(27.25, CB), P(27.25, TOP), P(16, TIP), P(4.75, TOP), P(4.75, CB)];
export const CAP = [P(CT, 3), P(32 - CT, 3), P(27.25, CB), P(4.75, CB)];
export const V_OUTER = [P(4.75, TOP), P(27.25, TOP), P(16, TIP)];
export const V_NOTCH = [P(SH, TOP), P(...NB), P(32 - SH, TOP)];
export const V = [P(4.75, TOP), P(SH, TOP), P(...NB), P(32 - SH, TOP), P(27.25, TOP), P(16, TIP)];
export const CAP_UNION = [P(CT, 3), P(32 - CT + O, 3), P(27.25 + O, CB), P(4.75, CB)];
export const W = [
  P(4.75, TOP), P(SH, TOP), P(...NB), P(...q), P(4.75 + O, TOP), P(27.25, TOP), P(...qm),
  P(16 + O, NB[1]), P(32 - SH + O, TOP), P(27.25 + O, TOP), P(16 + O, TIP), P(...c), P(16, TIP),
];

const RC = 2.1 * K, RS = 1.6555 * K;
export const CAP_R = [RC, RC, 0, 0];
export const V_R = [0, RS, 0, RS, 0, 0];
export const W_R = [0, RS, 0, 0, 0, 0, 0, 0, RS, 0, 0, 0, 0];

// Facets used by the paper shot: outer arm of the left V, outer arm of the right V.
export const FACET_L = [P(4.75, TOP), P(SH, TOP), P(...NB), P(16, TIP)];
export const FACET_R = [P(16 + O, NB[1]), P(32 - SH + O, TOP), P(27.25 + O, TOP), P(16 + O, TIP)];
