import { gsap } from 'gsap';
import { PATHS, MARK_W, MARK_H, WORD, WORD_PATH, WM } from './geometry.js';

const C = {
  ink: '#07080D', paper: '#EEF2F8', blue: '#1F5BFF', blueDeep: '#1238D6', cyan: '#6FD3FF',
  navy: '#15163F', white: '#F7F9FC', yellow: '#FFD23F', black: '#0B0B12',
};
const NS = 'http://www.w3.org/2000/svg';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const params = new URLSearchParams(location.search);
const SHOT = params.has('shot') ? parseFloat(params.get('shot')) : null;
const REC = params.has('rec');

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
// Lockup in mark units: crown top on the x-height, W tip below the baseline.
const LOCK_W = MARK_W + WM.GAP + WORD.width;
function lockupSVG({ mark = C.blue, cap, text = C.white, cls = '' } = {}) {
  return `<svg class="wm-svglock ${cls}" viewBox="-2 -2 ${LOCK_W + 4} ${MARK_H + 4}" role="img" aria-label="wonmor"><path d="${PATHS.capUnion}" fill="${cap || mark}"/><path d="${PATHS.w}" fill="${mark}"/><path transform="translate(${MARK_W + WM.GAP} ${WM.X})" d="${WORD_PATH}" fill="${text}"/></svg>`;
}
document.querySelectorAll('[data-lockup]').forEach((n) => {
  const o = n.dataset;
  n.innerHTML = lockupSVG({ mark: o.mk, cap: o.cap, text: o.text });
});
document.querySelectorAll('[data-word]').forEach((n) => {
  n.innerHTML = lockupSVG({ mark: 'currentColor', text: 'currentColor', cls: 'wm-svgword' });
});
document.querySelectorAll('[data-mark]').forEach((n) => {
  const o = n.dataset;
  n.innerHTML = markSVG({ fill: o.fill, cap: o.cap, outline: 'outline' in o });
});

// construction steps: 1 one diamond, 2 split, 3 V notch, 4 the V doubles into W
const stepSVG = {
  1: `<g transform="translate(66 10)"><path d="${PATHS.diamond}"/></g>`,
  2: `<g transform="translate(66 10)"><path d="${PATHS.cap}"/><path d="${PATHS.vOuter}"/><path class="wm-dim" d="M-6 26H106"/></g>`,
  3: `<g transform="translate(66 10)"><path d="${PATHS.cap}"/><path d="${PATHS.v}"/></g>`,
  4: `<g transform="translate(34 10)"><g class="wm-ghost"><path d="${PATHS.cap}"/><path d="${PATHS.v}"/><g transform="translate(64 0)"><path d="${PATHS.cap}"/><path d="${PATHS.v}"/></g></g><g class="wm-solid"><path d="${PATHS.capUnion}"/><path d="${PATHS.w}"/></g></g>`,
};
document.querySelectorAll('[data-step]').forEach((n) => {
  n.innerHTML = `<svg viewBox="0 0 232 120" aria-hidden="true">${stepSVG[n.dataset.step]}</svg>`;
});


// ---------- hero: pre-rendered brand film ----------
const film = $('#wm-film');
if (film) {
  const portrait = () => matchMedia('(max-aspect-ratio: 1/1)').matches;
  const pick = () => {
    const v = portrait() ? '9x16' : '16x9';
    if (film.dataset.fmt === v) return;
    film.dataset.fmt = v;
    film.poster = `/film/wonmor_${v}.jpg`;
    film.innerHTML = `<source src="/film/wonmor_${v}.mp4" type="video/mp4">`;
    film.load();
    if (!reduced && !held) film.play().catch(() => {});
  };
  let held = reduced;
  pick();
  addEventListener('resize', pick);
  if (reduced) film.removeAttribute('autoplay');
  const snd = $('#wm-sound');
  snd.addEventListener('click', () => {
    film.muted = !film.muted;
    snd.setAttribute('aria-pressed', String(!film.muted));
    snd.textContent = film.muted ? 'Sound on' : 'Sound off';
    if (!film.muted) film.play().catch(() => {});
  });
  const play = $('#wm-play');
  const sync = () => { play.textContent = film.paused ? 'Play' : 'Pause'; play.setAttribute('aria-pressed', String(film.paused)); };
  play.addEventListener('click', () => { held = !film.paused; if (held) film.pause(); else film.play().catch(() => {}); });
  film.addEventListener('play', sync);
  film.addEventListener('pause', sync);
  new IntersectionObserver(([e]) => { if (!e.isIntersecting) film.pause(); else if (!held) film.play().catch(() => {}); }, { threshold: 0.05 }).observe(film);
} else if ($('#wm-svg')) {
  import('./stage-live.js');
}

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
