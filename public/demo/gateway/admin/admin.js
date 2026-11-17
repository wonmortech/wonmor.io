'use strict';
// gateway admin: overview, audit with full request/response, agents, connectors, playground, settings.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const api = async (p, opt = {}) => {
  const r = await fetch(`/admin/api${p}`, { ...opt, headers: { 'content-type': 'application/json', ...(opt.headers || {}) }, body: opt.body ? JSON.stringify(opt.body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
};
const store = { get: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* blocked */ } } };

// ---------------------------------------------------------------- formatting
const num = (n) => (n ?? 0).toLocaleString('en-US').replace(/,/g, ' ');
const bytes = (n) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);
const ms = (n) => (n >= 10000 ? `${(n / 1000).toFixed(1)} s` : `${num(n)} ms`);
const sameDay = (t) => new Date(t).toDateString() === new Date().toDateString();
const hhmmss = (t) => new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const when = (t) => (sameDay(t) ? hhmmss(t) : `${new Date(t).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} ${hhmmss(t).slice(0, 5)}`);
const full = (t) => new Date(t).toLocaleString('ru-RU');
const ago = (t) => { if (!t) return 'hech qachon'; const s = (Date.now() - t) / 1000; return s < 5 ? 'hozirgina' : s < 60 ? `${s | 0} s oldin` : s < 3600 ? `${(s / 60) | 0} daq oldin` : s < 86400 ? `${(s / 3600) | 0} soat oldin` : `${(s / 86400) | 0} kun oldin`; };
const dur = (s) => (s < 3600 ? `${(s / 60) | 0} daq` : s < 86400 ? `${(s / 3600) | 0} soat ${((s % 3600) / 60) | 0} daq` : `${(s / 86400) | 0} kun ${((s % 86400) / 3600) | 0} soat`);
const dayOf = (t) => new Date(t).toISOString().slice(0, 10);
const MASK = {
  pinfl: ['PINFL', '30**********36'], passport: ['Pasport', 'AB*****67'], phone: ['Telefon', '+998 ** *** ** 45'], email: ['Email', 'n***@mail.uz'],
  card: ['Bank karta', '**** **** **** 1234'], secret: ['Token / parol / JWT', '[token]'], inn: ['INN (STIR)', '48*****63'],
};
const STATUS = { ok: ['ok', 'ok'], 'tool-error': ['tool xatosi', 'bad'], error: ['ulanmadi', 'bad'], denied: ['ruxsat yo\'q', 'warn'], killed: ['kill-switch', 'bad'], paused: ['pauza', 'warn'], rate: ['limit', 'warn'], unknown: ["noma'lum tool", 'warn'], expired: ['token eskirgan', 'bad'], ip: ['IP taqiq', 'bad'], arg: ['argument taqiq', 'warn'], admin: ['admin', 'adm'] };
const chip = (s) => { const [l, c] = STATUS[s] || [s || '?', '']; return `<span class="chip ${c}">${esc(l)}</span>`; };
const maskLabel = (k) => MASK[k]?.[0] || (k.startsWith('c:') ? S?.customMasks?.find((m) => `c:${m.id}` === k)?.name || 'maxsus niqob' : k);
const maskChips = (m) => Object.entries(m || {}).map(([k, n]) => `<span class="chip acc" title="niqoblandi">${esc(maskLabel(k))} ×${n}</span>`).join(' ');
const outcome = (e) => (e.type === 'admin' ? '' : e.rows !== undefined ? `${num(e.rows)} qator` : e.bytes ? bytes(e.bytes) : '—');

// ---------------------------------------------------------------- toasts / modal
function toast(msg, bad = false) {
  const el = document.createElement('div');
  el.className = `toast ${bad ? 'bad' : ''}`;
  el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), bad ? 6000 : 3000);
}
let modalDone = null;
function modal(html, onMount) {
  $('#modalBody').innerHTML = html;
  $('#modal').hidden = false;
  onMount?.($('#modalBody'));
  setTimeout(() => $('#modalBody').querySelector('[autofocus], input:not([type=hidden]), textarea, button.btn')?.focus(), 30);
  return new Promise((res) => { modalDone = res; });
}
function closeModal(v) { $('#modal').hidden = true; $('#modalBody').innerHTML = ''; const d = modalDone; modalDone = null; d?.(v); }
$('#modal').addEventListener('mousedown', (e) => { if (e.target.id === 'modal') closeModal(null); });
// confirm / prompt replacement
function ask({ title, text = '', input = null, placeholder = '', ok = 'Tasdiqlash', danger = false, required = false }) {
  return modal(`<h2>${esc(title)}</h2>${text ? `<p class="lead">${text}</p>` : ''}
    ${input !== null ? `<input id="askIn" style="width:100%" value="${esc(input)}" placeholder="${esc(placeholder)}" autofocus>` : ''}
    <div class="foot"><button class="btn ghost" type="button" data-x="cancel">Bekor</button><button class="btn ${danger ? 'danger' : ''}" type="button" data-x="ok">${esc(ok)}</button></div>`, (root) => {
    const go = () => { const v = input !== null ? $('#askIn', root).value.trim() : true; if (required && !v) { $('#askIn', root).focus(); return; } closeModal(v); };
    root.querySelector('[data-x=ok]').onclick = go;
    root.querySelector('[data-x=cancel]').onclick = () => closeModal(null);
    root.querySelector('#askIn')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });
}
const copy = async (text, what = 'Nusxa olindi') => { try { await navigator.clipboard.writeText(text); toast(what); } catch { toast('Nusxa olib bo\'lmadi', true); } };

