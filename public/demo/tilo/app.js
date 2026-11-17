// SPDX-FileCopyrightText: 2026 Wonmor and Tilo contributors
// SPDX-License-Identifier: Apache-2.0

/* Tilo concept demo: the planned MVP and v1 modules (docs/06_Platforma_rejasi/06a) as one clickable app on
   fictional data. No camera, microphone, server or real call: every flow is simulated in the browser and
   resets on reload. Hash routing, so it runs from any static folder. */
import * as D from './data.js';

const NOW = new Date();
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const pad = (n) => String(n).padStart(2, '0');
const hm = (d) => pad(d.getHours()) + ':' + pad(d.getMinutes());
const dayText = (d) => { const t = new Date(NOW); t.setHours(0, 0, 0, 0); const x = new Date(d); x.setHours(0, 0, 0, 0); const diff = Math.round((x - t) / 864e5);
  return diff === 0 ? 'Bugun' : diff === 1 ? 'Ertaga' : diff === -1 ? 'Kecha' : d.getDate() + ' ' + MONTHS[d.getMonth()]; };
const ago = (d) => { const m = Math.round((Date.now() - d.getTime()) / 60000); return m < 1 ? 'hozir' : m < 60 ? m + ' daq' : m < 1440 ? Math.round(m / 60) + ' soat' : Math.round(m / 1440) + ' kun'; };
const NF = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/* ---------- DOM helpers (no innerHTML: works under a strict CSP) ---------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k.nodeType ? k : String(k));
  return el;
}
const NS = 'http://www.w3.org/2000/svg';
function s(tag, attrs, ...kids) { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v); for (const k of kids) if (k != null) el.append(k.nodeType ? k : document.createTextNode(String(k))); return el; }
const go = (p) => { location.hash = '#' + p; };
const link = (p, ...kids) => h('a', { href: '#' + p }, ...kids);
function badge(kind, text) { return h('span', { class: 'badge b-' + kind }, text); }
function card(title, ...kids) { return h('section', { class: 'card' }, title ? h('h2', null, title) : null, ...kids); }
function head(eyebrow, title, lead, extra) { return h('header', { class: 'page-head' }, h('p', { class: 'eyebrow' }, eyebrow), h('h1', null, title), lead ? h('p', { class: 'lead' }, lead) : null, extra || null); }
function empty(title, text, action) { return h('div', { class: 'empty' }, h('strong', null, title), h('p', null, text), action || null); }
function kpi(label, value, sub) { return h('div', { class: 'kpi' }, h('span', { class: 'kl' }, label), h('strong', null, value), sub ? h('span', { class: 'ks' }, sub) : null); }
let toastTimer;
function toast(text) { const t = document.getElementById('toast'); t.textContent = text; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2600); }
function speak(text) {
  try { if ('speechSynthesis' in window && !navigator.webdriver) { const u = new SpeechSynthesisUtterance(text); u.lang = 'uz-UZ'; speechSynthesis.cancel(); speechSynthesis.speak(u); } } catch (e) { /* no TTS */ }
  toast('Ovoz chiqarildi: “' + text + '”');
}
const script = () => state.settings.script;
const T = (txt) => (script() === 'cyr' ? D.toCyr(txt) : txt);

/* Animated signer: a placeholder for a recorded sign video. Never a real person, never generated imagery. */
function signer(variant = 0, opts = {}) {
  const svg = s('svg', { viewBox: '0 0 160 120', class: 'signer v' + (variant % 6) + (opts.slow ? ' slow' : '') + (opts.mirror ? ' mirror' : '') + (opts.paused ? ' paused' : ''), role: 'img', 'aria-label': 'Imo-ishora videosi oʻrni (namuna animatsiya)' });
  svg.append(s('rect', { x: 0, y: 0, width: 160, height: 120, rx: 14, class: 'sg-bg' }),
    s('path', { d: 'M40 120 C44 88 58 78 80 78 C102 78 116 88 120 120 Z', class: 'sg-body' }),
    s('circle', { cx: 80, cy: 50, r: 19, class: 'sg-head' }),
    s('circle', { cx: 74, cy: 47, r: 1.8, class: 'sg-eye' }), s('circle', { cx: 86, cy: 47, r: 1.8, class: 'sg-eye' }),
    s('path', { d: 'M74 58 Q80 62 86 58', class: 'sg-mouth' }),
    s('g', { class: 'sg-hand l' }, s('circle', { cx: 56, cy: 92, r: 9 })), s('g', { class: 'sg-hand r' }, s('circle', { cx: 104, cy: 92, r: 9 })),
    s('path', { d: 'M54 104 Q80 70 106 104', class: 'sg-trace' }));
  return h('figure', { class: 'video' + (opts.big ? ' big' : '') }, svg, opts.caption === false ? null : h('figcaption', null, opts.caption || 'Namuna animatsiya · videoni kar imo-ishorachi yozadi'));
}

/* ---------- state (memory only) ---------- */
const state = {
  settings: { font: 100, contrast: false, script: 'lat', vibrate: true, flash: true, wifiOnly: false },
  bookings: D.bookings(NOW), threads: D.threads(NOW), queue: D.queue(NOW), call: null, interp: null, favs: new Set(['d0', 'd13', 'd61']),
  learn: Object.fromEntries(D.lessons.map((l) => [l.id, l.done])), sentence: [], face: null, history: [],
};
state.history = [
  { at: new Date(NOW.getTime() - 50 * 60000), place: 'Bank', lines: 14 }, { at: new Date(NOW.getTime() - 5 * 3600e3), place: 'Poliklinika', lines: 22 },
  { at: new Date(NOW.getTime() - 26 * 3600e3), place: 'Mahalla', lines: 9 }, { at: new Date(NOW.getTime() - 50 * 3600e3), place: 'Doʻkon', lines: 6 },
];
const openNow = () => { const hr = NOW.getHours(); return NOW.getDay() === 0 ? hr >= 10 && hr < 18 : hr >= D.hours.open && hr < D.hours.close; };
const online = () => D.interpreters.filter((i) => i.status === 'online');

/* ---------- home ---------- */
function viewHome() {
  const unread = state.threads.reduce((a, t) => a + t.unread, 0);
  const next = state.bookings.find((b) => b.at > NOW && b.status !== 'cancelled');
  const tiles = [['/vri', 'Tarjimon', 'Videoqoʻngʻiroq, 2 bosishda', 'call'], ['/face', 'Yuzma-yuz', 'Jonli subtitr va yozib javob', 'captions'], ['/cards', 'Vaziyat kartalari', D.situations.reduce((a, x) => a + x.cards.length, 0) + ' ta karta, offlayn', 'card'],
    ['/office', 'Idora yordamchisi', 'Hujjatlar va ariza shabloni', 'doc'], ['/messages', 'Video xabar', unread + ' ta yangi', 'wave'], ['/aac', 'AAC taxta', 'Belgilar orqali nutq', 'grid'],
    ['/learn', 'Ota-onalar', '20 ta qisqa dars', 'learn'], ['/dictionary', 'Lugʻat', D.dictionary.length + ' ta belgi', 'sign'], ['/orgs', 'Tashkilotlar', D.orgs.length + ' ta, imo-ishorada', 'org'], ['/sos', 'SOS (mashq)', 'v1 pilot konsepti', 'sos']];
  return [
    head('Konsept demo · Tilo', 'Kar va eshituvchi odamlar orasidagi devorsiz muloqot', 'Bu yerda rejalashtirilgan ilova toʻqima maʼlumot bilan ishlaydi: har bir tugmani bosib koʻring.'),
    h('div', { class: 'hero' },
      h('div', { class: 'call-cta' }, h('div', null, h('p', { class: 'eyebrow light' }, openNow() ? 'Ochiq · ' + D.hours.open + ':00–' + D.hours.close + ':00' : 'Hozir yopiq · ertaga 09:00'),
        h('h2', null, 'Tarjimon chaqirish'), h('p', null, online().length + ' tarjimon onlayn · navbatda ' + state.queue.length + ' kishi · kutish ≈ ' + Math.max(1, Math.round(state.queue.length * 0.6)) + ' daq')),
      h('button', { class: 'btn big light', type: 'button', id: 'home-call', onclick: () => go('/vri') }, 'Chaqirish')),
      signer(1, { caption: 'Tarjimon tile’i doim koʻrinadi' })),
    h('div', { class: 'tiles' }, tiles.map(([p, t, d, ic]) => h('a', { class: 'tile', href: '#' + p }, h('img', { src: 'icons/' + ic + '.svg', alt: '', width: 28, height: 28 }), h('strong', null, t), h('span', null, d)))),
    h('div', { class: 'grid-2' },
      card('Yaqin bronlar', next ? h('ul', { class: 'list' }, state.bookings.filter((b) => b.at > NOW).slice(0, 4).map(bookingRow)) : empty('Bron yoʻq', 'Tarjimonni oldindan bron qilish mumkin.'), h('p', { class: 'foot' }, link('/vri', 'Barcha bronlar →'))),
      card('Yangi video xabarlar', h('ul', { class: 'list' }, state.threads.filter((t) => t.unread).map((t) => h('li', null, h('a', { class: 'row-link', href: '#/messages/' + t.id }, avatar(t.name), h('span', { class: 'grow' }, h('strong', null, t.name), h('span', { class: 'sub' }, t.unread + ' ta yangi · ' + ago(t.msgs[t.msgs.length - 1].at) + ' oldin')), badge('teal', String(t.unread)))))))),
  ];
}
function avatar(name) { return h('span', { class: 'avatar', 'aria-hidden': 'true' }, name.replace(/[^A-Za-zʻ ]/g, '').trim().split(' ').map((x) => x[0]).slice(0, 2).join('')); }
const BST = { confirmed: ['ok', 'Tasdiqlangan'], pending: ['warn', 'Kutilmoqda'], cancelled: ['muted', 'Bekor qilingan'], inperson: ['water', 'Yuzma-yuz tarjimon'] };
function bookingRow(b) { const [k, t] = BST[b.status]; return h('li', null, h('span', { class: 'when' }, h('strong', null, hm(b.at)), h('span', { class: 'sub' }, dayText(b.at))), h('span', { class: 'grow' }, h('strong', null, b.topic + ' · ' + b.minutes + ' daq'), h('span', { class: 'sub' }, b.interpreter + (b.note ? ' · ' + b.note : ''))), badge(k, t)); }

