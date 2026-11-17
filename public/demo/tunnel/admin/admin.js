(function () {
  'use strict';
  var API = 'api/v2/';
  var POLL = 3000, KEEP = 60;
  var DEMO = /[?&]demo\b/.test(location.search);
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };

  // ---- theme -------------------------------------------------------------
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage off */ } }
  };
  var theme = store.get('tn-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  function applyTheme() { root.setAttribute('data-theme', theme); window.dispatchEvent(new CustomEvent('tn-theme', { detail: theme })); drawRate(); }
  $('#theme').addEventListener('click', function () { theme = theme === 'dark' ? 'light' : 'dark'; store.set('tn-theme', theme); applyTheme(); });

  // ---- format ------------------------------------------------------------
  function bytes(n) {
    n = +n || 0;
    var u = ['B', 'KB', 'MB', 'GB', 'TB'], i = 0;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return (i === 0 ? Math.round(n) : n.toFixed(n < 10 ? 1 : 0)) + ' ' + u[i];
  }
  function ago(sec) {
    if (!sec) return '—';
    var d = Math.max(0, Date.now() / 1000 - sec);
    if (d < 60) return Math.round(d) + ' s';
    if (d < 3600) return Math.round(d / 60) + ' daq';
    if (d < 86400) return Math.floor(d / 3600) + ' soat ' + Math.round((d % 3600) / 60) + ' daq';
    return Math.floor(d / 86400) + ' kun';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cssVar(n) { return getComputedStyle($('#tn')).getPropertyValue(n).trim(); }

  // ---- demo data (local preview only: ?demo) ------------------------------
  var demo = (function () {
    var t0 = Date.now() / 1000, tin = 8e6, tout = 41e6;
    var P = [['myapp', 'c1', 1], ['api-dev', 'c1', 1], ['bot-webhook', 'c2', 1], ['demo-shop', 'c3', 1], ['old-test', 'c2', 0]];
    function hist() { var h = [], d = new Date(); for (var i = 6; i >= 0; i--) { var x = new Date(d - i * 864e5); h.push({ date: x.toISOString().slice(0, 10), trafficIn: Math.random() * 4e7, trafficOut: Math.random() * 2e8 }); } return h; }
    var H = {}; P.forEach(function (p) { H[p[0]] = hist(); });
    return function (path) {
      tin += Math.random() * 4e5; tout += Math.random() * 2.4e6;
      if (path.indexOf('system/info') === 0) return { version: '0.71.1', config: { bindPort: 7000, vhostHTTPPort: 8080, subdomainHost: 'tunnel.acme.example', maxPoolCount: 20, heartbeatTimeout: -1 }, status: { totalTrafficIn: tin, totalTrafficOut: tout, curConns: 3 + Math.round(Math.random() * 4), clientCounts: 3, proxyTypeCount: { http: 5 } } };
      if (path.indexOf('proxies?') === 0) return { total: P.length, items: P.map(function (p, i) { return { name: p[0], clientID: p[1], spec: { type: 'http', http: { subdomain: p[0] } }, status: { phase: p[2] ? 'online' : 'offline', todayTrafficIn: 1e6 * (i + 1) * 3.3, todayTrafficOut: 1e7 * (i + 2) * 1.7, curConns: p[2] ? Math.round(Math.random() * 3) : 0, lastStartAt: t0 - 3600 * (i + 1) * 2.3 } }; }) };
      if (path.indexOf('clients') === 0) return { items: [{ clientID: 'c1', hostname: 'dev-laptop', version: '0.71.1', online: true, firstConnectedAt: t0 - 7200, lastConnectedAt: t0 - 7200 }, { clientID: 'c2', hostname: 'bot-server', version: '0.71.1', online: true, firstConnectedAt: t0 - 86400 * 3, lastConnectedAt: t0 - 900 }, { clientID: 'c3', hostname: 'qa-desktop', version: '0.71.0', online: true, firstConnectedAt: t0 - 1800, lastConnectedAt: t0 - 1800 }] };
      var m = path.match(/^proxies\/([^/]+)\/traffic/); if (m) return { history: H[decodeURIComponent(m[1])] || [] };
      return {};
    };
  })();

  function get(path) {
    if (DEMO) return Promise.resolve(demo(path));
    return fetch(API + path, { credentials: 'same-origin', headers: { Accept: 'application/json' } }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) { if (j && j.code && j.code !== 200) throw new Error(j.msg || 'api'); return j && j.data !== undefined ? j.data : j; });
  }

  // ---- KPIs --------------------------------------------------------------
  var kv = {};
  function setKpi(k, val, fmt, sub) {
    var el = $('.ad-kpi[data-k="' + k + '"]'), b = $('[data-v]', el), s = $('[data-sub]', el);
    s.textContent = sub || '';
    var from = kv[k] == null ? 0 : kv[k];
    kv[k] = val;
    if (reduced || !window.gsap || from === val) { b.textContent = fmt(val); return; }
    var o = { v: from };
    gsap.to(o, { v: val, duration: 1, ease: 'power2.out', onUpdate: function () { b.textContent = fmt(o.v); } });
  }
  var int = function (v) { return String(Math.round(v)); };

  // ---- rate chart -------------------------------------------------------
  var rate = [], last = null, hover = -1;
  var cv = $('#rate'), box = $('#rateBox'), tip = $('#rateTip');
  function drawRate() {
    var dpr = Math.min(2, devicePixelRatio || 1), W = box.clientWidth, Hh = box.clientHeight;
    if (!W) return;
    cv.width = W * dpr; cv.height = Hh * dpr;
    var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, Hh);
    var padL = 64, padR = 10, padT = 10, padB = 22, w = W - padL - padR, h = Hh - padT - padB;
    var max = 1;
    rate.forEach(function (r) { max = Math.max(max, r.i, r.o); });
    var step = Math.pow(10, Math.floor(Math.log10(max))), nice = Math.ceil(max / step) * step;
    var ink = cssVar('--ink'), mute = 'rgb(' + cssVar('--mute') + ')';
    g.font = '11px ' + (cssVar('--mono') || 'monospace');
    g.fillStyle = mute; g.strokeStyle = 'rgb(' + ink + ' / .08)'; g.lineWidth = 1;
    for (var k = 0; k <= 3; k++) {
      var y = padT + h - (h * k) / 3;
      g.beginPath(); g.moveTo(padL, Math.round(y) + .5); g.lineTo(W - padR, Math.round(y) + .5); g.stroke();
      g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(bytes((nice * k) / 3) + '/s', padL - 8, y);
    }
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('−3 daq', padL, Hh - 4);
    g.textAlign = 'right'; g.fillText('hozir', W - padR, Hh - 4);
    if (rate.length < 2) {
      g.textAlign = 'center'; g.fillText("ma'lumot yig'ilmoqda…", padL + w / 2, padT + h / 2); return;
    }
    var X = function (i) { return padL + (w * (i + KEEP - rate.length)) / (KEEP - 1); };
    var Y = function (v) { return padT + h - (h * v) / nice; };
    [['i', cssVar('--in')], ['o', cssVar('--out')]].forEach(function (s) {
      var grad = g.createLinearGradient(0, padT, 0, padT + h);
      grad.addColorStop(0, s[1] + '33'); grad.addColorStop(1, s[1] + '00');
      g.beginPath();
      rate.forEach(function (r, i) { var x = X(i), y = Y(r[s[0]]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      g.strokeStyle = s[1]; g.lineWidth = 2; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
      g.lineTo(X(rate.length - 1), padT + h); g.lineTo(X(0), padT + h); g.closePath(); g.fillStyle = grad; g.fill();
      var lr = rate[rate.length - 1];
      g.beginPath(); g.arc(X(rate.length - 1), Y(lr[s[0]]), 4, 0, 7); g.fillStyle = s[1]; g.fill();
    });
    if (hover >= 0 && hover < rate.length) {
      var hx = X(hover);
      g.strokeStyle = 'rgb(' + ink + ' / .25)'; g.beginPath(); g.moveTo(hx, padT); g.lineTo(hx, padT + h); g.stroke();
      [['i', cssVar('--in')], ['o', cssVar('--out')]].forEach(function (s) {
        g.beginPath(); g.arc(hx, Y(rate[hover][s[0]]), 5, 0, 7); g.fillStyle = s[1]; g.fill();
        g.lineWidth = 2; g.strokeStyle = 'rgb(' + cssVar('--panel') + ')'; g.stroke();
      });
      var r = rate[hover];
      tip.hidden = false;
      tip.innerHTML = '<div class="k">' + new Date(r.t).toLocaleTimeString() + '</div><div><i style="background:var(--in)"></i>Kiruvchi ' + bytes(r.i) + '/s</div><div><i style="background:var(--out)"></i>Chiquvchi ' + bytes(r.o) + '/s</div>';
      var tw = tip.offsetWidth; tip.style.left = Math.min(W - tw - 4, Math.max(4, hx + 12)) + 'px';
    } else tip.hidden = true;
  }
  box.addEventListener('pointermove', function (e) {
    var r = box.getBoundingClientRect(), padL = 64, w = r.width - 74;
    var i = Math.round(((e.clientX - r.left - padL) / w) * (KEEP - 1)) - (KEEP - rate.length);
    hover = Math.max(0, Math.min(rate.length - 1, i)); drawRate();
  });
  box.addEventListener('pointerleave', function () { hover = -1; drawRate(); });
  addEventListener('resize', drawRate);

  // ---- tunnels -----------------------------------------------------------
  var hist = {}, histAt = 0, prevConns = {};
  function spark(name) {
    var h = hist[name];
    if (!h || !h.length) return '<div class="ad-skel" style="height:54px"></div>';
    var max = 1; h.forEach(function (d) { max = Math.max(max, d.trafficIn, d.trafficOut); });
    var n = h.length, x = function (i) { return (i / (n - 1)) * 100; }, y = function (v) { return 50 - (v / max) * 46; };
    var line = function (k) { return h.map(function (d, i) { return (i ? 'L' : 'M') + x(i).toFixed(2) + ' ' + y(d[k]).toFixed(2); }).join(' '); };
    var hits = h.map(function (d, i) { return '<rect x="' + (x(i) - 50 / (n - 1)).toFixed(2) + '" y="0" width="' + (100 / (n - 1)).toFixed(2) + '" height="54" fill="transparent" data-i="' + i + '"/>'; }).join('');
    return '<svg viewBox="0 0 100 54" preserveAspectRatio="none" aria-label="7 kunlik trafik">' +
      '<path d="' + line('trafficOut') + '" fill="none" stroke="var(--out)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
      '<path d="' + line('trafficIn') + '" fill="none" stroke="var(--in)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
      hits + '</svg><div class="ad-tip tip" hidden></div>';
  }
  function renderTunnels(items, clientsById, host) {
    var el = $('#tunnels');
    $('#tunCount').textContent = items.length + ' ta';
    if (!items.length) { el.innerHTML = '<div class="ad-card">Hozircha tunnel yo\'q. Klientda <code>tunnel up</code>.</div>'; return; }
    items.sort(function (a, b) { return (b.status.phase === 'online') - (a.status.phase === 'online') || a.name.localeCompare(b.name); });
    var gw = window.__gw || { stats: {}, paused: {} };
    el.innerHTML = items.map(function (p) {
      var on = p.status.phase === 'online', sub = (p.spec && p.spec.http && p.spec.http.subdomain) || p.name;
      var url = 'https://' + sub + '.' + host, c = clientsById[p.clientID];
      var paused = gw.paused && gw.paused[sub], s = gw.stats && gw.stats[sub];
      var st = paused ? '<span class="ad-st pause">⏸ to\'xtatilgan</span>' : '<span class="ad-st ' + (on ? 'on' : 'off') + '">' + (on ? '● onlayn' : '○ oflayn') + '</span>';
      var gws = s ? '<div class="ad-gws"><span title="oxirgi 1 soat">📨 ' + s.count + ' so\'rov</span><span class="' + (s.err5 ? 'bad' : '') + '">⚠️ ' + (s.count ? Math.round(((s.err4 + s.err5) / s.count) * 100) : 0) + '% xato</span><span>⏱ p95 ' + s.p95 + ' ms</span></div>' : '<div class="ad-gws"><span>📨 1 soatda so\'rov yo\'q</span></div>';
      var locked = gw.locks && gw.locks[sub], owner = gw.owners && gw.owners[sub], ipl = gw.allow && gw.allow[sub];
      var acts = '<div class="ad-acts"><button data-act="log" data-sub="' + esc(sub) + '" title="So\'rovlar">📜 So\'rovlar</button>' +
        (locked ? '<button data-act="unlock" data-sub="' + esc(sub) + '" class="ok" title="Parolni olib tashlash">🔓 Ochish</button>' : '<button data-act="lock" data-sub="' + esc(sub) + '" title="Parol qo\'yish">🔐 Parol</button>') +
        (ipl ? '<button data-act="allowoff" data-sub="' + esc(sub) + '" class="ok" title="' + esc(ipl.cidrs.join(', ')) + '">🧱 IP ochish</button>' : '<button data-act="allow" data-sub="' + esc(sub) + '" title="Faqat ma\'lum IP manzillardan">🧱 IP</button>') +
        (paused ? '<button data-act="resume" data-sub="' + esc(sub) + '" class="ok">▶ Yoqish</button>' : '<button data-act="pause" data-sub="' + esc(sub) + '">⏸ To\'xtatish</button>') + '</div>';
      if (locked) st = '<span class="ad-st lock">🔐 parolli</span>' + st;
      if (ipl) st = '<span class="ad-st lock" title="' + esc(ipl.cidrs.join(', ')) + '">🧱 IP: ' + ipl.cidrs.length + '</span>' + st;
      var ru = (gw.rules && gw.rules[sub]) || {};
      if (ru.google) st = '<span class="ad-st lock" title="' + esc(ru.google.join(', ')) + '">🔑 Google</span>' + st;
      if (ru.webhook) st = '<span class="ad-st lock" title="' + esc(ru.webhook.kind + ' ' + ru.webhook.path) + '">🪝 ' + esc(ru.webhook.kind) + '</span>' + st;
      if (ru.limit) st = '<span class="ad-st lock" title="har IP uchun">🚦 ' + ru.limit + '/daq</span>' + st;
      if (ru.reqSet || ru.reqDel || ru.resSet) st = '<span class="ad-st lock" title="sarlavha qoidalari">🏷 sarlavha</span>' + st;
      return '<article class="ad-tun' + (on && !paused ? '' : ' off') + '" data-name="' + esc(p.name) + '">' +
        '<div class="ad-tun-top"><span>' + (paused ? '⏸️' : on ? '🛰️' : '💤') + '</span><b>' + esc(p.name) + '</b>' + st + '</div>' +
        '<div class="ad-url"><span>🔒</span><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url.replace('https://', '')) + '</a><button data-copy="' + esc(url) + '" aria-label="Nusxa">📋</button></div>' +
        '<div class="ad-stats"><div><small>⬇ bugun</small><span>' + bytes(p.status.todayTrafficIn) + '</span></div><div><small>⬆ bugun</small><span>' + bytes(p.status.todayTrafficOut) + '</span></div><div><small>⚡ ulanish</small><span>' + (p.status.curConns || 0) + '</span></div></div>' +
        gws +
        '<div class="ad-spark">' + spark(p.name) + '</div>' +
        '<div class="ad-meta"><span>💻 ' + esc(c ? c.hostname : (p.clientID || '—')) + (owner ? ' · 👤 ' + esc(owner) : '') + '</span><span>⏱ ' + (on ? ago(p.status.lastStartAt) : (p.status.lastCloseAt ? ago(p.status.lastCloseAt) + ' oldin' : '—')) + '</span></div>' +
        acts +
        '</article>';
    }).join('');
    items.forEach(function (p) {
      var c = p.status.curConns || 0;
      if (prevConns[p.name] != null && c > prevConns[p.name]) { var a = el.querySelector('[data-name="' + CSS.escape(p.name) + '"]'); if (a) a.classList.add('flash'); }
      prevConns[p.name] = c;
    });
  }
  $('#tunnels').addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    var done = function () { b.textContent = '✓'; setTimeout(function () { b.textContent = '📋'; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.getAttribute('data-copy')).then(done, function () {}); else done();
  });
  $('#tunnels').addEventListener('pointermove', function (e) {
    var r = e.target.closest('rect[data-i]'); var sp = e.target.closest('.ad-spark');
    document.querySelectorAll('.ad-spark .tip').forEach(function (t) { if (!sp || t.parentNode !== sp) t.hidden = true; });
    if (!r || !sp) return;
    var name = sp.closest('.ad-tun').getAttribute('data-name'), d = hist[name][+r.getAttribute('data-i')], t = $('.tip', sp);
    t.hidden = false;
    t.innerHTML = '<div class="k">' + d.date + '</div><div><i style="background:var(--in)"></i>⬇ ' + bytes(d.trafficIn) + '</div><div><i style="background:var(--out)"></i>⬆ ' + bytes(d.trafficOut) + '</div>';
    var br = sp.getBoundingClientRect(); t.style.left = Math.min(br.width - 70, Math.max(70, e.clientX - br.left)) + 'px';
  });
  $('#tunnels').addEventListener('pointerleave', function () { document.querySelectorAll('.ad-spark .tip').forEach(function (t) { t.hidden = true; }); });

  function loadHist(items) {
    if (Date.now() - histAt < 60000) return;
    histAt = Date.now();
    Promise.all(items.map(function (p) {
      return get('proxies/' + encodeURIComponent(p.name) + '/traffic').then(function (d) { hist[p.name] = d.history || []; }, function () {});
    })).then(function () { last && renderAll(last); });
  }

  // ---- clients / server ----------------------------------------------------
  function renderClients(items) {
    $('#clients tbody').innerHTML = items.length ? items.map(function (c) {
      return '<tr><td>💻 ' + esc(c.hostname || c.clientID) + '</td><td>' + (c.online ? '<span class="ad-st on">● onlayn</span>' : '<span class="ad-st off">○ oflayn</span>') + '</td><td class="tn-mono">' + esc(c.version) + '</td><td>' + ago(c.lastConnectedAt || c.firstConnectedAt) + '</td></tr>';
    }).join('') : '<tr><td colspan="4">Klient yo\'q</td></tr>';
  }
  function renderServer(s) {
    var c = s.config || {}, st = s.status || {};
    var rows = [['Versiya', 'frp ' + s.version], ['Subdomen', '*.' + c.subdomainHost], ['Boshqaruv kanali', 'wss · ' + c.bindPort], ['HTTP vhost', c.vhostHTTPPort], ['Max pool', c.maxPoolCount], ['Jami ⬇', bytes(st.totalTrafficIn)], ['Jami ⬆', bytes(st.totalTrafficOut)], ['Tunnel turlari', Object.keys(st.proxyTypeCount || {}).map(function (k) { return k + ': ' + st.proxyTypeCount[k]; }).join(', ') || '—']];
    $('#server').innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    $('#srv').textContent = 'frp ' + s.version + ' · *.' + c.subdomainHost;
  }

  function renderAll(d) {
    var byId = {}; d.clients.forEach(function (c) { byId[c.clientID] = c; });
    renderTunnels(d.proxies.slice(), byId, (d.info.config || {}).subdomainHost || location.host);
    renderClients(d.clients);
  }

  // ---- loop ----------------------------------------------------------------
  var live = $('#live');
  function setLive(ok, text) { live.className = 'ad-live ' + (ok ? 'ok' : 'err'); $('span', live).textContent = text; }
  function tick() {
    Promise.all([get('system/info'), get('proxies?page=1&pageSize=200'), get('clients?page=1&pageSize=200')]).then(function (r) {
      var info = r[0], proxies = (r[1] && r[1].items) || [], clients = (r[2] && r[2].items) || [];
      var st = info.status || {}, now = Date.now();
      if (last) {
        var dt = (now - last.at) / 1000;
        rate.push({ t: now, i: Math.max(0, (st.totalTrafficIn - last.info.status.totalTrafficIn) / dt), o: Math.max(0, (st.totalTrafficOut - last.info.status.totalTrafficOut) / dt) });
        if (rate.length > KEEP) rate.shift();
      }
      last = { at: now, info: info, proxies: proxies, clients: clients };
      var online = proxies.filter(function (p) { return p.status.phase === 'online'; }).length;
      var tin = 0, tout = 0; proxies.forEach(function (p) { tin += p.status.todayTrafficIn || 0; tout += p.status.todayTrafficOut || 0; });
      var onCli = clients.filter(function (c) { return c.online; }).length;
      setKpi('online', online, int, 'jami ' + proxies.length + ' ta');
      setKpi('clients', onCli, int, clients.length + ' ta ro\'yxatda');
      setKpi('conns', st.curConns || 0, int, 'hozir ochiq');
      setKpi('today', tin + tout, bytes, '⬇ ' + bytes(tin) + ' · ⬆ ' + bytes(tout));
      renderServer(info);
      renderAll(last);
      loadHist(proxies);
      drawRate();
      window.dispatchEvent(new CustomEvent('ad-data', { detail: { proxies: proxies, clients: clients, conns: st.curConns || 0 } }));
      setLive(true, DEMO ? 'demo · jonli' : 'jonli · ' + new Date().toLocaleTimeString());
    }).catch(function (e) {
      setLive(false, 'aloqa yo\'q: ' + e.message);
    }).then(function () { setTimeout(tick, POLL); });
  }

  window.addEventListener('gw-update', function () { if (last) renderAll(last); });
  window.__adFormat = { bytes: bytes, esc: esc, DEMO: DEMO };

  applyTheme();
  $('#tunnels').innerHTML = '<div class="ad-skel"></div><div class="ad-skel"></div>';
  tick();
})();
