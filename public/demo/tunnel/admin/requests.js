(function () {
  'use strict';
  var F = window.__adFormat, bytes = F.bytes, esc = F.esc, DEMO = F.DEMO;
  var GW = 'gw/';
  var $ = function (s) { return document.querySelector(s); };
  var rows = [], ids = new Set(), oldest = Infinity, es = null, cur = null;
  var tb = $('#reqs tbody');
  window.__gw = { stats: {}, paused: {} };

  // ---- demo backend (?demo) -------------------------------------------------
  var demo = (function () {
    var T = ['myapp', 'api-dev', 'bot-webhook', 'demo-shop'], P = ['/', '/api/items', '/api/login', '/static/app.js', '/webhook', '/health', '/api/orders?page=2', '/ws'];
    var allowDemo = {};
    var M = ['GET', 'GET', 'GET', 'POST', 'GET', 'PUT', 'DELETE', 'WS'], id = 0, list = [], paused = {}, locks = { 'demo-shop': { by: 'qa', at: Date.now() } };
    var users = [
      { name: 'nosir', subs: ['nosir-*', 'myapp', 'api-dev'], created: Date.now() - 864e5 * 9, lastSeen: Date.now() - 6e4, host: 'dev-laptop', tunnels: ['myapp', 'api-dev'], disabled: false },
      { name: 'aziz', subs: ['aziz-*', 'bot-webhook'], created: Date.now() - 864e5 * 4, lastSeen: Date.now() - 36e5, host: 'bot-server', tunnels: ['bot-webhook'], disabled: false },
      { name: 'qa', subs: ['qa-*', 'demo-shop'], created: Date.now() - 864e5 * 2, lastSeen: Date.now() - 9e5, host: 'qa-desktop', tunnels: ['demo-shop'], disabled: false },
      { name: 'old-intern', subs: ['old-intern-*'], created: Date.now() - 864e5 * 60, lastSeen: Date.now() - 864e5 * 20, host: 'old-test', tunnels: [], disabled: true }
    ];
    function mk(ts) {
      var t = T[Math.floor(Math.random() * T.length)], p = P[Math.floor(Math.random() * P.length)], m = p === '/ws' ? 'WS' : M[Math.floor(Math.random() * 7)];
      var r = Math.random(), st = m === 'WS' ? 101 : r < .78 ? 200 : r < .86 ? 304 : r < .93 ? 404 : r < .97 ? 401 : 502;
      return { id: ++id, ts: ts, tunnel: t, method: m, path: p, status: st, ms: Math.round(Math.random() * Math.random() * 900), in: m === 'POST' ? Math.round(Math.random() * 4000) : 0, out: Math.round(Math.random() * 90000), ip: '203.0.113.' + (10 + Math.floor(Math.random() * 40)), ua: 'Mozilla/5.0 (Windows NT 10.0) Chrome/130', ref: '', ct: 'text/html' };
    }
    for (var i = 400; i > 0; i--) list.push(mk(Date.now() - i * 9000));
    return {
      next: function () { var e = mk(Date.now()); list.push(e); return e; },
      get: function (path, opt) {
        var u = new URL(path, 'http://x'), q = Object.fromEntries(u.searchParams);
        if (u.pathname === '/requests') {
          var before = +q.before || Infinity, out = [];
          for (var i = list.length - 1; i >= 0 && out.length < (+q.limit || 100); i--) { var e = list[i]; if (e.id < before && match(e, q)) out.push(e); }
          return { items: out, more: true };
        }
        if (u.pathname === '/stats') {
          var per = {};
          list.forEach(function (e) {
            [e.tunnel, '*'].forEach(function (k) {
              var s = per[k] || (per[k] = { tunnel: k, count: 0, err4: 0, err5: 0, in: 0, out: 0, ms: [], series: new Array(60).fill(0), uniq: {} });
              s.count++; s.out += e.out; s.ms.push(e.ms); s.uniq[e.ip] = 1; if (e.status >= 500) s.err5++; else if (e.status >= 400) s.err4++;
              s.series[Math.min(59, Math.floor((e.ts - (Date.now() - 3600e3)) / 60e3))]++;
            });
          });
          return { items: Object.keys(per).map(function (k) { var s = per[k]; s.ms.sort(function (a, b) { return a - b; }); s.p95 = s.ms[Math.floor(s.ms.length * .95)] || 0; s.p50 = s.ms[Math.floor(s.ms.length / 2)] || 0; s.uniqueIps = Object.keys(s.uniq).length; return s; }) };
        }
        if (u.pathname === '/state') return { paused: paused, locks: locks, allow: allowDemo, owners: { myapp: 'nosir', 'api-dev': 'nosir', 'bot-webhook': 'aziz', 'demo-shop': 'qa' } };
        var am = u.pathname.match(/^\/tunnels\/([^/]+)\/allow$/);
        if (am) { var cs = JSON.parse(opt.body || '{}').cidrs; if (!cs || !cs.length) delete allowDemo[am[1]]; else allowDemo[am[1]] = { cidrs: [].concat(cs), by: 'admin', at: Date.now() }; return { ok: true, cidrs: cs || [] }; }
        var m = u.pathname.match(/^\/tunnels\/([^/]+)\/(pause|resume|lock|unlock)$/);
        if (m) { if (m[2] === 'pause') paused[m[1]] = { at: Date.now(), reason: '' }; else if (m[2] === 'resume') delete paused[m[1]]; else if (m[2] === 'lock') locks[m[1]] = { by: 'admin', at: Date.now() }; else delete locks[m[1]]; return { ok: true }; }
        if (u.pathname === '/users' && !opt) return { items: users };
        if (u.pathname === '/users') { var b = JSON.parse(opt.body || '{}'); var nu = { name: b.name, subs: b.subs ? b.subs.split(/[\s,]+/) : [b.name + '-*', b.name], created: Date.now(), lastSeen: 0, host: '', tunnels: [], disabled: false }; users.push(nu); return { ok: true, token: 'tn_' + b.name + '_DEMOdemoDEMOdemoDEMOdemoDEMOdemo', user: nu }; }
        var um = u.pathname.match(/^\/users\/([^/]+)(?:\/(\w+))?$/);
        if (um) { var x = users.filter(function (q) { return q.name === um[1]; })[0]; if (um[2] === 'rotate') return { ok: true, token: 'tn_' + um[1] + '_ROTATEDrotatedROTATEDrotatedROTA' }; if (um[2] === 'disable' || um[2] === 'enable') x.disabled = um[2] === 'disable'; if (!um[2]) users.splice(users.indexOf(x), 1); return { ok: true }; }
        return {};
      }
    };
  })();

  function match(e, q) {
    if (q.tunnel && e.tunnel !== q.tunnel) return false;
    if (q.status) { if (q.status === 'err' ? e.status < 400 : String(e.status)[0] !== q.status) return false; }
    if (q.method && e.method !== q.method) return false;
    if (q.q) { var s = q.q.toLowerCase(); if (!(e.path.toLowerCase().indexOf(s) >= 0 || e.ip.indexOf(s) >= 0 || (e.ua || '').toLowerCase().indexOf(s) >= 0)) return false; }
    return true;
  }
  function call(path, opt) {
    if (DEMO) return Promise.resolve(demo.get('/' + path, opt));
    return fetch(GW + path, Object.assign({ credentials: 'same-origin', headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }, opt || {})).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw new Error(j.error || 'HTTP ' + r.status); });
      return r.json();
    });
  }

  // ---- filters ---------------------------------------------------------------
  function filters() {
    return { tunnel: $('#fTunnel').value, status: $('#fStatus').value, method: $('#fMethod').value, q: $('#fQ').value.trim() };
  }
  function qs(o) { return Object.keys(o).filter(function (k) { return o[k] !== '' && o[k] != null; }).map(function (k) { return k + '=' + encodeURIComponent(o[k]); }).join('&'); }

  // ---- rendering -------------------------------------------------------------
  function cls(st) { return st >= 500 ? 's5' : st >= 400 ? 's4' : st >= 300 ? 's3' : st === 101 ? 's1' : 's2'; }
  function stLabel(st) { return (st >= 500 ? '✕ ' : st >= 400 ? '! ' : st >= 300 ? '↪ ' : st === 101 ? '⇄ ' : '✓ ') + st; }
  function row(e, fresh) {
    var t = new Date(e.ts);
    return '<tr data-id="' + e.id + '"' + (fresh ? ' class="fresh"' : '') + '><td class="tn-mono">' + t.toLocaleTimeString() + '</td><td>' + esc(e.tunnel) + '</td><td><span class="ad-m m-' + esc(e.method) + '">' + esc(e.method) + '</span></td>' +
      '<td class="ad-path" title="' + esc(e.path) + '">' + esc(e.path) + '</td><td><span class="ad-code ' + cls(e.status) + '">' + stLabel(e.status) + '</span></td>' +
      '<td class="num">' + e.ms + '</td><td class="num">' + bytes(e.out) + '</td><td class="tn-mono">' + esc(e.ip) + '</td></tr>';
  }
  function paint() {
    tb.innerHTML = rows.length ? rows.map(function (e) { return row(e); }).join('') : '<tr><td colspan="8" class="ad-emptyrow">Bu filtr bo\'yicha so\'rov yo\'q</td></tr>';
    $('#logInfo').textContent = rows.length + ' ta ko\'rsatildi';
  }
  function load(reset) {
    if (reset) { rows = []; ids.clear(); oldest = Infinity; }
    var q = filters(); q.limit = 100; if (oldest !== Infinity) q.before = oldest;
    return call('requests?' + qs(q)).then(function (d) {
      (d.items || []).forEach(function (e) { if (!ids.has(e.id)) { ids.add(e.id); rows.push(e); oldest = Math.min(oldest, e.id); } });
      $('#logMore').hidden = !d.more;
      paint();
    }).catch(function (e) { $('#logInfo').textContent = 'Jurnal yuklanmadi: ' + e.message; });
  }
  function onLive(e) {
    if (ids.has(e.id) || !match(e, filters())) return;
    ids.add(e.id); rows.unshift(e);
    if (rows.length > 1000) rows.length = 1000;
    var tmp = document.createElement('tbody'); tmp.innerHTML = row(e, true);
    if (tb.firstChild && tb.firstChild.querySelector && tb.firstChild.querySelector('.ad-emptyrow')) tb.innerHTML = '';
    tb.insertBefore(tmp.firstChild, tb.firstChild);
    while (tb.children.length > 1000) tb.removeChild(tb.lastChild);
    $('#logInfo').textContent = rows.length + ' ta ko\'rsatildi';
  }
  var demoTimer = null;
  function liveOn() {
    liveOff();
    if (!$('#logLive').checked) return;
    if (DEMO) { demoTimer = setInterval(function () { onLive(demo.next()); }, 900); return; }
    if (!window.EventSource) return;
    var t = $('#fTunnel').value;
    es = new EventSource(GW + 'live' + (t ? '?tunnel=' + encodeURIComponent(t) : ''));
    es.onmessage = function (m) { try { onLive(JSON.parse(m.data)); } catch (x) { /* ignore */ } };
  }
  function liveOff() { if (es) { es.close(); es = null; } if (demoTimer) { clearInterval(demoTimer); demoTimer = null; } }

  var deb;
  ['#fTunnel', '#fStatus', '#fMethod'].forEach(function (s) { $(s).addEventListener('change', function () { load(true); liveOn(); }); });
  $('#fQ').addEventListener('input', function () { clearTimeout(deb); deb = setTimeout(function () { load(true); }, 300); });
  $('#logLive').addEventListener('change', liveOn);
  $('#logMore').addEventListener('click', function () { load(false); });

  // ---- drawer ----------------------------------------------------------------
  tb.addEventListener('click', function (ev) {
    var tr = ev.target.closest('tr[data-id]'); if (!tr) return;
    var id = +tr.getAttribute('data-id'); cur = rows.filter(function (e) { return e.id === id; })[0]; if (!cur) return;
    var e = cur, host = e.tunnel + '.' + 'tunnel.acme.example';
    $('#dTitle').textContent = e.method + ' ' + e.status;
    var dl = [['Vaqt', new Date(e.ts).toLocaleString()], ['Tunnel', e.tunnel], ['URL', 'https://' + host + e.path], ['Status', e.status], ['Davomiylik', e.ms + ' ms'], ['Kiruvchi', bytes(e.in)], ['Chiquvchi', bytes(e.out)], ['Content-Type', e.ct || '—'], ['IP', e.ip], ['Brauzer', e.ua || '—'], ['Referer', e.ref || '—']];
    $('#dBody').innerHTML = dl.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    $('#drawer').hidden = false;
    requestAnimationFrame(function () { $('#drawer').classList.add('open'); });
  });
  function closeDrawer() { $('#drawer').classList.remove('open'); setTimeout(function () { $('#drawer').hidden = true; }, 250); }
  $('#dClose').addEventListener('click', closeDrawer);
  $('#drawer').addEventListener('click', function (ev) { if (ev.target.id === 'drawer') closeDrawer(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { closeDrawer(); closeModal(); } });
  $('#dCurl').addEventListener('click', function () {
    if (!cur) return;
    var cmd = 'curl -i -X ' + (cur.method === 'WS' ? 'GET' : cur.method) + " 'https://" + cur.tunnel + '.tunnel.acme.example' + cur.path + "'";
    if (navigator.clipboard) navigator.clipboard.writeText(cmd);
    this.textContent = '✓ nusxa olindi'; var b = this; setTimeout(function () { b.textContent = '📋 curl nusxasi'; }, 1400);
  });
  $('#dSame').addEventListener('click', function () { if (!cur) return; $('#fTunnel').value = cur.tunnel; $('#fQ').value = cur.path.split('?')[0]; closeDrawer(); load(true); liveOn(); });

  // ---- stats strip + tunnel options -----------------------------------------
  function strip(s) {
    if (!s) return '';
    var max = Math.max.apply(null, s.series.concat([1]));
    var bars = s.series.map(function (v, i) { var h = Math.max(v ? 3 : 1, Math.round((v / max) * 34)); return '<rect x="' + (i * 5) + '" y="' + (36 - h) + '" width="3.4" height="' + h + '" rx="1.5"/>'; }).join('');
    var errPct = s.count ? Math.round(((s.err4 + s.err5) / s.count) * 1000) / 10 : 0;
    return '<div class="ad-ls"><small>So\'rov · 1 soat</small><b>' + s.count + '</b></div>' +
      '<div class="ad-ls"><small>Xato (4xx+5xx)</small><b>' + errPct + '%</b></div>' +
      '<div class="ad-ls"><small>p50 / p95</small><b>' + s.p50 + ' / ' + s.p95 + ' ms</b></div>' +
      '<div class="ad-ls"><small>Noyob IP</small><b>' + s.uniqueIps + '</b></div>' +
      '<div class="ad-ls wide"><small>So\'rov/daqiqa · 60 daq</small><svg viewBox="0 0 300 36" preserveAspectRatio="none" aria-label="so\'rov/daqiqa">' + bars + '</svg></div>';
  }
  function refreshStats() {
    Promise.all([call('stats?window=3600'), call('state')]).then(function (r) {
      var by = {}; (r[0].items || []).forEach(function (s) { by[s.tunnel] = s; });
      window.__gw = { stats: by, paused: (r[1] && r[1].paused) || {}, locks: (r[1] && r[1].locks) || {}, allow: (r[1] && r[1].allow) || {}, rules: (r[1] && r[1].rules) || {}, owners: (r[1] && r[1].owners) || {} };
      var t = $('#fTunnel').value;
      $('#logStats').innerHTML = strip(by[t || '*']);
      var sel = $('#fTunnel'), have = {}; Array.prototype.forEach.call(sel.options, function (o) { have[o.value] = 1; });
      Object.keys(by).filter(function (k) { return k !== '*' && k && !have[k]; }).sort().forEach(function (k) { var o = document.createElement('option'); o.value = o.textContent = k; sel.appendChild(o); });
      window.dispatchEvent(new Event('gw-update'));
    }).catch(function () { /* gateway not reachable yet */ });
  }

  // ---- tunnel actions (from cards) ---------------------------------------------
  var pending = null;
  function closeModal() { $('#pauseModal').hidden = true; pending = null; }
  document.getElementById('tunnels').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-act]'); if (!b) return;
    var sub = b.getAttribute('data-sub'), act = b.getAttribute('data-act');
    if (act === 'log') {
      var sel = $('#fTunnel');
      if (!Array.prototype.some.call(sel.options, function (o) { return o.value === sub; })) { var o = document.createElement('option'); o.value = o.textContent = sub; sel.appendChild(o); }
      sel.value = sub; load(true); liveOn(); refreshStats();
      document.getElementById('log').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (act === 'pause' || act === 'lock') {
      pending = sub; $('#pauseText').innerHTML = '<code>' + esc(sub) + '</code> ga kelgan barcha so\'rovlar 503 "Tunnel to\'xtatilgan" sahifasini oladi. Klient ulanib turaveradi, istalgan payt qayta yoqasiz.';
      $('#pauseReason').value = ''; $('#pauseModal').hidden = false; $('#pauseReason').focus();
    } else if (act === 'resume' || act === 'unlock') {
      call('tunnels/' + encodeURIComponent(sub) + '/' + act, { method: 'POST', body: '{}' }).then(refreshStats);
    } else if (act === 'allowoff') {
      call('tunnels/' + encodeURIComponent(sub) + '/allow', { method: 'POST', body: JSON.stringify({ cidrs: [] }) }).then(refreshStats);
    } else if (act === 'allow') {
      pending = sub; mode = 'allow'; var inp2 = $('#pauseReason');
      $('#pauseModal h2').textContent = '🧱 IP bo\'yicha cheklash';
      $('#pauseForm button[type=submit]').textContent = 'Saqlash';
      $('#pauseText').innerHTML = '<code>' + esc(sub) + '</code> faqat shu manzillardan ochiladi, boshqalar 403 sahifasini ko\'radi. Bo\'sh joy yoki vergul bilan: <code>1.2.3.4 10.0.0.0/8</code>';
      inp2.type = 'text'; inp2.minLength = 0; inp2.required = true; inp2.autocomplete = 'off'; inp2.placeholder = '1.2.3.4 10.0.0.0/8';
      var cur = (window.__gw.allow || {})[sub]; inp2.value = cur ? cur.cidrs.join(' ') : '';
      $('#pauseModal').hidden = false; inp2.focus();
    }
    if (act === 'pause' || act === 'lock') {
      mode = act;
      var inp = $('#pauseReason'), lock = act === 'lock';
      $('#pauseModal h2').textContent = lock ? '🔐 Tunnelga parol qo\'yish' : '⏸️ Tunnelni to\'xtatish';
      $('#pauseForm button[type=submit]').textContent = lock ? 'Parol qo\'yish' : 'To\'xtatish';
      if (lock) $('#pauseText').innerHTML = '<code>' + esc(sub) + '</code> ochilganda brauzer parol so\'raydi (foydalanuvchi nomi istalgan). Parol serverda faqat scrypt xeshi ko\'rinishida saqlanadi va ilovaga uzatilmaydi.';
      inp.type = lock ? 'password' : 'text'; inp.minLength = lock ? 6 : 0; inp.required = lock;
      inp.placeholder = lock ? 'Parol (kamida 6 belgi)' : 'Sabab (ixtiyoriy): mehmonlarga ko\'rsatiladi';
      inp.autocomplete = lock ? 'new-password' : 'off';
    }
  });
  var mode = 'pause';
  $('#pauseCancel').addEventListener('click', closeModal);
  $('#pauseModal').addEventListener('click', function (ev) { if (ev.target.id === 'pauseModal') closeModal(); });
  $('#pauseForm').addEventListener('submit', function (ev) {
    ev.preventDefault(); if (!pending) return;
    var v = $('#pauseReason').value;
    var payload = mode === 'lock' ? { password: v } : mode === 'allow' ? { cidrs: v.split(/[\s,]+/).filter(Boolean) } : { reason: v };
    call('tunnels/' + encodeURIComponent(pending) + '/' + mode, { method: 'POST', body: JSON.stringify(payload) }).then(function (r) {
      if (r && r.error) { $('#pauseText').innerHTML = '⚠️ ' + esc(r.error); return; }
      $('#pauseReason').value = ''; closeModal(); refreshStats();
    }).catch(function (err) { $('#pauseText').innerHTML = '⚠️ ' + esc(err.message); });
  });
  window.__gwCall = call;

  load(true); liveOn(); refreshStats();
  setInterval(refreshStats, 10000);
})();
