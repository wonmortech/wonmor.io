// Runs in <head> before paint: resolve theme (saved > system) so there is no flash.
(function () {
  var saved = null;
  try { saved = localStorage.getItem('gw-theme'); } catch (e) { /* storage blocked */ }
  var sys = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  var t = saved === 'light' || saved === 'dark' ? saved : sys;
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.setAttribute('data-theme-resolved', t);
})();
