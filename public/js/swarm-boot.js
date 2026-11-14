/* /swarm, before first paint: hide the blocks the swarm will build, unless the visitor asked for a still page.
   If the swarm script has not started within 4 s, give the content back. */
(function () {
  var d = document.documentElement;
  try {
    if (/[?&]static\b/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches) { d.classList.add('sw-static'); return; }
    d.classList.add('sw-on');
    setTimeout(function () { if (!window.__swReady) { d.classList.remove('sw-on'); d.classList.add('sw-static'); } }, 4000);
  } catch (e) { d.classList.remove('sw-on'); }
})();