// ---------------------------------------------------------------- state
let S = null; // server state
let ST = null; // stats
let feed = []; // recent light entries (overview)
let lastId = 0;
const view = () => (location.hash.replace(/^#/, '').split(/[?=]/)[0] || 'overview');

// ---------------------------------------------------------------- routing
function route() {
  let v = view();
  const m = /^#call=(\d+)/.exec(location.hash);
  if (m) { openCall(+m[1]); v = 'audit'; history.replaceState(null, '', '#audit'); }
  if (!$(`.view[data-view="${v}"]`)) v = 'overview';
  $$('.view').forEach((s) => { s.hidden = s.dataset.view !== v; });
  $$('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.view === v));
  if (v === 'audit' && !audit.loaded) loadAudit();
  if (v === 'settings') loadAdminLog();
  if (v === 'playground') renderPlayground();
  if (v === 'agents') renderAgents();
  if (v === 'connectors') renderConnectors();
}
addEventListener('hashchange', route);

// ---------------------------------------------------------------- render: chrome (top bar, banners)
function renderChrome() {
  if (!S) return;
  $('#killed').hidden = !S.killed;
  if (S.killed) $('#killedWhy').textContent = `${S.killed.reason ? `Sabab: ${S.killed.reason}. ` : ''}(${ago(S.killed.at)})`;
  const off = Object.keys(MASK).filter((k) => k !== 'inn' && !S.mask[k]);
  $('#maskWarn').hidden = !off.length;
  $('#maskWarnList').textContent = off.map((k) => MASK[k][0]).join(', ');
  $('#cAgents').textContent = S.agents.length || '';
  const on = S.connectors.filter((c) => c.online && c.enabled).length;
  $('#cConns').textContent = S.connectors.length ? `${on}/${S.connectors.length}` : '';
  $('#kill').hidden = !!S.killed;
}

// ---------------------------------------------------------------- overview
function delta(cur, prev) {
  if (!prev) return '';
  const d = Math.round(((cur - prev) / prev) * 100);
  return `<span class="d ${d > 0 ? 'up' : d < 0 ? 'down' : 'flat'}" title="kecha: ${num(prev)}">${d > 0 ? '▲' : d < 0 ? '▼' : '='} ${Math.abs(d)}%</span>`;
}
function renderTiles() {
  if (!ST) return;
  const s = ST;
  const rate = s.calls ? Math.round((s.ok / s.calls) * 1000) / 10 : null;
  const tiles = [
    ['', num(s.calls), 'chaqiruv bugun', delta(s.calls, s.yesterday.calls)],
    [rate === null ? '' : rate >= 95 ? 'ok' : rate >= 80 ? 'warn' : 'bad', rate === null ? '—' : `${rate}<small>%</small>`, 'muvaffaqiyat', ''],
    [s.error ? 'bad' : '', num(s.error), 'xato', ''],
    [s.denied ? 'warn' : '', num(s.denied), 'rad etildi', ''],
    ['acc', num(s.maskedTotal), 'niqoblangan qiymat', ''],
    ['', `${num(s.p50)}<small> ms</small>`, 'p50 kechikish', ''],
    ['', `${num(s.p95)}<small> ms</small>`, 'p95 kechikish', ''],
    ['', `${s.activeAgents}<small> / ${S?.agents.length ?? '–'}</small>`, 'faol agent', ''],
  ];
  $('#tiles').innerHTML = tiles.map(([c, v, l, d]) => `<div class="tile ${c}">${d}<b>${v}</b><span>${l}</span></div>`).join('');
}
function renderChart() {
  if (!ST) return;
  const W = 720, H = 180, P = { l: 30, r: 6, t: 8, b: 22 };
  const data = ST.series;
  const max = Math.max(4, ...data.map((d) => d.ok + d.error + d.denied));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const bw = (W - P.l - P.r) / data.length;
  const y = (v) => H - P.b - (v / top) * (H - P.t - P.b);
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = (top / 4) * i; g += `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${P.l - 6}" y="${y(v) + 3}" text-anchor="end">${Math.round(v)}</text>`; }
  data.forEach((d, i) => {
    const x = P.l + i * bw + 2, w = bw - 4;
    let base = 0, bars = '';
    for (const [k, cls] of [['ok', 'b-ok'], ['error', 'b-err'], ['denied', 'b-den']]) {
      if (!d[k]) continue;
      bars += `<rect class="${cls}" x="${x}" y="${y(base + d[k])}" width="${w}" height="${y(base) - y(base + d[k])}" rx="2"/>`;
      base += d[k];
    }
    const h = new Date(d.t).getHours();
    g += `<g class="col"><rect class="hit" x="${P.l + i * bw}" y="${P.t}" width="${bw}" height="${H - P.t - P.b}"/>${bars}<title>${String(h).padStart(2, '0')}:00 — ${d.ok} ok, ${d.error} xato, ${d.denied} rad</title></g>`;
    if (i % 3 === 0 || i === data.length - 1) g += `<text class="ax" x="${x + w / 2}" y="${H - 6}" text-anchor="middle">${String(h).padStart(2, '0')}</text>`;
  });
  $('#chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Soatlik chaqiruvlar">${g}</svg>`;
}
function healthBar(h, len = 60) {
  const cells = h.slice(-len);
  return `<div class="hbar" title="oxirgi ${cells.length} tekshiruv (har daqiqada)">${Array.from({ length: len - cells.length }, () => '<i class="n"></i>').join('')}${cells.map((x) => `<i class="${x ? '' : 'x'}"></i>`).join('')}</div>`;
}
function renderHealth() {
  if (!S) return;
  $('#sysLine').textContent = `v${S.version} · ${S.tools} tool · ishlayapti ${dur(S.uptime)}`;
  $('#health').innerHTML = S.connectors.map((c) => `
    <div class="hrow"><span class="dot ${!c.enabled ? 'pause' : c.online ? 'on' : 'off'}"></span>
      <div><b>${esc(c.name)}</b> <span class="muted small">${!c.enabled ? "o'chirilgan" : c.online ? `online · ${c.latency} ms` : `offline · ${esc(c.lastErr.slice(0, 80))}`}</span></div>
      <span class="muted small">${c.uptime === null ? '' : `${c.uptime}% uptime`}</span>
      ${healthBar(c.health)}</div>`).join('') || '<p class="muted small">Konnektor yo\'q.</p>';
  $('#inflight').innerHTML = S.inflight?.length
    ? S.inflight.map((x) => `<div class="it"><span class="spin"></span><b>${esc(x.agent)}</b> → <span class="mono">${esc(x.tool)}</span><span class="muted small grow" data-since="${x.ts}">${ms(Date.now() - x.ts)}</span></div>`).join('')
    : '<p class="muted small">Hozir chaqiruv yo\'q.</p>';
}
function renderTops() {
  if (!ST) return;
  const max = Math.max(1, ...ST.byTool.map((t) => t.calls));
  $('#topTools').innerHTML = ST.byTool.length ? `<thead><tr><th>Tool</th><th class="num">Chaqiruv</th><th class="num">Xato</th><th class="num">p95</th><th class="num">Qator</th></tr></thead><tbody>${ST.byTool.map((t) => `
    <tr class="click" data-filter-tool="${esc(t.name)}"><td><span class="bar-mini" style="width:${Math.max(4, (t.calls / max) * 60)}px"></span><span class="mono">${esc(t.name)}</span></td><td class="num">${num(t.calls)}</td>
    <td class="num ${t.error + t.denied ? 'down' : ''}">${t.error + t.denied ? num(t.error + t.denied) : '—'}</td><td class="num">${ms(t.p95)}</td><td class="num">${t.rows ? num(t.rows) : '—'}</td></tr>`).join('')}</tbody>` : '<tbody><tr><td class="muted">Bugun chaqiruv yo\'q.</td></tr></tbody>';
  $('#topAgents').innerHTML = ST.byAgent.length ? `<thead><tr><th>Agent</th><th class="num">Chaqiruv</th><th class="num">Xato</th><th class="num">p95</th><th class="num">Oxirgi</th></tr></thead><tbody>${ST.byAgent.map((t) => `
    <tr class="click" data-filter-agent="${esc(t.name)}"><td><b>${esc(t.name)}</b></td><td class="num">${num(t.calls)}</td><td class="num ${t.error + t.denied ? 'down' : ''}">${t.error + t.denied ? num(t.error + t.denied) : '—'}</td><td class="num">${ms(t.p95)}</td><td class="num muted">${ago(t.last)}</td></tr>`).join('')}</tbody>` : '<tbody><tr><td class="muted">—</td></tr></tbody>';
}
function feedItem(e, fresh) {
  return `<li class="${fresh ? 'new' : ''}" data-call="${e.id}" data-day="${dayOf(e.ts)}">
    <span class="t">${when(e.ts)}</span>
    <span class="who"><b>${esc(e.agent)}</b> → <span class="mono">${esc(e.tool)}</span></span>
    <span>${chip(e.status)} <span class="muted small">${e.type === 'admin' ? '' : ms(e.ms)}</span></span>
    <span class="args mono">${esc(e.args)}</span></li>`;
}
function renderFeed() {
  $('#feed').innerHTML = feed.slice(-60).reverse().map((e) => feedItem(e, false)).join('') || '<li class="empty">Hali chaqiruv yo\'q. Agentni ulang va undan biror narsa so\'rang.</li>';
}
let statsTimer = null;
async function loadStats() {
  try { ST = await api('/stats'); renderTiles(); renderChart(); renderTops(); if (view() === 'agents') renderAgents(); } catch { /* next tick */ }
}
const statsSoon = () => { clearTimeout(statsTimer); statsTimer = setTimeout(loadStats, 1200); };

// 3D panel toggle
function apply3d() { const off = store.get('gw-3d-off', false); $('#stageCard').classList.toggle('collapsed', off); $('#toggle3d').textContent = off ? "ko'rsatish" : 'yashirish'; }
$('#toggle3d').onclick = () => { store.set('gw-3d-off', !store.get('gw-3d-off', false)); apply3d(); };
apply3d();

// ---------------------------------------------------------------- audit table
const audit = { items: [], more: false, loaded: false, busy: false };
function auditParams(extra = {}) {
  const f = new FormData($('#filters'));
  const q = new URLSearchParams();
  for (const k of ['q', 'days', 'agent', 'tool', 'status', 'sid']) { const v = String(f.get(k) || '').trim(); if (v) q.set(k, v); }
  for (const [k, v] of Object.entries(extra)) q.set(k, v);
  return q;
}
function auditRow(e, fresh) {
  return `<tr class="click ${fresh ? 'new' : ''}" data-call="${e.id}" data-day="${dayOf(e.ts)}">
    <td title="${esc(full(e.ts))}">${when(e.ts)}</td><td><b>${esc(e.agent)}</b>${e.origin === 'playground' ? ' <span class="chip adm">playground</span>' : ''}</td>
    <td class="mono">${esc(e.tool)}</td><td>${chip(e.status)} ${maskChips(e.masked)}${e.maskOff ? ' <span class="chip warn" title="niqob o\'chiq edi">niqob o\'chiq</span>' : ''}</td>
    <td class="num">${e.type === 'admin' ? '' : num(e.ms)}</td><td class="num">${outcome(e)}</td>
    <td class="ell mono" title="${esc(e.args)}">${esc(e.err && e.status !== 'tool-error' ? e.err : e.args)}</td></tr>`;
}
function renderAudit() {
  const tb = $('#audit tbody');
  tb.innerHTML = audit.items.map((e) => auditRow(e)).join('') || '<tr><td colspan="7" class="muted" style="text-align:center;padding:30px">Filtrga mos yozuv yo\'q.</td></tr>';
  $('#aMore').hidden = !audit.more;
  renderAuditSummary();
}
function renderAuditSummary() {
  const g = { ok: 0, error: 0, denied: 0, admin: 0 };
  for (const e of audit.items) g[e.status === 'ok' ? 'ok' : e.status === 'admin' ? 'admin' : ['denied', 'killed', 'paused', 'rate', 'unknown', 'expired', 'ip', 'arg'].includes(e.status) ? 'denied' : 'error']++;
  $('#aSummary').innerHTML = `<span><b>${num(audit.items.length)}</b>${audit.more ? '+' : ''} yozuv</span><span class="up">${num(g.ok)} ok</span><span class="down">${num(g.error)} xato</span><span style="color:var(--warn)">${num(g.denied)} rad</span>${g.admin ? `<span style="color:var(--a2)">${num(g.admin)} admin</span>` : ''}<span class="grow"></span>${$('#filters').sid.value ? `<span class="chip adm">sessiya ${esc($('#filters').sid.value.slice(0, 8))} <a href="#" data-clear-sid title="olib tashlash">✕</a></span>` : ''}<span>Qatorni bosing — so'rov va javob to'liq ochiladi</span>`;
}
async function loadAudit(more = false) {
  if (audit.busy) return;
  audit.busy = true;
  try {
    const extra = { limit: 200 };
    if (more && audit.items.length) extra.before = audit.items.at(-1).id;
    const r = await api(`/history?${auditParams(extra)}`);
    audit.items = more ? [...audit.items, ...r.items] : r.items;
    audit.more = r.more;
    audit.loaded = true;
    renderAudit();
  } catch (e) { toast(e.message, true); } finally { audit.busy = false; }
}
function matchesFilters(e) {
  const f = new FormData($('#filters'));
  if (f.get('agent') && e.agent !== f.get('agent')) return false;
  if (f.get('tool') && e.tool !== f.get('tool')) return false;
  if (f.get('sid') && e.sid !== f.get('sid')) return false;
  const st = f.get('status');
  if (st) { const g = e.status === 'ok' ? 'ok' : e.status === 'admin' ? 'admin' : ['denied', 'killed', 'paused', 'rate', 'unknown', 'expired', 'ip', 'arg'].includes(e.status) ? 'denied' : 'error'; if (g !== st) return false; }
  const q = String(f.get('q') || '').trim().toLowerCase();
  if (q && !`${e.agent} ${e.tool} ${e.args} ${e.err} ${e.preview || ''} ${e.ip} ${e.client || ''}`.toLowerCase().includes(q)) return false;
  return true;
}
function auditPush(e) {
  if (!audit.loaded || !$('#filters').live.checked || !matchesFilters(e)) return;
  audit.items.unshift(e);
  const tb = $('#audit tbody');
  if (tb.querySelector('td[colspan]')) tb.innerHTML = '';
  tb.insertAdjacentHTML('afterbegin', auditRow(e, true));
  renderAuditSummary();
}
function fillFilterOptions() {
  if (!S) return;
  const f = $('#filters');
  const setOpts = (sel, list, label) => { const cur = sel.value; sel.innerHTML = `<option value="">${label}</option>` + list.map((v) => `<option ${v === cur ? 'selected' : ''}>${esc(v)}</option>`).join(''); if (cur && !list.includes(cur)) { sel.insertAdjacentHTML('beforeend', `<option selected>${esc(cur)}</option>`); } };
  setOpts(f.agent, [...S.agents.map((a) => a.name), 'admin'], 'hamma agent');
  setOpts(f.tool, S.connectors.flatMap((c) => c.tools.map((t) => t.full)), 'hamma tool');
}
let qTimer = null;
$('#filters').addEventListener('input', (e) => { if (e.target.name === 'q') { clearTimeout(qTimer); qTimer = setTimeout(() => loadAudit(), 300); } });
$('#filters').addEventListener('change', (e) => { if (e.target.name !== 'live' && e.target.name !== 'q') loadAudit(); });
$('#filters').addEventListener('submit', (e) => { e.preventDefault(); loadAudit(); });
$('#fReset').onclick = () => { $('#filters').reset(); loadAudit(); };
$('#aMore').onclick = () => loadAudit(true);
$$('[data-export]').forEach((b) => { b.onclick = () => { const q = auditParams({ limit: 5000, format: b.dataset.export }); location.href = `/admin/api/history?${q}`; }; });
function filterAudit(k, v) {
  const f = $('#filters');
  f.reset();
  f[k].value = v;
  if (f[k].value !== v) { f[k].insertAdjacentHTML('beforeend', `<option selected>${esc(v)}</option>`); }
  f.days.value = '7';
  location.hash = '#audit';
  loadAudit();
}

// ---------------------------------------------------------------- response / request renderers
const MASKED_RE = /(\[jwt\]|\[token\]|\+998 \*\* \*\*\* \*\* \d\d|\*{4} \*{4} \*{4} \d{4}|\b[\w.%+-]{0,3}\*{3,}[\w.@-]*|\*\*\*)/g;
const markMasked = (h) => h.replace(MASKED_RE, '<mark class="m" title="gateway niqobladi">$1</mark>');
function splitRow(line) {
  const cells = [];
  let cur = '';
  const s = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i++; } else if (s[i] === '|') { cells.push(cur.trim()); cur = ''; } else cur += s[i];
  }
  cells.push(cur.trim());
  return cells;
}
let tblSeq = 0;
const tables = new Map();
const cellHtml = (c) => (c === 'NULL' ? '<td class="null">NULL</td>' : `<td class="${/^-?\d+(\.\d+)?$/.test(c) ? 'n' : ''}" title="${esc(c)}">${markMasked(esc(c))}</td>`);
const isMasked = (c) => new RegExp(MASKED_RE.source).test(c || '');
function tableHtml(id, vertical) {
  const [head, ...body] = tables.get(id);
  const tb = `<div class="tb"><span>${num(body.length)} qator · ${head.length} ustun</span><span><button class="s" type="button" data-flip="${id}">${vertical ? '⇆ jadval' : '⇅ vertikal'}</button> <button class="s" type="button" data-copytbl="${id}">TSV nusxa</button></span></div>`;
  if (vertical) {
    // column | value per record: readable for wide rows such as SELECT *
    const recs = body.slice(0, 50);
    return `${tb}<div class="rtbl"><table class="vert">${recs.map((r, i) => `${body.length > 1 ? `<tr><th colspan="2">#${i + 1}</th></tr>` : '<tr><th>ustun</th><th>qiymat</th></tr>'}${head.map((h, j) => `<tr class="${isMasked(r[j]) ? 'hit' : ''}"><td>${esc(h)}</td>${cellHtml(r[j] ?? '')}</tr>`).join('')}`).join('')}</table></div>${body.length > recs.length ? `<p class="foot">Vertikal ko'rinishda ${recs.length} yozuv.</p>` : ''}`;
  }
  const shown = body.slice(0, 1000);
  return `${tb}<div class="rtbl"><table><thead><tr><th class="muted">#</th>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${shown.map((r, i) => `<tr><td class="muted n">${i + 1}</td>${r.map(cellHtml).join('')}</tr>`).join('')}</tbody></table></div>
    ${body.length > shown.length ? `<p class="foot">Faqat ${shown.length} qator ko'rsatildi.</p>` : ''}`;
}
function renderTable(lines) {
  const head = splitRow(lines[0]);
  const body = lines.slice(2).map(splitRow);
  const id = `t${++tblSeq}`;
  tables.set(id, [head, ...body]);
  if (tables.size > 40) tables.delete(tables.keys().next().value);
  return `<div data-tbl="${id}">${tableHtml(id, body.length <= 3 && head.length > 8)}</div>`;
}
function renderPre(lines) {
  const h = lines.map((l) => {
    const e = markMasked(esc(l));
    if (/^\+(?!\+\+)/.test(l)) return `<span class="dl-add">${e}</span>`;
    if (/^-(?!--)/.test(l)) return `<span class="dl-del">${e}</span>`;
    if (/^(\+\+\+|---|@@)/.test(l)) return `<span class="dl-hdr">${e}</span>`;
    return e;
  }).join('\n').replace(/^\n+|\n+$/g, '');
  return h ? `<pre>${h}</pre>` : '';
}
function renderResult(text) {
  if (!text) return '<p class="muted">Javob matni yo\'q.</p>';
  const lines = String(text).split(/\r?\n/);
  let out = '', buf = [];
  const flush = () => { if (buf.length) out += renderPre(buf); buf = []; };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*\|.*\|\s*$/.test(l) && /^\s*\|[\s:|-]*-[\s:|-]*\|\s*$/.test(lines[i + 1] || '')) {
      flush();
      const block = [l, lines[i + 1]];
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) block.push(lines[i++]);
      i--;
      out += renderTable(block);
      continue;
    }
    const m = /^(#{1,3})\s+(.*)$/.exec(l);
    if (m) { flush(); out += `<h4>${markMasked(esc(m[2]))}</h4>`; continue; }
    if (/^\d+ qator\b.*ROLLBACK/.test(l) || /^\d+ qator · /.test(l)) { flush(); out += `<p class="foot">${esc(l)}</p>`; continue; }
    buf.push(l);
  }
  flush();
  return out;
}
const SQL_KW = /\b(select|from|where|and|or|not|in|is|null|as|on|join|inner|left|right|outer|full|cross|apply|group|by|order|having|top|distinct|union|all|with|case|when|then|else|end|like|between|exists|asc|desc|over|partition|count|sum|avg|min|max|cast|convert|isnull|coalesce|nullif|ltrim|rtrim|offset|fetch|next|rows|only)\b/gi;
function hlSql(sql) {
  const parts = [];
  const re = /(--[^\n]*|\/\*[\s\S]*?\*\/)|(N?'(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([^'\-/\d]+|[\s\S])/g;
  let m;
  while ((m = re.exec(sql))) {
    if (m[1]) parts.push(`<span class="c">${esc(m[1])}</span>`);
    else if (m[2]) parts.push(`<span class="s">${esc(m[2])}</span>`);
    else if (m[3]) parts.push(`<span class="n">${m[3]}</span>`);
    else parts.push(esc(m[4]).replace(SQL_KW, (k) => `<span class="k">${k.toUpperCase()}</span>`));
  }
  return parts.join('');
}
function prettySql(sql) {
  return String(sql).replace(/\s+/g, ' ').replace(/\s+\b(FROM|WHERE|GROUP BY|ORDER BY|HAVING|LEFT JOIN|RIGHT JOIN|INNER JOIN|JOIN|UNION ALL|UNION|CROSS APPLY|OUTER APPLY)\b/gi, '\n$1').replace(/\s+\b(AND|OR)\b(?=\s)/g, '\n  $1').trim();
}
function hlJson(obj) {
  const s = JSON.stringify(obj, null, 2) ?? '';
  return esc(s).replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)(\s*:)?|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g, (m, str, colon, b, n) => (str ? (colon ? `<span class="k">${str}</span>${colon}` : `<span class="s">${markMasked(str)}</span>`) : b ? `<span class="b">${b}</span>` : `<span class="n">${n}</span>`));
}
function renderRequest(e) {
  let args = null;
  try { args = JSON.parse(e.req ?? e.args); } catch { /* cut */ }
  if (!args) return `<pre>${esc(e.req ?? e.args)}</pre>`;
  let h = '';
  if (typeof args.sql === 'string') h += `<h4>SQL${args.db ? ` · <span class="chip adm">${esc(args.db)}</span>` : ''}</h4><pre class="sql">${hlSql(prettySql(args.sql))}</pre>`;
  if (typeof args.jql === 'string') h += `<h4>JQL</h4><pre class="sql">${hlSql(args.jql)}</pre>`;
  h += `<h4>Argumentlar</h4><pre class="json">${hlJson(args)}</pre>`;
  return h;
}