/* ---------- M1 VRI ---------- */
function viewVri() {
  const c = state.call;
  if (c && c.stage === 'call') return viewCall();
  const panel = h('div', { class: 'stack' });
  const drawPanel = () => {
    const cc = state.call;
    if (!cc) panel.replaceChildren(h('div', { class: 'call-cta' }, h('div', null, h('p', { class: 'eyebrow light' }, openNow() ? 'Ish vaqti: ' + D.hours.days + ' ' + D.hours.open + ':00–' + D.hours.close + ':00' : 'Yopiq. Ertaga 09:00 dan, yoki bron qiling'),
      h('h2', null, 'Bir tugma: navbatga turish'), h('p', null, 'Roʻyxatdan oʻtish shart emas. Qoʻngʻiroq yozilmaydi.')), h('button', { class: 'btn big light', type: 'button', id: 'queue-join', onclick: () => { state.call = { stage: 'consent' }; drawPanel(); } }, 'Navbatga turish')));
    else if (cc.stage === 'consent') panel.replaceChildren(h('div', { class: 'dialog', role: 'dialog', 'aria-label': 'Rozilik' }, h('h3', null, 'Boshlashdan oldin'),
      h('ul', { class: 'checks' }, h('li', null, 'Qoʻngʻiroq yozilmaydi. Yozish faqat ikki tomon roziligi bilan.'), h('li', null, 'Eshituvchi tomon QR yoki havola orqali login’siz qoʻshiladi.'), h('li', null, 'Ogʻir tashxis, operatsiya, tugʻruq uchun yuzma-yuz tarjimonni bron qilish tavsiya qilinadi.')),
      h('label', { class: 'field' }, 'Mavzu', h('select', { class: 'input', id: 'call-topic' }, D.topics.map((t) => h('option', null, t)))),
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', id: 'consent-ok', onclick: () => startQueue(document.getElementById('call-topic').value, drawPanel) }, 'Roziman, navbatga'), h('button', { class: 'btn ghost', type: 'button', onclick: () => { state.call = null; drawPanel(); } }, 'Bekor qilish'))));
    else if (cc.stage === 'rate') panel.replaceChildren(h('div', { class: 'dialog' }, h('h3', null, 'Qoʻngʻiroq tugadi · ' + cc.topic), h('p', { class: 'muted' }, cc.who.name + ' bilan · ' + Math.max(1, Math.round((Date.now() - cc.start) / 60000)) + ' daq. Baho anonim.'),
      h('div', { class: 'row' }, [1, 2, 3, 4, 5].map((n) => h('button', { type: 'button', class: 'btn ghost star', onclick: () => { state.call = null; toast('Rahmat! Baho: ' + n + '/5'); drawPanel(); } }, '★'.repeat(n))))));
    else panel.replaceChildren(h('div', { class: 'queue-box', role: 'status', 'aria-live': 'polite' }, h('div', { class: 'pulse', 'aria-hidden': 'true' }), h('div', null, h('p', { class: 'eyebrow' }, 'Navbatdasiz · ' + cc.topic),
      h('h2', null, cc.pos > 0 ? cc.pos + '-oʻrin' : 'Ulanmoqda…'), h('p', { class: 'muted' }, cc.pos > 0 ? 'Taxminiy kutish ' + Math.max(1, Math.round(cc.pos * 0.5)) + ' daqiqa · har 15 soniyada yangilanadi' : (cc.who ? cc.who.name + ' ulanmoqda' : 'Tarjimon tanlanmoqda')),
      h('div', { class: 'row' }, h('button', { class: 'btn ghost sm', type: 'button', id: 'queue-skip', onclick: () => { cc.pos = 0; tickQueue(drawPanel, true); } }, 'Demo: tezlashtirish'), h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { clearInterval(cc.timer); state.call = null; drawPanel(); } }, 'Navbatdan chiqish')))));
  };
  drawPanel();
  const form = h('form', { class: 'form', id: 'booking-form', onsubmit: (e) => {
    e.preventDefault(); const f = new FormData(e.target); const [y, m, d] = String(f.get('date')).split('-').map(Number); const [hh, mm] = String(f.get('time')).split(':').map(Number);
    const at = new Date(y, m - 1, d, hh, mm);
    const heavy = /Shifoxona|Huquq/.test(f.get('topic')) && f.get('heavy');
    state.bookings.push({ id: 'b' + Date.now(), at, minutes: Number(f.get('minutes')), topic: f.get('topic'), interpreter: online()[0].name, status: heavy ? 'inperson' : 'pending', note: heavy ? 'Yuzma-yuz tarjimon soʻraldi' : 'Yangi bron' });
    state.bookings.sort((a, b) => a.at - b.at); toast('Bron yuborildi: tarjimon tasdiqlashi kutilmoqda'); render();
  } },
  h('div', { class: 'fields-2' }, h('label', { class: 'field' }, 'Sana', h('input', { class: 'input', type: 'date', name: 'date', value: isoDay(1) })), h('label', { class: 'field' }, 'Vaqt', h('input', { class: 'input', type: 'time', name: 'time', value: '10:30' }))),
  h('div', { class: 'fields-2' }, h('label', { class: 'field' }, 'Mavzu', h('select', { class: 'input', name: 'topic' }, D.topics.map((t) => h('option', null, t)))), h('label', { class: 'field' }, 'Davomiyligi', h('select', { class: 'input', name: 'minutes' }, [15, 30, 45, 60].map((m) => h('option', { value: m }, m + ' daqiqa'))))),
  h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'heavy' }), 'Ogʻir mavzu: yuzma-yuz tarjimon kerak'),
  h('button', { class: 'btn', type: 'submit' }, 'Bron qilish'));
  return [
    head('M1 · Tarjimon (VRI)', 'Jonli imo-ishora tarjimoni', 'Kar foydalanuvchi bir tugma bilan tarjimonga videoqoʻngʻiroq qiladi; eshituvchi tomon brauzerda qoʻshiladi. Halol ish soatlari, hech qachon javobsiz kutish yoʻq.'),
    h('div', { class: 'grid-2' }, panel, card('Hozir onlayn', h('ul', { class: 'people' }, D.interpreters.slice(0, 13).map((i) => h('li', null, avatar(i.name), h('span', { class: 'grow' }, h('strong', null, i.name), h('span', { class: 'sub' }, i.langs.join(', ') + ' · ' + i.topics.join(', '))), badge(...ISTATE[i.status])))))),
    h('div', { class: 'grid-2' }, card('Bronlar', h('ul', { class: 'list' }, state.bookings.map(bookingRow))), card('Oldindan bron qilish', form)),
  ];
}
const ISTATE = { online: ['ok', 'Onlayn'], busy: ['warn', 'Qoʻngʻiroqda'], break: ['water', 'Tanaffus'], offline: ['muted', 'Oflayn'] };
const isoDay = (n) => { const d = new Date(NOW); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
function startQueue(topic, draw) {
  state.call = { stage: 'queue', topic, pos: 4 };
  state.call.timer = setInterval(() => tickQueue(draw), 1500);
  draw();
}
function tickQueue(draw, fast) {
  const c = state.call; if (!c) return;
  if (c.pos > 0 && !fast) c.pos--;
  if (c.pos === 0 && !c.who) { c.who = online()[1]; draw(); setTimeout(() => { if (state.call === c) { clearInterval(c.timer); c.stage = 'call'; c.start = Date.now(); c.lines = []; render(); } }, fast ? 300 : 1200); return; }
  draw();
}
const CALL_LINES = [['hear', 'Assalomu alaykum, qanday yordam bera olaman?'], ['deaf', 'Kartam bloklandi, qayta tiklamoqchiman.'], ['hear', 'Pasportingizni koʻrsating, iltimos.'], ['deaf', 'Mana. Qancha vaqt oladi?'], ['hear', 'Yangi karta 3 ish kunida tayyor boʻladi.'], ['deaf', 'Rahmat, SMS orqali xabar bering.']];
function viewCall() {
  const c = state.call;
  const captions = h('ol', { class: 'captions', 'aria-live': 'polite' });
  const timer = h('span', { class: 'mono' }, '00:00');
  const draw = () => { captions.replaceChildren(...c.lines.map(([who, t]) => h('li', { class: who }, h('span', { class: 'sub' }, who === 'hear' ? 'Eshituvchi (ovoz → tarjimon)' : 'Siz (imo-ishora → ovoz)'), t))); const sec = Math.round((Date.now() - c.start) / 1000); timer.textContent = pad(Math.floor(sec / 60)) + ':' + pad(sec % 60); };
  if (!c.lines.length) c.lines.push(CALL_LINES[0]);
  draw();
  clearInterval(c.loop);
  c.loop = setInterval(() => { if (state.call !== c || !document.body.contains(captions)) { clearInterval(c.loop); return; } if (c.lines.length < CALL_LINES.length) c.lines.push(CALL_LINES[c.lines.length]); draw(); }, 1800);
  const end = () => { clearInterval(c.loop); c.stage = 'rate'; render(); };
  if (c.stage === 'rate') return [];
  return [
    head('Qoʻngʻiroq · ' + c.topic, 'Uch tomonlama video', null, h('p', { class: 'row' }, badge('ok', 'Ulangan'), badge('muted', 'Yozilmayapti'), timer)),
    h('div', { class: 'call' },
      h('div', { class: 'tile-v pinned' }, signer(2, { caption: false }), h('span', { class: 'tag' }, c.who.name + ' · tarjimon · pinned')),
      h('div', { class: 'tile-v' }, signer(4, { caption: false, mirror: true }), h('span', { class: 'tag' }, 'Siz (koʻzgu koʻrinish)')),
      h('div', { class: 'tile-v hearing' }, h('div', { class: 'qr', 'aria-hidden': 'true' }, Array.from({ length: 49 }, (_, i) => h('i', { class: (i * 7 + i % 5) % 3 ? '' : 'on' }))), h('span', { class: 'tag' }, 'Eshituvchi: QR orqali, login’siz'))),
    h('div', { class: 'grid-2' }, card('Subtitr', captions), card('Boshqaruv', h('div', { class: 'row' },
      h('button', { class: 'btn ghost', type: 'button', onclick: () => toast('Ekran ulashildi: tarjimon tile’i joyida qoladi') }, 'Ekran ulashish'), h('button', { class: 'btn ghost', type: 'button', onclick: () => toast('Tarmoq past: video 360 kbit/s, qoʻllar oʻqiladi') }, 'Past tarmoq rejimi'),
      h('button', { class: 'btn danger', type: 'button', id: 'call-end', onclick: end }, 'Tugatish')), h('p', { class: 'hint' }, 'Statistikaga faqat daqiqa, kutish vaqti va mavzu yoziladi, shaxsiy maʼlumotsiz (M18).'))),
  ];
}

/* ---------- M2 face to face ---------- */
const FACE = [['Assalomu alaykum, sizga qanday yordam bera olaman?', 'hear'], ['Kartam bloklandi', 'deaf'], ['Pasportingiz bilan keldingizmi?', 'hear'], ['Ha, mana', 'deaf'], ['Bir daqiqa kuting, tizimni tekshiryapman', 'hear'], ['Karta 3 kunda tayyor boʻladi, SMS keladi', 'hear'], ['Rahmat, tushundim', 'deaf']];
function viewFace() {
  const f = state.face || (state.face = { lines: [], lang: 'uz-Latn', rotated: true, place: 'Bank', i: 0 });
  const top = h('div', { class: 'half top' + (f.rotated ? ' rot' : '') });
  const bottom = h('ol', { class: 'half bottom', 'aria-live': 'polite' });
  const draw = () => {
    const lastHear = f.lines.filter((l) => l.who === 'hear').slice(-1)[0];
    const lastDeaf = f.lines.filter((l) => l.who === 'deaf').slice(-1)[0];
    top.replaceChildren(h('p', { class: 'sub' }, 'Eshituvchi tomon · ' + (f.rotated ? '180° burilgan' : 'oddiy')), h('p', { class: 'big-text' }, lastDeaf ? T(lastDeaf.text) : 'Aniq gapiring, qarab turing, navbat bilan.'));
    bottom.replaceChildren(...f.lines.map((l, idx) => h('li', { class: l.who + (l.draft ? ' draft' : '') }, h('span', { class: 'sub' }, l.who === 'hear' ? 'Eshituvchi' : 'Siz yozdingiz'),
      h('span', { class: 'words' }, T(l.text).split(' ').map((w, wi) => h('button', { type: 'button', class: 'word', title: 'Tuzatish uchun bosing', onclick: () => { const nw = prompt('Soʻzni tuzating', w); if (nw) { const ws = l.text.split(' '); ws[wi] = nw; l.text = ws.join(' '); l.fixed = true; draw(); } } }, w))),
      l.fixed ? h('span', { class: 'sub' }, 'tuzatildi (faqat qurilmada)') : null, idx === f.lines.length - 1 && lastHear === l && l.draft ? h('span', { class: 'sub' }, 'qoralama…') : null)));
    if (!f.lines.length) bottom.replaceChildren(h('li', { class: 'hint-li' }, 'Mikrofon tugmasini bosing: eshituvchi nutqi shu yerda jonli subtitr boʻladi.'));
  };
  const step = () => {
    if (f.i >= FACE.length) { toast('Namuna suhbat tugadi'); return; }
    const [text, who] = FACE[f.i++];
    if (who === 'hear') { const words = text.split(' '); const line = { who, text: words[0], draft: true }; f.lines.push(line); let k = 1; const t = setInterval(() => { if (k >= words.length) { clearInterval(t); line.draft = false; draw(); return; } line.text += ' ' + words[k++]; draw(); }, 140); }
    else { f.lines.push({ who, text }); speak(text); }
    draw();
  };
  const input = h('input', { class: 'input', id: 'face-input', placeholder: 'Javobingizni yozing…', 'aria-label': 'Javob' });
  draw();
  return [
    head('M2 · Yuzma-yuz suhbat', 'Telefon stolda: yuqorisi eshituvchiga, pasti sizga', 'Eshituvchi gapiradi, oʻzbek yoki rus jonli subtitr chiqadi. Siz yozasiz yoki tayyor iborani bosasiz, ilova ovoz chiqaradi.'),
    h('div', { class: 'face-wrap' }, h('div', { class: 'phone-frame' }, top, bottom),
      h('div', { class: 'stack' },
        card('Boshqaruv', h('div', { class: 'chips' }, ['uz-Latn', 'uz-Cyrl', 'ru'].map((l) => h('button', { type: 'button', class: 'chip' + (f.lang === l ? ' on' : ''), onclick: () => { f.lang = l; state.settings.script = l === 'uz-Cyrl' ? 'cyr' : 'lat'; render(); } }, l))),
          h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', id: 'face-mic', onclick: step }, '● Keyingi gap (namuna)'), h('button', { class: 'btn ghost', type: 'button', onclick: () => { f.rotated = !f.rotated; draw(); } }, 'Yuqorini burish')),
          h('form', { class: 'row', onsubmit: (e) => { e.preventDefault(); if (!input.value.trim()) return; f.lines.push({ who: 'deaf', text: input.value.trim() }); speak(input.value.trim()); input.value = ''; draw(); } }, input, h('button', { class: 'btn', type: 'submit' }, 'Gapirish')),
          h('div', { class: 'chips' }, ['Tushunmadim, yozib bering', 'Sekinroq gapiring', 'Tarjimon chaqiraman', 'Rahmat'].map((p) => h('button', { type: 'button', class: 'chip', onclick: () => { f.lines.push({ who: 'deaf', text: p }); speak(p); draw(); } }, p))),
          h('p', { class: 'hint' }, 'ASR xato qilishi mumkin: soʻzni bosib tuzating. Internet yoʻq boʻlsa oflayn rejim ogohlantirish bilan ishlaydi.'),
          h('button', { class: 'btn ghost', type: 'button', onclick: () => go('/vri') }, 'Tarjimon chaqirish')),
        card('Tarix (24 soat, oʻchirish mumkin)', h('ul', { class: 'list' }, state.history.map((x, i) => h('li', null, h('span', { class: 'grow' }, h('strong', null, x.place), h('span', { class: 'sub' }, x.lines + ' qator · ' + ago(x.at) + ' oldin')),
          h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { state.history.splice(i, 1); render(); } }, 'Oʻchirish'))))))),
  ];
}

