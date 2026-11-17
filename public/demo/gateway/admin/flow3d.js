// Admin live 3D flow. Driven only by real events from admin.js:
//   gwa:state {agents, connectors, killed, ...}  gwa:start {key, agent, connector, tool}
//   gwa:end key  gwa:call {agent, tool, connector, status, ok, masked, ms}
// Agents sit on the left arc, connectors on the right with their tools as satellites,
// the gateway core in the middle. Drag to orbit; it drifts slowly on its own.
import * as THREE from '/demo/gateway/vendor/three.module.min.js';

const canvas = document.getElementById('flow3d');
const hud = document.getElementById('flowHud');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { canvas.closest('.stage')?.classList.add('no-webgl'); }

const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#888';
function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function textSprite(text, color, size = 0.3, weight = 600) {
  const c = document.createElement('canvas'); const g = c.getContext('2d');
  const font = `${weight} 44px Inter, system-ui, sans-serif`;
  g.font = font; const w = Math.ceil(g.measureText(text).width) + 40;
  c.width = w; c.height = 64; g.font = font; g.fillStyle = color; g.textBaseline = 'middle'; g.fillText(text, 20, 34);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set(size * w / 64, size, 1);
  return s;
}

if (renderer) start();

function start() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 2, 0.1, 200);
  const world = new THREE.Group(); scene.add(world);
  const glow = glowTex();
  const col = (v) => new THREE.Color(css(v));

  // core
  const core = new THREE.Group(); world.add(core);
  const ico = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.1, 1)), new THREE.LineBasicMaterial({ transparent: true }));
  const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 2), new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.25 }));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }));
  halo.scale.setScalar(4.6);
  const rings = [0, 1].map((i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(1.7 + i * 0.35, 0.012, 8, 140), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5 })); m.rotation.set(Math.PI / 2 + i * 0.6, i * 0.8, 0); return m; });
  core.add(ico, inner, halo, ...rings);
  const coreLabel = textSprite('gateway', css('--text'), 0.42, 700); coreLabel.position.set(0, -2.15, 0); world.add(coreLabel);

  // ambient: slow orbiting dust around the core (decoration, not traffic)
  const DN = 260, dPos = new Float32Array(DN * 3), dSeed = [];
  for (let i = 0; i < DN; i++) dSeed.push([1.6 + Math.random() * 1.8, Math.random() * 6.28, (Math.random() - 0.5) * 1.6, 0.1 + Math.random() * 0.3]);
  const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ size: 0.06, map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 }));
  world.add(dust);

  const lines = new THREE.Group(); world.add(lines);
  const nodeGroup = new THREE.Group(); world.add(nodeGroup);
  let agents = new Map(), conns = new Map(), state = null;
  const ORIGIN = new THREE.Vector3();

  function curve(a, b) { const m = a.clone().add(b).multiplyScalar(0.5); m.z += 1.2; return new THREE.QuadraticBezierCurve3(a, m, b); }
  function disposeGroup(g) { g.traverse((o) => { o.geometry?.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } }); g.clear(); }

  function build(S) {
    state = S;
    disposeGroup(lines); disposeGroup(nodeGroup);
    agents = new Map(); conns = new Map();
    const R = 6;
    const A = S.agents.slice(0, 10), C = S.connectors;
    const arcPos = (n, i, side, spread) => { const a = n === 1 ? 0 : (i / (n - 1) - 0.5) * spread; return new THREE.Vector3(side * R * Math.cos(a), R * 0.6 * Math.sin(a), Math.sin(a * 2 + side) * 1.1); };
    const lineMat = new THREE.LineDashedMaterial({ color: col('--muted'), dashSize: 0.12, gapSize: 0.16, transparent: true, opacity: 0.4 });
    A.forEach((a, i) => {
      const pos = arcPos(A.length, i, -1, Math.min(2.2, 0.5 * A.length));
      const g = new THREE.Group(); g.position.copy(pos);
      const geo = new THREE.OctahedronGeometry(0.34);
      const c = a.paused ? col('--warn') : col('--a2');
      const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: c }));
      const solid = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.18 }));
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: Date.now() - a.lastSeen < 300e3 ? 0.7 : 0.25 }));
      sp.scale.setScalar(1.7);
      const lab = textSprite(a.name, css('--text'), 0.34); lab.position.y = -0.7;
      const sub = textSprite(a.paused ? 'pauza' : `${a.calls} chaqiruv`, css('--muted'), 0.24, 500); sub.position.y = -1.04;
      g.add(solid, wire, sp, lab, sub);
      nodeGroup.add(g);
      const cv = curve(pos, ORIGIN);
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(cv.getPoints(40)), lineMat); l.computeLineDistances(); lines.add(l);
      agents.set(a.name, { g, wire, solid, sp, curve: cv, flash: 0, spin: Math.random() * 6 });
    });
    C.forEach((c, i) => {
      const pos = arcPos(C.length, i, 1, Math.min(1.8, 0.6 * C.length));
      const g = new THREE.Group(); g.position.copy(pos);
      const geo = new THREE.BoxGeometry(0.62, 0.62, 0.62);
      const k = !c.enabled ? col('--warn') : c.online ? col('--ok') : col('--bad');
      const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: k }));
      const solid = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: k, transparent: true, opacity: 0.16 }));
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: k, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 }));
      sp.scale.setScalar(2.1);
      const lab = textSprite(c.name, css('--text'), 0.4, 700); lab.position.y = -0.95;
      const sub = textSprite(c.online ? `${c.tools.length} tool · online` : 'offline', css('--muted'), 0.26, 500); sub.position.y = -1.32;
      g.add(solid, wire, sp, lab, sub);
      // tools as satellites
      const sats = new Map();
      c.tools.forEach((t, j) => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), new THREE.MeshBasicMaterial({ color: col('--a2') }));
        const ang = (j / c.tools.length) * Math.PI * 2;
        s.userData = { ang, r: 0.85 + (j % 2) * 0.18, tilt: 0.5 };
        const tl = textSprite(t.name, css('--text'), 0.24, 600); tl.material.opacity = 0;
        s.add(tl); tl.position.y = 0.2;
        g.add(s);
        sats.set(t.full, { s, tl, flash: 0 });
      });
      nodeGroup.add(g);
      const cv = curve(ORIGIN, pos);
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(cv.getPoints(40)), lineMat); l.computeLineDistances(); lines.add(l);
      conns.set(c.name, { g, wire, solid, sp, sats, curve: cv, flash: 0, spin: Math.random() * 6, busy: 0 });
    });
    paintCore();
    hud.innerHTML = !A.length && !C.length ? 'Agent va konnektor yo\'q' : `${A.length} agent · ${C.length} konnektor · ${S.tools} tool`;
  }

  function paintCore() {
    const killed = !!state?.killed;
    const a1 = killed ? col('--bad') : col('--a1'), a2 = killed ? col('--bad') : col('--a2');
    ico.material.color.copy(a1); inner.material.color.copy(a2); halo.material.color.copy(a1);
    rings.forEach((r, i) => r.material.color.copy(i ? a2 : a1));
    dust.material.color.copy(a2);
  }

  // packets
  const MAX = 120, pPos = new Float32Array(MAX * 3), pCol = new Float32Array(MAX * 3);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  world.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.34, map: glow, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  const packets = Array.from({ length: MAX }, () => ({ live: false }));
  const shocks = [], floats = [];
  const tmp = new THREE.Vector3();
  function packet(path, color, speed, done) {
    const p = packets.find((x) => !x.live); if (!p) return;
    Object.assign(p, { live: true, path, t: 0, speed, color: color.clone(), done });
  }
  function shock(color) {
    const m = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.26, 96), new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    core.add(m); shocks.push({ m, t: 0 });
  }
  function floatText(text, color, at) {
    const s = textSprite(text, color, 0.32, 800); s.position.copy(at); world.add(s); floats.push({ s, t: 0, y0: at.y });
  }
  // a path is an array of [curve, reverse]
  const along = (path, t, out) => { const n = path.length, k = Math.min(n - 1, Math.floor(t * n)), u = t * n - k; const [cv, rev] = path[k]; return cv.getPoint(rev ? 1 - Math.min(1, u) : Math.min(1, u), out); };

  addEventListener('gwa:state', (e) => build(e.detail));
  addEventListener('gwa:start', (e) => {
    const a = agents.get(e.detail.agent), c = conns.get(e.detail.connector);
    if (!a || !c) return;
    c.busy++;
    packet([[a.curve, false], [c.curve, false]], col('--a2'), 0.9, () => { c.flash = 1; const s = c.sats.get(e.detail.tool); if (s) s.flash = 1; });
  });
  addEventListener('gwa:end', () => { for (const c of conns.values()) c.busy = Math.max(0, c.busy - 1); });
  addEventListener('gwa:call', (e) => {
    const x = e.detail, a = agents.get(x.agent), c = conns.get(x.connector);
    const masked = Object.values(x.masked || {}).reduce((p, q) => p + q, 0);
    if (['denied', 'killed', 'paused', 'rate', 'unknown'].includes(x.status)) {
      if (!a) return;
      packet([[a.curve, false], [a.curve, true]], col('--bad'), 1.2, null);
      setTimeout(() => { shock(col('--bad')); floatText(x.status === 'rate' ? 'limit' : 'rad', css('--bad'), new THREE.Vector3(0, 1.6, 0)); }, 420);
      return;
    }
    if (!a || !c) return;
    const k = x.ok ? (masked ? col('--a1') : col('--ok')) : col('--bad');
    packet([[c.curve, true], [a.curve, true]], k, 0.9, () => { a.flash = 1; });
    if (masked) setTimeout(() => { shock(col('--a1')); floatText(`🎭 ${masked}`, css('--a1'), new THREE.Vector3(0, 1.6, 0)); }, 520);
  });

  // drag to orbit
  let rotY = -0.25, rotX = 0.12, vY = 0, dragging = false, lx = 0, ly = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!dragging) return; vY = (e.clientX - lx) * 0.006; rotY += vY; rotX = Math.max(-0.6, Math.min(0.6, rotX + (e.clientY - ly) * 0.004)); lx = e.clientX; ly = e.clientY; });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('dblclick', () => { rotY = -0.25; rotX = 0.12; vY = 0; });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const narrow = w / h < 1.4;
    camera.position.set(0, 0.3, narrow ? 16 : 10.5);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  new MutationObserver(() => { if (state) build(state); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (state) build(state); });

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now / 1000, k = reduced ? 0.25 : 1;
    if (!dragging) { vY *= 0.94; rotY += vY + Math.sin(t * 0.2) * 0.0006 * k; }
    world.rotation.set(rotX, rotY, 0);
    camera.lookAt(0, 0, 0);
    core.rotation.y += dt * 0.3 * k; ico.rotation.x += dt * 0.12 * k; inner.rotation.y -= dt * 0.45 * k;
    rings.forEach((r, i) => { r.rotation.z += dt * (0.25 + i * 0.15) * (i ? -1 : 1) * k; });
    halo.scale.setScalar(4.6 * (1 + Math.sin(t * (state?.killed ? 6 : 2)) * 0.04));
    for (let i = 0; i < DN; i++) { const [r, a0, y, s] = dSeed[i]; const a = a0 + t * s * k; dPos.set([Math.cos(a) * r, y + Math.sin(a * 2) * 0.1, Math.sin(a) * r], i * 3); }
    dGeo.attributes.position.needsUpdate = true;
    for (const n of [...agents.values(), ...conns.values()]) {
      n.spin += dt * 0.5 * k; n.solid.rotation.set(n.spin, n.spin * 0.7, 0); n.wire.rotation.copy(n.solid.rotation);
      n.flash = Math.max(0, n.flash - dt * 1.6);
      n.g.scale.setScalar(1 + n.flash * 0.45 + (n.busy ? Math.sin(t * 10) * 0.05 : 0));
      if (n.sats) for (const s of n.sats.values()) {
        const u = s.s.userData; u.ang += dt * 0.5 * k;
        s.s.position.set(Math.cos(u.ang) * u.r, Math.sin(u.ang) * u.r * u.tilt, Math.sin(u.ang) * u.r * 0.6);
        s.flash = Math.max(0, s.flash - dt * 0.7);
        s.s.scale.setScalar(1 + s.flash * 2.2);
        s.tl.material.opacity = s.flash;
      }
    }
    for (let i = 0; i < MAX; i++) {
      const p = packets[i];
      if (!p.live) { pPos.set([0, -999, 0], i * 3); continue; }
      p.t += dt * p.speed / p.path.length * (reduced ? 0.5 : 1);
      along(p.path, Math.min(1, p.t), tmp);
      pPos.set([tmp.x, tmp.y, tmp.z], i * 3); pCol.set([p.color.r, p.color.g, p.color.b], i * 3);
      if (p.t >= 1) { p.live = false; p.done?.(); }
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
    for (let i = shocks.length - 1; i >= 0; i--) { const s = shocks[i]; s.t += dt * 1.1; s.m.scale.setScalar(1 + s.t * 2.2); s.m.material.opacity = Math.max(0, 0.9 - s.t); s.m.lookAt(camera.position); if (s.t >= 1) { core.remove(s.m); s.m.geometry.dispose(); s.m.material.dispose(); shocks.splice(i, 1); } }
    for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.t += dt * 0.6; f.s.position.y = f.y0 + f.t * 1.4; f.s.material.opacity = Math.max(0, 1 - f.t); if (f.t >= 1) { world.remove(f.s); f.s.material.map.dispose(); f.s.material.dispose(); floats.splice(i, 1); } }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  // admin.js may have emitted state before this module loaded
  if (window.__gwaState) build(window.__gwaState);
}
