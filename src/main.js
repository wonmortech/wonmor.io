import { gsap } from 'gsap';
import { PATHS, MARK_W, MARK_H } from './geometry.js';

const C = {
  ink: '#07080D', paper: '#EEF2F8', blue: '#1F5BFF', blueDeep: '#1238D6', cyan: '#6FD3FF',
  navy: '#15163F', white: '#F7F9FC', yellow: '#FFD23F', black: '#0B0B12',
};
const NS = 'http://www.w3.org/2000/svg';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const params = new URLSearchParams(location.search);
const SHOT = params.has('shot') ? parseFloat(params.get('shot')) : null;

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};

// ---------- static marks in the brand sheet ----------
function markSVG({ fill = C.blue, cap, outline, cls = '' } = {}) {
  const s = outline
    ? `<g fill="none" stroke="${fill}" stroke-width="1.4" vector-effect="non-scaling-stroke" stroke-linejoin="round"><path d="${PATHS.capUnion}" vector-effect="non-scaling-stroke"/><path d="${PATHS.w}" vector-effect="non-scaling-stroke"/></g>`
    : `<path d="${PATHS.capUnion}" fill="${cap || fill}"/><path d="${PATHS.w}" fill="${fill}"/>`;
  return `<svg class="wm-svgmark ${cls}" viewBox="-2 -2 ${MARK_W + 4} ${MARK_H + 4}" aria-hidden="true">${s}</svg>`;
}
document.querySelectorAll('[data-mark]').forEach((n) => {
  const o = n.dataset;
  n.innerHTML = markSVG({ fill: o.fill, cap: o.cap, outline: 'outline' in o });
});

// construction steps: 1 two diamonds, 2 split, 3 V notch, 4 merged W
const stepSVG = {
  1: `<g transform="translate(6 10)">${['0', '120'].map((x) => `<path transform="translate(${x} 0)" d="${PATHS.diamond}"/>`).join('')}</g>`,
  2: `<g transform="translate(6 10)">${['0', '120'].map((x) => `<g transform="translate(${x} 0)"><path d="${PATHS.cap}"/><path d="${PATHS.vOuter}"/><path class="wm-dim" d="M-6 26H106"/></g>`).join('')}</g>`,
  3: `<g transform="translate(6 10)">${['0', '120'].map((x) => `<g transform="translate(${x} 0)"><path d="${PATHS.cap}"/><path d="${PATHS.v}"/></g>`).join('')}</g>`,
  4: `<g transform="translate(34 10)"><g class="wm-ghost"><path d="${PATHS.cap}"/><path d="${PATHS.v}"/><g transform="translate(64 0)"><path d="${PATHS.cap}"/><path d="${PATHS.v}"/></g></g><g class="wm-solid"><path d="${PATHS.capUnion}"/><path d="${PATHS.w}"/></g></g>`,
};
document.querySelectorAll('[data-step]').forEach((n) => {
  n.innerHTML = `<svg viewBox="0 0 232 120" aria-hidden="true">${stepSVG[n.dataset.step]}</svg>`;
});

// ---------- hero stage ----------
const stage = $('#wm-stage');
const bg = $('#wm-bg');
const svg = $('#wm-svg');
const canvas = $('#wm-3d');
const phone = $('#wm-phone');
const phoneBox = $('.wm-phone-box');
const chapterEl = $('#wm-chapter');
const bar = $('#wm-bar');

const root = el('g', {}, svg);
const defs = el('defs', {}, svg);
defs.innerHTML = `
  <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4C86FF"/><stop offset=".45" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.blueDeep}"/>
  </linearGradient>
  <linearGradient id="gCap" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8FD9FF"/><stop offset=".35" stop-color="#3E7BFF"/><stop offset="1" stop-color="${C.blue}"/>
  </linearGradient>
  <linearGradient id="gIri" gradientUnits="userSpaceOnUse" x1="-160" y1="0" x2="0" y2="60">
    <stop offset="0" stop-color="#6FD3FF" stop-opacity="0"/>
    <stop offset=".3" stop-color="#FF8AD8"/><stop offset=".5" stop-color="#FFE27A"/>
    <stop offset=".7" stop-color="#6FD3FF"/><stop offset="1" stop-color="#6FD3FF" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="gDarkV" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#101436"/><stop offset=".6" stop-color="#16206a"/><stop offset="1" stop-color="#2346d8"/>
  </linearGradient>
  <pattern id="pStitch" width="3.6" height="3.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
    <rect width="3.6" height="3.6" fill="#1440c8"/><rect width="3.6" height="1.9" fill="#3f7dff"/><rect width="3.6" height=".5" y="1.9" fill="#8fbaff" opacity=".5"/>
  </pattern>
  <pattern id="pHatch" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
    <rect width="2.4" height="2.4" fill="#d9d9de"/><rect width="2.4" height=".9" fill="#2a2a33"/>
  </pattern>
  <filter id="fRough" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/>
    <feDisplacementMap in="SourceGraphic" scale="1.6"/>
  </filter>
  <filter id="fEmboss" x="-10%" y="-10%" width="120%" height="120%">
    <feGaussianBlur in="SourceAlpha" stdDeviation=".8" result="b"/>
    <feSpecularLighting in="b" surfaceScale="2" specularConstant=".7" specularExponent="18" lighting-color="#bfe0ff" result="s">
      <feDistantLight azimuth="235" elevation="40"/>
    </feSpecularLighting>
    <feComposite in="s" in2="SourceAlpha" operator="in" result="sp"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sp"/></feMerge>
  </filter>
  <filter id="fGlow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="6" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="fFabric"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="3" seed="9"/>
    <feColorMatrix values="0 0 0 0 .05  0 0 0 0 .06  0 0 0 0 .11  0 0 0 .55 0"/></filter>
  <filter id="fBlur"><feGaussianBlur stdDeviation="14"/></filter>
`;