/* ---------- M3 cards ---------- */
function viewCards(sit) {
  const cur = D.situations.find((x) => x.id === sit) || D.situations[0];
  return [
    head('M3 · Vaziyat kartalari', 'Bosing va eshituvchiga koʻrsating', 'Har karta: sodda matn, ovoz va kar imo-ishorachi yozgan video. Internetsiz ochiladi, joylashuvi oʻzgarmaydi.', h('p', { class: 'row' }, badge('ok', 'Offlayn tayyor'), badge('muted', D.situations.reduce((a, x) => a + x.cards.length, 0) + ' karta · 8 vaziyat'))),
    h('div', { class: 'chips big' }, D.situations.map((x) => h('a', { class: 'chip' + (x === cur ? ' on' : ''), href: '#/cards/' + x.id }, h('span', { 'aria-hidden': 'true' }, x.icon + ' '), x.name))),
    h('div', { class: 'cards' }, cur.cards.map((txt, i) => h('button', { type: 'button', class: 'vcard', onclick: () => openCard(cur, i) }, h('span', { class: 'ic', 'aria-hidden': 'true' }, cur.icon), h('strong', null, T(txt)), h('span', { class: 'sub' }, 'Video · ovoz')))),
  ];
}
function openCard(sit, i) {
  const txt = sit.cards[i];
  let slow = false;
  const vid = h('div');
  const drawVid = () => vid.replaceChildren(signer(i, { big: true, slow }));
  drawVid();
  modal(h('div', { class: 'show-card' }, h('p', { class: 'eyebrow' }, sit.name + ' · ' + (i + 1) + '/' + sit.cards.length), h('p', { class: 'huge' }, T(txt)), vid,
    h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => speak(txt) }, 'Ovoz chiqarish'), h('button', { class: 'btn ghost', type: 'button', onclick: () => { slow = !slow; drawVid(); } }, '0,5× sekin'),
      h('button', { class: 'btn ghost', type: 'button', onclick: () => { closeModal(); openCard(sit, (i + 1) % sit.cards.length); } }, 'Keyingi karta →'))));
}

