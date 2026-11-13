// Runs in <head> before first paint.
// 1. Marks the document as scripted, so motion-only styles never hide content without JS.
// 2. Applies the visitor's saved theme ("light" | "dark"); without one the CSS follows the system setting.
(function (d) {
  d.classList.add('js');
  try {
    var t = localStorage.getItem('wm-theme');
    if (t === 'light' || t === 'dark') d.setAttribute('data-theme', t);
  } catch (e) { /* storage blocked: follow the system */ }
})(document.documentElement);
