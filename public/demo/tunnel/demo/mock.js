// Live demo data layer (scripts/build-demo.mjs injects it before admin.js; production never loads it).
// Answers the frps dashboard API (api/v2/*) and the tunnel gateway (gw/*, SSE gw/live) in the browser:
// fictional company "Acme", fictional people, RFC 5737 documentation IPs. Changes reset on reload.
(function () {
  'use strict';
  var NOW = Date.now(), MIN = 60e3, HOUR = 3600e3, DAY = 864e5;
  var seed = 7;
  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function int(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  var DOMAIN = 'tunnel.acme.example';

  // ---- clients (computers running frpc) ------------------------------------
  var clients = [
    { clientID: 'c-alisher', hostname: 'alisher-macbook', version: '0.71.1', online: true, firstConnectedAt: NOW / 1e3 - 6 * 3600, lastConnectedAt: NOW / 1e3 - 6 * 3600 },
    { clientID: 'c-dilnoza', hostname: 'dilnoza-pc', version: '0.71.1', online: true, firstConnectedAt: NOW / 1e3 - 2.4 * 3600, lastConnectedAt: NOW / 1e3 - 2.4 * 3600 },
    { clientID: 'c-ci', hostname: 'ci-runner-02', version: '0.71.1', online: true, firstConnectedAt: NOW / 1e3 - 12 * 86400, lastConnectedAt: NOW / 1e3 - 3 * 86400 },
    { clientID: 'c-qa', hostname: 'qa-desktop', version: '0.71.0', online: true, firstConnectedAt: NOW / 1e3 - 5 * 3600, lastConnectedAt: NOW / 1e3 - 40 * 60 },
    { clientID: 'c-1c', hostname: 'buxgalteriya-1c', version: '0.70.0', online: true, firstConnectedAt: NOW / 1e3 - 30 * 86400, lastConnectedAt: NOW / 1e3 - 9 * 86400 },
    { clientID: 'c-gulnora', hostname: 'gulnora-mbp', version: '0.71.1', online: true, firstConnectedAt: NOW / 1e3 - 50 * 60, lastConnectedAt: NOW / 1e3 - 50 * 60 },
    { clientID: 'c-bekzod', hostname: 'bekzod-nuc', version: '0.71.1', online: true, firstConnectedAt: NOW / 1e3 - 20 * 86400, lastConnectedAt: NOW / 1e3 - 26 * 3600 },
    { clientID: 'c-nodira', hostname: 'nodira-laptop', version: '0.69.1', online: false, firstConnectedAt: NOW / 1e3 - 4 * 86400, lastConnectedAt: NOW / 1e3 - 19 * 3600 }
  ];

  // ---- tunnels: [name, client, online, owner, weight, paths, kind] ---------
  var NEXT = ['/', '/dashboard', '/deals', '/deals/1842', '/_next/static/chunks/app-layout-8f2c.js', '/_next/static/css/5b1e.css', '/api/auth/session', '/api/deals?stage=won', '/favicon.ico', '/_next/image?url=%2Flogo.png&w=96'];
  var T = [
    ['alisher-crm', 'c-alisher', 1, 'alisher', 9, NEXT, 'web'],
    ['alisher-api', 'c-alisher', 1, 'alisher', 7, ['/v1/invoices?page=1', '/v1/invoices/88412', '/v1/contractors?q=savdo', '/v1/health', '/swagger/index.html', '/v1/auth/token', '/v1/reports/vat?month=2026-10'], 'api'],
    ['dilnoza-shop', 'c-dilnoza', 1, 'dilnoza', 6, ['/', '/catalog/ayollar', '/product/atlas-ko-ylak-417', '/cart', '/api/cart', '/checkout', '/assets/index-3f9a.js', '/assets/hero.webp'], 'web'],
    ['dilnoza-storybook', 'c-dilnoza', 0, 'dilnoza', 1, ['/', '/iframe.html?id=button--primary'], 'web'],
    ['payme-webhook', 'c-ci', 1, 'sardor', 3, ['/payme'], 'hook'],
    ['tg-bot', 'c-ci', 1, 'sardor', 5, ['/telegram/webhook'], 'tg'],
    ['gh-ci', 'c-ci', 1, 'bekzod', 2, ['/github'], 'gh'],
    ['qa-stand', 'c-qa', 1, 'madina', 5, ['/', '/login', '/api/me', '/api/orders?status=new', '/static/js/main.4b2c.js', '/api/orders/7731'], 'web'],
    ['madina-allure', 'c-qa', 1, 'madina', 2, ['/', '/data/suites.json', '/widgets/summary.json', '/data/test-cases/9f1e.json'], 'web'],
    ['javohir-1c', 'c-1c', 1, 'javohir', 3, ['/hs/exchange/orders', '/hs/exchange/stock', '/hs/exchange/ping'], 'api'],
    ['grafana', 'c-bekzod', 1, 'bekzod', 4, ['/d/acme-overview/acme', '/api/ds/query', '/api/live/ws', '/public/build/app.js', '/api/search?query='], 'web'],
    ['gulnora-expo', 'c-gulnora', 1, 'gulnora', 4, ['/index.bundle?platform=ios&dev=true', '/status', '/message', '/assets/logo.png'], 'expo'],
    ['nodira-docs', 'c-nodira', 0, 'nodira', 1, ['/', '/guide/install.html'], 'web'],
    ['demo-pitch', 'c-alisher', 1, 'alisher', 1, ['/', '/slides/3'], 'web'],
    ['temur-jupyter', 'c-bekzod', 1, 'temur', 2, ['/lab', '/api/kernels', '/api/contents/hisobot.ipynb'], 'web'],
    ['old-test', 'c-nodira', 0, 'nodira', 0, ['/'], 'web']
  ];
  var users = [
    ['alisher', ['alisher-*', 'alisher', 'demo-pitch'], 41, 2 * MIN, 'alisher-macbook'],
    ['dilnoza', ['dilnoza-*', 'dilnoza'], 33, 5 * MIN, 'dilnoza-pc'],
    ['sardor', ['sardor-*', 'payme-webhook', 'tg-bot'], 27, 1 * MIN, 'ci-runner-02'],
    ['madina', ['madina-*', 'qa-stand'], 19, 40 * MIN, 'qa-desktop'],
    ['javohir', ['javohir-*'], 60, 9 * DAY, 'buxgalteriya-1c'],
    ['bekzod', ['bekzod-*', 'grafana', 'gh-ci'], 52, 26 * HOUR, 'bekzod-nuc'],
    ['gulnora', ['gulnora-*'], 5, 50 * MIN, 'gulnora-mbp'],
    ['nodira', ['nodira-*', 'old-test'], 14, 19 * HOUR, 'nodira-laptop'],
    ['temur', ['temur-*'], 8, 26 * HOUR, 'bekzod-nuc'],
    ['kamola', ['kamola-*'], 3, 0, ''],
    ['ci-bot', ['ci-*', 'gh-ci'], 70, 3 * DAY, 'ci-runner-02'],
    ['old-intern', ['old-intern-*'], 120, 40 * DAY, 'old-laptop']
  ].map(function (u) { return { name: u[0], subs: u[1], created: NOW - u[2] * DAY, lastSeen: u[3] ? NOW - u[3] : 0, host: u[4], tunnels: T.filter(function (t) { return t[3] === u[0]; }).map(function (t) { return t[0]; }), disabled: u[0] === 'old-intern' }; });

  var gw = {
    paused: { 'demo-pitch': { at: NOW - 35 * MIN, reason: "Taqdimot tugadi, keyingi hafta qayta ochiladi" } },
    locks: { 'dilnoza-shop': { by: 'dilnoza', at: NOW - 2 * HOUR }, 'temur-jupyter': { by: 'admin', at: NOW - 3 * DAY } },
    allow: { 'madina-allure': { cidrs: ['203.0.113.0/24', '198.51.100.12'], by: 'madina', at: NOW - 6 * HOUR }, 'javohir-1c': { cidrs: ['192.0.2.40'], by: 'admin', at: NOW - 9 * DAY } },
    rules: {
      'payme-webhook': { webhook: { kind: 'hmac', secret: '***', header: 'X-Signature', path: '/payme' }, by: 'sardor', at: NOW - 4 * DAY },
      'tg-bot': { webhook: { kind: 'telegram', secret: '***', path: '/telegram/webhook' }, limit: 120, by: 'sardor', at: NOW - 6 * DAY },
      'gh-ci': { webhook: { kind: 'github', secret: '***', path: '/github' }, by: 'bekzod', at: NOW - 10 * DAY },
      'qa-stand': { google: ['@acme.example'], by: 'madina', at: NOW - 2 * DAY },
      'grafana': { reqSet: { 'X-WEBAUTH-USER': 'viewer' }, resSet: { 'X-Frame-Options': 'DENY' }, google: ['bekzod@acme.example', 'ops@acme.example'], by: 'bekzod', at: NOW - 12 * DAY },
      'alisher-api': { limit: 300, by: 'alisher', at: NOW - 1 * DAY }
    },
    owners: {}
  };
  T.forEach(function (t) { gw.owners[t[0]] = t[3]; });

  // ---- request log -----------------------------------------------------------
  var UA = {
    web: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Version/18.1 Mobile Safari/604.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', 'Mozilla/5.0 (Linux; Android 14; SM-A546E) Chrome/131.0 Mobile Safari/537.36', 'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0'],
    api: ['curl/8.9.1', 'okhttp/4.12.0', 'PostmanRuntime/7.42.0', 'axios/1.7.7', 'python-requests/2.32.3', '1C:Enterprise/8.3'],
    hook: ['Payme-Webhook/2.0'], tg: ['TelegramBot (like TwitterBot)'], gh: ['GitHub-Hookshot/7b1d9e4'], expo: ['Expo/52.0.11 CFNetwork/1568 Darwin/24.1.0', 'okhttp/4.9.2']
  };
  var IPS = ['203.0.113.14', '203.0.113.27', '203.0.113.41', '203.0.113.52', '203.0.113.88', '198.51.100.12', '198.51.100.33', '198.51.100.71', '192.0.2.40', '192.0.2.118', '198.51.100.140', '203.0.113.201'];
  var list = [], id = 90000;
  var weights = T.map(function (t) { return t[2] ? t[4] : 0; }), wsum = weights.reduce(function (a, b) { return a + b; }, 0);
  function pickTunnel() { var x = rnd() * wsum; for (var i = 0; i < T.length; i++) { x -= weights[i]; if (x <= 0) return T[i]; } return T[0]; }
  function mk(ts, t) {
    t = t || pickTunnel();
    var kind = t[6], p = pick(t[5]), m = 'GET', ct = 'text/html; charset=utf-8';
    if (kind === 'hook' || kind === 'tg' || kind === 'gh') { m = 'POST'; ct = 'application/json'; }
    else if (/\/api\/|\/v1\/|\/hs\//.test(p)) { m = p.indexOf('?') > 0 || /health|ping|me$|session/.test(p) ? 'GET' : pick(['GET', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']); ct = 'application/json'; }
    if (/live\/ws|\/message$/.test(p)) m = 'WS';
    if (/\.js|\.css/.test(p)) ct = /\.css/.test(p) ? 'text/css' : 'application/javascript';
    if (/\.(png|webp)|image/.test(p)) ct = 'image/webp';
    var r = rnd(), st = m === 'WS' ? 101 : r < .8 ? (m === 'POST' ? pick([200, 201]) : 200) : r < .88 ? 304 : r < .93 ? 404 : r < .955 ? 401 : r < .97 ? 403 : r < .985 ? 429 : pick([500, 502, 504]);
    if (kind === 'gh' && st >= 400 && st < 500) st = 401; // a bad webhook signature
    if (t[0] === 'dilnoza-shop' && rnd() < .08) st = 401; // password-protected
    var ms = Math.round(rnd() * rnd() * (kind === 'api' ? 1400 : 700)) + (st === 504 ? 30000 : 2);
    var out = st === 304 || st === 101 ? 0 : /\.js/.test(p) ? int(80, 900) * 1024 : /image|\.webp|\.png/.test(p) ? int(20, 400) * 1024 : int(300, 60000);
    return { id: ++id, ts: ts, tunnel: t[0], method: m, path: p, status: st, ms: ms, in: m === 'POST' || m === 'PUT' || m === 'PATCH' ? int(200, 8000) : 0, out: out, ip: kind === 'gh' ? '192.0.2.118' : kind === 'tg' ? '198.51.100.140' : pick(IPS), ua: pick(UA[kind] || UA.web), ref: kind === 'web' && rnd() < .5 ? 'https://' + t[0] + '.' + DOMAIN + '/' : '', ct: ct };
  }
  // 7 days, busier in working hours; the last hour is dense so the stats strip is full
  (function () {
    var ts = NOW - 7 * DAY;
    while (ts < NOW - HOUR) {
      var h = new Date(ts).getHours(), busy = h >= 9 && h <= 19 ? 1 : h >= 7 && h <= 23 ? .45 : .15;
      ts += (40e3 + rnd() * 160e3) / busy;
      list.push(mk(ts));
    }
    for (ts = NOW - HOUR; ts < NOW - 2e3; ts += 1500 + rnd() * 6000) list.push(mk(ts));
  })();

  // ---- frps numbers ------------------------------------------------------------
  var tin = 18.4e9, tout = 96.2e9;
  var today = {};
  T.forEach(function (t, i) { today[t[0]] = { i: t[2] ? t[4] * (2e6 + rnd() * 9e6) : rnd() * 3e5, o: t[2] ? t[4] * (1.2e7 + rnd() * 6e7) : rnd() * 2e6, c: t[2] ? int(0, 4) : 0, start: NOW / 1e3 - (t[2] ? int(10, 600) * 60 : 0), close: t[2] ? 0 : NOW / 1e3 - int(2, 40) * 3600 }; });
  var hist = {};
  T.forEach(function (t) {
    var h = [];
    for (var i = 6; i >= 0; i--) { var d = new Date(NOW - i * DAY), wk = d.getDay() === 0 || d.getDay() === 6 ? .3 : 1; h.push({ date: d.toISOString().slice(0, 10), trafficIn: (t[4] + .5) * wk * (1e6 + rnd() * 3e7), trafficOut: (t[4] + .5) * wk * (6e6 + rnd() * 2e8) }); }
    hist[t[0]] = h;
  });
  function frp(path) {
    var dIn = 2e5 + Math.random() * 1.6e6, dOut = 1e6 + Math.random() * 9e6;
    if (Math.random() < .15) { dIn *= 1.8; dOut *= 2.4; }
    if (path.indexOf('system/info') === 0) {
      tin += dIn; tout += dOut;
      var on = T.filter(function (t) { return t[2]; });
      on.forEach(function (t) { var x = today[t[0]]; x.i += dIn * t[4] / wsum; x.o += dOut * t[4] / wsum; x.c = Math.max(0, Math.min(9, x.c + (Math.random() < .5 ? -1 : 1) * (Math.random() < .4 ? 1 : 0))); });
      return { version: '0.71.1', config: { bindPort: 443, vhostHTTPPort: 8080, subdomainHost: DOMAIN, maxPoolCount: 20, heartbeatTimeout: -1 }, status: { totalTrafficIn: tin, totalTrafficOut: tout, curConns: on.reduce(function (s, t) { return s + today[t[0]].c; }, 0) + 6, clientCounts: clients.filter(function (c) { return c.online; }).length, proxyTypeCount: { http: T.length } } };
    }
    if (path.indexOf('proxies?') === 0) return { total: T.length, items: T.map(function (t) { var x = today[t[0]]; return { name: t[0], clientID: t[1], spec: { type: 'http', http: { subdomain: t[0] } }, status: { phase: t[2] ? 'online' : 'offline', todayTrafficIn: x.i, todayTrafficOut: x.o, curConns: t[2] ? x.c : 0, lastStartAt: x.start, lastCloseAt: x.close } }; }) };
    if (path.indexOf('clients') === 0) return { items: clients };
    var m = path.match(/^proxies\/([^/]+)\/traffic/); if (m) return { history: hist[decodeURIComponent(m[1])] || [] };
    return {};
  }

  // ---- gateway API -------------------------------------------------------------
  function match(e, q) {
    if (q.tunnel && e.tunnel !== q.tunnel) return false;
    if (q.status) { if (q.status === 'err' ? e.status < 400 : String(e.status)[0] !== q.status) return false; }
    if (q.method && e.method !== q.method) return false;
    if (q.q) { var s = q.q.toLowerCase(); if (!(e.path.toLowerCase().indexOf(s) >= 0 || e.ip.indexOf(s) >= 0 || (e.ua || '').toLowerCase().indexOf(s) >= 0)) return false; }
    return true;
  }
  function stats() {
    var per = {}, from = Date.now() - HOUR;
    for (var j = list.length - 1; j >= 0 && list[j].ts >= from; j--) {
      var e = list[j];
      [e.tunnel, '*'].forEach(function (k) {
        var s = per[k] || (per[k] = { tunnel: k, count: 0, err4: 0, err5: 0, in: 0, out: 0, ms: [], series: new Array(60).fill(0), uniq: {} });
        s.count++; s.in += e.in; s.out += e.out; s.ms.push(e.ms); s.uniq[e.ip] = 1; if (e.status >= 500) s.err5++; else if (e.status >= 400) s.err4++;
        s.series[Math.min(59, Math.floor((e.ts - from) / MIN))]++;
      });
    }
    return { items: Object.keys(per).map(function (k) { var s = per[k]; s.ms.sort(function (a, b) { return a - b; }); s.p95 = s.ms[Math.floor(s.ms.length * .95)] || 0; s.p50 = s.ms[Math.floor(s.ms.length / 2)] || 0; s.uniqueIps = Object.keys(s.uniq).length; delete s.ms; delete s.uniq; return s; }) };
  }
  function tok(name) { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789', s = ''; for (var i = 0; i < 28; i++) s += a[Math.floor(Math.random() * a.length)]; return 'tn_' + name + '_demo' + s; }
  function okj(b, st) { return new Response(JSON.stringify(b), { status: st || 200, headers: { 'content-type': 'application/json' } }); }
  function gwRoute(method, path, q, body) {
    var m;
    if (path === 'requests') {
      var before = +q.before || Infinity, out = [], lim = +q.limit || 100, more = false;
      for (var i = list.length - 1; i >= 0; i--) { var e = list[i]; if (e.id < before && match(e, q)) { if (out.length >= lim) { more = true; break; } out.push(e); } }
      return okj({ items: out, more: more });
    }
    if (path === 'stats') return okj(stats());
    if (path === 'state') return okj(gw);
    if ((m = path.match(/^tunnels\/([^/]+)\/(pause|resume|lock|unlock|allow)$/))) {
      var s = decodeURIComponent(m[1]);
      if (m[2] === 'pause') gw.paused[s] = { at: Date.now(), reason: body.reason || '' };
      else if (m[2] === 'resume') delete gw.paused[s];
      else if (m[2] === 'lock') { if (!body.password || body.password.length < 6) return okj({ error: 'parol kamida 6 belgi' }, 400); gw.locks[s] = { by: 'admin', at: Date.now() }; }
      else if (m[2] === 'unlock') delete gw.locks[s];
      else {
        var cs = body.cidrs || [];
        var bad = cs.filter(function (c) { return !/^(\d{1,3}\.){3}\d{1,3}(\/(8|9|[12]\d|3[0-2]))?$|^[0-9a-f:]+(\/\d{2,3})?$|^me$/i.test(c); });
        if (bad.length) return okj({ error: "noto'g'ri manzil: " + bad.join(', ') }, 400);
        if (!cs.length) delete gw.allow[s]; else gw.allow[s] = { cidrs: cs.map(function (c) { return c === 'me' ? '203.0.113.5' : c; }), by: 'admin', at: Date.now() };
      }
      return okj({ ok: true });
    }
    if (path === 'users' && method === 'GET') return okj({ items: users });
    if (path === 'users' && method === 'POST') {
      if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(body.name || '')) return okj({ error: "nom: a-z, 0-9 va '-'" }, 400);
      if (users.some(function (u) { return u.name === body.name; })) return okj({ error: 'bunday foydalanuvchi bor' }, 400);
      var nu = { name: body.name, subs: body.subs ? body.subs.split(/[\s,]+/).filter(Boolean) : [body.name + '-*', body.name], created: Date.now(), lastSeen: 0, host: '', tunnels: [], disabled: false };
      users.unshift(nu);
      return okj({ ok: true, token: tok(body.name), user: nu });
    }
    if ((m = path.match(/^users\/([^/]+)(?:\/(\w+))?$/))) {
      var n = decodeURIComponent(m[1]), x = users.filter(function (u) { return u.name === n; })[0];
      if (!x) return okj({ error: 'topilmadi' }, 404);
      if (m[2] === 'rotate') return okj({ ok: true, token: tok(n) });
      if (m[2] === 'disable' || m[2] === 'enable') x.disabled = m[2] === 'disable';
      if (!m[2] && method === 'DELETE') users.splice(users.indexOf(x), 1);
      return okj({ ok: true });
    }
    return okj({ error: 'demo: ' + path }, 404);
  }

  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    init = init || {};
    var u = new URL(typeof input === 'string' ? input : input.url, location.href);
    var p = u.pathname, i;
    var method = (init.method || 'GET').toUpperCase(), body = {};
    try { body = init.body ? JSON.parse(init.body) : {}; } catch (e) { body = {}; }
    var q = {}; u.searchParams.forEach(function (v, k) { q[k] = v; });
    var wait = function (r) { return new Promise(function (res) { setTimeout(function () { res(r); }, 40 + Math.random() * 120); }); };
    if ((i = p.indexOf('/api/v2/')) >= 0) return wait(okj(frp(p.slice(i + 8) + u.search)));
    if ((i = p.indexOf('/gw/')) >= 0) return wait(gwRoute(method, p.slice(i + 4), q, body));
    return realFetch(input, init);
  };

  // live request stream (gw/live)
  var streams = [];
  function DemoES(url) { var me = this; this.url = url; this.readyState = 1; this.onmessage = null; var m = /tunnel=([^&]+)/.exec(url); this.tunnel = m ? decodeURIComponent(m[1]) : ''; streams.push(this); }
  DemoES.prototype.close = function () { this.readyState = 2; streams = streams.filter(function (s) { return s !== this; }, this); };
  DemoES.prototype.addEventListener = function () {};
  var RealES = window.EventSource;
  window.EventSource = function (url, opt) { return /gw\/live/.test(url) ? new DemoES(url) : new RealES(url, opt); };
  (function loop() {
    var e = mk(Date.now());
    list.push(e);
    streams.forEach(function (s) { if (s.onmessage && (!s.tunnel || s.tunnel === e.tunnel)) s.onmessage({ data: JSON.stringify(e) }); });
    var burst = Math.random() < .15;
    setTimeout(loop, burst ? 120 + Math.random() * 200 : 500 + Math.random() * 1600);
  })();

  // demo pill
  function pill() { var d = document.createElement('div'); d.className = 'demo-pill'; d.innerHTML = "<b>Demo</b> · namuna ma'lumotlar, qayta yuklanganda tiklanadi"; document.body.appendChild(d); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pill); else pill();
})();