// ---------------------------------------------------------------- call drawer
const drawer = { id: null, entry: null, tab: store.get('gw-dtab', 'res'), list: [] };
function currentList() { return view() === 'audit' ? audit.items : feed.slice().reverse(); }
async function openCall(id, day) {
  drawer.id = id;
  drawer.list = currentList();
  $('#scrim').hidden = false;
  $('#drawer').hidden = false;
  $$('tr.sel').forEach((r) => r.classList.remove('sel'));
  $(`#audit tr[data-call="${id}"]`)?.classList.add('sel');
  $('#dTitle').innerHTML = `<span class="spin"></span> #${id}`;
  $('#dSub').textContent = '';
  $('#dBody').innerHTML = '';
  try {
    const e = await api(`/call/${id}${day ? `?day=${day}` : ''}`);
    if (drawer.id !== id) return;
    drawer.entry = e;
    renderDrawer();
  } catch (err) { $('#dTitle').textContent = `#${id}`; $('#dBody').innerHTML = `<div class="alert bad">${esc(err.message)}</div>`; }
}
function renderDrawer() {
  const e = drawer.entry;
  const isAdmin = e.type === 'admin';
  $('#dTitle').innerHTML = `${chip(e.status)} <span class="mono">${esc(e.tool)}</span>`;
  $('#dSub').innerHTML = `#${e.id} · ${esc(full(e.ts))} · <b>${esc(e.agent)}</b>`;
  const meta = isAdmin
    ? [['Harakat', e.action], ['Obyekt', e.target || '—'], ['Tafsilot', e.detail || e.args || '—'], ['IP', e.ip]]
    : [['Agent', e.agent], ['Mijoz', e.client || '—'], ['Konnektor', e.connector || '—'], ['Davomiylik', ms(e.ms)], ...(e.rows !== undefined ? [['Natija', `${num(e.rows)} qator`]] : []), ['Hajm', bytes(e.bytes || 0)], ['IP', e.ip || '—'], ['Manba', e.origin === 'playground' ? 'admin playground' : 'MCP']];
  const sidCard = !isAdmin && e.sid ? `<div><span>Sessiya</span><b><a href="#" data-sid="${esc(e.sid)}" title="Shu sessiyaning barcha chaqiruvlari">${esc(e.sid.slice(0, 8))} →</a></b></div>` : '';
  let h = `<div class="d-meta">${meta.map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}${sidCard}</div>`;
  if (e.maskOff?.length) h += `<div class="alert warn">Bu chaqiruv paytida niqoblash o'chiq edi: <b>${e.maskOff.map(maskLabel).join(', ')}</b>. Javobda shaxsiy ma'lumot ochiq bo'lishi mumkin.</div>`;
  if (Object.keys(e.masked || {}).length) h += `<p class="small">Niqoblandi: ${maskChips(e.masked)}</p>`;
  if (e.err && e.status !== 'tool-error') h += `<div class="alert bad">${esc(e.err)}</div>`;
  if (!isAdmin) {
    const noBody = e.req === undefined; // written by v0.1.0, which kept only a 600-char request preview
    h +=`<div class="d-tabs"><button type="button" data-dtab="res" class="${drawer.tab === 'res' ? 'on' : ''}">Javob</button><button type="button" data-dtab="req" class="${drawer.tab === 'req' ? 'on' : ''}">So'rov</button><button type="button" data-dtab="raw" class="${drawer.tab === 'raw' ? 'on' : ''}">Xom</button><span class="grow"></span>
      <span class="tools"><button class="s" type="button" data-dact="copyres">javobni nusxa</button><button class="s" type="button" data-dact="copyreq">so'rovni nusxa</button>${e.connector ? '<button class="s" type="button" data-dact="replay">▷ playground</button>' : ''}<button class="s" type="button" data-dact="link">havola</button></span></div>
      <div class="result" id="dTab">${drawerTab(e, noBody)}</div>`;
  }
  $('#dBody').innerHTML = h;
  $('#dBody').scrollTop = 0;
}
function drawerTab(e, noBody) {
  if (drawer.tab === 'req') return renderRequest(e);
  if (drawer.tab === 'raw') return `<pre class="json">${hlJson(e)}</pre>`;
  if (noBody) return '<div class="alert warn">Bu chaqiruvning javobi saqlanmagan: u v0.2.0 dan oldin yozilgan, o\'sha versiya faqat so\'rovni saqlardi. Yangi chaqiruvlarda javob to\'liq ko\'rinadi.</div>';
  if (e.res === undefined) return '<p class="muted">Chaqiruv konnektorga yetib bormadi, javob yo\'q.</p>';
  return `${e.resCut ? `<div class="alert warn">Javob ${num(e.resCut)} belgi edi; auditda birinchi ${num(e.res.length)} belgisi saqlangan.</div>` : ''}${renderResult(e.res)}`;
}
function closeDrawer() { $('#drawer').hidden = true; $('#scrim').hidden = true; drawer.id = null; $$('tr.sel').forEach((r) => r.classList.remove('sel')); }
function stepDrawer(d) {
  const list = drawer.list;
  const i = list.findIndex((x) => x.id === drawer.id);
  const n = list[i + d];
  if (n) openCall(n.id, dayOf(n.ts));
}
$('#dClose').onclick = closeDrawer;
$('#scrim').onclick = closeDrawer;
$('#dPrev').onclick = () => stepDrawer(-1);
$('#dNext').onclick = () => stepDrawer(1);
$('#drawer').addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-dtab]');
  if (t) { drawer.tab = t.dataset.dtab; store.set('gw-dtab', drawer.tab); renderDrawer(); return; }
  const a = ev.target.closest('[data-dact]')?.dataset.dact;
  const e = drawer.entry;
  const sl = ev.target.closest('[data-sid]');
  if (sl) { ev.preventDefault(); const f = $('#filters'); f.reset(); f.sid.value = sl.dataset.sid; f.days.value = '2'; closeDrawer(); location.hash = '#audit'; loadAudit(); return; }
  if (!a || !e) return;
  if (a === 'copyres') copy(e.res || '', 'Javob nusxalandi');
  else if (a === 'copyreq') copy(e.req || e.args || '', 'So\'rov nusxalandi');
  else if (a === 'link') copy(`${location.origin}/admin/#call=${e.id}`, 'Havola nusxalandi');
  else if (a === 'replay') { let args = {}; try { args = JSON.parse(e.req || e.args); } catch { /* cut */ } pg.prefill = { tool: e.tool, args }; closeDrawer(); location.hash = '#playground'; }
});

