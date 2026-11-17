(function () {
  'use strict';
  var F = window.__adFormat, esc = F.esc;
  var call = function (p, o) { return window.__gwCall(p, o); };
  var $ = function (s) { return document.querySelector(s); };
  var tb = $('#uTable tbody');

  function ago(t) {
    if (!t) return '—';
    var s = Math.max(0, (Date.now() - t) / 1000);
    return s < 90 ? 'hozirgina' : s < 5400 ? Math.round(s / 60) + ' daq oldin' : s < 129600 ? Math.round(s / 3600) + ' soat oldin' : Math.round(s / 86400) + ' kun oldin';
  }
  function load() {
    call('users').then(function (d) {
      var items = d.items || [];
      tb.innerHTML = items.length ? items.map(function (u) {
        return '<tr class="' + (u.disabled ? 'ad-off' : '') + '"><td><b>👤 ' + esc(u.name) + '</b>' + (u.disabled ? ' <span class="ad-st off">o\'chirilgan</span>' : '') + '<br><small class="tn-mono">' + esc(u.host || '') + '</small></td>' +
          '<td class="tn-mono">' + u.subs.map(esc).join(', ') + '</td>' +
          '<td>' + (u.tunnels.length ? u.tunnels.map(function (t) { return '<code>' + esc(t) + '</code>'; }).join(' ') : '—') + '</td>' +
          '<td>' + ago(u.lastSeen) + '</td>' +
          '<td class="ad-uacts"><button data-u="' + esc(u.name) + '" data-a="rotate" title="Yangi token (eskisi ishlamay qoladi)">🔄 Token</button>' +
          '<button data-u="' + esc(u.name) + '" data-a="' + (u.disabled ? 'enable' : 'disable') + '">' + (u.disabled ? '✅ Yoqish' : '⛔ O\'chirish') + '</button>' +
          '<button data-u="' + esc(u.name) + '" data-a="delete" title="Butunlay o\'chirish">🗑</button></td></tr>';
      }).join('') : '<tr><td colspan="5" class="ad-emptyrow">Hali foydalanuvchi yo\'q: birinchi tokenni yarating</td></tr>';
    }).catch(function (e) { tb.innerHTML = '<tr><td colspan="5" class="ad-emptyrow">Yuklanmadi: ' + esc(e.message) + '</td></tr>'; });
  }
  function showToken(name, token) {
    var box = $('#uToken');
    var win = 'irm https://tunnel.acme.example/install.ps1 | iex; tunnel login ' + token;
    var nix = 'curl -fsSL https://tunnel.acme.example/install.sh | TUNNEL_TOKEN=' + token + ' bash';
    box.innerHTML = '<b>🔑 ' + esc(name) + ' uchun token: hozir nusxa oling, qayta ko\'rsatilmaydi</b>' +
      '<div class="ad-tokline"><code>' + esc(token) + '</code><button data-c="' + esc(token) + '">📋</button></div>' +
      '<small>Windows:</small><div class="ad-tokline"><code>' + esc(win) + '</code><button data-c="' + esc(win) + '">📋</button></div>' +
      '<small>Linux / macOS:</small><div class="ad-tokline"><code>' + esc(nix) + '</code><button data-c="' + esc(nix) + '">📋</button></div>';
    box.hidden = false;
  }
  $('#uToken').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-c]'); if (!b) return;
    if (navigator.clipboard) navigator.clipboard.writeText(b.getAttribute('data-c'));
    b.textContent = '✓'; setTimeout(function () { b.textContent = '📋'; }, 1200);
  });
  $('#uForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = $('#uName').value.trim().toLowerCase();
    call('users', { method: 'POST', body: JSON.stringify({ name: name, subs: $('#uSubs').value.trim() }) })
      .then(function (d) { showToken(name, d.token); $('#uName').value = ''; $('#uSubs').value = ''; load(); })
      .catch(function (e) { alertBox('Yaratilmadi: ' + e.message); });
  });
  function alertBox(t) { var b = $('#uToken'); b.innerHTML = '<b>⚠️ ' + esc(t) + '</b>'; b.hidden = false; }
  tb.addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-a]'); if (!b) return;
    var n = b.getAttribute('data-u'), a = b.getAttribute('data-a');
    if (a === 'delete') {
      if (b.getAttribute('data-sure') !== '1') { b.setAttribute('data-sure', '1'); b.textContent = 'Aniqmi?'; setTimeout(function () { b.removeAttribute('data-sure'); b.textContent = '🗑'; }, 3000); return; }
      call('users/' + encodeURIComponent(n), { method: 'DELETE' }).then(load);
    } else if (a === 'rotate') {
      call('users/' + encodeURIComponent(n) + '/rotate', { method: 'POST', body: '{}' }).then(function (d) { showToken(n, d.token); load(); });
    } else {
      call('users/' + encodeURIComponent(n) + '/' + a, { method: 'POST', body: '{}' }).then(load);
    }
  });
  load();
  setInterval(load, 30000);
})();