/* ---------- M4 office ---------- */
function viewOffice(oid, si) {
  const office = D.offices.find((o) => o.id === oid);
  if (!office) return [head('M4 · Idora yordamchisi', 'Qaysi idoraga borasiz?', 'Hujjatlar roʻyxati imo-ishora video va oddiy matn bilan, ariza shabloni, kerak boʻlsa tarjimon.'),
    h('div', { class: 'office-grid' }, D.offices.map((o) => h('a', { class: 'tile', href: '#/office/' + o.id }, h('img', { src: 'icons/doc.svg', alt: '', width: 26, height: 26 }), h('strong', null, o.name), h('span', null, o.services.length + ' xizmat')))),
    h('div', { class: 'notice' }, 'Fuqarolar qabulida surdotarjimon ishtiroki taʼminlanishi kerak: bu haqda kartani xodimga koʻrsating. Bu yuridik maslahat emas.')];
  const svc = office.services[Number(si) || 0];
  const fields = { name: 'Aliyev Bekzod Rustamovich (namuna)', address: 'Toshkent sh., Chilonzor tumani, 9-mavze (namuna)', reason: svc.name.toLowerCase() };
  const preview = h('pre', { class: 'letter', id: 'letter' });
  const done = new Set();
  const drawLetter = () => { preview.textContent = `${office.name} rahbariga\n${fields.name}dan\nManzil: ${fields.address}\n\nARIZA\n\nMen eshitish boʻyicha nogironligi bor shaxsman. Sizdan ${fields.reason} masalasida yordam berishingizni soʻrayman. Qabulda surdotarjimon ishtirokini taʼminlashingizni iltimos qilaman.\n\nIlova: ${svc.docs.join(', ')}.\n\nSana: ${NOW.getDate()} ${MONTHS[NOW.getMonth()]} ${NOW.getFullYear()} y.          Imzo: ________`; };
  drawLetter();
  return [
    h('nav', { class: 'crumbs' }, link('/office', 'Idora yordamchisi'), ' / ', office.name),
    head('M4 · ' + office.name, svc.name, 'Muddat: ' + svc.days + '. Kerakli hujjatlarni belgilang, ariza matnini tayyorlang va xodimga koʻrsating.'),
    h('div', { class: 'chips' }, office.services.map((x, i) => h('a', { class: 'chip' + (x === svc ? ' on' : ''), href: '#/office/' + office.id + '/' + i }, x.name))),
    h('div', { class: 'grid-2' },
      h('div', { class: 'stack' }, card('Kerakli hujjatlar', h('ul', { class: 'checklist' }, svc.docs.map((d) => h('li', null, h('label', { class: 'check' }, h('input', { type: 'checkbox', onchange: (e) => { e.target.checked ? done.add(d) : done.delete(d); } }), d))))),
        card('Imo-ishorada tushuntirish', signer(3), h('p', { class: 'hint' }, 'Kontent hamkorlar ruxsati bilan yoki yangi yozuv; kar ekspertlar tasdiqlaydi.'))),
      card('Ariza shabloni', h('div', { class: 'form' },
        h('label', { class: 'field' }, 'F.I.Sh.', h('input', { class: 'input', value: fields.name, oninput: (e) => { fields.name = e.target.value; drawLetter(); } })),
        h('label', { class: 'field' }, 'Manzil', h('input', { class: 'input', value: fields.address, oninput: (e) => { fields.address = e.target.value; drawLetter(); } })),
        h('label', { class: 'field' }, 'Masala', h('input', { class: 'input', value: fields.reason, oninput: (e) => { fields.reason = e.target.value; drawLetter(); } }))),
        preview, h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => modal(h('div', { class: 'show-card' }, h('p', { class: 'eyebrow' }, 'Xodim uchun'), h('pre', { class: 'letter big' }, preview.textContent))) }, 'Xodimga koʻrsatish'),
          h('button', { class: 'btn ghost', type: 'button', onclick: () => toast('Chop etish oynasi (demo)') }, 'Chop etish'), h('button', { class: 'btn ghost', type: 'button', onclick: () => toast('Telegram bot orqali yuborildi (demo)') }, 'Telegram’ga')),
        h('p', { class: 'hint' }, 'Shaxsiy maʼlumot tashqi AI xizmatiga yuborilmaydi. Bu yuridik maslahat emas.'))),
  ];
}

