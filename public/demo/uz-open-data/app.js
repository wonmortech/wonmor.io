// Explorer for the uz-open-data datasets. Everything shown is computed in the browser from the two files
// the repository publishes: mosques/mosques.geojson and alphabet/cyrillic-to-latin-2026.csv (copied next to
// this page by tools/build-demo.mjs). Pins and notes are kept in memory only and reset on reload.
import { MapView } from './map.js';
import { parseCsv, buildTable, convert, hasCyrillic } from './translit.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (n) => new Intl.NumberFormat('en-US').format(n);
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0) + '%';
const main = $('#main');

// Regional centres, used only to group points by the nearest centre (straight line). This is an
// approximation for browsing, not an administrative boundary.
const CENTRES = [
  { region: 'Tashkent city', name: 'Toshkent', lon: 69.279, lat: 41.311 },
  { region: 'Tashkent region', name: 'Nurafshon', lon: 69.36, lat: 41.04 },
  { region: 'Andijan', name: 'Andijon', lon: 72.344, lat: 40.783 },
  { region: 'Namangan', name: 'Namangan', lon: 71.672, lat: 40.998 },
  { region: 'Fergana', name: 'Fargʻona', lon: 71.784, lat: 40.389 },
  { region: 'Syrdarya', name: 'Guliston', lon: 68.78, lat: 40.49 },
  { region: 'Jizzakh', name: 'Jizzax', lon: 67.842, lat: 40.115 },
  { region: 'Samarkand', name: 'Samarqand', lon: 66.976, lat: 39.654 },
  { region: 'Kashkadarya', name: 'Qarshi', lon: 65.79, lat: 38.86 },
  { region: 'Surkhandarya', name: 'Termiz', lon: 67.278, lat: 37.224 },
  { region: 'Bukhara', name: 'Buxoro', lon: 64.428, lat: 39.775 },
  { region: 'Navoiy', name: 'Navoiy', lon: 65.374, lat: 40.103 },
  { region: 'Khorezm', name: 'Urganch', lon: 60.63, lat: 41.55 },
  { region: 'Karakalpakstan', name: 'Nukus', lon: 59.61, lat: 42.46 },
];
const CITY_LABELS = CENTRES.map((c) => ({ ...c, minScale: c.name === 'Nurafshon' ? 700 : 0 }));
const PRESETS = { Uzbekistan: null, 'Fergana Valley': [70.4, 40.0, 73.2, 41.4], Tashkent: [68.85, 41.0, 69.75, 41.6], Bukhara: [64.2, 39.6, 64.7, 39.9], Samarkand: [66.8, 39.55, 67.15, 39.75], Khorezm: [60.2, 41.2, 61.2, 41.9] };

const state = {
  all: [], meta: null, table: null, rows: [], borders: null,
  f: { q: '', type: 'all', script: 'all', region: 'all' },
  sort: { key: 'name', dir: 1 }, page: 0,
  pins: new Map(), map: null, density: false, selected: null,
  alpha: 'Ўзбекистон Республикаси пойтахти — Тошкент.\nМаъно, поезд, лицей, цирк, ЯНГИ ЙЎЛ.', letter: null,
};