// ---------------------------------------------------------------- agents
const statFor = (name) => ST?.byAgent.find((x) => x.name === name);
function renderAgents() {
  if (!S) return;
  const box = $('#agents');
  if (!S.agents.length) { box.innerHTML = '<div class="empty-state">Hali agent yo\'q. «+ Yangi agent» bilan token chiqaring.</div>'; return; }
  box.innerHTML = S.agents.map((a) => {
    const st = statFor(a.name) || { calls: 0, ok: 0, error: 0, denied: 0, p95: 0 };
    const exp = a.expires ? (a.expires < Date.now() ? '<span class="chip bad">token eskirgan</span>' : `<span class="chip ${a.expires - Date.now() < 7 * 864e5 ? 'warn' : ''}">muddat ${new Date(a.expires).toLocaleDateString('ru-RU')}</span>`) : '';
    const load = Math.min(100, Math.round(((a.rpmNow || 0) / a.rpm) * 100));
    const online = Date.now() - a.lastSeen < 300e3;
    return `<section class="card" data-agent="${esc(a.name)}">
      <div class="ag-h"><span class="dot ${a.paused ? 'pause' : online ? 'on' : ''}"></span><h3>${esc(a.name)}</h3>${a.paused ? '<span class="chip warn">pauza</span>' : online ? '<span class="chip ok">faol</span>' : ''}${exp}<span class="grow"></span><span class="muted small">${esc(a.owner)}</span></div>
      ${a.note ? `<p class="muted small" style="margin:6px 0 0">${esc(a.note)}</p>` : ''}
      ${a.paused?.reason ? `<div class="alert warn" style="margin:8px 0 0">Pauza sababi: ${esc(a.paused.reason)} (${ago(a.paused.at)})</div>` : ''}
      <div class="ag-stats"><div><b>${num(st.calls)}</b><span>bugun</span></div><div><b class="${st.error ? 'down' : ''}">${num(st.error)}</b><span>xato</span></div><div><b class="${st.denied ? 'down' : ''}">${num(st.denied)}</b><span>rad</span></div><div><b>${st.calls ? ms(st.p95) : '—'}</b><span>p95</span></div></div>
      <dl class="kv">
        <dt>Mijoz</dt><dd>${esc(a.client || '—')}</dd>
        <dt>Oxirgi faollik</dt><dd>${ago(a.lastSeen)}${a.lastIp ? ` · <span class="mono">${esc(a.lastIp)}</span>` : ''}</dd>
        <dt>Limit</dt><dd>${a.rpmNow || 0} / ${a.rpm} daqiqada<div class="meter"><i class="${load > 90 ? 'x' : load > 60 ? 'w' : ''}" style="width:${load}%"></i></div></dd>
        <dt>Toollar</dt><dd><div class="chips">${a.tools.map((t) => `<span class="chip mono">${esc(t)}</span>`).join('')}</div></dd>
        <dt>Argumentlar</dt><dd>${Object.keys(a.argAllow || {}).length ? Object.entries(a.argAllow).map(([k, v]) => `<span class="mono">${esc(k)}</span> ∈ ${v.map((x) => `<span class="chip mono">${esc(x)}</span>`).join(' ')}`).join('<br>') : '<span class="muted">cheklovsiz</span>'}</dd>
        <dt>IP cheklov</dt><dd>${a.ipAllow.length ? a.ipAllow.map((x) => `<span class="mono">${esc(x)}</span>`).join(', ') : '<span class="muted">yo\'q (har qanday IP)</span>'}</dd>
        <dt>Token</dt><dd>${a.created ? `yaratilgan ${new Date(a.created).toLocaleDateString('ru-RU')}` : '—'}${a.rotated ? ` · yangilangan ${ago(a.rotated)}` : ''} · jami ${num(a.calls)} chaqiruv</dd>
      </dl>
      <div class="actions">
        <button class="s" type="button" data-act="edit">✎ Tahrirlash</button>
        <button class="s" type="button" data-act="${a.paused ? 'resume' : 'pause'}">${a.paused ? '▶ Davom ettirish' : '⏸ Pauza'}</button>
        <button class="s" type="button" data-act="audit">☰ Audit</button>
        <button class="s" type="button" data-act="rotate">↻ Token</button>
        <span class="grow"></span>
        <button class="s danger" type="button" data-act="delete" title="Agentni o'chirish">✕</button>
      </div></section>`;
  }).join('');
}
function toolChecks(selected) {
  const sel = new Set(selected);
  const all = sel.has('*');
  let h = `<label class="grp"><input type="checkbox" data-pat="*" ${all ? 'checked' : ''}> Hammasi <span class="mono muted">*</span></label>`;
  for (const c of S.connectors) {
    const pat = `${c.name}-*`;
    h += `<label class="grp"><input type="checkbox" data-pat="${esc(pat)}" ${all || sel.has(pat) ? 'checked' : ''} ${all ? 'disabled' : ''}> ${esc(c.name)} — barcha toollar <span class="mono muted">${esc(pat)}</span></label>`;
    for (const t of c.tools) h += `<label class="sub"><input type="checkbox" data-pat="${esc(t.full)}" ${all || sel.has(pat) || sel.has(t.full) ? 'checked' : ''} ${all || sel.has(pat) ? 'disabled' : ''}> <span class="mono">${esc(t.name)}</span></label>`;
  }
  return h;
}
function readChecks(root) {
  const on = $$('.checks input[data-pat]', root).filter((x) => x.checked && !x.disabled).map((x) => x.dataset.pat);
  const extra = $('#fExtra', root).value.split(',').map((s) => s.trim()).filter(Boolean);
  return [...new Set([...on, ...extra])];
}
function wireChecks(root) {
  $('.checks', root).addEventListener('change', (ev) => {
    const p = ev.target.dataset.pat;
    if (!p || !p.endsWith('*')) return;
    const pre = p === '*' ? '' : p.slice(0, -1);
    $$('.checks input[data-pat]', root).forEach((x) => { if (x !== ev.target && x.dataset.pat.startsWith(pre)) { x.disabled = ev.target.checked; if (ev.target.checked) x.checked = true; } });
  });
}
async function agentForm(a) {
  const isNew = !a;
  a ||= { name: '', owner: '', note: '', rpm: 30, tools: ['*'], expires: 0, ipAllow: [], argAllow: {} };
  const argText = Object.entries(a.argAllow || {}).map(([k, v]) => `${k}=${v.join(',')}`).join('; ');
  const known = new Set(['*', ...S.connectors.flatMap((c) => [`${c.name}-*`, ...c.tools.map((t) => t.full)])]);
  const extra = a.tools.filter((t) => !known.has(t));
  const r = await modal(`<h2>${isNew ? 'Yangi agent' : `${esc(a.name)} — tahrirlash`}</h2>
    <p class="lead">${isNew ? 'Saqlangach token bir marta ko\'rsatiladi — uni darhol nusxalang.' : 'O\'zgarishlar darhol kuchga kiradi va auditga yoziladi.'}</p>
    <form id="agForm">
      ${isNew ? `<label class="fld"><span>Nom</span><input name="name" required pattern="[a-z0-9][a-z0-9\\-]{1,30}" placeholder="masalan: ali-cursor" autofocus><small>a-z, 0-9 va «-»; token prefiksi bo'ladi.</small></label>` : ''}
      <div class="row2"><label class="fld"><span>Egasi</span><input name="owner" value="${esc(a.owner)}" placeholder="ism yoki jamoa"></label>
      <label class="fld"><span>Limit (daqiqasiga)</span><input name="rpm" type="number" min="1" max="600" value="${a.rpm}"></label></div>
      <label class="fld"><span>Izoh</span><input name="note" value="${esc(a.note)}" placeholder="nima uchun kerak"></label>
      <div class="fld"><span>Ruxsat etilgan toollar</span><div class="checks">${toolChecks(a.tools)}</div>
        <input id="fExtra" value="${esc(extra.join(', '))}" placeholder="qo'shimcha naqsh: faktura-jira_*  (vergul bilan)"></div>
      <label class="fld"><span>Argument cheklovi</span><input name="argAllow" value="${esc(argText)}" placeholder="db=stage,stageflow"><small>Tool shu argumentni qabul qilsa, faqat sanalgan qiymatlarga ruxsat. Bir nechta: «;» bilan. Agent toollar ro'yxatida ham faqat shular ko'rinadi.</small></label>
      <div class="row2"><label class="fld"><span>Token muddati</span><input name="expires" type="date" value="${a.expires ? dayOf(a.expires) : ''}"><small>Bo'sh = muddatsiz</small></label>
      <label class="fld"><span>IP cheklov</span><input name="ipAllow" value="${esc(a.ipAllow.join(', '))}" placeholder="178.218.200.106, 10.0.0."><small>Bo'sh = har qanday IP. «.» bilan tugasa — prefiks.</small></label></div>
      <div class="foot"><button class="btn ghost" type="button" data-x="cancel">Bekor</button><button class="btn" type="submit">${isNew ? 'Yaratish va token olish' : 'Saqlash'}</button></div>
    </form>`, (root) => {
    wireChecks(root);
    root.querySelector('[data-x=cancel]').onclick = () => closeModal(null);
    $('#agForm', root).onsubmit = (ev) => {
      ev.preventDefault();
      const f = new FormData(ev.target);
      const tools = readChecks(root);
      if (!tools.length) { toast('Kamida bitta tool tanlang', true); return; }
      const exp = f.get('expires') ? Date.parse(`${f.get('expires')}T23:59:59`) : 0;
      closeModal({ name: f.get('name'), owner: f.get('owner'), note: f.get('note'), rpm: +f.get('rpm'), tools, expires: exp, ipAllow: String(f.get('ipAllow')).split(',').map((s) => s.trim()).filter(Boolean), argAllow: parseArgAllow(f.get('argAllow')) });
    };
  });
  if (!r) return;
  try {
    if (isNew) showToken(await api('/agents', { method: 'POST', body: r }));
    else { await api(`/agents/${a.name}`, { method: 'PUT', body: r }); toast('Saqlandi'); }
  } catch (e) { toast(e.message, true); }
}
function parseArgAllow(t) {
  const o = {};
  for (const part of String(t || '').split(';')) {
    const m = /^\s*([\w-]+)\s*=\s*(.+)$/.exec(part);
    if (m) o[m[1]] = m[2].split(',').map((s) => s.trim()).filter(Boolean);
  }
  return o;
}
function showToken(r) {
  const base = r.mcp;
  const snips = {
    'Claude Code': r.claude,
    '.mcp.json': JSON.stringify({ mcpServers: { dtwin: { type: 'http', url: base, headers: { Authorization: `Bearer ${r.token}` } } } }, null, 2),
    Cursor: JSON.stringify({ mcpServers: { dtwin: { url: base, headers: { Authorization: `Bearer ${r.token}` } } } }, null, 2),
    'curl sinov': `curl -s ${base} -H "Authorization: Bearer ${r.token}" -H "content-type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`,
  };
  modal(`<h2>🔑 ${esc(r.name)} tokeni</h2><p class="lead">Faqat hozir ko'rinadi. Serverda faqat uning sha256 xeshi saqlanadi.</p>
    <div class="secret"><code>${esc(r.token)}</code><button class="s" type="button" data-copy="token">nusxa</button></div>
    <div class="snip-tabs">${Object.keys(snips).map((k, i) => `<button class="s ${i ? '' : 'on'}" type="button" data-snip="${esc(k)}">${esc(k)}</button>`).join('')}</div>
    <pre class="snip" id="snip">${esc(snips['Claude Code'])}</pre>
    <div class="foot"><button class="s" type="button" data-copy="snip">sozlamani nusxa</button><button class="btn" type="button" data-x="done">Saqladim</button></div>`, (root) => {
    let cur = 'Claude Code';
    root.addEventListener('click', (ev) => {
      const s = ev.target.closest('[data-snip]');
      if (s) { cur = s.dataset.snip; $('#snip', root).textContent = snips[cur]; $$('[data-snip]', root).forEach((b) => b.classList.toggle('on', b === s)); }
      const c = ev.target.closest('[data-copy]');
      if (c) copy(c.dataset.copy === 'token' ? r.token : snips[cur]);
      if (ev.target.closest('[data-x=done]')) closeModal(true);
    });
  });
}
$('#addAgent').onclick = () => agentForm(null);
$('#agents').addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-act]');
  if (!b) return;
  const n = b.closest('[data-agent]').dataset.agent;
  const a = S.agents.find((x) => x.name === n);
  try {
    switch (b.dataset.act) {
      case 'edit': return agentForm(a);
      case 'audit': return filterAudit('agent', n);
      case 'pause': { const reason = await ask({ title: `${n} — pauza`, text: 'Agentning barcha chaqiruvlari rad etiladi va toollar ro\'yxati bo\'sh qaytadi.', input: '', placeholder: 'sabab (ixtiyoriy)', ok: 'Pauza' }); if (reason === null) return; await api(`/agents/${n}/pause`, { method: 'POST', body: { reason } }); return toast(`${n} pauza qilindi`); }
      case 'resume': await api(`/agents/${n}/resume`, { method: 'POST', body: {} }); return toast(`${n} davom etmoqda`);
      case 'rotate': { if (!(await ask({ title: `${n} — yangi token`, text: 'Eski token <b>darhol</b> ishlamay qoladi. Agent sozlamasini yangilash kerak bo\'ladi.', ok: 'Yangi token chiqarish', danger: true }))) return; return showToken(await api('/agents', { method: 'POST', body: { name: n, rotate: true } })); }
      case 'delete': { const v = await ask({ title: `${n} agentini o'chirish`, text: `Token darhol bekor bo'ladi, qaytarib bo'lmaydi. Tasdiqlash uchun nomini yozing: <b>${esc(n)}</b>`, input: '', ok: "O'chirish", danger: true }); if (v === null) return; if (v !== n) return toast('Nom mos kelmadi', true); await api(`/agents/${n}`, { method: 'DELETE' }); return toast(`${n} o'chirildi`); }
    }
  } catch (e) { toast(e.message, true); }
});

