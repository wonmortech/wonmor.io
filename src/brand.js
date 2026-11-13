// wonmor brand, variant B: Vetric's 32-grid diamond geometry, the V doubled at +9.4 into a W.
// Source of truth: film/brand/make_wonmor.py -> film/brand/wonmor_b.json (the same file the film uses).
import BRAND from '../film/brand/wonmor_b.json';

const B = BRAND.variants.b;
export const PATHS = {
  diamond: 'M7.2764 3H24.7236L27.25 9.2275V12.3411L16 29.0206L4.75 12.3411V9.2275Z',
  vCrown: BRAND.vCrown,
  vChev: BRAND.vChev,
  crown: B.crown,
  chev: B.chev,
  word: B.word,
};
const MX = 4.75, MY = 3, MW = B.mark_w - 9.5, MH = 26.0206;
const K = BRAND.K, TY = BRAND.TY;

export function markSVG({ fill = 'currentColor', cls = '' } = {}) {
  return `<svg class="${cls}" viewBox="${MX} ${MY} ${MW} ${MH}" aria-hidden="true"><path fill="${fill}" d="${PATHS.crown}"/><path fill="${fill}" d="${PATHS.chev}"/></svg>`;
}

export function lockupSVG({ mark = '#2969FF', text = 'currentColor', cls = '' } = {}) {
  const g = `translate(${(-4.75 * K).toFixed(4)} ${TY.toFixed(4)}) scale(${K.toFixed(5)})`;
  return `<svg class="${cls}" viewBox="0 0 ${B.lock_w.toFixed(3)} 24" role="img" aria-label="wonmor"><g transform="${g}" fill="${mark}"><path d="${PATHS.crown}"/><path d="${PATHS.chev}"/></g><path fill="${text}" d="${PATHS.word}"/></svg>`;
}

// One diamond -> crown + V -> the V doubles -> one crown over a W.
// Step 3 animates in CSS (.wm-cmp-*): one V splits in two, the left one sinks into shadow.
export function stepSVG(n) {
  const p = (d) => `<path d="${d}"/>`;
  const two = p(PATHS.vCrown) + p(PATHS.vChev);
  const s = {
    1: p(PATHS.diamond),
    2: two,
    3: `<g class="wm-cmp-ghost" opacity=".5">${two}</g><g class="wm-cmp-front" transform="translate(${B.o} 0)">${two}</g>`,
    4: p(PATHS.crown) + p(PATHS.chev),
  }[n];
  const dx = n < 3 ? B.o / 2 : 0;
  return `<svg viewBox="3 2 37.4 28" aria-hidden="true"><g transform="translate(${dx} 0)">${s}</g></svg>`;
}