/* ---------- M5 messages ---------- */
function viewMessages(tid) {
  const t = state.threads.find((x) => x.id === tid) || state.threads[0];
  t.unread = 0;
  const thread = h('ol', { class: 'thread' }, t.msgs.map((m) => h('li', { class: m.mine ? 'mine' : '' }, m.kind === 'video' ? h('div', { class: 'vmsg' }, signer(m.variant, { caption: false, mirror: false }), h('span', { class: 'sub' }, m.sec + ' s · ' + (m.sec * 0.045).toFixed(1).replace('.', ',') + ' MB · ' + hm(m.at))) : h('p', { class: 'bubble' }, m.text, h('span', { class: 'sub' }, ' ' + hm(m.at))))));
  const rec = h('div', { class: 'rec' });
  const drawRec = (st) => {
    if (!st) rec.replaceChildren(h('button', { class: 'btn', type: 'button', id: 'rec-start', onclick: () => record(t) }, '● Imo-ishora yozish'), h('span', { class: 'sub' }, state.settings.wifiOnly ? 'Faqat Wi-Fi' : 'Mobil internet ruxsat · bugun 18,4 MB'));
    else rec.replaceChildren(st);
  };
  const record = (thr) => {
    let n = 3;
    const v = h('div', { class: 'rec-live' }, signer(5, { caption: 'Oldindan koʻrish koʻzguda; yuboriladigan video toʻgʻri yoʻnalishda', mirror: true }), h('strong', { class: 'count' }, '3'));
    drawRec(v);
    const cd = setInterval(() => { n--; v.querySelector('.count').textContent = n > 0 ? String(n) : '● REC'; if (n <= -2) { clearInterval(cd); thr.msgs.push({ mine: true, sec: 8, at: new Date(), kind: 'video', variant: 5, seen: false }); toast('Video xabar yuborildi · 0,4 MB'); render(); } }, 600);
  };
  drawRec();
  return [
    head('M5 · Video xabar', 'Imo-ishorani yozing va yuboring', 'Bir bosishda yozish, past bitreyt, koʻzgu toʻgʻri: chap va oʻng qoʻl qabul qiluvchida toʻgʻri koʻrinadi.'),
    h('div', { class: 'msg-wrap' },
      h('ul', { class: 'threads' }, state.threads.map((x) => h('li', null, h('a', { class: 'row-link' + (x === t ? ' on' : ''), href: '#/messages/' + x.id }, avatar(x.name), h('span', { class: 'grow' }, h('strong', null, x.name), h('span', { class: 'sub' }, (x.msgs[x.msgs.length - 1].kind === 'video' ? 'Video · ' : '') + ago(x.msgs[x.msgs.length - 1].at))), x.unread ? badge('teal', String(x.unread)) : null)))),
      h('div', { class: 'card chat' }, h('h2', null, t.name, t.group ? h('span', { class: 'sub' }, ' · guruh') : null), thread, rec)),
  ];
}

/* ---------- M6 AAC ---------- */
function viewAac(cat) {
  const cats = Object.keys(D.aac);
  const cur = cats.includes(cat) ? cat : cats[0];
  const strip = h('div', { class: 'strip', 'aria-live': 'polite' });
  const draw = () => strip.replaceChildren(...(state.sentence.length ? state.sentence.map((w) => h('span', { class: 'chip on' }, T(w))) : [h('span', { class: 'sub' }, 'Belgilarni bosing, gap shu yerda yigʻiladi')]));
  draw();
  return [
    head('M6 · AAC', 'Gapira olmaydiganlar uchun belgi-taxta', 'Belgilarni bosib gap tuzing, ilova oʻzbek tilida oʻqib beradi. Belgilar oʻrni oʻzgarmaydi (motor-plan).'),
    h('div', { class: 'card' }, h('div', { class: 'row' }, strip, h('button', { class: 'btn', type: 'button', id: 'aac-speak', onclick: () => state.sentence.length && speak(state.sentence.join(' ')) }, 'Gapir'),
      h('button', { class: 'btn ghost', type: 'button', onclick: () => { state.sentence.pop(); draw(); } }, '⌫'), h('button', { class: 'btn ghost', type: 'button', onclick: () => { state.sentence = []; draw(); } }, 'Tozalash'))),
    h('div', { class: 'chips big' }, cats.map((c) => h('a', { class: 'chip' + (c === cur ? ' on' : ''), href: '#/aac/' + c }, c))),
    h('div', { class: 'aac' }, D.aac[cur].map((w, i) => h('button', { type: 'button', class: 'sym c' + (i % 6), onclick: () => { state.sentence.push(w); draw(); } }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, w.slice(0, 1)), T(w)))),
    h('p', { class: 'hint' }, 'Belgilar toʻplami: Mulberry (CC BY-SA) rejalashtirilgan; demoda harf-belgilar. Alohida GPL ilova, platforma bilan HTTP orqali.'),
  ];
}

/* ---------- M7 learning ---------- */
function viewLearn(lid) {
  const l = D.lessons.find((x) => x.id === lid);
  const done = D.lessons.filter((x) => state.learn[x.id] >= 1).length;
  if (!l) return [head('M7 · Ota-onalar uchun', 'Kar bolangiz bilan imo-ishorada gaplashing', 'Kuniga 5 daqiqa. Kar oʻqituvchi videolari, sekin va takror rejim, faqat oʻtilgan belgidan test. Paywall yoʻq.'),
    h('div', { class: 'kpis' }, kpi('Tugatilgan darslar', done + ' / 20'), kpi('Oʻrganilgan belgilar', String(D.lessons.filter((x) => state.learn[x.id] >= 1).reduce((a, x) => a + x.signs, 0))), kpi('Ketma-ket kunlar', '6'), kpi('Bugungi dars', '5 daq')),
    h('div', { class: 'lessons' }, D.lessons.map((x) => { const p = state.learn[x.id]; const bar = h('span', { class: 'fill' }); bar.style.width = Math.round(p * 100) + '%';
      return h('a', { class: 'lesson' + (p >= 1 ? ' done' : ''), href: '#/learn/' + x.id }, h('span', { class: 'n' }, String(x.n)), h('strong', null, x.title), h('span', { class: 'sub' }, x.minutes + ' daq · ' + x.signs + ' belgi · ' + x.teacher), h('span', { class: 'bar' }, bar)); }))];
  let slow = false, mirror = false, idx = 0;
  const signs = D.dictionary.slice((l.n * 3) % 50, (l.n * 3) % 50 + l.signs);
  const stage = h('div', { class: 'stack' });
  const draw = () => stage.replaceChildren(signer(idx + l.n, { big: true, slow, mirror, caption: 'Oʻqituvchi: ' + l.teacher + ' · namuna animatsiya' }), h('p', { class: 'huge center' }, T(signs[idx].word)),
    h('div', { class: 'row center' }, h('button', { class: 'btn ghost', type: 'button', onclick: () => { idx = (idx + signs.length - 1) % signs.length; draw(); } }, '←'), h('span', { class: 'sub' }, (idx + 1) + ' / ' + signs.length),
      h('button', { class: 'btn ghost', type: 'button', onclick: () => { idx = (idx + 1) % signs.length; draw(); } }, '→'), h('button', { class: 'btn ghost' + (slow ? ' on' : ''), type: 'button', onclick: () => { slow = !slow; draw(); } }, '0,5×'), h('button', { class: 'btn ghost' + (mirror ? ' on' : ''), type: 'button', onclick: () => { mirror = !mirror; draw(); } }, 'Koʻzgu')));
  draw();
  const quiz = h('div', { class: 'quiz' });
  const ask = () => { const ans = signs[Math.floor(Math.random() * signs.length)]; const opts = [...signs].sort(() => Math.random() - 0.5).slice(0, 3); if (!opts.includes(ans)) opts[0] = ans;
    quiz.replaceChildren(signer(signs.indexOf(ans) + l.n, { caption: 'Bu qaysi belgi?' }), h('div', { class: 'row' }, opts.sort(() => Math.random() - 0.5).map((o) => h('button', { type: 'button', class: 'btn ghost', onclick: (e) => {
      if (o === ans) { e.target.classList.add('right'); state.learn[l.id] = Math.min(1, state.learn[l.id] + 0.34); toast('Toʻgʻri! Progress saqlandi (xotirada)'); setTimeout(ask, 700); } else { e.target.classList.add('wrong'); } } }, T(o.word))))); };
  ask();
  return [h('nav', { class: 'crumbs' }, link('/learn', 'Darslar'), ' / ', l.n + '-dars'), head('M7 · ' + l.n + '-dars', l.title, l.minutes + ' daqiqa · ' + l.signs + ' belgi. Faqat shu darsda oʻtilgan belgilardan test.'),
    h('div', { class: 'grid-2' }, card('Belgilar', stage), card('Test', quiz))];
}

