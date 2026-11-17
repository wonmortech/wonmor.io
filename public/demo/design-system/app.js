// Playground for @wonmor/tokens. Everything on these pages is read from tokens/tokens.json and the live
// custom properties of tokens/tokens.css (the same two files the package ships). Edits (playground colours,
// component rows) live in memory only and reset on reload.
import { ROWS, PROJECTS } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const main = $('#main');

const state = {
  theme: 'default',
  tokens: [],
  json: null,
  overrides: {},
  rows: ROWS.map((r) => ({ ...r })),
  nextId: ROWS.length + 1,
  filter: { q: '', status: 'all', group: 'all' },
  viewport: 1440,
  layoutWidth: 1280,
  duration: 700,
  family: 'sans',
  specimen: 'Ochiq maʼlumot, ochiq kod: Ö Ğ Ş Ç',
};

/* ---------- tokens ---------- */
function cssVarFor(path) {
  const [g, a, b] = path;
  if (g === 'font') return '--' + a;
  if (g === 'color' && a === 'gray') return '--gray-' + b;
  if (g === 'color' && a === 'illustration') return '--ill-' + b;
  if (g === 'color' && a === 'brand') return '--wm-' + b;
  if (g === 'theme') return b === 'wm-text' ? '--wm-text' : '--theme-' + b;
  if (g === 'layout') return '--' + a;
  if (g === 'radius') return '--radius-' + a;
  if (g === 'typeScale') return '--fs-' + a;
  if (g === 'easing') return '--ease-' + a;
  return '--' + path.join('-');
}
function flatten(o, p = [], out = []) {
  // JS orders integer-like keys ("100") before others ("050"), so put numeric scales back in order.
  const entries = Object.entries(o);
  if (entries.every(([k]) => /^\d+$/.test(k))) entries.sort((a, b) => +a[0] - +b[0]);
  for (const [k, v] of entries) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && 'value' in v) out.push({ path: p.concat(k), name: p.concat(k).join('.'), css: cssVarFor(p.concat(k)), ...v });
    else if (v && typeof v === 'object') flatten(v, p.concat(k), out);
  }
  return out;
}
const groupOf = (t) => (t.path[0] === 'color' ? 'colour' : t.path[0] === 'typeScale' ? 'type' : t.path[0]);
const byGroup = (g) => state.tokens.filter((t) => groupOf(t) === g);
const themeTokens = (th) => state.tokens.filter((t) => t.path[0] === 'theme' && t.path[1] === th);

/* ---------- colour maths ---------- */
function hexToRgb(h) {
  h = h.trim().replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbStrToHex(s) {
  s = s.trim();
  if (s.startsWith('#')) return s.length === 4 ? '#' + [...s.slice(1)].map((c) => c + c).join('') : s.toLowerCase();
  const m = s.match(/[\d.]+/g);
  if (!m) return s;
  return '#' + m.slice(0, 3).map((x) => Math.round(+x).toString(16).padStart(2, '0')).join('');
}
function lum(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); }
const inkOn = (hex) => (contrast(hex, '#141413') > contrast(hex, '#faf9f5') ? '#141413' : '#faf9f5');
function grade(r) { return r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large' : 'fail'; }

/* Resolve a custom property inside a given theme, using a hidden probe element. */
const probes = {};
function probe(theme) {
  if (!probes[theme]) {
    const el = document.createElement('div');
    el.hidden = true;
    if (theme !== 'default') el.className = 'theme-' + theme;
    document.body.appendChild(el);
    probes[theme] = el;
  }
  return probes[theme];
}
const live = (name, theme = state.theme) => getComputedStyle(probe(theme)).getPropertyValue(name).trim();

/* ---------- ui helpers ---------- */
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 1600);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); } catch { /* clipboard can be blocked; the toast still shows the value */ }
  toast('Copied ' + text);
}
document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-copy]');
  if (c) { e.preventDefault(); copy(c.dataset.copy); }
});
const fmtUZS = (n) => new Intl.NumberFormat('en-US').format(n).replace(/,/g, ' ') + ' soʻm';
function ago(ts) {
  const d = Math.round((Date.now() - ts) / 864e5);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return d + ' days ago';
  return Math.round(d / 30) + ' mo ago';
}
const head = (title, lede, extra = '') => `<div class="page-head"><div><h1>${title}</h1><p class="lede">${lede}</p></div>${extra}</div>`;