/* ---------- data ---------- */
const typeName = { node: 'node', way: 'way', relation: 'relation' };
const APOS = [["'", 'U+0027 apostrophe'], ['`', 'U+0060 grave accent'], ['ʻ', 'U+02BB turned comma'], ['‘', 'U+2018 left quote'], ['’', 'U+2019 right quote'], ['ʼ', 'U+02BC modifier apostrophe']];
const norm = (s) => (s || '').toLowerCase().replace(/[`'ʻ‘’ʼ]/g, '').replace(/\s+/g, ' ').trim();
const GENERIC = /^(jome?\s*masjidi?|jome?|masjidi?|мечеть|mosque|jume masjid|juma masjidi?|жоме масжиди|масжид|masjid jome)$/;
function script(s) {
  if (!s) return 'none';
  const c = hasCyrillic(s), l = /[A-Za-z]/.test(s);
  return c && l ? 'mixed' : c ? 'cyrillic' : 'latin';
}
function km(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function prepare(fc) {
  state.all = fc.features.map((f, i) => {
    const p = f.properties, [lon, lat] = f.geometry.coordinates;
    const rec = { i, type: p.osm_type, id: p.osm_id, key: p.osm_type + '/' + p.osm_id, name: p.name || '', nameUz: p['name:uz'] || '', nameRu: p['name:ru'] || '', city: p['addr:city'] || '', lon, lat };
    rec.script = script(rec.name);
    rec.generic = GENERIC.test(norm(rec.name));
    let best = null, bd = Infinity;
    for (const c of CENTRES) { const d = km(rec, c); if (d < bd) { bd = d; best = c; } }
    rec.region = best.region; rec.centreKm = bd;
    rec.label = rec.name || rec.nameRu || `${rec.type} ${rec.id} (no name)`;
    return rec;
  });
  // possible duplicates: same non-generic name within 150 m
  const byName = new Map();
  for (const r of state.all) if (r.name && !r.generic) { const k = norm(r.name); if (!byName.has(k)) byName.set(k, []); byName.get(k).push(r); }
  state.dups = [];
  for (const list of byName.values()) {
    for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) {
      const d = km(list[a], list[b]);
      if (d < 0.15) state.dups.push([list[a], list[b], d]);
    }
  }
  // seed pins so the Pinned page shows its features; real points, fictional notes
  const seed = [['Bahovuddin', 'Check opening hours before the Friday visit.'], ['Hazrati Dovud', 'Photograph the entrance for the OSM note.'], ['SAYROB', 'Name has old apostrophe; propose name:uz in 2026 Latin.'], ['Юнусабадский', 'Name is Cyrillic and generic; ask a local mapper.']];
  for (const [needle, note] of seed) {
    const r = state.all.find((x) => x.name.includes(needle));
    if (r) state.pins.set(r.key, { note, at: Date.now() - (state.pins.size + 1) * 3 * 864e5 });
  }
}

/* ---------- ui helpers ---------- */
let tt;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 1700); }
const daysAgo = (t) => { const d = Math.round((Date.now() - t) / 864e5); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago'; };
const osmUrl = (r) => `https://www.openstreetmap.org/${r.type}/${r.id}`;
const detailHref = (r) => `#/m/${r.type}/${r.id}`;
const scriptPill = (r) => `<span class="pill ${r.script === 'cyrillic' ? 'cyr' : r.script === 'none' ? 'none' : ''}">${r.script === 'none' ? 'no name' : r.script}</span>`;
const head = (t, lede, extra = '') => `<div class="head"><div><h1>${t}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div>${extra}</div>`;
function updPins() { $('#pincount').textContent = state.pins.size || ''; }
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('Downloaded ' + name);
}
function filtered() {
  const f = state.f, q = norm(f.q);
  return state.all.filter((r) => (f.type === 'all' || r.type === f.type)
    && (f.script === 'all' || r.script === f.script || (f.script === 'named' && r.script !== 'none'))
    && (f.region === 'all' || r.region === f.region)
    && (!q || norm(r.name + ' ' + r.nameRu + ' ' + r.nameUz + ' ' + r.city + ' ' + r.id).includes(q)));
}
function filterBar(withSearch = true) {
  const f = state.f;
  const cnt = (k, v) => state.all.filter((r) => (k === 'script' ? (v === 'named' ? r.script !== 'none' : r.script === v) : r[k] === v)).length;
  return `<div class="toolbar">${withSearch ? `<input class="input" id="q" type="search" placeholder="Search name (any script), city or OSM id" value="${esc(f.q)}">` : ''}
    ${['all', 'node', 'way', 'relation'].map((t) => `<button class="chip" data-ft="${t}" aria-pressed="${f.type === t}">${t === 'all' ? 'All types' : `<span class="dot ${t}"></span> ${t}`}<span class="n">${t === 'all' ? '' : cnt('type', t)}</span></button>`).join('')}
    <select class="input" id="fs" style="flex:0 0 auto">${[['all', 'Any name'], ['named', 'Has a name'], ['latin', 'Latin name'], ['cyrillic', 'Cyrillic name'], ['mixed', 'Mixed scripts'], ['none', 'No name']].map(([v, l]) => `<option value="${v}"${f.script === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
    <select class="input" id="fr" style="flex:0 0 auto"><option value="all">All regions</option>${CENTRES.map((c) => `<option${f.region === c.region ? ' selected' : ''}>${c.region}</option>`).join('')}</select></div>`;
}
function bindFilters(onChange) {
  const q = $('#q');
  if (q) q.oninput = () => { state.f.q = q.value; state.page = 0; onChange(true); };
  $$('[data-ft]').forEach((b) => (b.onclick = () => { state.f.type = b.dataset.ft; state.page = 0; onChange(); }));
  $('#fs').onchange = (e) => { state.f.script = e.target.value; state.page = 0; onChange(); };
  $('#fr').onchange = (e) => { state.f.region = e.target.value; state.page = 0; onChange(); };
}
function newMap(el, opts = {}) {
  if (state.map && state.map !== opts.keep) state.map.destroy?.();
  return new MapView(el, { borders: state.borders, cities: CITY_LABELS, ...opts });
}

/* ---------- pages ---------- */
const pages = {};

pages[''] = () => {
  const A = state.all, n = A.length;
  const c = (fn) => A.filter(fn).length;
  const types = ['node', 'way', 'relation'].map((t) => [t, c((r) => r.type === t)]);
  const fields = [['name', c((r) => r.name)], ['name:ru', c((r) => r.nameRu)], ['name:uz', c((r) => r.nameUz)], ['addr:city', c((r) => r.city)]];
  const regions = CENTRES.map((x) => [x.region, c((r) => r.region === x.region)]).sort((a, b) => b[1] - a[1]);
  main.innerHTML = `
    ${head('Open data for Uzbekistan, ready to explore', `${nf(n)} mosques from OpenStreetMap and the Uzbek Cyrillic → 2026 Latin letter table. Every number on this page is computed from the files in the repository; nothing is sampled or invented.`)}
    <div class="grid g4 mt32">
      <div class="card stat"><b>${nf(n)}</b><span>mosques in mosques.geojson</span></div>
      <div class="card stat"><b>${pct(c((r) => r.name), n)}</b><span>have a <code>name</code> tag (${nf(c((r) => r.name))})</span></div>
      <div class="card stat"><b>${state.table.size}</b><span>Cyrillic letters, ${state.rows.length} rows in the alphabet table</span></div>
      <div class="card stat"><b>${state.meta.date}</b><span>OpenStreetMap snapshot date</span></div>
    </div>
    <div class="grid g2 mt24">
      <a class="card" href="#/map" style="padding:0;overflow:hidden"><div class="mapwrap map-mini" id="mini" style="border:0;border-radius:0"></div><div style="padding:16px 20px"><h3>Map</h3><p class="small muted mt8">Every point, with zoom, filters and a density layer.</p></div></a>
      <div class="card"><h3>Dataset at a glance</h3>
        <div class="bars mt16">${types.map(([t, v]) => `<div class="bar"><a href="#/table" data-go-type="${t}"><span class="dot ${t}"></span> ${t}s</a><span class="track"><span class="fill" style="width:${(v / n) * 100}%"></span></span><span class="n">${nf(v)}</span></div>`).join('')}</div>
        <h3 class="mt24">Tag coverage</h3>
        <div class="bars mt16">${fields.map(([k, v]) => `<div class="bar"><code>${k}</code><span class="track"><span class="fill" style="width:${(v / n) * 100}%"></span></span><span class="n">${pct(v, n)}</span></div>`).join('')}</div></div>
    </div>
    <h2>Where the points are</h2>
    <p class="small muted mt8">Grouped by nearest regional centre (straight line), an approximation for browsing. <a href="#/regions">All regions →</a></p>
    <div class="bars mt16">${regions.slice(0, 8).map(([k, v]) => `<div class="bar"><a href="#/table" data-go-region="${k}">${k}</a><span class="track"><span class="fill" style="width:${(v / regions[0][1]) * 100}%"></span></span><span class="n">${nf(v)}</span></div>`).join('')}</div>
    <h2>Explore</h2>
    <div class="grid g4 mt16">
      ${[['table', 'Table', 'Sort, search in any script, filter and export CSV or GeoJSON.'], ['quality', 'Data quality', `${nf(n - c((r) => r.name))} unnamed, ${nf(c((r) => r.generic))} generic names, ${nf(c((r) => r.script === 'cyrillic'))} Cyrillic, ${state.dups.length} likely duplicates.`], ['alphabet', 'Alphabet', 'The letter table with a live converter and the bitg test cases.'], ['pinned', 'Pinned', 'Your own short list with notes, kept until reload.']].map(([h, t, d]) => `<a class="card" href="#/${h}"><h3>${t}</h3><p class="small muted mt8">${d}</p></a>`).join('')}
    </div>`;
  const m = newMap($('#mini'), { interactive: false });
  state.map = m;
  m.setPoints(state.all);
  $$('[data-go-type]').forEach((a) => (a.onclick = () => { state.f = { q: '', type: a.dataset.goType, script: 'all', region: 'all' }; }));
  $$('[data-go-region]').forEach((a) => (a.onclick = () => { state.f = { q: '', type: 'all', script: 'all', region: a.dataset.goRegion }; }));
};

pages.map = () => {
  main.innerHTML = `
    ${head('Map', 'Drag, scroll or use the buttons to zoom; click a point for details.', `<div class="row">${Object.keys(PRESETS).map((k) => `<button class="chip" data-preset="${k}">${k}</button>`).join('')}<button class="chip" id="dens" aria-pressed="${state.density}">Density</button></div>`)}
    ${filterBar()}
    <div class="maplayout"><div class="mapwrap map-full" id="map"><div class="tip"></div>
      <div class="map-ui"><button id="zin" aria-label="Zoom in">+</button><button id="zout" aria-label="Zoom out">−</button><button id="zfit" aria-label="Fit Uzbekistan">⤢</button></div>
      <div class="legend"><span><span class="dot node"></span> node</span><span><span class="dot way"></span> way (centre)</span><span><span class="dot relation"></span> relation (centre)</span><span class="cap" id="shown"></span></div></div>
      <aside class="side" id="side"></aside></div>`;
  const m = newMap($('#map'), { onSelect: (p) => { state.selected = p; m.select(p); side(); } });
  state.map = m;
  m.density = state.density;
  const side = () => {
    const r = state.selected, list = m.points;
    if (!r) {
      const top = [...list].filter((x) => x.name && !x.generic).slice(0, 14);
      $('#side').innerHTML = `<div class="card"><h3>${nf(list.length)} points shown</h3><p class="small muted mt8">Click a point on the map, or one of these named ones.</p></div><div class="card"><div class="list">${top.map((x) => `<a href="${detailHref(x)}" data-sel="${x.key}"><span>${esc(x.name)}</span><span>${x.region}</span></a>`).join('') || '<p class="small muted">No named points under these filters.</p>'}</div></div>`;
    } else {
      const pinned = state.pins.has(r.key);
      $('#side').innerHTML = `<div class="card"><span class="cap"><span class="dot ${r.type}"></span> ${r.type} ${r.id}</span><h3 class="mt8">${esc(r.label)}</h3>
        <dl class="kv mt16"><dt>name:ru</dt><dd>${esc(r.nameRu) || '<span class="muted">—</span>'}</dd><dt>name:uz</dt><dd>${esc(r.nameUz) || '<span class="muted">—</span>'}</dd><dt>addr:city</dt><dd>${esc(r.city) || '<span class="muted">—</span>'}</dd><dt>Region</dt><dd>${r.region} <span class="muted">(${r.centreKm.toFixed(0)} km to centre)</span></dd><dt>Lat, lon</dt><dd class="mono">${r.lat.toFixed(5)}, ${r.lon.toFixed(5)}</dd></dl>
        <div class="row mt16"><a class="btn sm" href="${detailHref(r)}">Details</a><button class="btn sm secondary" id="pin">${pinned ? 'Unpin' : 'Pin'}</button><a class="btn sm ghost" href="${osmUrl(r)}" target="_blank" rel="noopener">OpenStreetMap ↗</a></div></div>
        <div class="card"><h3>Nearest</h3><div class="list mt8">${nearest(r, 6).map(([x, d]) => `<a href="${detailHref(x)}" data-sel="${x.key}"><span>${esc(x.label)}</span><span>${d < 1 ? Math.round(d * 1000) + ' m' : d.toFixed(1) + ' km'}</span></a>`).join('')}</div></div>`;
      $('#pin').onclick = () => { togglePin(r); side(); };
    }
    $$('[data-sel]', $('#side')).forEach((a) => (a.onclick = (e) => { e.preventDefault(); const x = state.all.find((y) => y.key === a.dataset.sel); state.selected = x; m.select(x); m.focus(x.lon, x.lat, Math.max(m.view.s, 2500)); side(); }));
  };
  const apply = () => { const list = filtered(); m.setPoints(list); $('#shown').textContent = nf(list.length) + ' shown'; if (state.selected && !list.includes(state.selected)) state.selected = null; side(); };
  bindFilters(() => { apply(); $$('[data-ft]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ft === state.f.type))); });
  m.ready(() => { apply(); if (state.selected) { m.select(state.selected); m.focus(state.selected.lon, state.selected.lat, 3000); } });
  $('#zin').onclick = () => m.zoom(1.6); $('#zout').onclick = () => m.zoom(0.625); $('#zfit').onclick = () => m.fit();
  $$('[data-preset]').forEach((b) => (b.onclick = () => (PRESETS[b.dataset.preset] ? m.fit(PRESETS[b.dataset.preset]) : m.fit())));
  $('#dens').onclick = () => { state.density = !state.density; m.density = state.density; $('#dens').setAttribute('aria-pressed', state.density); m.draw(); };
};
function nearest(r, k) {
  return state.all.filter((x) => x !== r).map((x) => [x, km(r, x)]).sort((a, b) => a[1] - b[1]).slice(0, k);
}
function togglePin(r) {
  if (state.pins.has(r.key)) { state.pins.delete(r.key); toast('Unpinned'); } else { state.pins.set(r.key, { note: '', at: Date.now() }); toast('Pinned · see the Pinned page'); }
  updPins();
}

const COLS = [['type', 'Type'], ['id', 'OSM id', 'num'], ['name', 'name'], ['nameRu', 'name:ru'], ['nameUz', 'name:uz'], ['city', 'addr:city'], ['region', 'Region'], ['lat', 'Lat, lon', 'num']];
pages.table = () => {
  const PAGE = 50;
  const list = filtered();
  const { key, dir } = state.sort;
  list.sort((a, b) => {
    const x = a[key], y = b[key];
    if (typeof x === 'number') return (x - y) * dir;
    if (!x && y) return 1; if (x && !y) return -1;
    return String(x).localeCompare(String(y), 'uz') * dir;
  });
  const pages_ = Math.max(1, Math.ceil(list.length / PAGE));
  state.page = Math.min(state.page, pages_ - 1);
  const slice = list.slice(state.page * PAGE, state.page * PAGE + PAGE);
  main.innerHTML = `
    ${head('Table', `${nf(list.length)} of ${nf(state.all.length)} features. Tag values are shown exactly as mappers entered them.`, `<div class="row"><button class="btn secondary" id="csv">Export CSV</button><button class="btn secondary" id="gj">Export GeoJSON</button></div>`)}
    ${filterBar()}
    <div class="tbl">${slice.length ? `<table><thead><tr>${COLS.map(([k, l, c]) => `<th class="${c || ''} ${['nameUz', 'city'].includes(k) ? 'hide-sm' : ''}"><button data-sort="${k}" aria-sort="${key === k ? (dir > 0 ? 'ascending' : 'descending') : 'none'}">${l}</button></th>`).join('')}<th></th></tr></thead><tbody>
      ${slice.map((r) => `<tr><td><span class="dot ${r.type}"></span> ${r.type}</td><td class="num mono"><a href="${detailHref(r)}">${r.id}</a></td><td><a href="${detailHref(r)}">${esc(r.name) || '<span class="muted">no name</span>'}</a> ${r.script === 'cyrillic' || r.script === 'mixed' ? scriptPill(r) : ''}</td><td>${esc(r.nameRu)}</td><td class="hide-sm">${esc(r.nameUz)}</td><td class="hide-sm">${esc(r.city)}</td><td class="muted">${r.region}</td><td class="num mono">${r.lat.toFixed(4)}, ${r.lon.toFixed(4)}</td><td><button class="btn sm ghost" data-pin="${r.key}">${state.pins.has(r.key) ? 'Unpin' : 'Pin'}</button></td></tr>`).join('')}
      </tbody></table>
      <div class="pager"><span>Rows ${nf(state.page * PAGE + 1)}–${nf(state.page * PAGE + slice.length)} of ${nf(list.length)}</span><div class="row"><button class="btn sm secondary" id="prev"${state.page ? '' : ' disabled'}>← Previous</button><span>Page ${state.page + 1} / ${pages_}</span><button class="btn sm secondary" id="next"${state.page < pages_ - 1 ? '' : ' disabled'}>Next →</button></div></div>`
      : `<div class="empty"><h3>No feature matches</h3><p class="small mt8">Names are stored as mappers typed them, in Latin or Cyrillic, with several apostrophe characters. Search ignores apostrophes; try a shorter word.</p><button class="btn secondary mt16" id="reset">Clear filters</button></div>`}</div>`;
  bindFilters((typing) => { pages.table(); if (typing) { const q = $('#q'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); } });
  $$('[data-sort]').forEach((b) => (b.onclick = () => { const k = b.dataset.sort; state.sort = { key: k, dir: state.sort.key === k ? -state.sort.dir : 1 }; pages.table(); }));
  $$('[data-pin]').forEach((b) => (b.onclick = () => { togglePin(state.all.find((r) => r.key === b.dataset.pin)); pages.table(); }));
  const prev = $('#prev'), next = $('#next'), reset = $('#reset');
  if (prev) prev.onclick = () => { state.page--; pages.table(); };
  if (next) next.onclick = () => { state.page++; pages.table(); };
  if (reset) reset.onclick = () => { state.f = { q: '', type: 'all', script: 'all', region: 'all' }; pages.table(); };
  $('#csv').onclick = () => {
    const q = (v) => (/[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : v);
    download('mosques-filtered.csv', ['osm_type,osm_id,name,name:uz,name:ru,addr:city,lat,lon', ...list.map((r) => [r.type, r.id, r.name, r.nameUz, r.nameRu, r.city, r.lat, r.lon].map(q).join(','))].join('\n') + '\n', 'text/csv');
  };
  $('#gj').onclick = () => download('mosques-filtered.geojson', JSON.stringify({ type: 'FeatureCollection', features: list.map((r) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [r.lon, r.lat] }, properties: Object.fromEntries(Object.entries({ osm_type: r.type, osm_id: r.id, name: r.name, 'name:uz': r.nameUz, 'name:ru': r.nameRu, 'addr:city': r.city }).filter(([, v]) => v)) })) }), 'application/geo+json');
};

pages.m = (type, id) => {
  const r = state.all.find((x) => x.type === type && String(x.id) === id);
  if (!r) { main.innerHTML = `<div class="empty"><h3>No feature ${esc(type)}/${esc(id)} in this snapshot</h3><p class="small mt8">It may have been added to OpenStreetMap after the snapshot date, or removed.</p><a class="btn secondary mt16" href="#/table">Back to the table</a></div>`; return; }
  const pin = state.pins.get(r.key);
  const conv = [r.name].filter(hasCyrillic).map((s) => [s, convert(s, state.table).text]);
  const near = nearest(r, 8);
  main.innerHTML = `
    <p class="cap"><a href="#/table">Table</a> / ${r.type} ${r.id}</p>
    ${head(esc(r.label), '', `<div class="row"><button class="btn${pin ? ' secondary' : ''}" id="pin">${pin ? 'Unpin' : 'Pin'}</button><a class="btn ghost" href="${osmUrl(r)}" target="_blank" rel="noopener">Open in OpenStreetMap ↗</a></div>`)}
    <div class="grid g2 mt24">
      <div class="card"><h3>Properties</h3><p class="cap mt8">Exactly the properties stored in mosques.geojson.</p>
        <dl class="kv mt16"><dt>osm_type</dt><dd><span class="dot ${r.type}"></span> ${r.type}</dd><dt>osm_id</dt><dd class="mono">${r.id}</dd><dt>name</dt><dd>${esc(r.name) || '<span class="muted">not tagged</span>'}</dd><dt>name:uz</dt><dd>${esc(r.nameUz) || '<span class="muted">not tagged</span>'}</dd><dt>name:ru</dt><dd>${esc(r.nameRu) || '<span class="muted">not tagged</span>'}</dd><dt>addr:city</dt><dd>${esc(r.city) || '<span class="muted">not tagged</span>'}</dd><dt>Coordinates</dt><dd class="mono">${r.lat.toFixed(6)}, ${r.lon.toFixed(6)} <button class="btn sm ghost" id="cp">Copy</button></dd><dt>Point is</dt><dd>${r.type === 'node' ? 'the node itself' : 'the centre Overpass computes'}</dd></dl>
        <h3 class="mt24">Derived here</h3>
        <dl class="kv mt16"><dt>Name script</dt><dd>${scriptPill(r)}${r.generic ? ' <span class="pill">generic name</span>' : ''}</dd><dt>Region</dt><dd>${r.region}, ${r.centreKm.toFixed(1)} km from ${CENTRES.find((c) => c.region === r.region).name} (nearest centre)</dd>
        ${conv.map(([a, b]) => `<dt>2026 Latin</dt><dd>${esc(b)} <span class="cap">from “${esc(a)}”, letter table applied to <code>name</code>; a Russian name stays Russian</span></dd>`).join('')}</dl></div>
      <div class="grid" style="align-content:start"><div class="mapwrap map-mini" id="dmap"><div class="tip"></div></div>
        <div class="card"><h3>Your note</h3><p class="cap mt8">Stored in memory; reload clears it.</p><textarea class="input mt8" id="note" placeholder="${pin ? 'Write a note' : 'Pin this mosque to keep a note'}"${pin ? '' : ' disabled'}>${esc(pin?.note || '')}</textarea></div></div>
    </div>
    <h2>Nearest mosques</h2>
    <div class="tbl mt16"><table><thead><tr><th>Name</th><th>Type</th><th class="num">Distance</th><th>Region</th></tr></thead><tbody>${near.map(([x, d]) => `<tr><td><a href="${detailHref(x)}">${esc(x.label)}</a></td><td><span class="dot ${x.type}"></span> ${x.type}</td><td class="num">${d < 1 ? Math.round(d * 1000) + ' m' : d.toFixed(2) + ' km'}</td><td class="muted">${x.region}</td></tr>`).join('')}</tbody></table></div>`;
  const m = newMap($('#dmap'), { onSelect: (p) => { location.hash = detailHref(p); } });
  state.map = m;
  m.ready(() => { m.setPoints(state.all); m.select(r); m.focus(r.lon, r.lat, 2200); });
  $('#pin').onclick = () => { togglePin(r); render(); };
  $('#cp').onclick = async () => { try { await navigator.clipboard.writeText(`${r.lat}, ${r.lon}`); } catch { /* blocked clipboard */ } toast('Copied coordinates'); };
  const note = $('#note');
  note.oninput = () => { const p = state.pins.get(r.key); if (p) p.note = note.value; };
};

pages.regions = () => {
  const rows = CENTRES.map((c) => {
    const list = state.all.filter((r) => r.region === c.region);
    return { ...c, n: list.length, named: list.filter((r) => r.name).length, cyr: list.filter((r) => r.script === 'cyrillic').length, ways: list.filter((r) => r.type !== 'node').length };
  }).sort((a, b) => b.n - a.n);
  const max = rows[0].n;
  main.innerHTML = `
    ${head('Regions', 'Each point is assigned to the nearest of 14 regional centres in a straight line. This is a quick way to browse, not an administrative boundary: a point near a border can land in the neighbouring region.')}
    <div class="grid g2 mt24"><div class="card"><div class="bars">${rows.map((r) => `<div class="bar"><a href="#/table" data-r="${r.region}">${r.region}</a><span class="track"><span class="fill" style="width:${(r.n / max) * 100}%"></span></span><span class="n">${nf(r.n)}</span></div>`).join('')}</div></div>
    <div class="mapwrap" id="rmap" style="min-height:420px"><div class="tip"></div></div></div>
    <h2>Per region</h2>
    <div class="tbl mt16"><table><thead><tr><th>Region</th><th>Centre</th><th class="num">Mosques</th><th class="num">Named</th><th class="num">Cyrillic names</th><th class="num">Ways + relations</th><th></th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td>${r.region}</td><td class="muted">${r.name}</td><td class="num">${nf(r.n)}</td><td class="num">${pct(r.named, r.n)}</td><td class="num">${nf(r.cyr)}</td><td class="num">${nf(r.ways)}</td><td><a class="btn sm ghost" href="#/map" data-rm="${r.region}">Map</a></td></tr>`).join('')}
    </tbody></table></div>`;
  const m = newMap($('#rmap'), { onSelect: (p) => { location.hash = detailHref(p); } });
  state.map = m;
  m.density = true;
  m.ready(() => m.setPoints(state.all));
  $$('[data-r], [data-rm]').forEach((a) => (a.onclick = () => { state.f = { q: '', type: 'all', script: 'all', region: a.dataset.r || a.dataset.rm }; }));
};

pages.quality = () => {
  const A = state.all;
  const unnamed = A.filter((r) => !r.name);
  const generic = A.filter((r) => r.generic);
  const cyr = A.filter((r) => r.script === 'cyrillic' || r.script === 'mixed');
  const genericNames = {};
  for (const r of generic) genericNames[r.name] = (genericNames[r.name] || 0) + 1;
  const apos = APOS.map(([ch, label]) => [ch, label, A.filter((r) => r.name.includes(ch)).length]);
  const ruOnly = A.filter((r) => !r.name && r.nameRu);
  const list = (rows, k = 10) => `<div class="list mt8">${rows.slice(0, k).map((r) => `<a href="${detailHref(r)}"><span>${esc(r.label)}</span><span>${r.region}</span></a>`).join('')}</div>`;
  main.innerHTML = `
    ${head('Data quality', 'What a re-user should know before relying on the names. These are observations about the snapshot, not corrections: fixes belong in OpenStreetMap.')}
    <div class="grid g4 mt24">
      <div class="card stat"><b>${nf(unnamed.length)}</b><span>points without a <code>name</code></span></div>
      <div class="card stat"><b>${nf(generic.length)}</b><span>generic names such as “jomʼe masjid”</span></div>
      <div class="card stat"><b>${nf(cyr.length)}</b><span>names written in Cyrillic or mixed</span></div>
      <div class="card stat"><b>${nf(state.dups.length)}</b><span>pairs with the same name under 150 m apart</span></div>
    </div>
    <div class="grid g2 mt24">
      <div class="card"><h3>Apostrophe characters in names</h3><p class="small muted mt8">Uzbek Latin oʻ and gʻ are typed with at least six different characters. Search here ignores all of them.</p>
        <div class="bars mt16">${apos.map(([ch, l, n]) => `<div class="bar"><span><code>${esc(ch)}</code> <span class="cap">${l}</span></span><span class="track"><span class="fill" style="width:${(n / Math.max(...apos.map((a) => a[2]))) * 100}%"></span></span><span class="n">${nf(n)}</span></div>`).join('')}</div></div>
      <div class="card"><h3>Most common generic names</h3><p class="small muted mt8">A name that only says “mosque” does not identify the place.</p>
        <div class="bars mt16">${Object.entries(genericNames).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([k, v], i, arr) => `<div class="bar"><span>${esc(k)}</span><span class="track"><span class="fill" style="width:${(v / arr[0][1]) * 100}%"></span></span><span class="n">${nf(v)}</span></div>`).join('')}</div></div>
      <div class="card"><div class="row spread"><h3>Cyrillic names</h3><a class="btn sm ghost" href="#/table" id="gocyr">All ${cyr.length} in the table</a></div><p class="small muted mt8">Most are Russian, so the letter-table output on the right is a transliteration, not an Uzbek name.</p>
        <div class="list mt8">${cyr.slice(0, 10).map((r) => `<a href="${detailHref(r)}"><span>${esc(r.name)}</span><span>${esc(convert(r.name, state.table).text)}</span></a>`).join('')}</div></div>
      <div class="card"><h3>Likely duplicates</h3><p class="small muted mt8">Same name, under 150 m apart. Often a building (way) and a node for the same mosque.</p>
        <div class="list mt8">${state.dups.length ? state.dups.slice(0, 10).map(([a, b, d]) => `<a href="${detailHref(a)}"><span>${esc(a.name)} <span class="cap">${a.type} + ${b.type}</span></span><span>${Math.round(d * 1000)} m</span></a>`).join('') : '<p class="small muted">None found.</p>'}</div></div>
      <div class="card"><h3>Unnamed, by region</h3>${(() => { const by = {}; unnamed.forEach((r) => (by[r.region] = (by[r.region] || 0) + 1)); const e = Object.entries(by).sort((a, b) => b[1] - a[1]); return `<div class="bars mt16">${e.slice(0, 7).map(([k, v]) => `<div class="bar"><span>${k}</span><span class="track"><span class="fill" style="width:${(v / e[0][1]) * 100}%"></span></span><span class="n">${v}</span></div>`).join('')}</div>`; })()}</div>
      <div class="card"><h3>Only <code>name:ru</code>, no <code>name</code></h3><p class="small muted mt8">${nf(ruOnly.length)} points. Data consumers that read only <code>name</code> will miss these.</p>${ruOnly.length ? list(ruOnly, 6) : '<p class="small muted mt8">None in this snapshot: every point with name:ru also has name.</p>'}</div>
    </div>`;
  $('#gocyr').onclick = () => { state.f = { q: '', type: 'all', script: 'cyrillic', region: 'all' }; };
};

pages.pinned = () => {
  const rows = [...state.pins.entries()].map(([k, v]) => [state.all.find((r) => r.key === k), v]).filter(([r]) => r).sort((a, b) => b[1].at - a[1].at);
  main.innerHTML = `
    ${head('Pinned', 'A short list for a field trip or a mapping session. Pin from the map, the table or a detail page; edit notes here. Nothing leaves your browser and a reload resets the list.', rows.length ? `<div class="row"><button class="btn secondary" id="exp">Export list (CSV)</button><button class="btn ghost" id="clr">Clear all</button></div>` : '')}
    ${rows.length ? `<div class="grid g2 mt24">${rows.map(([r, v]) => `<div class="card"><div class="row spread"><span class="cap"><span class="dot ${r.type}"></span> ${r.type} ${r.id} · ${r.region}</span><span class="cap">pinned ${daysAgo(v.at)}</span></div>
      <h3 class="mt8"><a href="${detailHref(r)}">${esc(r.label)}</a></h3>
      <textarea class="input mt16" data-note="${r.key}" placeholder="Add a note" style="min-height:70px">${esc(v.note)}</textarea>
      <div class="row mt8"><a class="btn sm secondary" href="#/map" data-show="${r.key}">Show on map</a><button class="btn sm ghost" data-unpin="${r.key}">Remove</button></div></div>`).join('')}</div>`
      : `<div class="card empty mt24"><h3>Nothing pinned</h3><p class="small mt8">Open the map or the table and press “Pin” on a mosque you want to visit or fix in OpenStreetMap.</p><a class="btn mt16" href="#/map">Open the map</a></div>`}`;
  $$('[data-note]').forEach((t) => (t.oninput = () => { state.pins.get(t.dataset.note).note = t.value; }));
  $$('[data-unpin]').forEach((b) => (b.onclick = () => { state.pins.delete(b.dataset.unpin); updPins(); toast('Removed'); pages.pinned(); }));
  $$('[data-show]').forEach((a) => (a.onclick = () => { state.selected = state.all.find((r) => r.key === a.dataset.show); }));
  const clr = $('#clr'), exp = $('#exp');
  if (clr) clr.onclick = () => { state.pins.clear(); updPins(); pages.pinned(); };
  if (exp) exp.onclick = () => download('pinned.csv', ['osm_type,osm_id,name,lat,lon,note', ...rows.map(([r, v]) => [r.type, r.id, r.label, r.lat, r.lon, v.note].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n') + '\n', 'text/csv');
};

const TESTS = [['ер', 'yer'], ['поезд', 'poyezd'], ['келди', 'keldi'], ['лицей', 'litsey'], ['цирк', 'sirk'], ['маъно', 'maʼno'], ['Янги', 'Yangi'], ['ЯНГИ', 'YANGI'], ['ПОЕЗД', 'POYEZD']];
pages.alphabet = () => {
  const letters = [...state.table.keys()];
  const sel = state.letter;
  main.innerHTML = `
    ${head('Cyrillic → 2026 Latin', `The ${state.rows.length}-row letter table, transcribed from <a href="https://github.com/dtwinuz/bitg">bitg</a>. The 2026 alphabet writes Ö, Ğ, Ş, Ç where the previous Latin alphabet had Oʻ, Gʻ, Sh, Ch.`, '<a class="btn secondary" href="data/cyrillic-to-latin-2026.csv" download>Download CSV</a>')}
    <div class="grid g2 mt24">
      <div class="card"><label class="cap" for="src">Cyrillic text</label><textarea class="input mt8" id="src" spellcheck="false">${esc(state.alpha)}</textarea>
        <div class="row mt8">${['Тошкент шаҳри, Чилонзор тумани', 'Ғафур Ғулом кўчаси', 'ЎЗБЕКИСТОН', 'Шоҳимардон, Қўқон, Хоразм'].map((s) => `<button class="chip" data-ex="${s}">${s}</button>`).join('')}</div></div>
      <div class="card"><span class="cap">2026 Latin <span id="nconv"></span></span><div class="out mt8" id="dst" aria-live="polite"></div><div class="row mt8"><button class="btn sm secondary" id="copy">Copy</button></div></div>
    </div>
    <p class="callout mt16">This is the letter table only. Names, foreign words and the old-Latin → 2026 direction need bitg's extra rules and lexicon, so use bitg itself for running text.</p>
    <h2>Letters</h2><p class="small muted mt8">Click a letter to see its rows. Letters marked “rule” depend on the letter before them.</p>
    <div class="letters mt16">${letters.map((l) => { const rows = state.table.get(l); return `<button class="letter${rows.length > 1 ? ' cond' : ''}" data-l="${l}" aria-pressed="${sel === l}"><b>${rows[0].cyrillic_upper} ${l}</b><span>${rows.map((r) => r.latin_lower || '∅').join(' / ')}</span></button>`; }).join('')}</div>
    <div id="ldetail"></div>
    <h2>Checks from bitg's unit tests</h2>
    <div class="tbl mt16"><table><thead><tr><th>Cyrillic</th><th>Expected</th><th>This table gives</th><th>Result</th></tr></thead><tbody>${TESTS.map(([a, b]) => { const got = convert(a, state.table).text; return `<tr><td>${a}</td><td class="mono">${b}</td><td class="mono">${got}</td><td class="check ${got === b ? 'ok' : 'bad'}">${got === b ? '✓ match' : '✗ differs'}</td></tr>`; }).join('')}</tbody></table></div>
    <h2>The full table</h2>
    <div class="tbl mt16"><table><thead><tr><th>Lower</th><th>Upper</th><th>Latin</th><th>Latin, capitalised</th><th>Condition</th></tr></thead><tbody>${state.rows.map((r) => `<tr><td>${r.cyrillic_lower}</td><td>${r.cyrillic_upper}</td><td class="mono">${esc(r.latin_lower) || '<span class="muted">(dropped)</span>'}</td><td class="mono">${esc(r.latin_upper) || '<span class="muted">(dropped)</span>'}</td><td class="small muted">${esc(r.condition) || 'always'}</td></tr>`).join('')}</tbody></table></div>`;
  const run = () => {
    const { text, steps } = convert(state.alpha, state.table);
    $('#dst').textContent = text;
    $('#nconv').textContent = `· ${steps.length} letters converted`;
  };
  run();
  $('#src').oninput = (e) => { state.alpha = e.target.value; run(); };
  $$('[data-ex]').forEach((b) => (b.onclick = () => { state.alpha = b.dataset.ex; $('#src').value = state.alpha; run(); }));
  $('#copy').onclick = async () => { try { await navigator.clipboard.writeText($('#dst').textContent); } catch { /* blocked */ } toast('Copied'); };
  const detail = () => {
    if (!state.letter) { $('#ldetail').innerHTML = ''; return; }
    const rows = state.table.get(state.letter);
    const words = state.all.map((r) => r.name).filter((n) => n && hasCyrillic(n) && n.toLowerCase().includes(state.letter)).slice(0, 5);
    $('#ldetail').innerHTML = `<div class="card mt16"><div class="row spread"><h3>${rows[0].cyrillic_upper} ${state.letter}</h3><button class="btn sm ghost" id="lclose">Close</button></div>
      <div class="tbl mt16"><table><thead><tr><th>Latin</th><th>Capitalised</th><th>When</th></tr></thead><tbody>${rows.map((r) => `<tr><td class="mono">${esc(r.latin_lower) || '(dropped)'}</td><td class="mono">${esc(r.latin_upper) || '(dropped)'}</td><td class="small">${esc(r.condition) || 'always'}</td></tr>`).join('')}</tbody></table></div>
      ${words.length ? `<p class="cap mt16">In mosque names from the dataset:</p><div class="list mt8">${words.map((w) => `<a href="#/alphabet"><span>${esc(w)}</span><span>${esc(convert(w, state.table).text)}</span></a>`).join('')}</div>` : ''}</div>`;
    $('#lclose').onclick = () => { state.letter = null; $$('[data-l]').forEach((b) => b.setAttribute('aria-pressed', 'false')); detail(); };
  };
  $$('[data-l]').forEach((b) => (b.onclick = () => { state.letter = b.dataset.l; $$('[data-l]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); detail(); }));
  detail();
};

pages.about = () => {
  const m = state.meta;
  main.innerHTML = `
    ${head('Sources', 'Every dataset ships with the query, script or source it was built from, and the date it was made.')}
    <div class="grid g2 mt24">
      <div class="card"><h3>mosques/mosques.geojson</h3>
        <dl class="kv mt16"><dt>Features</dt><dd>${nf(state.all.length)} (${['node', 'way', 'relation'].map((t) => nf(state.all.filter((r) => r.type === t).length) + ' ' + t + 's').join(', ')})</dd><dt>Query sent</dt><dd>2026-11-13 07:33:00 UTC</dd><dt>OSM data as of</dt><dd class="mono">2026-11-13T07:32:21Z</dd><dt>Endpoint</dt><dd class="mono">overpass-api.de</dd><dt>Licence</dt><dd>ODbL 1.0, © OpenStreetMap contributors</dd><dt>File size</dt><dd>${(m.bytes / 1024).toFixed(0)} KB</dd></dl>
        <p class="small mt16">Filter: <code>amenity=place_of_worship</code> and <code>religion=muslim</code> inside Uzbekistan's national boundary. Ways and relations are reduced to the centre Overpass computes.</p>
        <h3 class="mt24">Query</h3><pre class="code mt8">${esc(m.query)}</pre>
        <h3 class="mt24">Rebuild</h3><pre class="code mt8">curl -s https://overpass-api.de/api/interpreter \\
  --data-urlencode data@query.overpassql -o overpass.json
python3 to_geojson.py overpass.json mosques.geojson</pre>
        <div class="row mt16"><a class="btn secondary" href="data/mosques.geojson" download>Download GeoJSON</a><a class="btn ghost" href="https://github.com/wonmortech/uz-open-data/tree/main/mosques">Folder on GitHub</a></div></div>
      <div class="card"><h3>alphabet/cyrillic-to-latin-2026.csv</h3>
        <dl class="kv mt16"><dt>Rows</dt><dd>${state.rows.length} (${state.table.size} letters; е and ц have two rows)</dd><dt>Source</dt><dd><a href="https://github.com/dtwinuz/bitg">bitg</a>, <code>crates/bitg-core/src/cyrillic.rs</code></dd><dt>Commit</dt><dd class="mono">2de5c946 (2026-11-13)</dd><dt>Tutuq sign</dt><dd>ʼ U+02BC (bitg default)</dd><dt>Licence</dt><dd>MIT, derived from bitg (MIT OR Apache-2.0)</dd></dl>
        <p class="small mt16">If bitg changes its mapping, bitg is authoritative and this table should be regenerated.</p>
        <div class="row mt16"><a class="btn secondary" href="data/cyrillic-to-latin-2026.csv" download>Download CSV</a><a class="btn ghost" href="https://github.com/wonmortech/uz-open-data/tree/main/alphabet">Folder on GitHub</a></div>
        <h3 class="mt24">Principles</h3>
        <ul class="small mt8" style="padding-left:18px;display:grid;gap:6px"><li><b>Reproducible.</b> Query, script or source file, and the date, for every dataset.</li><li><b>Unchanged values.</b> Tags and letters are copied as they are; corrections belong upstream.</li><li><b>Licence per folder.</b> OpenStreetMap data stays under the ODbL.</li></ul>
        <h3 class="mt24">This explorer</h3><p class="small mt8">Map borders: Natural Earth 1:50m via world-atlas 2.0.2 (public domain). Regions are the nearest of 14 centres, not official boundaries. No tiles or third-party requests: everything is served from this page.</p></div>
    </div>`;
};

/* ---------- router ---------- */
function render() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const r = parts[0] || '';
  if (state.map && !['map', 'm', 'regions', ''].includes(r)) { state.map.destroy(); state.map = null; }
  (r === 'm' ? () => pages.m(parts[1], parts[2]) : pages[r] || pages[''])();
  $$('.nav a').forEach((a) => (a.getAttribute('href') === '#/' + (r === 'm' ? 'table' : r) ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  document.title = (r ? ($(`.nav a[href="#/${r === 'm' ? 'table' : r}"]`)?.firstChild?.textContent.trim() || '') + ' · ' : '') + 'uz-open-data explorer';
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  state.map?.draw();
}
$('#theme').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

async function boot() {
  try {
    const [gj, csv, borders, query] = await Promise.all([
      fetch('data/mosques.geojson').then((r) => r.text()),
      fetch('data/cyrillic-to-latin-2026.csv').then((r) => r.text()),
      fetch('borders.json').then((r) => r.json()),
      fetch('data/query.overpassql').then((r) => r.text()),
    ]);
    state.meta = { date: '2026-11-13', bytes: gj.length, query: query.trim() };
    state.borders = borders;
    state.rows = parseCsv(csv);
    state.table = buildTable(state.rows);
    prepare(JSON.parse(gj));
    const p = new URLSearchParams(location.search).get('theme');
    if (p === 'dark' || (!p && matchMedia('(prefers-color-scheme: dark)').matches)) setTheme('dark');
    updPins();
    render();
  } catch (e) {
    main.innerHTML = `<div class="empty"><h3>Could not load the datasets</h3><p class="small mt8">${esc(e.message)}</p></div>`;
  }
  document.documentElement.dataset.ready = '1';
}
boot();