// ---------------------------------------------------------------- connectors
function paramsOf(schema) {
  const p = schema?.properties || {};
  const req = new Set(schema?.required || []);
  return Object.entries(p).map(([k, v]) => `<div><code>${esc(k)}</code>${req.has(k) ? '<b title="majburiy">*</b>' : ''} <span class="muted">${esc(v.type || '')}${v.enum ? ` · ${esc(v.enum.join(' | '))}` : ''}</span> — ${esc(v.description || '')}</div>`).join('') || '<div class="muted">parametrsiz</div>';
}
function renderConnectors() {
  if (!S) return;
  const box = $('#connectors');
  if (!S.connectors.length) { box.innerHTML = '<div class="empty-state">Konnektor ulanmagan.</div>'; return; }
  const open = new Set($$('#connectors details[open]').map((d) => d.dataset.tool));
  box.innerHTML = S.connectors.map((c) => {
    const st = ST?.byConnector.find((x) => x.name === c.name);
    return `<section class="card" data-conn="${esc(c.name)}">
      <div class="ag-h"><span class="dot ${!c.enabled ? 'pause' : c.online ? 'on' : 'off'}"></span><h3>${esc(c.name)}</h3>${!c.enabled ? '<span class="chip warn">o\'chirilgan</span>' : c.online ? '<span class="chip ok">online</span>' : '<span class="chip bad">offline</span>'}<span class="muted small">${esc(c.server)}</span><span class="grow"></span><span class="muted small">${c.uptime === null ? '' : `${c.uptime}% uptime`}</span></div>
      <div class="ag-stats"><div><b>${c.online ? `${c.latency} ms` : '—'}</b><span>health javobi</span></div><div><b>${c.tools.length}</b><span>tool</span></div><div><b>${num(st?.calls || 0)}</b><span>chaqiruv bugun</span></div><div><b>${st?.calls ? ms(st.p95) : '—'}</b><span>p95</span></div></div>
      ${healthBar(c.health, 120)}
      <dl class="kv" style="margin-top:12px"><dt>URL</dt><dd class="mono">${esc(c.url)}</dd><dt>Secret</dt><dd>${c.hasSecret ? 'o\'rnatilgan' : '<span class="down">yo\'q</span>'}</dd><dt>Oxirgi muvaffaqiyat</dt><dd>${c.lastOk ? `${ago(c.lastOk)} (${full(c.lastOk)})` : '—'}</dd></dl>
      ${c.lastErr ? `<div class="err-box">${c.lastErrAt ? `${ago(c.lastErrAt)}: ` : ''}${esc(c.lastErr)}</div>` : ''}
      <div class="tool-list">${c.tools.map((t) => `<details data-tool="${esc(t.full)}" ${open.has(t.full) ? 'open' : ''}><summary><b>${esc(t.name)}</b><span class="muted small grow">${esc((t.description || '').split(/[.\n]/)[0])}</span><button class="s" type="button" data-try="${esc(t.full)}">▷ sinash</button></summary><p>${esc(t.description)}</p><div class="params">${paramsOf(t.inputSchema)}</div></details>`).join('')}</div>
      <div class="actions">
        <button class="s" type="button" data-cact="refresh">↻ Tekshirish</button>
        <button class="s" type="button" data-cact="${c.enabled ? 'disable' : 'enable'}">${c.enabled ? '⏻ O\'chirish' : '⏻ Yoqish'}</button>
        <button class="s" type="button" data-cact="edit">✎ URL / secret</button>
        <button class="s" type="button" data-cact="audit">☰ Audit</button>
        <span class="grow"></span><button class="s danger" type="button" data-cact="delete">Olib tashlash</button>
      </div></section>`;
  }).join('');
}
async function connForm(c) {
  const isNew = !c;
  const r = await modal(`<h2>${isNew ? 'Konnektor ulash' : `${esc(c.name)} — URL / secret`}</h2><p class="lead">MCP server (Streamable HTTP). Gateway ulanib, toollar ro'yxatini oladi.</p>
    <form id="cForm">
      ${isNew ? '<label class="fld"><span>Nom</span><input name="name" required pattern="[a-z0-9]{2,20}" placeholder="faktura" autofocus><small>Tool nomlari oldiga qo\'shiladi: faktura-sql_query</small></label>' : ''}
      <label class="fld"><span>URL</span><input name="url" required value="${esc(c?.url || '')}" placeholder="https://nosir-gwc.tunnel.dtwin.uz/"></label>
      <label class="fld"><span>Bearer secret</span><input name="secret" type="password" autocomplete="off" placeholder="${isNew ? '' : 'bo\'sh qoldirilsa o\'zgarmaydi'}"></label>
      <div class="foot"><button class="btn ghost" type="button" data-x="cancel">Bekor</button><button class="btn" type="submit">Ulash va tekshirish</button></div></form>`, (root) => {
    root.querySelector('[data-x=cancel]').onclick = () => closeModal(null);
    $('#cForm', root).onsubmit = (ev) => { ev.preventDefault(); const f = new FormData(ev.target); const body = { name: f.get('name') || c.name, url: f.get('url') }; if (f.get('secret')) body.secret = f.get('secret'); closeModal(body); };
  });
  if (!r) return;
  try { const x = await api('/connectors', { method: 'POST', body: r }); toast(x.online ? `${x.name}: ${x.tools.length} tool ulandi` : `${x.name}: ulanmadi — ${x.lastErr}`, !x.online); } catch (e) { toast(e.message, true); }
}
$('#addConn').onclick = () => connForm(null);
$('#connectors').addEventListener('click', async (ev) => {
  const tr = ev.target.closest('[data-try]');
  if (tr) { ev.preventDefault(); pg.prefill = { tool: tr.dataset.try, args: {} }; location.hash = '#playground'; return; }
  const b = ev.target.closest('[data-cact]');
  if (!b) return;
  const n = b.closest('[data-conn]').dataset.conn;
  const act = b.dataset.cact;
  try {
    if (act === 'edit') return connForm(S.connectors.find((x) => x.name === n));
    if (act === 'audit') { const f = $('#filters'); f.reset(); f.q.value = `${n}-`; f.days.value = '7'; location.hash = '#audit'; return loadAudit(); }
    if (act === 'delete' && !(await ask({ title: `${n} konnektorini olib tashlash`, text: 'Uning barcha toollari agentlardan darhol yo\'qoladi.', ok: 'Olib tashlash', danger: true }))) return;
    if (act === 'disable' && !(await ask({ title: `${n} — o'chirish`, text: 'Toollar vaqtincha agentlarga ko\'rinmaydi.', ok: "O'chirish" }))) return;
    b.disabled = true;
    await api(act === 'delete' ? `/connectors/${n}` : `/connectors/${n}/${act}`, { method: act === 'delete' ? 'DELETE' : 'POST' });
    toast(act === 'refresh' ? `${n} tekshirildi` : 'Bajarildi');
  } catch (e) { toast(e.message, true); } finally { b.disabled = false; }
});