// fabric / paper / backgrounds that live in content space
const fabric = el('rect', { x: -2000, y: -2000, width: 4000, height: 4000, filter: 'url(#fFabric)', opacity: 0 }, root);

const notebook = el('g', { opacity: 0 }, root);
el('rect', { x: -230, y: -250, width: 460, height: 560, rx: 8, fill: '#f4f4f1' }, notebook);
for (let i = 0; i < 12; i++) el('circle', { cx: -200 + i * 36.5, cy: -232, r: 7, fill: 'none', stroke: '#9a9aa3', 'stroke-width': 3 }, notebook);

const strings = el('g', { opacity: 0, fill: 'none', 'stroke-linecap': 'round' }, root);
['M-150 -520 C-120 -200 -175 80 -140 420', 'M-40 -520 C-20 -220 -75 90 -30 440'].forEach((d) => {
  el('path', { d, stroke: '#1c2236', 'stroke-width': 20 }, strings);
  el('path', { d, stroke: '#e9eef5', 'stroke-width': 12 }, strings);
  el('path', { d, stroke: '#ffffff', 'stroke-width': 3, opacity: 0.8, transform: 'translate(-3 0)' }, strings);
});

const shadow = el('ellipse', { cx: 0, cy: 230, rx: 150, ry: 22, fill: '#06123f', opacity: 0, filter: 'url(#fBlur)' }, root);
const badge = el('circle', { cx: 0, cy: 0, r: 0, fill: C.black }, root);
const wipe = el('circle', { cx: 0, cy: 0, r: 0, fill: C.blue }, root);

const big = el('text', { class: 'wm-word', x: 0, y: 0, 'text-anchor': 'middle', fill: C.white, opacity: 0, 'font-size': 520 }, root);
big.textContent = 'wonmor';