/* ---------- theme switch ---------- */
function setTheme(th) {
  state.theme = th;
  document.body.classList.remove('theme-slate', 'theme-ivory-medium');
  if (th !== 'default') document.body.classList.add('theme-' + th);
  document.documentElement.style.colorScheme = th === 'slate' ? 'dark' : 'light';
  $$('.theme-switch button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.theme === th)));
}
$$('.theme-switch button').forEach((b) => b.addEventListener('click', () => { setTheme(b.dataset.theme); render(); }));

/* ---------- pages ---------- */
const pages = {};

pages[''] = () => {
  const counts = ['colour', 'theme', 'type', 'layout', 'radius', 'easing', 'font'].map((g) => [g, byGroup(g).length]);
  const total = state.tokens.length;
  const sections = [
    ['colour', 'Colour', '20-step warm neutral scale, semantic theme tokens, an illustration palette and the logo blue.'],
    ['contrast', 'Contrast', 'Every foreground against every background, graded against WCAG 2.2.'],
    ['type', 'Type', 'Fourteen fluid sizes from 390 px to 1920 px, three font families.'],
    ['layout', 'Spacing & layout', 'Grid, margins, gutters and section spacers at each breakpoint.'],
    ['motion', 'Motion', 'Eight easing curves, plotted and played side by side.'],
    ['components', 'Components', 'Buttons, fields, cards, a table and a dialog built only from tokens.'],
    ['themes', 'Themes', 'Default, ivory medium and slate, compared value by value.'],
    ['playground', 'Playground', 'Recolour the semantic tokens live and export the CSS.'],
  ];
  main.innerHTML = `
    ${head('One set of tokens, every page of wonmor.io', 'This playground loads <code>tokens.css</code> and <code>tokens.json</code> from <code>@wonmor/tokens</code> 0.1.0 and renders every value. Switch the theme at the top right: only the semantic <code>--theme-*</code> tokens change.')}
    <div class="grid g4 mt32">
      <div class="card stat"><b>${total}</b><span>tokens in tokens.json</span></div>
      <div class="card stat"><b>${byGroup('colour').length}</b><span>colours (20 neutrals, 9 illustration, 4 brand)</span></div>
      <div class="card stat"><b>${state.json ? Object.keys(state.json.theme).length : 3}</b><span>themes: default, ivory medium, slate</span></div>
      <div class="card stat"><b>${byGroup('type').length}</b><span>type sizes, 12 of them fluid</span></div>
    </div>
    <h2>Sections</h2>
    <div class="grid g4 mt16">${sections.map(([h, t, d]) => `<a class="card" href="#/${h}"><h3>${t}</h3><p class="small muted mt8">${d}</p></a>`).join('')}</div>
    <h2>Tokens by group</h2>
    <div class="bars mt16">${counts.map(([g, n]) => `<div class="bar"><code>${g}</code><i style="width:${(n / Math.max(...counts.map((c) => c[1]))) * 100}%"></i><span class="small">${n}</span></div>`).join('')}</div>
    <h2>Use it</h2>
    <div class="grid g2 mt16">
      <pre class="snippet">npm install github:wonmortech/design-system

@import "@wonmor/tokens/tokens.css";

body {
  font-family: var(--sans);
  background: var(--theme-background-primary);
  color: var(--theme-foreground-primary);
}</pre>
      <div class="card"><h3>Three rules</h3>
        <ul class="small mt8" style="padding-left:18px;display:grid;gap:8px">
          <li>Components use the semantic <code>--theme-*</code> tokens, never raw <code>--gray-*</code> or hex. That is what makes <code>.theme-slate</code> work on any subtree.</li>
          <li><code>--ill-*</code> colours are for illustrations only, never for UI chrome.</li>
          <li><code>--wm-*</code> colours are for the Wonmor logo only.</li>
        </ul>
      </div>
    </div>`;
};

pages.colour = () => {
  const grays = state.tokens.filter((t) => t.path[1] === 'gray');
  const ill = state.tokens.filter((t) => t.path[1] === 'illustration');
  const brand = state.tokens.filter((t) => t.path[1] === 'brand');
  const sw = (t, big) => `<button class="sw${big ? ' big' : ''}" style="background:${t.value};color:${inkOn(t.value)}" data-copy="var(${t.css})" title="Copy var(${t.css})"><b>${t.path.at(-1)}</b><span>${t.value}</span><span>${t.css}</span></button>`;
  const sem = themeTokens('default');
  main.innerHTML = `
    ${head('Colour', 'Click any swatch to copy its <code>var()</code>. The neutral scale is warm (paper, not white); semantic tokens point into it, and change per theme.')}
    <h2>Neutral scale <span class="cap">--gray-000 … --gray-950</span></h2>
    <div class="ramp mt16">${grays.map((t) => sw(t)).join('')}</div>
    <h2>Semantic tokens in the current theme <span class="cap">(${state.theme})</span></h2>
    <div class="tbl-wrap mt16"><table class="t"><thead><tr><th>Token</th><th>Points to</th><th>Resolved</th><th class="num">vs page bg</th></tr></thead><tbody>
    ${sem.map((t) => { const v = rgbStrToHex(live(t.css)); const bg = rgbStrToHex(live('--theme-background-primary')); const r = contrast(v, bg); return `<tr><td><button class="copy" data-copy="var(${t.css})">${t.css}</button></td><td class="muted small">${esc(refIn(t, state.theme))}</td><td><span class="pip" style="background:${v}"></span><code>${v}</code></td><td class="num">${r.toFixed(2)} : 1</td></tr>`; }).join('')}
    </tbody></table></div>
    <h2>Illustration palette <span class="cap">--ill-*</span></h2>
    <p class="ill-note small muted mt8">For collages and illustrations only, never for buttons, borders or text.</p>
    <div class="grid g3 mt16">${ill.map((t) => sw(t, true)).join('')}</div>
    <div class="grid g3 mt16">${illustration(0)}${illustration(1)}${illustration(2)}</div>
    <h2>Brand <span class="cap">--wm-*</span></h2>
    <p class="ill-note small muted mt8">Logo only. Wonmor Blue is the mark, Ink the wordmark on light backgrounds.</p>
    <div class="grid g4 mt16">${brand.map((t) => sw(t, true)).join('')}</div>`;
};
function refIn(t, theme) {
  const own = state.json.theme[theme]?.[t.path[2]];
  const v = own || t;
  return v.ref ? v.ref : 'fixed ' + v.value;
}
function illustration(i) {
  const sets = [
    ['--ill-oat', '--ill-olive', '--ill-cactus', '--ill-clay'],
    ['--ill-heather', '--ill-lapis', '--ill-sky', '--ill-gold'],
    ['--ill-coral', '--ill-clay', '--ill-gold', '--ill-olive'],
  ][i];
  const titles = ['Fields at dawn', 'Night market', 'Courtyard'];
  return `<figure class="card" style="margin:0"><div class="media" style="background:var(${sets[0]})"><svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <circle cx="${120 - i * 30}" cy="${30 + i * 6}" r="16" fill="var(${sets[3]})"/>
    <path d="M0 70 Q40 ${48 + i * 6} 80 66 T160 60 V100 H0Z" fill="var(${sets[1]})"/>
    <path d="M0 84 Q50 70 100 82 T160 78 V100 H0Z" fill="var(${sets[2]})"/></svg></div>
    <figcaption class="small"><b>${titles[i]}</b><span class="muted"> · ${sets.join(' ')}</span></figcaption></figure>`;
}

pages.contrast = () => {
  const fgs = state.tokens.filter((t) => t.path[0] === 'theme' && t.path[1] === 'default' && /foreground|button-.*-foreground|focus/.test(t.path[2]));
  const bgs = state.tokens.filter((t) => t.path[0] === 'theme' && t.path[1] === 'default' && /background/.test(t.path[2]) && !/button-.*-foreground/.test(t.path[2]));
  const sel = state.pair || { fg: '--theme-foreground-primary', bg: '--theme-background-primary' };
  const opts = (list, cur) => list.map((t) => `<option value="${t.css}"${t.css === cur ? ' selected' : ''}>${t.css}</option>`).join('');
  const fg = rgbStrToHex(live(sel.fg)), bg = rgbStrToHex(live(sel.bg)), r = contrast(fg, bg);
  const pf = (ok) => `<span class="${ok ? 'pass' : 'fail'}">${ok ? 'pass' : 'fail'}</span>`;
  const textFgs = fgs.filter((t) => /^foreground/.test(t.path[2]));
  const pageBgs = bgs.filter((t) => /^background|popup/.test(t.path[2]));
  main.innerHTML = `
    ${head('Contrast', 'Pick a foreground and a background token; the ratio is computed from the values the browser resolves in the current theme (' + state.theme + ').')}
    <div class="grid g2 mt24">
      <div class="card"><div class="grid g2">
        <label class="field">Foreground<select class="input" id="fg">${opts(fgs, sel.fg)}</select></label>
        <label class="field">Background<select class="input" id="bg">${opts(bgs, sel.bg)}</select></label></div>
        <div class="row mt24" style="align-items:baseline"><b style="font-family:var(--serif);font-size:56px;font-weight:420;line-height:1">${r.toFixed(2)}</b><span class="muted">: 1 · ${grade(r)}</span></div>
        <table class="t mt16"><tbody>
          <tr><td>Normal text, AA (4.5)</td><td class="num">${pf(r >= 4.5)}</td></tr>
          <tr><td>Normal text, AAA (7)</td><td class="num">${pf(r >= 7)}</td></tr>
          <tr><td>Large text and UI, AA (3)</td><td class="num">${pf(r >= 3)}</td></tr>
        </tbody></table></div>
      <div class="preview-text" style="background:var(${sel.bg});color:var(${sel.fg})">
        <p style="font-family:var(--serif);font-size:var(--fs-subheadline-2);line-height:1.15">Toshkent kitob bayrami</p>
        <p class="mt16" style="font-size:var(--fs-body-2)">Ochiq kutubxona 12-dekabrda Mirobod tumanida ochiladi. Kirish bepul, roʻyxatdan oʻtish shart emas.</p>
        <p class="mt16" style="font-size:var(--fs-caption-1)">${fg} on ${bg}</p>
      </div>
    </div>
    <h2>Matrix: text tokens on surfaces</h2>
    <div class="tbl-wrap mt16"><table class="t matrix"><thead><tr><th style="text-align:left">Foreground ↓ / background →</th>${pageBgs.map((b) => `<th>${b.css.replace('--theme-', '')}</th>`).join('')}</tr></thead><tbody>
    ${textFgs.map((f) => `<tr><td style="text-align:left"><code>${f.css.replace('--theme-', '')}</code></td>${pageBgs.map((b) => { const x = contrast(rgbStrToHex(live(f.css)), rgbStrToHex(live(b.css))); return `<td class="cell" style="background:var(${b.css});color:var(${f.css})" title="${grade(x)}">${x.toFixed(1)}<br><span style="font-size:10px">${grade(x)}</span></td>`; }).join('')}</tr>`).join('')}
    </tbody></table></div>
    <p class="small muted mt8">The quaternary foreground is meant for disabled and decorative text; it is expected to fail AA.</p>`;
  $('#fg').onchange = $('#bg').onchange = () => { state.pair = { fg: $('#fg').value, bg: $('#bg').value }; render(); };
};

function fluid(t, vw) {
  if (!t.min) return parseFloat(t.value);
  const a = parseFloat(t.min), b = parseFloat(t.max);
  return Math.min(b, Math.max(a, a + (b - a) * ((vw - 390) / 1530)));
}
pages.type = () => {
  const sizes = byGroup('type');
  const fam = state.family;
  main.innerHTML = `
    ${head('Type', 'Fluid sizes interpolate linearly between a 390 px and a 1920 px viewport. Drag the slider to see each size at any width.')}
    <div class="controls mt16"><div class="grid g3">
      <label class="field">Viewport <b id="vwv">${state.viewport} px</b><input class="range" id="vw" type="range" min="390" max="1920" step="10" value="${state.viewport}"></label>
      <label class="field">Family<select class="input" id="fam">${['sans', 'serif', 'mono'].map((f) => `<option${f === fam ? ' selected' : ''}>${f}</option>`).join('')}</select></label>
      <label class="field">Specimen<input class="input" id="spec" value="${esc(state.specimen)}"></label></div></div>
    <div id="specs">${sizes.map((t) => `<div class="spec"><div class="meta"><b>${t.css}</b><span data-size="${t.name}"></span><span>${t.min ? t.min + ' → ' + t.max : 'fixed'}</span></div><div class="sample" data-sample="${t.name}" style="font-family:var(--${fam})">${esc(state.specimen)}</div></div>`).join('')}</div>
    <h2>Families</h2>
    <div class="families mt16">
      ${[['sans', 'Wm Sans', 'Hanken Grotesk (Latin) + Onest (Cyrillic)'], ['serif', 'Wm Serif', 'Source Serif 4'], ['mono', 'Wm Mono', 'JetBrains Mono']].map(([k, n, f]) => `<div class="card family"><div class="cap">var(--${k})</div><div class="glyphs" style="font-family:var(--${k})">Aa Öö Şş Яя</div><b>${n}</b><p class="small muted">${f} · OFL 1.1</p><p class="small mt8" style="font-family:var(--${k})">Oʻzbekiston · Ўзбекистон · 0123456789</p></div>`).join('')}
    </div>`;
  const upd = () => {
    $('#vwv').textContent = state.viewport + ' px';
    for (const t of sizes) {
      const px = fluid(t, state.viewport);
      $(`[data-size="${t.name}"]`).textContent = px.toFixed(1) + ' px at ' + state.viewport;
      $(`[data-sample="${t.name}"]`).style.fontSize = px + 'px';
    }
  };
  upd();
  $('#vw').oninput = (e) => { state.viewport = +e.target.value; upd(); };
  $('#fam').onchange = (e) => { state.family = e.target.value; render(); };
  $('#spec').oninput = (e) => { state.specimen = e.target.value; $$('[data-sample]').forEach((s) => (s.textContent = e.target.value)); };
};

function layoutAt(w) {
  const pick = (t) => {
    let v = t.value;
    for (const [bp, val] of Object.entries(t.breakpoints || {})) if (w >= parseInt(bp.replace(/\D+/g, ''), 10)) v = val;
    return v;
  };
  const o = {};
  for (const t of byGroup('layout')) o[t.path[1]] = pick(t);
  return o;
}
pages.layout = () => {
  main.innerHTML = `
    ${head('Spacing & layout', 'The grid switches from 4 to 12 columns at 768 px; margins and spacers grow at 768 and 1280 px. Drag to simulate a viewport.')}
    <div class="controls mt16"><label class="field">Simulated viewport <b id="lwv"></b><input class="range" id="lw" type="range" min="360" max="1920" step="10" value="${state.layoutWidth}"></label>
      <div class="row mt8">${[390, 768, 1024, 1280, 1440, 1920].map((w) => `<button class="chip" data-w="${w}">${w}</button>`).join('')}</div></div>
    <div class="frame-wrap mt16"><div class="frame" id="frame"></div></div>
    <div class="grid g2 mt24"><div><h3>Values at this width</h3><div class="bars mt16" id="lbars"></div></div>
    <div><h3>Radius</h3><div class="radius-demo mt16">
      <div style="border-radius:var(--radius-media)">--radius-media<br>4px</div>
      <div style="border-radius:var(--radius-card)">--radius-card<br>16px</div>
      <div style="border-radius:var(--radius-card);background:var(--theme-background-secondary);border:1px solid var(--theme-border-secondary);place-items:stretch;padding:10px"><div style="height:auto;border-radius:var(--radius-media);background:var(--ill-sky);padding:0"></div></div>
    </div><p class="small muted mt8">Media inside a card: 4 px on the image, 16 px on the card.</p>
    <h3 class="mt24">Fixed</h3><div class="kv mt8"><span>--grid-max-width</span><b>1920px</b><span>--header-nav-height</span><b>84px</b><span>--reading-width</span><b>660px</b></div></div></div>`;
  const upd = () => {
    const w = state.layoutWidth, L = layoutAt(w);
    $('#lwv').textContent = w + ' px';
    $$('[data-w]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.w === w)));
    const box = $('.frame-wrap').clientWidth - 40;
    const scale = Math.min(1, box / w);
    const fr = $('#frame');
    fr.style.width = w * scale + 'px';
    const cols = +L['grid-columns'], m = parseInt(L['grid-margin'], 10) * scale, g = parseInt(L['grid-gutter'], 10) * scale, hh = 84 * scale;
    fr.innerHTML = `<div class="hdr" style="height:${hh}px"></div><span class="lbl" style="left:6px;top:4px">header 84px</span>
      <div class="cols" style="padding:0 ${m}px;column-gap:${g}px;grid-template-columns:repeat(${cols},1fr);top:${hh}px">${'<i></i>'.repeat(cols)}</div>
      <span class="lbl" style="left:6px;bottom:6px">${cols} columns · margin ${L['grid-margin']} · gutter ${L['grid-gutter']} · scale ${(scale * 100).toFixed(0)}%</span>`;
    const rows = [['grid-columns', cols, 12], ['grid-margin', parseInt(L['grid-margin'], 10), 96], ['grid-gutter', 16, 96], ['page-top-spacer', parseInt(L['page-top-spacer'], 10), 96], ['section-spacer-sm', parseInt(L['section-spacer-sm'], 10), 96], ['section-spacer-lg', parseInt(L['section-spacer-lg'], 10), 96]];
    $('#lbars').innerHTML = rows.map(([k, v, max]) => `<div class="bar"><code>--${k}</code><i style="width:${(v / max) * 100}%"></i><span class="small">${k === 'grid-columns' ? v : v + 'px'}</span></div>`).join('');
  };
  upd();
  $('#lw').oninput = (e) => { state.layoutWidth = +e.target.value; upd(); };
  $$('[data-w]').forEach((b) => (b.onclick = () => { state.layoutWidth = +b.dataset.w; $('#lw').value = b.dataset.w; upd(); }));
};

function bez(v) { return v.slice(v.indexOf('(') + 1, v.lastIndexOf(')')).split(',').map(Number); }
pages.motion = () => {
  const eases = byGroup('easing');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  main.innerHTML = `
    ${head('Motion', 'Each curve is plotted from its <code>cubic-bezier()</code> value. Press play to run a ball with that easing; compare them all in one race below.', `<div class="row"><label class="field" style="min-width:220px">Duration <b id="durv">${state.duration} ms</b><input class="range" id="dur" type="range" min="200" max="2000" step="50" value="${state.duration}"></label><button class="btn" id="all">Play all</button></div>`)}
    ${reduced ? '<p class="warn mt16">Your system asks for reduced motion, so the animations here finish instantly.</p>' : ''}
    <div class="grid g4 mt24">${eases.map((t) => { const [x1, y1, x2, y2] = bez(t.value); const P = (x, y) => `${10 + x * 100},${110 - y * 100}`; return `<div class="card curve"><div class="row spread"><button class="copy" data-copy="var(${t.css})">${t.css}</button><button class="btn sm tertiary" data-play="${t.css}">Play</button></div>
      <svg viewBox="0 0 120 120" aria-label="Curve ${t.value}"><path class="grid-l" d="M10 10V110H110"/><path class="h" d="M${P(0, 0)}L${P(x1, y1)}M${P(1, 1)}L${P(x2, y2)}"/><path class="path" d="M${P(0, 0)}C${P(x1, y1)} ${P(x2, y2)} ${P(1, 1)}"/><circle cx="${10 + x1 * 100}" cy="${110 - y1 * 100}" r="3"/><circle cx="${10 + x2 * 100}" cy="${110 - y2 * 100}" r="3"/></svg>
      <div class="track" data-track="${t.css}"><span class="ball"></span></div><span class="cap">${t.value}</span></div>`; }).join('')}</div>
    <h2>Race</h2>
    <div class="card mt16 compare" id="race">${eases.map((t) => `<div class="lane"><span>${t.css.replace('--ease-', '')}</span><div class="track" data-track="${t.css}"><span class="ball"></span></div></div>`).join('')}</div>
    <h2>In use</h2>
    <div class="grid g3 mt16">
      <a class="card" href="#/motion"><h3>Card hover</h3><p class="small muted mt8">translateY(-3px) over 400 ms <code>--ease-out-quart</code>. Hover me.</p></a>
      <div class="card"><h3>Dialog rise</h3><p class="small muted mt8">420 ms <code>--ease-rise</code>.</p><button class="btn sm mt16" id="dlgdemo">Open dialog</button></div>
      <div class="card"><h3>Theme swap</h3><p class="small muted mt8">300 ms <code>--ease-swap</code> on background and colour. Use the switch at the top.</p></div>
    </div>
    <dialog id="mdlg"><div class="dlg-head"><h3>Rising with --ease-rise</h3></div><div class="dlg-body"><p class="small muted">Opacity and a short lift, so the panel arrives rather than appears.</p></div><div class="dlg-foot"><button class="btn" id="mclose">Close</button></div></dialog>`;
  const play = (tracks) => {
    tracks.forEach((tr) => {
      const ball = $('.ball', tr);
      tr.classList.remove('go');
      ball.style.transition = 'none';
      tr.style.setProperty('--dist', tr.clientWidth - ball.offsetWidth - 10 + 'px');
      void ball.offsetWidth;
      ball.style.transition = `transform ${state.duration}ms var(${tr.dataset.track})`;
      tr.classList.add('go');
    });
  };
  $$('[data-play]').forEach((b) => (b.onclick = () => play($$(`[data-track="${b.dataset.play}"]`))));
  $('#all').onclick = () => play($$('.track'));
  $('#dur').oninput = (e) => { state.duration = +e.target.value; $('#durv').textContent = state.duration + ' ms'; };
  $('#dlgdemo').onclick = () => $('#mdlg').showModal();
  $('#mclose').onclick = () => $('#mdlg').close();
};

const STATUS = { paid: ['Paid', 'strong'], pending: ['Pending', ''], review: ['In review', 'hollow'], overdue: ['Overdue', 'dash'], draft: ['Draft', 'hollow dash'] };
pages.components = () => {
  const f = state.filter;
  const q = f.q.toLowerCase();
  const rows = state.rows.filter((r) => (f.status === 'all' || r.status === f.status) && (!q || (r.name + r.org + r.district).toLowerCase().includes(q)));
  const total = rows.reduce((a, r) => a + r.amount, 0);
  main.innerHTML = `
    ${head('Components', 'Previews built only from tokens. The component package is <b>planned</b>; nothing here is published yet. The sample people, organisations and sums are fictional.', '<span class="preview-label">preview · not published</span>')}
    <h2>Buttons</h2>
    <div class="card mt16"><div class="row"><button class="btn lg">Primary large</button><button class="btn">Primary</button><button class="btn secondary">Secondary</button><button class="btn tertiary">Tertiary</button><button class="btn ghost">Ghost</button><button class="btn sm">Small</button><button class="btn" disabled>Disabled</button></div>
      <p class="cap mt16">Tab through them to see <code>--theme-focus-ring</code>.</p></div>
    <h2>Fields</h2>
    <div class="card mt16"><div class="grid g4">
      <label class="field">Full name<input class="input" value="Dilnoza Rahimova"></label>
      <label class="field">District<select class="input"><option>Mirobod</option><option>Yunusobod</option><option>Chilonzor</option></select></label>
      <label class="field">Amount, soʻm<input class="input" inputmode="numeric" value="2 450 000"></label>
      <label class="field">Phone (invalid)<input class="input" aria-invalid="true" value="+000"><span class="cap">Dashed border marks the error, not a new colour.</span></label>
    </div><div class="row mt16">${Object.entries(STATUS).map(([, [l, c]]) => `<span class="badge ${c}">${l}</span>`).join('')}<label class="row small"><input type="checkbox" checked> Send receipt</label><label class="row small"><input type="radio" name="r" checked> Monthly</label><label class="row small"><input type="radio" name="r"> Once</label></div></div>
    <h2>Cards</h2>
    <div class="grid g3 mt16">${PROJECTS.map((p, i) => `<a class="card" href="#/components"><div class="media" style="background:var(${p.bg})"><svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><circle cx="${40 + i * 25}" cy="40" r="${18 + i * 2}" fill="var(${p.fg})"/><rect x="${90 - i * 10}" y="52" width="70" height="60" rx="4" fill="var(${p.fg2})"/></svg></div><span class="cap">${p.kind} · ${ago(p.updated)}</span><h3 class="mt8">${p.title}</h3><p class="small muted mt8">${p.text}</p></a>`).join('')}</div>
    <h2>Table <span class="cap">${state.rows.length} rows · add, edit, delete</span></h2>
    <div class="toolbar"><input class="input" id="q" placeholder="Search name, organisation, district" value="${esc(f.q)}">
      ${['all', ...Object.keys(STATUS)].map((s) => `<button class="chip" data-status="${s}" aria-pressed="${f.status === s}">${s === 'all' ? 'All' : STATUS[s][0]} <span class="muted">${s === 'all' ? state.rows.length : state.rows.filter((r) => r.status === s).length}</span></button>`).join('')}
      <button class="btn" id="add">Add row</button></div>
    <div class="tbl-wrap">${rows.length ? `<table class="t"><thead><tr><th>#</th><th>Applicant</th><th>Organisation</th><th>District</th><th>Status</th><th class="num">Amount</th><th>Updated</th><th></th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td class="muted">${r.id}</td><td>${esc(r.name)}</td><td>${esc(r.org)}</td><td class="muted">${esc(r.district)}</td><td><span class="badge ${STATUS[r.status][1]}">${STATUS[r.status][0]}</span></td><td class="num">${fmtUZS(r.amount)}</td><td class="muted small">${ago(r.updated)}</td><td class="num"><button class="icon-btn" data-edit="${r.id}">Edit</button><button class="icon-btn" data-del="${r.id}">Delete</button></td></tr>`).join('')}
      </tbody><tfoot><tr><td colspan="5" class="muted small" style="padding:12px">${rows.length} shown</td><td class="num"><b>${fmtUZS(total)}</b></td><td colspan="2"></td></tr></tfoot></table>` : `<div class="empty"><h3>No rows match</h3><p class="small mt8">Clear the search or pick another status. Empty states use the tertiary foreground.</p><button class="btn secondary mt16" id="clear">Clear filters</button></div>`}</div>
    <h2>Header and footer</h2>
    <div class="frame-box mt16"><div class="mock-header"><span class="row"><img src="favicon.svg" alt="" width="22" height="22"><b>Ochiq kutubxona</b></span><nav><span>Kitoblar</span><span>Tadbirlar</span><span>Aʼzolik</span><span>Biz haqimizda</span></nav><button class="btn sm">Aʼzo boʻlish</button></div>
      <div style="padding:40px 20px"><p class="cap">Mirobod, Toshkent</p><p style="font-family:var(--serif);font-size:var(--fs-subheadline-1);line-height:1.1;max-width:640px" class="mt8">Har bir mahallada ochiq kitob javoni</p></div>
      <div class="mock-footer theme-slate" style="background:var(--theme-background-primary)"><div><b>Ochiq kutubxona</b><span>Amir Temur koʻchasi 1, Toshkent</span><span>Fictional organisation, for the preview only.</span></div><div><b>Loyiha</b><span>Kitoblar</span><span>Tadbirlar</span></div><div><b>Hamjamiyat</b><span>Koʻngillilar</span><span>Hamkorlar</span></div><div><b>Huquqiy</b><span>Maxfiylik</span><span>Shartlar</span></div></div></div>
    <dialog id="dlg"><form method="dialog" id="rowform"><div class="dlg-head"><h3 id="dlgt">Add row</h3><p class="small muted mt8">Stored in memory; a reload restores the sample rows.</p></div>
      <div class="dlg-body"><label class="field">Applicant<input class="input" name="name" required></label><label class="field">Organisation<input class="input" name="org" required></label>
      <div class="grid g2"><label class="field">District<select class="input" name="district">${['Mirobod', 'Yunusobod', 'Chilonzor', 'Shayxontohur', 'Yakkasaroy', 'Sergeli', 'Olmazor', 'Uchtepa', 'Bektemir', 'Yashnobod', 'Mirzo Ulugʻbek', 'Yangihayot'].map((d) => `<option>${d}</option>`).join('')}</select></label>
      <label class="field">Status<select class="input" name="status">${Object.entries(STATUS).map(([k, [l]]) => `<option value="${k}">${l}</option>`).join('')}</select></label></div>
      <label class="field">Amount, soʻm<input class="input" name="amount" type="number" min="0" step="1000" required></label></div>
      <div class="dlg-foot"><button class="btn ghost" value="cancel" formnovalidate>Cancel</button><button class="btn" value="ok" id="save">Save</button></div></form></dialog>`;
  $('#q').oninput = (e) => { f.q = e.target.value; render(); const i = $('#q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); };
  $$('[data-status]').forEach((b) => (b.onclick = () => { f.status = b.dataset.status; render(); }));
  const clear = $('#clear');
  if (clear) clear.onclick = () => { f.q = ''; f.status = 'all'; render(); };
  const dlg = $('#dlg'), form = $('#rowform');
  let editing = null;
  const open = (r) => {
    editing = r || null;
    $('#dlgt').textContent = r ? 'Edit row ' + r.id : 'Add row';
    form.reset();
    if (r) for (const k of ['name', 'org', 'district', 'status', 'amount']) form.elements[k].value = r[k];
    dlg.showModal();
  };
  $('#add').onclick = () => open();
  $$('[data-edit]').forEach((b) => (b.onclick = () => open(state.rows.find((r) => r.id === +b.dataset.edit))));
  $$('[data-del]').forEach((b) => (b.onclick = () => { state.rows = state.rows.filter((r) => r.id !== +b.dataset.del); toast('Row ' + b.dataset.del + ' deleted'); render(); }));
  form.addEventListener('submit', (e) => {
    if (e.submitter?.value !== 'ok') return;
    const d = Object.fromEntries(new FormData(form));
    const rec = { name: d.name.trim(), org: d.org.trim(), district: d.district, status: d.status, amount: Math.max(0, Math.round(+d.amount || 0)), updated: Date.now() };
    if (editing) Object.assign(editing, rec); else state.rows.unshift({ id: state.nextId++, ...rec });
    toast(editing ? 'Row ' + editing.id + ' saved' : 'Row added');
    setTimeout(render, 0);
  });
};

pages.themes = () => {
  const names = ['default', 'ivory-medium', 'slate'];
  const keys = themeTokens('default').map((t) => t.path[2]);
  main.innerHTML = `
    ${head('Themes', 'A theme is a class that redefines the semantic tokens on a subtree. The same markup is rendered three times below, once per class.')}
    <div class="grid g3 mt24">${names.map((n) => `<div class="theme-col ${n === 'default' ? '' : 'theme-' + n}"><span class="cap">${n === 'default' ? ':root' : '.theme-' + n}</span><h3>${n === 'default' ? 'Default' : n === 'slate' ? 'Slate' : 'Ivory medium'}</h3>
      <p class="small" style="color:var(--theme-foreground-secondary)">Mahalla kutubxonasi har shanba 10:00 da ochiladi.</p>
      <div class="card"><b>Yangi kitoblar</b><p class="small muted mt8">36 ta kitob qoʻshildi</p></div>
      <div class="row"><button class="btn sm">Primary</button><button class="btn sm secondary">Secondary</button><button class="btn sm tertiary">Tertiary</button></div>
      <div class="kv">${['background-primary', 'background-secondary', 'foreground-primary', 'foreground-secondary', 'border-primary', 'focus-ring'].map((k) => `<span>${k}</span><b>${rgbStrToHex(live('--theme-' + k, n))}</b>`).join('')}</div></div>`).join('')}</div>
    <h2>Every semantic token, side by side</h2>
    <div class="tbl-wrap mt16"><table class="t"><thead><tr><th>Token</th>${names.map((n) => `<th>${n}</th>`).join('')}</tr></thead><tbody>
    ${keys.map((k) => `<tr><td><code>--theme-${k}</code></td>${names.map((n) => { const v = rgbStrToHex(live('--theme-' + k, n)); const changed = n !== 'default' && state.json.theme[n][k]; return `<td><span class="pip" style="background:${v}"></span><code${changed ? ' style="font-weight:700"' : ''}>${v}</code></td>`; }).join('')}</tr>`).join('')}
    </tbody></table></div>
    <p class="small muted mt8">Bold values are overridden by that theme; the rest inherit from <code>:root</code>. Ivory medium changes ${Object.keys(state.json.theme['ivory-medium']).length} tokens, slate ${Object.keys(state.json.theme.slate).length}.</p>`;
};

pages.playground = () => {
  const list = themeTokens('default').filter((t) => /^#/.test(t.value));
  const base = (t) => rgbStrToHex(live(t.css, state.theme));
  const val = (t) => state.overrides[t.css] || base(t);
  const css = () => {
    const e = Object.entries(state.overrides);
    return e.length ? `.theme-custom {\n${e.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}` : '/* Change a colour on the left: the overrides appear here. */';
  };
  main.innerHTML = `
    ${head('Playground', 'Recolour the semantic tokens of the ' + state.theme + ' theme and watch the preview follow. Export the result as a theme class. Changes are in memory only.', `<div class="row"><button class="btn secondary" id="preset">Try a lapis preset</button><button class="btn tertiary" id="reset">Reset</button></div>`)}
    <div class="pg mt24">
      <div class="card"><div class="pg-list">${list.map((t) => `<label class="pg-item${state.overrides[t.css] ? ' changed' : ''}" title="${t.css}"><input type="color" data-k="${t.css}" value="${val(t)}"><span>${t.css.replace('--theme-', '')}</span><input type="text" data-t="${t.css}" value="${val(t)}" spellcheck="false" aria-label="${t.css} hex"></label>`).join('')}</div>
        <label class="field mt16">--radius-card <b id="radv">${state.radius ?? 16}px</b><input class="range" id="rad" type="range" min="0" max="32" value="${state.radius ?? 16}"></label></div>
      <div class="pg-preview"><div class="stage" id="stage">
        <span class="cap">Toshkent · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span>
        <p style="font-family:var(--serif);font-size:var(--fs-subheadline-1);line-height:1.08">Mahalla uchun ochiq maʼlumot</p>
        <p style="color:var(--theme-foreground-secondary);font-size:var(--fs-body-2)">Masjidlar, maktablar va kutubxonalar xaritasi, manbasi bilan.</p>
        <div class="grid g2"><div class="card"><b>2 289</b><p class="small muted">masjid nuqtasi</p></div><div class="card" style="background:var(--theme-popup-background)"><b>39</b><p class="small muted">harf qatori</p></div></div>
        <div class="row"><button class="btn">Xaritani ochish</button><button class="btn secondary">Yuklab olish</button><button class="btn tertiary">Manba</button></div>
        <label class="field">Qidiruv<input class="input" placeholder="Masjid nomi"></label>
        <div id="pgwarn"></div></div>
        <label class="field mt16">Exported CSS<textarea class="input code" id="out" readonly>${css()}</textarea></label>
        <div class="row mt8"><button class="btn sm" id="copycss">Copy CSS</button><a class="btn sm secondary" id="dl" download="theme-custom.css" href="#">Download .css</a></div></div>
    </div>`;
  const stage = $('#stage');
  const apply = () => {
    for (const [k, v] of Object.entries(state.overrides)) stage.style.setProperty(k, v);
    if (state.radius != null) stage.style.setProperty('--radius-card', state.radius + 'px');
    $('#out').value = css() + (state.radius != null ? `\n/* --radius-card: ${state.radius}px */` : '');
    const fg = state.overrides['--theme-foreground-primary'] || rgbStrToHex(live('--theme-foreground-primary'));
    const bg = state.overrides['--theme-background-primary'] || rgbStrToHex(live('--theme-background-primary'));
    const bf = state.overrides['--theme-button-primary-foreground'] || rgbStrToHex(live('--theme-button-primary-foreground'));
    const bb = state.overrides['--theme-button-primary-background'] || rgbStrToHex(live('--theme-button-primary-background'));
    const w = [];
    const r1 = contrast(fg, bg), r2 = contrast(bf, bb);
    if (r1 < 4.5) w.push(`Body text on the page is ${r1.toFixed(2)} : 1, below AA (4.5).`);
    if (r2 < 4.5) w.push(`Primary button label is ${r2.toFixed(2)} : 1, below AA (4.5).`);
    $('#pgwarn').innerHTML = w.length ? `<p class="warn">${w.join(' ')}</p>` : `<p class="cap">Body text ${r1.toFixed(2)} : 1 · button ${r2.toFixed(2)} : 1 · both pass AA.</p>`;
    $('#dl').href = 'data:text/css;charset=utf-8,' + encodeURIComponent($('#out').value);
  };
  const set = (k, v) => {
    if (!/^#[0-9a-f]{6}$/i.test(v)) return;
    state.overrides[k] = v.toLowerCase();
    $(`[data-k="${k}"]`).value = v; $(`[data-t="${k}"]`).value = v;
    $(`[data-k="${k}"]`).closest('.pg-item').classList.add('changed');
    apply();
  };
  $$('[data-k]').forEach((i) => (i.oninput = () => set(i.dataset.k, i.value)));
  $$('[data-t]').forEach((i) => (i.onchange = () => set(i.dataset.t, i.value.trim())));
  $('#rad').oninput = (e) => { state.radius = +e.target.value; $('#radv').textContent = state.radius + 'px'; apply(); };
  $('#reset').onclick = () => { state.overrides = {}; state.radius = null; render(); toast('Playground reset'); };
  $('#preset').onclick = () => {
    Object.assign(state.overrides, { '--theme-background-primary': '#eef2f8', '--theme-background-secondary': '#e2e9f4', '--theme-foreground-primary': '#14213d', '--theme-foreground-secondary': '#33476b', '--theme-button-primary-background': '#3e5f9a', '--theme-button-primary-border': '#3e5f9a', '--theme-button-primary-foreground': '#ffffff', '--theme-border-secondary': '#c9d4e6' });
    state.radius = 24;
    render();
  };
  $('#copycss').onclick = () => copy($('#out').value);
  apply();
};

pages.tokens = () => {
  const f = state.filter;
  const groups = ['all', 'colour', 'theme', 'type', 'layout', 'radius', 'easing', 'font'];
  const q = f.tq?.toLowerCase() || '';
  const list = state.tokens.filter((t) => (f.group === 'all' || groupOf(t) === f.group) && (!q || (t.name + t.css + t.value).toLowerCase().includes(q)));
  main.innerHTML = `
    ${head('All tokens', `${state.tokens.length} entries from <code>tokens.json</code>. Theme overrides are listed under their theme. Click a name to copy its <code>var()</code>.`, `<a class="btn secondary" href="tokens/tokens.json" download>tokens.json</a>`)}
    <div class="toolbar"><input class="input" id="tq" placeholder="Search token, value or custom property" value="${esc(f.tq || '')}">${groups.map((g) => `<button class="chip" data-g="${g}" aria-pressed="${f.group === g}">${g} <span class="muted">${g === 'all' ? state.tokens.length : byGroup(g).length}</span></button>`).join('')}</div>
    <div class="tbl-wrap">${list.length ? `<table class="t"><thead><tr><th>JSON path</th><th>Custom property</th><th>Value</th><th>Ref / breakpoints</th></tr></thead><tbody>
    ${list.map((t) => `<tr><td><code>${t.name}</code></td><td><button class="copy" data-copy="var(${t.css})">${t.css}</button></td><td>${/^#/.test(t.value) ? `<span class="pip" style="background:${t.value}"></span>` : ''}<code>${esc(t.value)}</code></td><td class="muted small">${t.ref ? '<code>' + t.ref + '</code>' : ''}${t.breakpoints ? Object.entries(t.breakpoints).map(([k, v]) => `${k}: ${v}`).join(' · ') : ''}${t.min ? `${t.min} → ${t.max}` : ''}</td></tr>`).join('')}
    </tbody></table>` : '<div class="empty"><h3>No token matches</h3><p class="small mt8">Try “gray”, “ease” or “#141413”.</p></div>'}</div>`;
  $('#tq').oninput = (e) => { f.tq = e.target.value; render(); const i = $('#tq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); };
  $$('[data-g]').forEach((b) => (b.onclick = () => { f.group = b.dataset.g; render(); }));
};

/* ---------- router ---------- */
function route() { return (location.hash.replace(/^#\/?/, '').split(/[/?]/)[0] || ''); }
let last = null;
function render() {
  const r = route();
  const fn = pages[r] || pages[''];
  fn();
  $$('.side a').forEach((a) => (a.getAttribute('href') === '#/' + r ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  if (last !== r) { window.scrollTo(0, 0); last = r; document.title = (r ? $(`.side a[href="#/${r}"]`)?.textContent + ' · ' : '') + 'Wonmor tokens playground'; }
}
window.addEventListener('hashchange', render);
window.addEventListener('resize', () => { if (route() === 'layout') render(); });

async function boot() {
  try {
    const res = await fetch('tokens/tokens.json');
    state.json = await res.json();
    state.tokens = flatten(state.json);
    const p = new URLSearchParams(location.search);
    if (['slate', 'ivory-medium'].includes(p.get('theme'))) setTheme(p.get('theme'));
    render();
  } catch (e) {
    main.innerHTML = `<div class="empty"><h3>Could not load tokens.json</h3><p class="small mt8">${esc(e.message)}</p></div>`;
  }
  document.documentElement.dataset.ready = '1';
}
boot();