// ---------------------------------------------------------------- playground
const pg = { prefill: null, catKey: '' };
const catalog = () => (S ? S.connectors.filter((c) => c.enabled).flatMap((c) => c.tools.map((t) => ({ ...t, connector: c.name, online: c.online }))) : []);
function renderPlayground() {
  if (!S) return;
  const cat = catalog();
  const sel = $('#pgTool');
  const key = cat.map((t) => t.full).join();
  if (key !== pg.catKey) {
    const cur = sel.value;
    const groups = {};
    for (const t of cat) (groups[t.connector] ||= []).push(t);
    sel.innerHTML = Object.entries(groups).map(([g, l]) => `<optgroup label="${esc(g)}">${l.map((t) => `<option value="${esc(t.full)}">${esc(t.name)}${t.online ? '' : ' (offline)'}</option>`).join('')}</optgroup>`).join('') || '<option value="">tool yo\'q</option>';
    if (cur) sel.value = cur;
    pg.catKey = key;
    buildForm();
  }
  if (pg.prefill) {
    sel.value = pg.prefill.tool;
    buildForm(pg.prefill.args);
    pg.prefill = null;
  }
}
function buildForm(values = {}) {
  const t = catalog().find((x) => x.full === $('#pgTool').value);
  $('#pgDesc').textContent = t?.description || '';
  if (!t) { $('#pgForm').innerHTML = ''; return; }
  const props = t.inputSchema?.properties || {};
  const req = new Set(t.inputSchema?.required || []);
  const saved = store.get(`gw-pg-${t.full}`, {});
  $('#pgForm').innerHTML = Object.entries(props).map(([k, p]) => {
    const v = values[k] ?? saved[k] ?? p.default ?? '';
    const label = `<span>${esc(k)}${req.has(k) ? ' <b class="down">*</b>' : ''}</span>`;
    const hint = p.description ? `<small>${esc(p.description)}</small>` : '';
    if (p.enum) return `<label class="fld">${label}<select name="${esc(k)}" data-type="${p.type}">${req.has(k) ? '' : '<option value=""></option>'}${p.enum.map((o) => `<option ${String(o) === String(v) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>${hint}</label>`;
    if (/^(sql|jql|query|search|body|text)$/i.test(k) && p.type === 'string') return `<label class="fld">${label}<textarea class="code" name="${esc(k)}" data-type="string" spellcheck="false" ${req.has(k) ? 'required' : ''}>${esc(v)}</textarea>${hint}</label>`;
    if (p.type === 'integer' || p.type === 'number') return `<label class="fld">${label}<input type="number" name="${esc(k)}" data-type="number" value="${esc(v)}" ${p.minimum !== undefined ? `min="${p.minimum}"` : ''} ${p.maximum !== undefined ? `max="${p.maximum}"` : ''}>${hint}</label>`;
    if (p.type === 'boolean') return `<label class="fld"><span><input type="checkbox" name="${esc(k)}" data-type="boolean" ${v ? 'checked' : ''}> ${esc(k)}</span>${hint}</label>`;
    return `<label class="fld">${label}<input name="${esc(k)}" data-type="string" value="${esc(typeof v === 'object' ? JSON.stringify(v) : v)}" ${req.has(k) ? 'required' : ''}>${hint}</label>`;
  }).join('') || '<p class="muted small">Bu tool parametrsiz.</p>';
}
$('#pgTool').addEventListener('change', () => buildForm());
async function runPlayground() {
  const tool = $('#pgTool').value;
  if (!tool) return;
  const args = {};
  for (const el of $$('#pgForm [name]')) {
    const k = el.name, ty = el.dataset.type;
    if (ty === 'boolean') { if (el.checked) args[k] = true; continue; }
    const v = el.value.trim();
    if (v === '') continue;
    args[k] = ty === 'number' ? +v : v;
  }
  const missing = $$('#pgForm [required]').find((el) => !el.value.trim());
  if (missing) { missing.focus(); toast(`${missing.name} majburiy`, true); return; }
  store.set(`gw-pg-${tool}`, args);
  const btn = $('#pgRun');
  btn.disabled = true;
  $('#pgMeta').innerHTML = '<span class="spin"></span> bajarilmoqda…';
  const t0 = performance.now();
  try {
    const r = await api('/run', { method: 'POST', body: { tool, arguments: args } });
    const text = (r.result?.content || []).map((c) => (c.type === 'text' ? c.text : `[${c.type}]`)).join('\n\n');
    const e = r.entry;
    $('#pgMeta').innerHTML = e ? `${chip(e.status)} <span class="muted">${ms(e.ms)}</span> ${e.rows !== undefined ? `<span class="muted">${num(e.rows)} qator</span>` : ''} ${maskChips(e.masked)} <button class="s" type="button" data-open="${e.id}">audit #${e.id}</button>` : `<span class="muted">${Math.round(performance.now() - t0)} ms</span>`;
    $('#pgResult').innerHTML = r.result?.isError ? `<div class="alert bad">${esc(text)}</div>` : renderResult(text);
  } catch (err) {
    $('#pgMeta').innerHTML = '';
    $('#pgResult').innerHTML = `<div class="alert bad">${esc(err.message)}</div>`;
  } finally { btn.disabled = false; }
}
$('#pgRun').onclick = runPlayground;
$('#pgForm').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runPlayground(); } });
$('#pgMeta').addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) openCall(+b.dataset.open); });