// two diamonds
function diamond(id) {
  const g = el('g', { id, opacity: 0 }, root);
  const inner = el('g', { transform: 'translate(-50 -50)' }, g);
  const sel = el('g', { class: 'wm-sel', opacity: 0 }, inner);
  el('rect', { x: -8, y: -8, width: 116, height: 116, fill: 'none', stroke: '#3c7bff', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }, sel);
  [[-8, -8], [108, -8], [-8, 108], [108, 108], [50, -8], [50, 108]].forEach(([x, y]) =>
    el('rect', { x: x - 1.6, y: y - 1.6, width: 3.2, height: 3.2, fill: '#fff', stroke: '#3c7bff', 'stroke-width': 0.6 }, sel));
  const S = { fill: 'rgba(16,40,110,.38)', stroke: '#4d8bff', 'stroke-width': 1.3, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' };
  const outline = el('path', { d: PATHS.diamond, ...S }, inner);
  const cap = el('path', { d: PATHS.cap, ...S, opacity: 0 }, inner);
  const vout = el('path', { d: PATHS.vOuter, ...S, opacity: 0 }, inner);
  const split = el('path', { d: 'M-6 26H106', stroke: '#fff', 'stroke-width': 0.7, fill: 'none', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, inner);
  const notch = el('path', { d: 'M18 30L50 62L82 30', stroke: '#fff', 'stroke-width': 0.8, fill: 'none', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1, 'stroke-linejoin': 'round' }, inner);
  const vline = el('path', { d: 'M-16 22V30', stroke: C.yellow, 'stroke-width': 0.8, fill: 'none', opacity: 0 }, inner);
  const lab = el('text', { x: -20, y: 28.5, 'font-size': 6, fill: C.yellow, 'text-anchor': 'end', class: 'wm-mono', opacity: 0 }, inner);
  lab.textContent = '4.4';
  const dim = el('text', { x: 50, y: -12, 'font-size': 6, fill: '#6aa0ff', 'text-anchor': 'middle', class: 'wm-mono', opacity: 0 }, inner);
  dim.textContent = '10';
  const anchors = el('g', { opacity: 0 }, inner);
  [[18, 30], [50, 62], [82, 30], [18, 0], [82, 0]].forEach(([x, y]) =>
    el('rect', { x: x - 1.5, y: y - 1.5, width: 3, height: 3, fill: '#fff', stroke: '#2f6bff', 'stroke-width': 0.5 }, anchors));
  const handle = el('g', { opacity: 0 }, inner);
  el('path', { d: 'M18 0 A10 10 0 0 0 8 10', fill: 'none', stroke: '#6aa0ff', 'stroke-width': 0.6, 'stroke-dasharray': '1.5 1' }, handle);
  el('circle', { cx: 9, cy: 3, r: 2, fill: '#fff', stroke: '#2f6bff', 'stroke-width': 0.5 }, handle);
  return { g, sel, outline, cap, vout, split, notch, vline, lab, dim, anchors, handle };
}
const dA = diamond('wm-dA');
const dB = diamond('wm-dB');

// merged mark
const mark = el('g', { id: 'wm-mark', opacity: 0 }, root);
const mIn = el('g', { transform: `translate(${-MARK_W / 2} ${-MARK_H / 2})` }, mark);
const mCap = el('path', { d: PATHS.capUnion, fill: 'url(#gCap)' }, mIn);
const mW = el('path', { d: PATHS.w, fill: 'url(#gBlue)' }, mIn);
const mIri = el('g', { opacity: 0, style: 'mix-blend-mode:screen' }, mIn);
el('path', { d: PATHS.capUnion, fill: 'url(#gIri)' }, mIri);
el('path', { d: PATHS.w, fill: 'url(#gIri)' }, mIri);
const mOut = el('g', { opacity: 0, fill: 'none', stroke: '#cfd6e6', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, mIn);
el('path', { d: PATHS.capUnion, 'vector-effect': 'non-scaling-stroke' }, mOut);
el('path', { d: PATHS.w, 'vector-effect': 'non-scaling-stroke' }, mOut);
const mWire = el('g', { opacity: 0, fill: 'none', stroke: '#2a2d44', 'stroke-width': 0.8 }, mIn);
['M50 0V22', 'M82 0V22', 'M114 0V22', 'M0 26H164', 'M82 30V55.2'].forEach((d) =>
  el('path', { d, 'vector-effect': 'non-scaling-stroke', opacity: 0.55 }, mWire));
const mStitch = el('g', { opacity: 0, filter: 'url(#fEmboss)' }, mIn);
el('path', { d: PATHS.capUnion, fill: 'url(#pStitch)', stroke: '#5a93ff', 'stroke-width': 0.8, 'stroke-dasharray': '1.4 0.9' }, mStitch);
el('path', { d: PATHS.w, fill: 'url(#pStitch)', stroke: '#5a93ff', 'stroke-width': 0.8, 'stroke-dasharray': '1.4 0.9' }, mStitch);
const mHatch = el('g', { opacity: 0, filter: 'url(#fRough)' }, mIn);
el('path', { d: PATHS.capUnion, fill: 'url(#pHatch)', stroke: '#2a2a33', 'stroke-width': 1.2 }, mHatch);
el('path', { d: PATHS.w, fill: 'url(#pHatch)', stroke: '#2a2a33', 'stroke-width': 1.2 }, mHatch);

const dot = el('circle', { cx: 0, cy: 0, r: 0, fill: C.blue }, root);

// wordmark (letters measured after the font loads)
const word = el('g', { id: 'wm-word', opacity: 0 }, root);
const wordFill = el('text', { class: 'wm-word', x: 0, y: 0, 'font-size': 100, fill: C.white }, word);
wordFill.textContent = 'wonmor';
const letters = [];
const wordAnchors = el('g', { opacity: 0 }, word);

// cursor (px-sized, counter-scaled)
const cursor = el('g', { opacity: 0 }, root);
const cursorIn = el('g', {}, cursor);
el('path', { d: 'M0 0L0 17L4.6 12.6L7.6 19.2L10.4 18L7.4 11.5L13.4 11.5Z', fill: '#fff', stroke: '#111', 'stroke-width': 1, 'stroke-linejoin': 'round' }, cursorIn);

function navTone() {
  const overStage = scrollY < stage.offsetHeight - 60;
  document.documentElement.style.setProperty('--wm-navfg', overStage && stage.dataset.tone === 'light' ? C.navy : '#fff');
  $('.wm-nav').classList.toggle('wm-solidnav', !overStage);
}
addEventListener('scroll', navTone, { passive: true });

// ---------- layout ----------
let W = 1, H = 1, K = 1, tw100 = 300;
function layout() {
  const r = stage.getBoundingClientRect();
  W = r.width; H = r.height; K = Math.min(W, H) / 1000;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  root.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${K})`);
  cursorIn.setAttribute('transform', `scale(${1 / K})`);
  three && three.resize();
}

// Lockup: mark of height h (content units) left, wordmark right, centred as a whole.
function lock(h) {
  const F = 1.55 * h;
  const mw = (MARK_W / MARK_H) * h;
  const gap = 0.34 * h;
  const tw = (tw100 * F) / 100;
  const total = mw + gap + tw;
  return { markX: -total / 2 + mw / 2, markS: h / MARK_H, textX: -total / 2 + mw + gap, baseline: 0.23 * h, ts: F / 100, total };
}

// ---------- 3D ----------
let three = null;
async function init3D() {
  if (!canvas) return;
  try {
    const { createStage } = await import('./three-stage.js');
    three = createStage(canvas);
    canvas.addEventListener('wm-lost', () => { canvas.style.display = 'none'; });
  } catch {
    canvas.style.display = 'none';
  }
}

// ---------- timeline ----------
function build() {
  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });
  const st = three ? three.state : {};
  const set = (t, target, vars) => tl.set(target, vars, t);
  const show = (t, ...els) => els.forEach((e) => tl.set(e, { opacity: 1 }, t));
  const hide = (t, ...els) => els.forEach((e) => tl.set(e, { opacity: 0 }, t));
  const LIGHT = new Set([C.paper]);
  const bgTo = (t, color, dur = 0) => {
    tl.call(() => { stage.dataset.tone = LIGHT.has(color) ? 'light' : 'dark'; navTone(); }, null, t);
    return dur ? tl.to(bg, { backgroundColor: color, duration: dur, ease: 'none' }, t) : tl.set(bg, { backgroundColor: color }, t);
  };
  const chapter = (t, txt) => tl.call(() => { chapterEl.textContent = txt; }, null, t);
  const mode = (t, m) => tl.call(() => { if (three) { three.state.mode = m; m === 'none' ? three.stop() : three.start(); } }, null, t);
  const flash = (t, color = '#fff') => {
    tl.set('#wm-flash', { backgroundColor: color, opacity: 0.9 }, t);
    tl.to('#wm-flash', { opacity: 0, duration: 0.22, ease: 'power1.out' }, t + 0.02);
  };
  const cur = (t, x, y, dur = 0.4) => tl.to(cursor, { x, y, duration: dur, ease: 'power2.inOut' }, t);
  const ds = 2.2;
  const L1 = lock(240);
  const L2 = lock(74);
  const L3 = lock(88);

  // reset state at t=0
  tl.set([dA.g, dB.g, mark, word, big, cursor, fabric, notebook, strings, shadow, phone, '#wm-flash'], { opacity: 0 }, 0);
  tl.set([badge, wipe, dot], { attr: { r: 0 } }, 0);
  tl.set(dA.g, { x: -160, y: 0, scale: ds, svgOrigin: '0 0' }, 0);
  tl.set(dB.g, { x: 160, y: 0, scale: ds, svgOrigin: '0 0' }, 0);
  [dA, dB].forEach((d) => {
    tl.set([d.outline], { opacity: 1 }, 0);
    tl.set([d.cap, d.vout, d.sel, d.vline, d.lab, d.dim, d.anchors, d.handle], { opacity: 0 }, 0);
    tl.set([d.split, d.notch], { attr: { 'stroke-dashoffset': 1 } }, 0);
    tl.set(d.cap, { y: 0 }, 0);
  });
  tl.set(mark, { x: 0, y: 0, scale: ds, svgOrigin: '0 0' }, 0);
  tl.set(mCap, { fill: 'url(#gCap)', opacity: 1 }, 0);
  tl.set(mW, { fill: 'url(#gBlue)', opacity: 1 }, 0);
  tl.set([mIri, mOut, mWire, mStitch, mHatch], { opacity: 0 }, 0);
  tl.set(cursor, { x: 40, y: -120 }, 0);
  bgTo(0, C.ink);
  chapter(0, '01  Two diamonds');
  if (three) {
    tl.set(st, { gemX: 160, gemScale: 220, gemOpacity: 1 }, 0);
    mode(0, 'gems');
  }

  // S1 gems + selection
  show(0.12, dA.sel, dB.sel, cursor);
  cur(0.2, 250, -170, 0.9);
  // S2 gems -> flat outlines
  if (three) tl.to(st, { gemOpacity: 0, duration: 0.28 }, 1.2);
  tl.to([dA.g, dB.g], { opacity: 1, duration: 0.25 }, 1.22);
  mode(1.55, 'none');
  hide(1.5, dA.sel, dB.sel);
  chapter(1.5, '02  Construction');
  // S3 split
  cur(1.55, -150, -100, 0.45);
  tl.to([dA.split, dB.split], { attr: { 'stroke-dashoffset': 0 }, duration: 0.45, ease: 'power1.inOut' }, 1.7);
  [dA, dB].forEach((d) => {
    tl.set(d.outline, { opacity: 0 }, 2.2);
    tl.set([d.cap, d.vout], { opacity: 1 }, 2.2);
    tl.set(d.cap, { y: 4 }, 2.2);
    tl.to(d.cap, { y: 0, duration: 0.3, ease: 'power3.out' }, 2.22);
    tl.to(d.split, { opacity: 0, duration: 0.2 }, 2.25);
    show(2.25, d.vline, d.lab, d.dim);
    tl.call(() => { d.lab.textContent = '5'; }, null, 2.5);
  });
  tl.call(() => { dA.lab.textContent = '4.4'; dB.lab.textContent = '4.4'; }, null, 2.24);
  // S4 V notch
  cur(2.6, -110, -50, 0.35);
  show(2.62, dA.anchors, dB.anchors);
  tl.to([dA.notch, dB.notch], { attr: { 'stroke-dashoffset': 0 }, duration: 0.55, ease: 'power1.inOut' }, 2.7);
  [dA, dB].forEach((d) => tl.call(() => d.vout.setAttribute('d', PATHS.v), null, 3.2));
  tl.call(() => { [dA, dB].forEach((d) => d.vout.setAttribute('d', PATHS.vOuter)); }, null, 0.01);
  tl.to([dA.notch, dB.notch], { opacity: 0, duration: 0.15 }, 3.22);
  tl.set([dA.notch, dB.notch], { opacity: 1 }, 0);
  // S5 round corners
  show(3.25, dA.handle, dB.handle);
  cur(3.25, -255, -105, 0.3);
  hide(3.55, dA.handle, dB.handle, dA.vline, dB.vline, dA.lab, dB.lab, dA.dim, dB.dim, dA.anchors, dB.anchors);
  // S6 merge -> W
  chapter(3.6, '03  Two V become W');
  tl.to(dA.g, { x: -32 * ds, duration: 0.75, ease: 'power3.inOut' }, 3.6);
  tl.to(dB.g, { x: 32 * ds, duration: 0.75, ease: 'power3.inOut' }, 3.6);
  cur(3.6, 30, 150, 0.7);
  hide(4.38, dA.g, dB.g);
  show(4.38, mark);
  tl.fromTo(mark, { opacity: 0.4 }, { opacity: 1, duration: 0.12 }, 4.38);
  hide(4.5, cursor);
  // S7 scale down + iridescent sweep
  tl.to(mark, { scale: 1.1, duration: 0.9, ease: 'expo.out' }, 4.55);
  tl.to(mIri, { opacity: 0.85, duration: 0.25 }, 4.7);
  tl.fromTo('#gIri', { attr: { x1: -170, x2: -10 } }, { attr: { x1: 170, x2: 330 }, duration: 0.9, ease: 'power1.inOut' }, 4.7);
  tl.to(mIri, { opacity: 0, duration: 0.25 }, 5.35);
  // S8 light background
  bgTo(5.6, C.paper);
  flash(5.6, '#bfe6ff');
  tl.set(mark, { scale: 1.7 }, 5.6);
  tl.set(mCap, { fill: C.blue }, 5.6);
  tl.set(mW, { fill: '#1a2a8a' }, 5.6);
  tl.to(mCap, { fill: '#0f1232', duration: 0.5 }, 6.05);
  tl.to(mW, { fill: '#121845', duration: 0.5 }, 6.05);
  // S9 outline + wordmark construction
  chapter(6.6, '04  Wordmark');
  bgTo(6.6, C.ink);
  tl.set([mCap, mW], { opacity: 0 }, 6.6);
  show(6.6, mOut);
  tl.set(mark, { scale: 2.3, x: 60 }, 6.6);
  show(6.7, cursor);
  tl.set(cursor, { x: 120, y: -140 }, 6.7);
  tl.to(mark, { x: L1.markX, scale: L1.markS, duration: 0.5, ease: 'power3.inOut' }, 6.75);
  tl.set(word, { x: L1.textX, y: L1.baseline, scale: L1.ts, svgOrigin: '0 0', opacity: 1 }, 6.75);
  tl.set(wordFill, { opacity: 0 }, 6.75);
  tl.call(() => letters.forEach((l) => l.setAttribute('opacity', 0)), null, 6.75);
  show(7.0, wordAnchors);
  letters.forEach((l, i) => {
    tl.fromTo(l, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'none', immediateRender: false }, 7.0 + i * 0.3);
    cur(7.0 + i * 0.3, L1.textX + (l._x + 20) * L1.ts, -40 + (i % 2) * 60, 0.28);
  });
  tl.set(wordAnchors, { opacity: 0 }, 9.1);
  // S10 outline -> solid white lockup, scale down
  chapter(9.1, '05  Lockup');
  hide(9.12, cursor, mOut);
  tl.set([mCap, mW], { opacity: 1, fill: C.white }, 9.12);
  tl.set(wordFill, { opacity: 1, fill: C.white }, 9.12);
  tl.call(() => letters.forEach((l) => l.setAttribute('opacity', 0)), null, 9.12);
  tl.call(() => letters.forEach((l) => l.setAttribute('opacity', 1)), null, 9.11);
  flash(9.12, '#ffffff');
  tl.to(mark, { x: L2.markX, scale: L2.markS, duration: 0.7, ease: 'expo.out' }, 9.15);
  tl.to(word, { x: L2.textX, y: L2.baseline, scale: L2.ts, duration: 0.7, ease: 'expo.out' }, 9.15);
  tl.to(mCap, { fill: '#4C86FF', duration: 0.35 }, 9.75);
  tl.to(mW, { fill: C.blue, duration: 0.35 }, 9.75);
  // S11 light lockup
  bgTo(10.4, C.paper);
  flash(10.4, '#a9d6ff');
  tl.set(wordFill, { fill: C.navy }, 10.4);
  tl.set(mCap, { fill: C.blue }, 10.4);
  tl.set(mW, { fill: C.blue }, 10.4);
  tl.to(mark, { x: L3.markX, scale: L3.markS, duration: 1, ease: 'power1.inOut' }, 10.45);
  tl.to(word, { x: L3.textX, y: L3.baseline, scale: L3.ts, duration: 1, ease: 'power1.inOut' }, 10.45);
  // S12 big white sweep + blue mark
  chapter(11.4, '06  In the world');
  bgTo(11.4, C.ink);
  hide(11.4, word);
  tl.set(big, { opacity: 1, x: 260, y: 170 }, 11.4);
  tl.to(big, { x: -260, duration: 1.1, ease: 'none' }, 11.4);
  tl.set(mark, { x: 0, y: 0, scale: 1.5 }, 11.4);
  tl.set([mCap, mW], { fill: C.blue }, 11.4);
  tl.set([mCap, mW], { opacity: 0 }, 11.9);
  tl.set(mOut, { opacity: 1, stroke: '#6aa0ff' }, 11.9);
  tl.to(dot, { attr: { r: 120 }, duration: 0.45, ease: 'power2.in' }, 11.95);
  // S13 phone profile
  hide(12.42, big, mark, mOut);
  tl.set(mOut, { stroke: '#cfd6e6' }, 12.42);
  tl.set(dot, { attr: { r: 0 } }, 12.42);
  tl.set(phone, { opacity: 1 }, 12.42);
  tl.fromTo(phoneBox, { opacity: 0, xPercent: 14, scale: 1.15 }, { opacity: 1, xPercent: 0, scale: 1, duration: 0.45, ease: 'power3.out' }, 12.42);
  tl.to(phoneBox, { xPercent: -6, duration: 1.1, ease: 'none' }, 12.87);
  // S14 hoodie strings
  hide(13.98, phone);
  tl.set(fabric, { opacity: 1 }, 13.98);
  tl.fromTo(strings, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.3 }, 13.98);
  tl.to(strings, { x: -20, duration: 0.9, ease: 'none' }, 14.28);
  tl.set(mark, { opacity: 1, x: 170, y: -40, scale: 0.75 }, 13.98);
  tl.set([mCap, mW], { opacity: 1, fill: C.blue }, 13.98);
  // S15 white mark alone + glow
  hide(14.98, strings, fabric);
  tl.set(mark, { x: 0, y: 0, scale: 2.1 }, 14.98);
  tl.set([mCap, mW], { fill: C.white }, 14.98);
  tl.set(mark, { attr: { filter: 'url(#fGlow)' } }, 14.98);
  tl.fromTo(mark, { opacity: 0.2 }, { opacity: 1, duration: 0.18 }, 15.18);
  tl.set(mark, { attr: { filter: '' } }, 15.5);
  // S16 3D on blue
  chapter(15.5, '07  Materials');
  hide(15.5, mark);
  bgTo(15.5, C.blue);
  show(15.5, shadow);
  if (three) {
    tl.set(st, { markScale: 170, markRotY: 1.45, markRotX: -0.18, markY: -10, markOpacity: 1 }, 15.5);
    mode(15.5, 'mark');
    tl.to(st, { markRotY: 0.35, duration: 0.6, ease: 'power2.out' }, 15.5);
    tl.to(st, { markY: 10, duration: 0.6, ease: 'sine.inOut' }, 15.5);
    // S17 big 3D on dark
    bgTo(16.1, C.ink);
    hide(16.1, shadow);
    tl.set(st, { markScale: 300, markRotY: 0.3, markRotX: -0.08, markY: 0 }, 16.1);
    tl.to(st, { markRotY: -0.12, duration: 0.55 }, 16.1);
    mode(16.66, 'none');
  } else {
    tl.set(mark, { opacity: 1, scale: 1.8 }, 15.5);
    tl.set([mCap, mW], { fill: C.white }, 15.5);
    hide(16.66, mark);
  }
  // S18 light outline / wire
  bgTo(16.66, C.paper);
  tl.set(mark, { opacity: 1, x: 0, y: 0, scale: 2 }, 16.66);
  tl.set([mCap, mW], { opacity: 0 }, 16.66);
  tl.set(mOut, { opacity: 1, stroke: '#2a2d44' }, 16.66);
  show(16.66, mWire);
  tl.to(mark, { scale: 2.12, duration: 0.5, ease: 'none' }, 16.66);
  // S19 embroidery
  hide(17.18, mOut, mWire);
  tl.set(mOut, { stroke: '#cfd6e6' }, 17.18);
  bgTo(17.18, '#0c0e17');
  show(17.18, fabric, mStitch);
  tl.set(mark, { scale: 2.3 }, 17.18);
  // S20 black solid on light
  hide(17.46, fabric, mStitch);
  bgTo(17.46, C.paper);
  tl.set([mCap, mW], { opacity: 1, fill: C.black }, 17.46);
  tl.set(mark, { scale: 1.9 }, 17.46);
  // S21 notebook sketch
  bgTo(17.72, '#1b1a1f');
  tl.set([mCap, mW], { opacity: 0 }, 17.72);
  show(17.72, notebook, mHatch);
  tl.fromTo(notebook, { rotation: -4, svgOrigin: '0 0' }, { rotation: -2, duration: 0.3, ease: 'none' }, 17.72);
  tl.set(mark, { scale: 2.2, rotation: -3, y: 30 }, 17.72);
  // S22 badge
  hide(18.02, notebook, mHatch);
  bgTo(18.02, C.paper);
  tl.set(mark, { rotation: 0, y: 0, scale: 1.25 }, 18.02);
  tl.set([mCap, mW], { opacity: 1 }, 18.02);
  tl.set(mW, { fill: 'url(#gBlue)' }, 18.02);
  tl.set(mCap, { fill: 'url(#gCap)' }, 18.02);
  tl.set(badge, { attr: { r: 170 } }, 18.02);
  // S23 circle wipe -> blue + gems
  hide(18.3, mark);
  tl.set(badge, { attr: { r: 0 } }, 18.3);
  tl.set(wipe, { attr: { r: 170 } }, 18.3);
  tl.to(wipe, { attr: { r: 1600 }, duration: 0.22, ease: 'power2.in' }, 18.3);
  bgTo(18.52, C.blue);
  tl.set(wipe, { attr: { r: 0 } }, 18.53);
  chapter(18.52, '01  Two diamonds');
  if (three) {
    tl.set(st, { gemX: 190, gemScale: 330, gemOpacity: 1 }, 18.52);
    mode(18.52, 'gems');
    tl.to(st, { gemX: 175, gemScale: 300, duration: 0.8, ease: 'sine.inOut' }, 18.52);
    // S24 back to dark, small gems (loops into S1)
    bgTo(19.32, C.ink, 0.15);
    tl.to(st, { gemX: 160, gemScale: 220, duration: 0.45, ease: 'power2.out' }, 19.32);
  } else {
    bgTo(19.32, C.ink, 0.15);
  }
  tl.to({}, { duration: 0.1 }, 19.8);
  tl.eventCallback('onUpdate', () => { bar.style.transform = `scaleX(${tl.progress()})`; });
  return tl;
}

function buildLetters() {
  letters.forEach((l) => l.remove());
  letters.length = 0;
  wordAnchors.innerHTML = '';
  tw100 = wordFill.getComputedTextLength() || 300;
  const txt = wordFill.textContent;
  for (let i = 0; i < txt.length; i++) {
    const x = wordFill.getStartPositionOfChar(i).x;
    const l = el('text', { class: 'wm-word', x, y: 0, 'font-size': 100, fill: 'none', stroke: '#d6dcea', 'stroke-width': 1.1, 'vector-effect': 'non-scaling-stroke', opacity: 0 }, word);
    l.textContent = txt[i];
    l._x = x;
    letters.push(l);
    el('rect', { x: x - 2, y: -74, width: 4, height: 4, fill: i % 2 ? C.yellow : '#3c7bff' }, wordAnchors);
    el('rect', { x: x + 24, y: -2, width: 4, height: 4, fill: '#fff', stroke: '#2f6bff', 'stroke-width': 0.6 }, wordAnchors);
  }
}

let master = null;
async function start() {
  try { await document.fonts.load('700 100px "Plus Jakarta Sans"'); } catch { /* fallback font */ }
  layout();
  buildLetters();
  await init3D();
  layout();
  master = build();
  if (SHOT !== null) {
    master.pause(SHOT, false);
    if (three) three.render();
    document.documentElement.dataset.ready = '1';
    return;
  }
  if (reduced) {
    master.pause(10.9, false);
    if (three) { three.stop(); three.render(); }
  }
  document.documentElement.dataset.ready = '1';
  const io = new IntersectionObserver(([e]) => {
    if (!master || reduced) return;
    if (e.isIntersecting && !paused) { master.play(); if (three && three.state.mode !== 'none') three.start(); }
    else { master.pause(); three && three.stop(); }
  }, { threshold: 0.05 });
  io.observe(stage);
}

let paused = false;
$('#wm-toggle').addEventListener('click', (e) => {
  if (!master) return;
  paused = !paused;
  e.currentTarget.setAttribute('aria-pressed', String(paused));
  e.currentTarget.textContent = paused ? 'Play' : 'Pause';
  if (paused) { master.pause(); three && three.stop(); } else { master.play(); three && three.state.mode !== 'none' && three.start(); }
});
$('#wm-replay').addEventListener('click', () => { if (master) { master.restart(); if (!paused && three && three.state.mode !== 'none') three.start(); } });

let rt = 0;
addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    if (!master) return;
    const t = master.time();
    const wasPaused = master.paused();
    master.kill();
    layout();
    buildLetters();
    master = build();
    master.seek(t, false);
    if (wasPaused) master.pause();
    three && three.render();
  }, 150);
});

start();

// ---------- brand sheet: interactive 3D + reveals ----------
const viewer = $('#wm-viewer');
if (viewer) {
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    try {
      const { createStage } = await import('./three-stage.js');
      const v = createStage(viewer, { interactive: true });
      const s = v.state;
      s.mode = 'mark';
      const fit = () => { v.resize(); const r = viewer.getBoundingClientRect(); s.markScale = Math.min(330, 1000 * 0.5 * Math.min(r.width, r.height * 1.4) / Math.min(r.width, r.height) / 1.64 * 1.1); };
      fit();
      addEventListener('resize', fit);
      let drag = null, vy = 0.004, vx = 0;
      viewer.addEventListener('pointerdown', (ev) => { drag = { x: ev.clientX, y: ev.clientY }; viewer.setPointerCapture(ev.pointerId); });
      viewer.addEventListener('pointermove', (ev) => {
        if (!drag) return;
        vy = (ev.clientX - drag.x) * 0.006; vx = (ev.clientY - drag.y) * 0.004;
        drag = { x: ev.clientX, y: ev.clientY };
      });
      const end = () => { drag = null; };
      viewer.addEventListener('pointerup', end);
      viewer.addEventListener('pointercancel', end);
      const tick = () => {
        s.markRotY += vy; s.markRotX = Math.max(-0.7, Math.min(0.7, s.markRotX + vx));
        if (!drag) { vy += (0.004 - vy) * 0.04; vx *= 0.9; s.markRotX += (-0.12 - s.markRotX) * 0.03; }
      };
      if (reduced) { s.markRotY = 0.45; v.render(); return; }
      gsap.ticker.add(tick);
      const vis = new IntersectionObserver(([x]) => (x.isIntersecting ? v.start() : v.stop()));
      vis.observe(viewer);
    } catch {
      viewer.replaceWith(Object.assign(document.createElement('div'), { className: 'wm-viewer-fallback', innerHTML: markSVG({}) }));
    }
  }, { rootMargin: '200px' });
  io.observe(viewer);
}

const reveal = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('wm-in'); reveal.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.wm-reveal').forEach((n) => reveal.observe(n));

document.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); b.classList.add('wm-copied'); setTimeout(() => b.classList.remove('wm-copied'), 1200); } catch { /* ignore */ }
}));