/* ---------- M8 dictionary ---------- */
const dict = { q: '', topic: 'all', favs: false };
function viewDictionary(did) {
  const topics = [...new Set(D.dictionary.map((d) => d.topic))];
  const list = h('div', { class: 'dict' });
  const detail = h('div', { class: 'card sticky' });
  const show = (d) => { let slow = false; const v = h('div'); const dv = () => v.replaceChildren(signer(d.variant + 1, { big: true, slow })); dv();
    detail.replaceChildren(h('p', { class: 'eyebrow' }, d.topic + ' · ' + d.hand), h('h2', { class: 'huge' }, T(d.word)), h('p', { class: 'sub' }, D.toCyr(d.word) + (d.ru ? ' · ru: ' + d.ru : '')), v,
      h('div', { class: 'row' }, h('button', { class: 'btn ghost', type: 'button', onclick: () => { slow = !slow; dv(); } }, '0,5× sekin'), h('button', { class: 'btn ghost', type: 'button', id: 'fav', onclick: () => { state.favs.has(d.id) ? state.favs.delete(d.id) : state.favs.add(d.id); show(d); draw(); } }, state.favs.has(d.id) ? '★ Sevimlida' : '☆ Sevimliga')),
      h('dl', { class: 'mini' }, h('div', null, h('dt', null, 'Hudud'), h('dd', null, d.region)), h('div', null, h('dt', null, 'Variantlar'), h('dd', null, String(d.variants))), h('div', null, h('dt', null, 'Tekshiruv'), h('dd', null, d.verified ? 'Tasdiqlangan' : 'Koʻrikda'))),
      h('p', { class: 'hint' }, (d.dactyl ? d.dactyl + ' ' : '') + (d.verified ? 'Ikki kar ekspert tasdiqlagan.' : 'Kar ekspertlar koʻrigida.'))); };
  const draw = () => {
    const q = D.norm(dict.q.trim());
    const rows = D.dictionary.filter((d) => (dict.topic === 'all' || d.topic === dict.topic) && (!dict.favs || state.favs.has(d.id)) && (!q || D.norm(d.word).includes(q) || d.ru.includes(dict.q.trim().toLowerCase())));
    list.replaceChildren(...(rows.length ? rows.map((d) => h('button', { type: 'button', class: 'dword', onclick: () => show(d) }, h('strong', null, T(d.word)), h('span', { class: 'sub' }, d.topic), d.verified ? null : badge('warn', 'koʻrikda'), state.favs.has(d.id) ? h('span', { 'aria-label': 'sevimli' }, '★') : null))
      : [empty('Belgi topilmadi', 'Lotin yoki kirillda yozing: “салом” ham “salom”ni topadi. Yangi belgi taklif qilish dataset ilovasi orqali (v1).')]));
  };
  draw(); show(D.dictionary.find((d) => d.id === did) || D.dictionary[0]);
  return [
    head('M8 · Lugʻat (v1)', 'Oʻzbek imo-ishora tili lugʻati', D.dictionary.length + ' ta namuna belgi. Lotin soʻrov kirill kalit soʻzni topadi va aksincha; hududiy variantlar belgilangan.'),
    h('div', { class: 'toolbar' }, h('input', { class: 'input', type: 'search', id: 'dict-q', placeholder: 'Qidirish: salom yoki салом', value: dict.q, oninput: (e) => { dict.q = e.target.value; draw(); } }),
      h('div', { class: 'chips' }, [['all', 'Hammasi'], ...topics.map((t) => [t, t])].map(([k, t]) => h('button', { type: 'button', class: 'chip' + (dict.topic === k ? ' on' : ''), onclick: () => { dict.topic = k; render(); } }, t)),
        h('button', { type: 'button', class: 'chip' + (dict.favs ? ' on' : ''), onclick: () => { dict.favs = !dict.favs; render(); } }, '★ Sevimlilar'))),
    h('div', { class: 'dict-wrap' }, list, detail),
  ];
}

/* ---------- M9 orgs ---------- */
function viewOrgs() {
  const types = [...new Set(D.orgs.map((o) => o.type))];
  const f = viewOrgs.f || (viewOrgs.f = { type: 'all' });
  const hr = NOW.getHours();
  return [
    head('M9 · Tashkilotlar katalogi (v1)', 'Imo-ishorada murojaat qilsa boʻladigan joylar', 'Bosilganda tashkilot toʻlaydigan yoki hamkor tarjimon ulanadi. Hamma nomlar namuna.'),
    h('div', { class: 'chips' }, [['all', 'Hammasi'], ...types.map((t) => [t, t])].map(([k, t]) => h('button', { type: 'button', class: 'chip' + (f.type === k ? ' on' : ''), onclick: () => { f.type = k; render(); } }, t))),
    h('div', { class: 'org-grid' }, D.orgs.filter((o) => f.type === 'all' || o.type === f.type).map((o) => { const isOpen = hr >= o.open && hr < o.close && NOW.getDay() !== 0;
      return h('article', { class: 'org' }, h('div', { class: 'row between' }, h('span', { class: 'sub' }, o.type), badge(isOpen ? 'ok' : 'muted', isOpen ? 'Ochiq' : 'Yopiq')), h('strong', null, o.name), h('span', { class: 'sub' }, o.district + ' · ' + o.hours),
        h('div', { class: 'row between' }, h('span', { class: 'sub' }, o.paid ? o.via : 'Kar tadbirkor'), h('button', { class: 'btn sm' + (isOpen ? '' : ' ghost'), type: 'button', onclick: () => toast(isOpen ? o.name + ': tarjimon ulanmoqda (demo)' : 'Yopiq. Ish vaqti ' + o.hours + ', bron taklif qilinadi') }, isOpen ? 'Imo-ishorada qoʻngʻiroq' : 'Bron qilish'))); })),
  ];
}

/* ---------- M12 SOS (training) ---------- */
function viewSos() {
  const st = viewSos.st || (viewSos.st = { svc: null, sent: false, silent: true });
  const services = [['101', 'Yongʻin', '🔥'], ['102', 'Politsiya', '⛨'], ['103', 'Tez yordam', '✚'], ['112', 'Favqulodda', '!']];
  return [
    head('M12 · SOS (v1 pilot konsepti)', 'Mashq rejimi', 'MVP da faqat “Men karman” kartasi. Toʻliq SOS faqat FVV/112 bilan yozma kelishuvdan keyin. Ilova 112 ning oʻrnini bosmaydi.'),
    h('div', { class: 'notice warn' }, h('strong', null, 'Mashq rejimi.'), ' Haqiqiy dispetcher chaqirilmaydi, hech qanday xabar yuborilmaydi.'),
    h('div', { class: 'grid-2' },
      card('1. Xizmatni tanlang', h('div', { class: 'sos-grid' }, services.map(([n, t, ic]) => h('button', { type: 'button', class: 'sos-btn' + (st.svc === n ? ' on' : ''), onclick: () => { st.svc = n; st.sent = false; render(); } }, h('span', { class: 'ic', 'aria-hidden': 'true' }, ic), h('strong', null, n), t))),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.silent ? true : null, onchange: (e) => { st.silent = e.target.checked; } }), 'Jim rejim (ekran qorongʻi, tovush yoʻq)'),
        h('button', { class: 'btn danger big', type: 'button', id: 'sos-send', disabled: st.svc ? null : true, onclick: () => { st.sent = true; render(); } }, st.svc ? st.svc + ' ga mashq signali' : 'Avval xizmatni tanlang')),
      card('2. Dispetcher nimani koʻradi', st.sent ? h('div', { class: 'stack' }, h('div', { class: 'verdict ok' }, h('strong', null, 'Mashq: signal “yetkazildi”'), h('span', null, 'Haqiqiy tizimda dispetcher matnli chat yoki video bilan javob beradi.')),
        h('dl', { class: 'mini' }, h('div', null, h('dt', null, 'Profil'), h('dd', null, 'Men karman, matn yoki imo-ishora kerak')), h('div', null, h('dt', null, 'Joylashuv'), h('dd', null, 'Toshkent, Chilonzor (namuna, ±15 m)')),
          h('div', null, h('dt', null, 'Xizmat'), h('dd', null, st.svc)), h('div', null, h('dt', null, 'Til'), h('dd', null, 'Oʻzbek, imo-ishora'))))
        : empty('Hali signal yoʻq', 'Xizmatni tanlab mashq signalini yuboring. EU 2023/444 talablari: ikki tomonlama, roʻyxatsiz, bepul, toʻgʻri markazga, aniq joylashuv.')),
    ),
    card('“Men karman” kartasi (MVP)', h('p', { class: 'huge' }, T('Men karman. Iltimos, yozing yoki imo-ishora qiling. Manzilim: Chilonzor tumani (namuna)'))),
  ];
}

