// Runs in <head> before first paint.
// 1. Marks the document as scripted, so motion-only styles never hide content without JS.
// 2. Applies the visitor's saved theme (light, dark, ink, blueprint, cobalt, contrast, paper, dots or glass); without one the CSS follows the system.
(function (d) {
  d.classList.add('js');
  try {
    var t = localStorage.getItem('wm-theme');
    if (/^(light|dark|ink|blueprint|cobalt|contrast|paper|dots|glass)$/.test(t || '')) d.setAttribute('data-theme', t);
  } catch (e) { /* storage blocked: follow the system */ }
})(document.documentElement);