// ---------------------------------------------------------------- settings
function renderSettings() {
  if (!S) return;
  $('#mask').innerHTML = Object.entries(MASK).map(([k, [l, ex]]) => `<label><span class="switch"><input type="checkbox" data-mask="${k}" ${S.mask[k] ? 'checked' : ''}><i></i></span><span>${l}${k === 'inn' ? ' <span class="muted small">(odatda o\'chiq: INN ochiq ma\'lumot)</span>' : ''}</span><small>${esc(ex)}</small></label>`).join('');
  const mcp = `https://gateway.acme.example/mcp`;
  $('#sysInfo').innerHTML = [
    ['Versiya', `v${S.version}`], ['Ishlayapti', dur(S.uptime)], ['MCP manzil', `<span class="mono">${esc(mcp)}</span> <button class="s" type="button" data-copy-mcp>nusxa</button>`],
    ['Agentlar / konnektorlar', `${S.agents.length} / ${S.connectors.length}`], ['Toollar', S.tools], ['Audit saqlanadi', `${S.retention} kun (so'rov + niqoblangan javob)`],
    ['Javob limiti', `${num(S.limits.maxResult)} belgi agentga · ${num(S.limits.logRes)} belgi auditga`], ['Chaqiruv timeout', `${S.limits.callTimeout / 1000} s`],
    ['Kill-switch', S.killed ? `<span class="down">yoqilgan</span> (${ago(S.killed.at)})` : '<span class="up">o\'chiq</span>'],
  ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}
$('#sysInfo').addEventListener('click', (e) => { if (e.target.closest('[data-copy-mcp]')) copy(`https://gateway.acme.example/mcp`); });
$('#mask').addEventListener('change', async (ev) => {
  const k = ev.target.dataset?.mask;
  if (!k) return;
  const on = ev.target.checked;
  let reason = '';
  if (!on && k !== 'inn') {
    reason = await ask({ title: `${MASK[k][0]} niqobini o'chirish`, text: 'Agentlar bu ma\'lumotni <b>ochiq</b> ko\'radi va u ularning kontekstiga (va provayderga) ketadi. Harakat sababi bilan auditga yoziladi.', input: '', placeholder: 'sabab (majburiy)', ok: "Niqobni o'chirish", danger: true, required: true });
    if (reason === null) { ev.target.checked = true; return; }
  }
  try { await api('/mask', { method: 'PUT', body: { [k]: on, reason } }); toast(`${MASK[k][0]}: niqob ${on ? 'yoqildi' : "o'chirildi"}`); } catch (e) { ev.target.checked = !on; toast(e.message, true); }
});
async function loadAdminLog() {
  try {
    const r = await api('/history?status=admin&days=30&limit=300');
    $('#admLog').innerHTML = r.items.length ? `<thead><tr><th>Vaqt</th><th>Harakat</th><th>Obyekt</th><th>Tafsilot</th><th>IP</th></tr></thead><tbody>${r.items.map((e) => `<tr><td title="${esc(full(e.ts))}">${when(e.ts)}</td><td><span class="chip ${/kill|delete|mask|rotate/.test(e.action) ? 'warn' : 'adm'}">${esc(e.action)}</span></td><td class="mono">${esc(e.target || '—')}</td><td class="muted">${esc(e.detail || '')}</td><td class="mono muted">${esc(e.ip)}</td></tr>`).join('')}</tbody>` : '<tbody><tr><td class="muted">Hali admin harakati yozilmagan (v0.2.0 dan boshlab yoziladi).</td></tr></tbody>';
  } catch (e) { toast(e.message, true); }
}
$('#admRefresh').onclick = loadAdminLog;

// ---------------------------------------------------------------- custom masks
const CM_PRESETS = [
  { name: 'Hisob raqami (20 xona)', type: 'regex', pattern: '\\b\\d{20}\\b', keepStart: 4, keepEnd: 4, sample: 'Hisob: 20208000900123456001, MFO 00444' },
  { name: 'Ism-familiya ustunlari', type: 'column', pattern: '^(first_?name|last_?name|middle_?name|fio|full_?name|director|accountant)$', keepStart: 1, keepEnd: 0, column: 'FirstName', sample: 'Alisher' },
  { name: 'Manzil ustunlari', type: 'column', pattern: '^(address|street|home|manzil|address_?line)$', replace: '[manzil]', column: 'Street', sample: 'Dustmuhammedov 12' },
  { name: 'Avtomobil raqami', type: 'regex', pattern: '\\b\\d{2}\\s?[A-Z]\\s?\\d{3}\\s?[A-Z]{2}\\b|\\b\\d{2}\\s?\\d{3}\\s?[A-Z]{3}\\b', keepStart: 2, keepEnd: 0, sample: 'Mashina 01 A 123 BC va 10 777 AAA' },
];
const cmStyle = (m) => (m.replace ? `→ «${m.replace}»` : `boshidan ${m.keepStart || 0}, oxiridan ${m.keepEnd || 0} belgi qoladi`);
function renderCustomMasks() {
  const list = S?.customMasks || [];
  $('#customMasks').innerHTML = list.map((m) => `<div class="cm-row" data-cm="${m.id}">
      <span class="switch"><input type="checkbox" data-cmtoggle ${m.enabled !== false ? 'checked' : ''}><i></i></span>
      <div><b>${esc(m.name)}</b> <span class="chip ${m.type === 'column' ? 'adm' : 'acc'}">${m.type === 'column' ? 'ustun' : 'regex'}</span><div class="pat">${esc(m.pattern)}${m.ci ? ' /i' : ''} · ${esc(cmStyle(m))}</div></div>
      <div class="btns"><button class="s" type="button" data-cmedit title="Tahrirlash">✎</button><button class="s danger" type="button" data-cmdel title="O'chirish">✕</button></div></div>`).join('') || '<p class="muted small">Hali maxsus niqob yo\'q.</p>';
}
$('#customMasks').addEventListener('click', async (ev) => {
  const row = ev.target.closest('[data-cm]');
  if (!row) return;
  const m = S.customMasks.find((x) => x.id === row.dataset.cm);
  if (ev.target.closest('[data-cmedit]')) return maskForm(m);
  if (!ev.target.closest('[data-cmdel]')) return;
  if (!(await ask({ title: `«${m.name}» niqobini o'chirish`, text: 'Bu naqshdagi ma\'lumot endi agentlarga ochiq boradi. Harakat auditga yoziladi.', ok: "O'chirish", danger: true }))) return;
  try { await api(`/masks/${m.id}`, { method: 'DELETE' }); toast("Niqob o'chirildi"); } catch (e) { toast(e.message, true); }
});
$('#customMasks').addEventListener('change', async (ev) => {
  if (!ev.target.matches('[data-cmtoggle]')) return;
  const id = ev.target.closest('[data-cm]').dataset.cm;
  try { await api(`/masks/${id}`, { method: 'PUT', body: { enabled: ev.target.checked } }); toast(ev.target.checked ? 'Niqob yoqildi' : "Niqob o'chirildi"); } catch (e) { ev.target.checked = !ev.target.checked; toast(e.message, true); }
});
$('#addMask').onclick = () => maskForm(null);

// ---------------------------------------------------------------- Telegram alerts
const ALERT_RULES = [
  ['kill', 'Kill-switch yoqildi / o\'chirildi'],
  ['mask', 'Niqob o\'chirildi (o\'rnatilgan yoki maxsus)'],
  ['connector', 'Konnektor offline (2 ta tekshiruv ketma-ket) va qayta online'],
  ['agents', 'Agent yaratildi, tokeni yangilandi yoki o\'chirildi'],
  ['auth', 'Muddati o\'tgan token yoki taqiqlangan IP bilan ulanish'],
  ['adminLogin', 'Admin panelga noto\'g\'ri kirish (5 va 20 urinish)'],
  ['burst', 'Bitta agentda 5 daqiqada ko\'p xato/rad', 'burstN', 'ta'],
  ['bigRows', 'Katta natija (ma\'lumot ko\'p chiqib ketishi)', 'bigRowsN', 'qator'],
];
function renderAlerts() {
  const A = S?.alerts;
  if (!A) return;
  $('#tgState').innerHTML = A.telegram ? '<span class="chip ok">ulangan</span>' : '<span class="chip warn">sozlanmagan — TG_BOT_TOKEN / TG_CHAT_ID</span>';
  $('#tgTest').disabled = !A.telegram;
  if (!$('#alertRules').contains(document.activeElement)) {
    $('#alertRules').innerHTML = ALERT_RULES.map(([k, l, nk, unit]) => `<label><span class="switch"><input type="checkbox" data-alert="${k}" ${A[k] ? 'checked' : ''}><i></i></span><span>${l}</span>${nk ? `<span class="small muted">≥ <input type="number" data-alertn="${nk}" value="${A[nk]}" style="width:70px;padding:3px 6px"> ${unit}</span>` : '<span></span>'}</label>`).join('');
  }
  $('#alertLog').innerHTML = A.log.length ? A.log.map((x) => `<div class="cm-row"><span class="muted small">${when(x.ts)}</span><div><b>${esc(x.title)}</b><div class="pat">${esc(x.text)}</div></div>${x.ok ? '<span class="chip ok">yuborildi</span>' : x.err ? `<span class="chip bad" title="${esc(x.err)}">yuborilmadi</span>` : '<span class="chip">navbatda</span>'}</div>`).join('') : '<p class="muted small">Hali ogohlantirish yo\'q. Har bir turi 10 daqiqada ko\'pi bilan 1 marta yuboriladi.</p>';
}
$('#alertRules').addEventListener('change', async (ev) => {
  const k = ev.target.dataset.alert, n = ev.target.dataset.alertn;
  if (!k && !n) return;
  try { await api('/alerts', { method: 'PUT', body: k ? { [k]: ev.target.checked } : { [n]: +ev.target.value } }); toast('Saqlandi'); } catch (e) { toast(e.message, true); }
});
$('#tgTest').onclick = async () => { try { await api('/alerts/test', { method: 'POST' }); toast('Telegram\'ga yuborildi'); } catch (e) { toast(e.message, true); } };
function maskForm(m) {
  const isNew = !m;
  m = { name: '', type: 'regex', pattern: '', ci: false, keepStart: 2, keepEnd: 2, replace: '', sample: '', column: '', ...(m || {}) };
  return modal(`<h2>${isNew ? 'Maxsus niqob' : `«${esc(m.name)}» — tahrirlash`}</h2>
    <p class="lead">Har bir tool javobi va audit yozuviga qo'llanadi, o'rnatilgan niqoblardan keyin ishlaydi. O'zgarish auditga yoziladi.</p>
    ${isNew ? `<div class="presets"><span class="muted small" style="align-self:center">Shablon:</span>${CM_PRESETS.map((p, i) => `<button class="s" type="button" data-preset="${i}">${esc(p.name)}</button>`).join('')}</div>` : ''}
    <form id="cmForm">
      <label class="fld"><span>Nom</span><input name="name" required maxlength="40" value="${esc(m.name)}" placeholder="masalan: Hisob raqami" autofocus></label>
      <div class="fld"><span>Qayerdan izlaydi</span><div class="seg"><label><input type="radio" name="type" value="regex" ${m.type !== 'column' ? 'checked' : ''}>Matndagi naqsh (regex)</label><label><input type="radio" name="type" value="column" ${m.type === 'column' ? 'checked' : ''}>Jadval ustuni nomi</label></div><small id="typeHint"></small></div>
      <label class="fld"><span>Naqsh (JavaScript regex)</span><input name="pattern" class="mono" required maxlength="200" value="${esc(m.pattern)}" spellcheck="false" autocomplete="off"></label>
      <label class="fld" id="ciRow"><span><input type="checkbox" name="ci" ${m.ci ? 'checked' : ''}> katta-kichik harfni farqlamasin</span></label>
      <div class="fld"><span>Qanday niqoblanadi</span><div class="seg"><label><input type="radio" name="style" value="keep" ${m.replace ? '' : 'checked'}>Boshi va oxiri qolsin</label><label><input type="radio" name="style" value="replace" ${m.replace ? 'checked' : ''}>Matn bilan almashtirish</label></div></div>
      <div class="row2" id="keepRow"><label class="fld"><span>Boshidan qoladi</span><input name="keepStart" type="number" min="0" max="10" value="${m.keepStart || 0}"></label><label class="fld"><span>Oxiridan qoladi</span><input name="keepEnd" type="number" min="0" max="10" value="${m.keepEnd || 0}"></label></div>
      <label class="fld" id="replRow"><span>O'rniga yoziladi</span><input name="replace" maxlength="40" value="${esc(m.replace)}" placeholder="[yashirin]"></label>
      <div class="fld"><span>Sinov</span>
        <input name="column" id="cmCol" value="${esc(m.column)}" placeholder="ustun nomi, masalan: FirstName">
        <textarea name="sample" rows="3" placeholder="namuna matn — natija pastda darhol ko'rinadi">${esc(m.sample)}</textarea>
        <div class="preview"><div class="st" id="cmSt"></div><pre id="cmOut"></pre></div></div>
      <div class="foot"><button class="btn ghost" type="button" data-x="cancel">Bekor</button><button class="btn" type="submit">${isNew ? "Qo'shish" : 'Saqlash'}</button></div>
    </form>`, (root) => {
    const f = $('#cmForm', root);
    const read = () => { const d = new FormData(f); return { name: d.get('name'), type: d.get('type'), pattern: d.get('pattern'), ci: !!d.get('ci'), keepStart: +d.get('keepStart'), keepEnd: +d.get('keepEnd'), replace: d.get('style') === 'replace' ? d.get('replace') || '[yashirin]' : '' }; };
    const sync = () => {
      const col = f.elements.type.value === 'column';
      $('#typeHint', root).textContent = col ? "Ustun sarlavhasi naqshga mos kelsa, o'sha ustundagi har bir qiymat niqoblanadi (SQL natijalari)." : 'Javob matnidagi har bir moslik niqoblanadi.';
      $('#ciRow', root).hidden = col;
      $('#cmCol', root).hidden = !col;
      $('#keepRow', root).hidden = f.elements.style.value === 'replace';
      $('#replRow', root).hidden = f.elements.style.value !== 'replace';
    };
    let tm = null;
    const test = () => {
      clearTimeout(tm);
      tm = setTimeout(async () => {
        const d = new FormData(f);
        if (!d.get('pattern')) { $('#cmSt', root).innerHTML = '<span class="muted">Naqsh kiriting.</span>'; $('#cmOut', root).textContent = ''; return; }
        try {
          const r = await api('/masks/test', { method: 'POST', body: { mask: { ...read(), name: d.get('name') || 'test' }, sample: d.get('sample'), column: d.get('column') } });
          $('#cmSt', root).innerHTML = r.matched ? `<span class="up">✓ ${r.matched} ta moslik niqoblanadi</span>` : '<span class="muted">Moslik yo\'q</span>';
          $('#cmOut', root).innerHTML = markMasked(esc(r.output));
        } catch (e) { $('#cmSt', root).innerHTML = `<span class="down">${esc(e.message)}</span>`; $('#cmOut', root).textContent = ''; }
      }, 250);
    };
    f.addEventListener('input', () => { sync(); test(); });
    f.addEventListener('change', () => { sync(); test(); });
    root.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-preset]');
      if (!b) return;
      const p = CM_PRESETS[+b.dataset.preset];
      f.elements.name.value = p.name; f.elements.pattern.value = p.pattern; f.elements.type.value = p.type; f.elements.sample.value = p.sample; f.elements.column.value = p.column || '';
      f.elements.style.value = p.replace ? 'replace' : 'keep'; f.elements.replace.value = p.replace || ''; f.elements.keepStart.value = p.keepStart || 0; f.elements.keepEnd.value = p.keepEnd || 0;
      sync(); test();
    });
    root.querySelector('[data-x=cancel]').onclick = () => closeModal(null);
    f.onsubmit = async (ev) => {
      ev.preventDefault();
      try {
        if (isNew) await api('/masks', { method: 'POST', body: read() });
        else await api(`/masks/${m.id}`, { method: 'PUT', body: read() });
        closeModal(true);
        toast(isNew ? "Niqob qo'shildi" : 'Saqlandi');
      } catch (e) { toast(e.message, true); }
    };
    sync(); test();
  });
}