/* ---------- M17 interpreter cabinet ---------- */
function viewInterp() {
  if (!state.interp) {
    const err = h('p', { class: 'err', role: 'alert' });
    return [h('div', { class: 'login' }, card('Tarjimon kabineti', h('p', { class: 'muted' }, 'Tarjimon va dispetcher uchun. Demo: login ', h('b', null, 'demo'), ', parol ', h('b', null, 'demo'), '.'),
      h('form', { class: 'form', id: 'interp-login', onsubmit: (e) => { e.preventDefault(); const f = new FormData(e.target); if (f.get('u') !== 'demo' || f.get('p') !== 'demo') { err.textContent = 'Demo: demo / demo'; return; } state.interp = { status: 'online', me: D.interpreters[0] }; render(); } },
        h('label', { class: 'field' }, 'Login', h('input', { class: 'input', name: 'u', value: 'demo', autocomplete: 'username' })), h('label', { class: 'field' }, 'Parol', h('input', { class: 'input', name: 'p', type: 'password', value: 'demo', autocomplete: 'current-password' })), err,
        h('button', { class: 'btn', type: 'submit' }, 'Kirish'))))];
  }
  const me = state.interp.me;
  const streak = 2.4;
  const fatigue = h('span', { class: 'fill' + (streak > 2 ? ' warn' : '') }); fatigue.style.width = Math.min(100, streak / 3 * 100) + '%';
  const week = [3.5, 5.2, 4.8, 6.1, 5.6, 2.2, 0.8];
  return [
    head('M17 · Tarjimon kabineti', me.name, 'Navbat, bron jadvali, daqiqa hisobi va charchoq nazorati.', h('div', { class: 'chips' }, Object.entries(ISTATE).map(([k, [, t]]) => h('button', { type: 'button', class: 'chip' + (state.interp.status === k ? ' on' : ''), onclick: () => { state.interp.status = k; render(); } }, t)))),
    h('div', { class: 'kpis' }, kpi('Bugun', '3 soat 40 daq', '11 qoʻngʻiroq'), kpi('Bu hafta', NF(me.minutesWeek) + ' daq', 'reja 1 200'), kpi('Oʻrtacha baho', me.rating + ' / 5', 'anonim'), kpi('Taxminiy toʻlov', NF(Math.round(me.minutesWeek * 2400)) + ' soʻm', '2 400 soʻm/daq (namuna)')),
    h('div', { class: 'grid-2' },
      card('Navbat (' + state.queue.length + ')', h('ul', { class: 'list' }, state.queue.map((q, i) => h('li', null, h('span', { class: 'grow' }, h('strong', null, q.topic + ' · ' + q.region), h('span', { class: 'sub' }, q.who + ' · ' + q.device + ' · ' + q.waited + ' daq kutmoqda')),
        h('button', { class: 'btn sm', type: 'button', disabled: state.interp.status === 'online' ? null : true, onclick: () => { state.queue.splice(i, 1); toast('Qabul qilindi: ' + q.topic); render(); } }, 'Qabul qilish'))))),
      h('div', { class: 'stack' }, card('Charchoq nazorati', h('p', null, 'Ketma-ket ishlangan: ', h('strong', null, '2 soat 24 daq'), ' / 3 soat chegarasi'), h('span', { class: 'bar' }, fatigue), h('p', { class: 'hint' }, '20 daqiqadan keyin 15 daqiqalik tanaffus tavsiya qilinadi.')),
        card('Hafta (soat)', barChart(week.map((v, i) => ({ label: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'][i], v })), { h: 150 })))),
    card('Bronlar jadvali', h('ul', { class: 'list' }, state.bookings.filter((b) => b.status !== 'cancelled').slice(0, 10).map(bookingRow))),
    h('div', { class: 'row' }, h('button', { class: 'btn ghost', type: 'button', onclick: () => { state.interp = null; render(); } }, 'Chiqish')),
  ];
}

/* ---------- M18 stats ---------- */
function barChart(data, opts = {}) {
  const W = 600, H = opts.h || 200, pad = 28;
  const max = Math.max(1, ...data.map((d) => d.v));
  const bw = (W - pad) / data.length;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': opts.label || 'Diagramma' });
  for (let i = 0; i <= 3; i++) { const y = 6 + (H - 30) * (1 - i / 3); svg.append(s('line', { x1: pad, x2: W, y1: y, y2: y, class: 'grid' }), s('text', { x: pad - 4, y: y + 4, class: 'axis', 'text-anchor': 'end' }, Math.round(max * i / 3))); }
  data.forEach((d, i) => { const hh = (H - 30) * d.v / max; const x = pad + i * bw + 4; svg.append(s('rect', { x, y: 6 + (H - 30) - hh, width: bw - 8, height: Math.max(1, hh), rx: 4, class: opts.alt ? 'alt' : 'col' }, s('title', {}, d.label + ': ' + d.v)), s('text', { x: x + (bw - 8) / 2, y: H - 8, class: 'axis', 'text-anchor': 'middle' }, d.label)); });
  return svg;
}
function lineChart(data, opts = {}) {
  const W = 600, H = opts.h || 200, pad = 28;
  const max = Math.max(...data.map((d) => d.v)) * 1.15, min = 0;
  const x = (i) => pad + i * (W - pad - 10) / (data.length - 1), y = (v) => 6 + (H - 30) * (1 - (v - min) / (max - min));
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': opts.label || 'Diagramma' });
  for (let i = 0; i <= 3; i++) { const yy = 6 + (H - 30) * (1 - i / 3); svg.append(s('line', { x1: pad, x2: W, y1: yy, y2: yy, class: 'grid' }), s('text', { x: pad - 4, y: yy + 4, class: 'axis', 'text-anchor': 'end' }, (max * i / 3).toFixed(0))); }
  svg.append(s('path', { d: data.map((d, i) => (i ? 'L' : 'M') + x(i) + ' ' + y(d.v)).join(' '), class: 'line' }));
  data.forEach((d, i) => svg.append(s('circle', { cx: x(i), cy: y(d.v), r: 3.5, class: 'dot' }, s('title', {}, d.label + ': ' + d.v)), s('text', { x: x(i), y: H - 8, class: 'axis', 'text-anchor': 'middle' }, d.label)));
  return svg;
}
function viewStats() {
  const m = D.monthly(NOW);
  const last = m[m.length - 1], prev = m[m.length - 2];
  const tot = D.topicStats.reduce((a, x) => a + x[1], 0);
  return [
    head('M18 · Funder statistikasi (v1)', 'Daqiqalar, kutish va hududlar', 'Donor va davlat uchun hisobot: faqat agregat raqamlar, shaxsiy maʼlumotsiz. Hamma raqamlar namuna.'),
    h('div', { class: 'kpis' }, kpi('Qoʻngʻiroqlar (oy)', NF(last.calls), '+' + Math.round((last.calls / prev.calls - 1) * 100) + '% oʻtgan oyga'), kpi('Daqiqalar (oy)', NF(last.minutes)), kpi('Oʻrtacha kutish', last.wait + ' daq', 'maqsad < 3 daq'), kpi('Faol foydalanuvchilar', NF(last.users))),
    h('div', { class: 'grid-2' }, card('Oylik daqiqalar', barChart(m.map((x) => ({ label: MONTHS[x.d.getMonth()].slice(0, 3), v: x.minutes })))), card('Oʻrtacha kutish, daqiqa', lineChart(m.map((x) => ({ label: MONTHS[x.d.getMonth()].slice(0, 3), v: x.wait }))))),
    h('div', { class: 'grid-2' },
      card('Hududlar', h('div', { class: 'table-wrap' }, h('table', { class: 'table' }, h('thead', null, h('tr', null, h('th', null, 'Hudud'), h('th', { class: 'num' }, 'Qoʻngʻiroq'), h('th', { class: 'num' }, 'Foydalanuvchi'), h('th', { class: 'num' }, 'Kutish'))),
        h('tbody', null, D.regionStats.map((r) => h('tr', null, h('td', null, r.name), h('td', { class: 'num' }, NF(r.calls)), h('td', { class: 'num' }, NF(r.users)), h('td', { class: 'num' + (r.wait > 6 ? ' warn' : '') }, r.wait + ' daq'))))))),
      card('Mavzular', h('ul', { class: 'cats' }, D.topicStats.map(([t, v]) => { const f = h('span', { class: 'fill' }); f.style.width = Math.round(v / D.topicStats[0][1] * 100) + '%'; return h('li', null, h('span', null, t), h('span', { class: 'track' }, f), h('span', { class: 'num' }, Math.round(v / tot * 100) + '%')); })))),
  ];
}

/* ---------- M10 settings ---------- */
function viewSettings() {
  const st = state.settings;
  const set = (k, v) => { st[k] = v; applySettings(); render(); };
  return [
    head('M10 · Qulaylik', 'Signal, shrift va kontrast', 'Tovush hech qachon yagona signal emas: vibratsiya, chiroq va toʻliq ekranli vizual signal.'),
    h('div', { class: 'grid-2' },
      card('Koʻrinish', h('label', { class: 'field' }, 'Shrift oʻlchami: ' + st.font + '%', h('input', { type: 'range', min: 90, max: 140, step: 10, value: st.font, id: 'font-size', onchange: (e) => set('font', Number(e.target.value)) })),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.contrast ? true : null, id: 'contrast', onchange: (e) => set('contrast', e.target.checked) }), 'Yuqori kontrast'),
        h('div', { class: 'chips' }, [['lat', 'Lotin'], ['cyr', 'Кирилл']].map(([k, t]) => h('button', { type: 'button', class: 'chip' + (st.script === k ? ' on' : ''), onclick: () => set('script', k) }, t))),
        h('p', { class: 'hint' }, 'Yozuv tanlovi kartalar, AAC va lugʻatga taʼsir qiladi. WCAG 2.2 AA minimal.')),
      card('Kiruvchi qoʻngʻiroq signali', h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.vibrate ? true : null, onchange: (e) => set('vibrate', e.target.checked) }), 'Vibratsiya naqshi'),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.flash ? true : null, onchange: (e) => set('flash', e.target.checked) }), 'Kamera chirogʻi va toʻliq ekran signal'),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.wifiOnly ? true : null, onchange: (e) => set('wifiOnly', e.target.checked) }), 'Video faqat Wi-Fi orqali'),
        h('button', { class: 'btn', type: 'button', id: 'alert-test', onclick: alertTest }, 'Signalni sinash'))),
  ];
}
function alertTest() {
  const el = h('div', { class: 'flash', role: 'alert' }, h('div', null, h('p', { class: 'eyebrow light' }, 'Kiruvchi videoqoʻngʻiroq'), h('h2', null, 'Onam'), h('div', { class: 'row center' }, h('button', { class: 'btn big light', type: 'button', onclick: () => el.remove() }, 'Javob berish'), h('button', { class: 'btn big danger', type: 'button', onclick: () => el.remove() }, 'Rad etish'))));
  document.body.append(el);
  try { if (state.settings.vibrate && navigator.vibrate) navigator.vibrate([400, 200, 400]); } catch (e) { /* not supported */ }
  setTimeout(() => el.remove(), 6000);
}
function applySettings() {
  document.documentElement.style.fontSize = state.settings.font + '%';
  document.documentElement.classList.toggle('hc', state.settings.contrast);
}

