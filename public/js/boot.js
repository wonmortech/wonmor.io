// Runs in <head> before first paint. Loaded as /js/boot.js?v=<content hash> (Base.astro), so a deploy never leaves
// an old copy in the browser cache.
// 1. Marks the document as scripted, so motion-only styles never hide content without JS.
// 2. Applies the visitor's saved theme; without one the CSS follows the system.
// 3. Language: on entry from outside the site to an English page, the visitor's saved language (or on a first visit
//    their browser's, uz or ru) is used: the bare home page opens in it, deeper pages offer it in a banner.
//    /uz/ and /ru/ URLs are an explicit choice and never change, nothing happens while browsing inside the site
//    (sessionStorage marks the visit), the switcher and the banner save the pick (src/scripts/header.ts), and every
//    other page load remembers its own language.
(function (d, w) {
  d.classList.add('js');
  var ls; try { ls = w.localStorage; } catch (e) { ls = null; }
  try {
    var t = ls && ls.getItem('wm-theme');
    if (/^(light|dark|ink|blueprint|cobalt|contrast|paper|dots|glass)$/.test(t || '')) d.setAttribute('data-theme', t);
  } catch (e) { /* storage blocked: follow the system */ }

  try {
    var page = (d.lang || 'en').slice(0, 2);
    var ss; try { ss = w.sessionStorage; } catch (e) { ss = null; }
    var inside = !!(ss && ss.getItem('wm-in'));
    if (!inside) { try { inside = !!d.referrer && new URL(d.referrer).origin === w.location.origin; } catch (e) { /* no referrer */ } }
    if (ss) ss.setItem('wm-in', '1');
    var want = ls && ls.getItem('wm-lang');
    if (!want) {
      var langs = w.navigator.languages || [w.navigator.language || ''];
      for (var i = 0; i < langs.length && !want; i++) {
        var l = String(langs[i]).toLowerCase().slice(0, 2);
        if (l === 'uz' || l === 'ru' || l === 'en') want = l;
      }
    }
    var path = w.location.pathname;
    if (!inside && page === 'en' && (want === 'uz' || want === 'ru') && !/^\/(404|search)(\/|\.html|$)/.test(path)) {
      // Only the bare home page switches by itself; deeper English pages keep their URL (Google's guidance) and get a
      // dismissible suggestion instead (rendered by src/scripts/header.ts from this attribute).
      if (path === '/') { w.location.replace('/' + want + '/' + w.location.search + w.location.hash); return; }
      d.setAttribute('data-lang-suggest', want);
      return;
    }
    if (ls) ls.setItem('wm-lang', page);
  } catch (e) { /* storage blocked: no language memory */ }
})(document.documentElement, window);
