// Runs in <head> before first paint. Loaded as /js/boot.js?v=<content hash> (Base.astro), so a deploy never leaves
// an old copy in the browser cache.
// 1. Marks the document as scripted, so motion-only styles never hide content without JS.
// 2. Applies the visitor's saved theme; without one the CSS follows the system.
// 3. Language: the unprefixed (English) URLs follow the visitor: on entry from outside the site they open in the saved
//    language, or on a first visit in the browser's language (uz or ru). /uz/ and /ru/ URLs are an explicit choice and
//    are never redirected, and nothing is redirected while browsing inside the site (sessionStorage marks the visit).
//    The language switcher saves the pick (src/scripts/header.ts), and every page load remembers its own language.
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
      w.location.replace('/' + want + path + w.location.search + w.location.hash);
      return;
    }
    if (ls) ls.setItem('wm-lang', page);
  } catch (e) { /* storage blocked: no language memory */ }
})(document.documentElement, window);