/* ---------- modal ---------- */
function modal(content) {
  closeModal();
  const m = h('div', { class: 'modal', id: 'modal', role: 'dialog', 'aria-modal': 'true', onclick: (e) => { if (e.target === m) closeModal(); } }, h('div', { class: 'modal-box' }, h('button', { class: 'close', type: 'button', 'aria-label': 'Yopish', onclick: closeModal }, '×'), content));
  document.body.append(m);
  m.querySelector('.close').focus();
}
function closeModal() { document.getElementById('modal')?.remove(); }
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ---------- shell ---------- */
const NAV = [['', 'Bosh sahifa', 'home'], ['vri', 'Tarjimon', 'call'], ['face', 'Yuzma-yuz', 'captions'], ['cards', 'Kartalar', 'card'], ['office', 'Idora', 'doc'], ['messages', 'Video xabar', 'wave'],
  ['aac', 'AAC', 'grid'], ['learn', 'Ota-onalar', 'learn'], ['dictionary', 'Lugʻat', 'sign'], ['orgs', 'Tashkilotlar', 'org'], ['sos', 'SOS mashq', 'sos'], ['interpreter', 'Tarjimon kabineti', 'interpreter'], ['stats', 'Statistika', 'chart'], ['settings', 'Qulaylik', 'settings']];
function route() {
  const [a = '', b, c] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  const views = { '': viewHome, vri: viewVri, face: viewFace, cards: () => viewCards(b), office: () => viewOffice(b, c), messages: () => viewMessages(b), aac: () => viewAac(b), learn: () => viewLearn(b),
    dictionary: () => viewDictionary(b), orgs: viewOrgs, sos: viewSos, interpreter: viewInterp, stats: viewStats, settings: viewSettings };
  const v = views[a];
  return [a, v ? v() : [empty('Sahifa topilmadi', 'Bu manzil demoda yoʻq.', link('/', 'Bosh sahifaga'))]];
}
function render() {
  const [a, view] = route();
  document.querySelectorAll('.nav a').forEach((el) => { if (el.dataset.k === a) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
  document.getElementById('main').replaceChildren(...[view].flat(Infinity).filter(Boolean));
}
function shell() {
  const theme = h('button', { class: 'btn ghost sm', type: 'button', id: 'theme', onclick: () => {
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('tilo-demo-theme', document.documentElement.dataset.theme); } catch (e) { /* storage blocked */ }
  } }, 'Mavzu');
  document.getElementById('app').replaceChildren(
    h('header', { class: 'top' }, h('a', { class: 'brand', href: '#/' }, h('img', { src: 'logo.svg', alt: 'tilo', class: 'logo only-light' }), h('img', { src: 'logo-dark.svg', alt: 'tilo', class: 'logo only-dark' })), h('span', { class: 'concept' }, 'Konsept demo · ilova hali qurilmoqda'),
      h('a', { class: 'btn sos-top', href: '#/sos' }, 'SOS'), theme),
    h('nav', { class: 'nav', 'aria-label': 'Modullar' }, NAV.map(([p, t, ic]) => h('a', { href: '#/' + p, 'data-k': p }, h('img', { src: 'icons/' + ic + '.svg', alt: '', width: 18, height: 18 }), h('span', null, t)))),
    h('main', { id: 'main', tabindex: '-1' }),
    h('div', { id: 'toast', class: 'toast', role: 'status', 'aria-live': 'polite' }),
    h('p', { class: 'demo-pill', role: 'note' }, h('b', null, 'Demo'), ' · namuna maʼlumotlar, qayta yuklanganda tiklanadi'));
}

try { const t = localStorage.getItem('tilo-demo-theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) { /* storage blocked */ }
shell();
addEventListener('hashchange', () => { closeModal(); if (state.call && state.call.stage === 'rate') state.call = null; render(); scrollTo(0, 0); });
render();
document.documentElement.dataset.ready = '1';