// ---------------------------------------------------------------- kill switch / theme
$('#kill').onclick = async () => {
  const reason = await ask({ title: 'Kill-switch', text: 'Barcha agentlarning barcha chaqiruvlari <b>darhol</b> rad etiladi. Sabab auditga yoziladi.', input: 'shubhali faollik', ok: "Hammasini to'xtatish", danger: true });
  if (reason === null) return;
  try { await api('/kill', { method: 'POST', body: { reason } }); toast("Gateway to'xtatildi", true); } catch (e) { toast(e.message, true); }
};
$('#unkill').onclick = async () => { try { await api('/unkill', { method: 'POST' }); toast('Gateway qayta yoqildi'); } catch (e) { toast(e.message, true); } };
$('#theme').onclick = () => {
  const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('gw-theme', t); } catch { /* blocked */ }
  if (S) emit('gwa:state', S); // flow3d reads colours from CSS variables when it rebuilds
};

// ---------------------------------------------------------------- global clicks / keys
document.addEventListener('click', (ev) => {
  const c = ev.target.closest('[data-call]');
  if (c && !ev.target.closest('.drawer')) { openCall(+c.dataset.call, c.dataset.day); return; }
  const ft = ev.target.closest('[data-filter-tool]');
  if (ft) return filterAudit('tool', ft.dataset.filterTool);
  const fa = ev.target.closest('[data-filter-agent]');
  if (fa) return filterAudit('agent', fa.dataset.filterAgent);
  if (ev.target.closest('[data-clear-sid]')) { ev.preventDefault(); $('#filters').sid.value = ''; loadAudit(); return; }
  const fl = ev.target.closest('[data-flip]');
  if (fl) { const box = fl.closest('[data-tbl]'); box.innerHTML = tableHtml(fl.dataset.flip, !box.querySelector('table.vert')); return; }
  const ct = ev.target.closest('[data-copytbl]');
  if (ct) { const t = tables.get(ct.dataset.copytbl); if (t) copy(t.map((r) => r.join('\t')).join('\n'), `${t.length - 1} qator nusxalandi`); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (!$('#modal').hidden) return closeModal(null); if (!$('#drawer').hidden) return closeDrawer(); }
  const typing = /^(input|textarea|select)$/i.test(e.target.tagName);
  if (typing || e.ctrlKey || e.metaKey || e.altKey || !$('#modal').hidden) return;
  if (!$('#drawer').hidden && (e.key === 'j' || e.key === 'ArrowDown')) { e.preventDefault(); stepDrawer(1); return; }
  if (!$('#drawer').hidden && (e.key === 'k' || e.key === 'ArrowUp')) { e.preventDefault(); stepDrawer(-1); return; }
  if (e.key === '/') { e.preventDefault(); location.hash = '#audit'; setTimeout(() => $('#filters').q.focus(), 30); return; }
  const tabs = ['overview', 'audit', 'agents', 'connectors', 'playground', 'settings'];
  if (/^[1-6]$/.test(e.key)) location.hash = `#${tabs[+e.key - 1]}`;
});

// ---------------------------------------------------------------- 3D flow (flow3d.js listens to these)
const emit = (type, detail) => dispatchEvent(new CustomEvent(type, { detail }));

// ---------------------------------------------------------------- live stream
function onState() {
  renderChrome(); renderHealth(); renderTiles(); fillFilterOptions(); renderSettings(); renderCustomMasks(); renderAlerts();
  const v = view();
  if (v === 'agents' && $('#modal').hidden) renderAgents();
  if (v === 'connectors' && $('#modal').hidden) renderConnectors();
  if (v === 'playground') renderPlayground();
  window.__gwaState = S;
  emit('gwa:state', S);
}
function onCall(e) {
  if (e.id <= lastId) return;
  lastId = e.id;
  feed.push(e);
  if (feed.length > 500) feed = feed.slice(-500);
  const ol = $('#feed');
  ol.querySelector('.empty')?.remove();
  ol.insertAdjacentHTML('afterbegin', feedItem(e, true));
  while (ol.children.length > 60) ol.lastElementChild.remove();
  auditPush(e);
  if (e.type === 'admin') { if (view() === 'settings') loadAdminLog(); } else emit('gwa:call', e);
  statsSoon();
}
function connect() {
  const es = new EventSource('/admin/api/live');
  es.addEventListener('open', () => { $('#conn').className = 'pill ok'; $('#conn').textContent = '● jonli'; });
  es.addEventListener('error', () => { $('#conn').className = 'pill bad'; $('#conn').textContent = 'uzildi, qayta ulanmoqda…'; });
  es.addEventListener('state', (m) => { S = JSON.parse(m.data); onState(); });
  es.addEventListener('start', (m) => {
    const x = JSON.parse(m.data);
    if (S) { S.inflight = [...(S.inflight || []), x]; renderHealth(); }
    emit('gwa:start', x);
  });
  es.addEventListener('end', (m) => {
    const k = JSON.parse(m.data).key;
    if (S) { S.inflight = (S.inflight || []).filter((x) => x.key !== k); renderHealth(); }
    emit('gwa:end', k);
  });
  es.addEventListener('call', (m) => onCall(JSON.parse(m.data)));
}
// live timers for in-flight calls and relative times
setInterval(() => { $$('[data-since]').forEach((el) => { el.textContent = ms(Date.now() - +el.dataset.since); }); }, 500);
setInterval(() => { if (view() === 'agents' && $('#modal').hidden) renderAgents(); }, 15_000);

(async () => {
  try {
    feed = await api('/log?limit=300');
    lastId = feed.at(-1)?.id || 0;
  } catch { /* stream will fill */ }
  renderFeed();
  await loadStats();
  setInterval(loadStats, 30_000);
  connect();
  route();
})();
