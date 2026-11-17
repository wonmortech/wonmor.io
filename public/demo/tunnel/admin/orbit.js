// Admin 3D "tunnel orbit": frps core in the middle, clients on an orbit, their tunnels as moons.
// Live traffic is drawn as packets flowing along the beam between a tunnel's client and the core.
import * as THREE from '../vendor/three.module.min.js';

const wrap = document.getElementById('orbitWrap');
const canvas = document.getElementById('orbit');
const labels = document.getElementById('labels');
const empty = document.getElementById('orbitEmpty');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const PAL = {
  dark: { acc: '#22d3ee', vio: '#8b5cf6', on: '#34d399', off: '#56607a', pause: '#fbbf24', cli: '#fbbf24', star: '#9fb3ff', blend: THREE.AdditiveBlending },
  light: { acc: '#0891b2', vio: '#6d28d9', on: '#059669', off: '#a3acc2', pause: '#d97706', cli: '#d97706', star: '#6d7fb8', blend: THREE.NormalBlending }
};
let theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
const C = () => PAL[theme];

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(1.75, devicePixelRatio || 1));
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.set(0, 3.6, 10.5);
  camera.lookAt(0, 0, 0);
  const tex = glowTex();
  const root = new THREE.Group(); scene.add(root);

  // stars
  const SN = 700, sp = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) { const r = 18 + Math.random() * 30, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1); sp.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sm = new THREE.PointsMaterial({ size: 0.12, map: tex, transparent: true, depthWrite: false, opacity: .7 });
  scene.add(new THREE.Points(sg, sm));

  // core
  const core = new THREE.Group(); root.add(core);
  const icoE = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.95, 1)), new THREE.LineBasicMaterial({ transparent: true, opacity: .9 }));
  const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 2), new THREE.MeshBasicMaterial({ transparent: true, opacity: .55 }));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: .8 }));
  halo.scale.set(4.2, 4.2, 1);
  core.add(icoE, inner, halo);
  const rings = [0, 1, 2].map((i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1.35 + i * 0.28, 0.012, 8, 120), new THREE.MeshBasicMaterial({ transparent: true, opacity: .55 }));
    m.rotation.x = Math.PI / 2 + (i - 1) * 0.5; m.rotation.y = i * 0.7; core.add(m); return m;
  });
  // orbit path
  const ORB = 3.6;
  const orbitLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 160 }, (_, i) => { const a = (i / 160) * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * ORB, 0, Math.sin(a) * ORB); })), new THREE.LineDashedMaterial({ dashSize: .12, gapSize: .1, transparent: true, opacity: .35 }));
  orbitLine.computeLineDistances(); root.add(orbitLine);

  const nodes = new Map(); // clientID -> { group, mesh, label, beam, moons: Map(name -> {mesh,label,state}), packets }
  const labelOf = (cls, text) => { const d = document.createElement('div'); d.className = 'ad-lab ' + cls; d.textContent = text; labels.appendChild(d); return d; };
  const coreLabel = labelOf('core', 'frps · tunnel.acme.example');

  function paint() {
    const c = C();
    icoE.material.color.set(c.acc); inner.material.color.set(c.vio); halo.material.color.set(c.acc);
    halo.material.blending = c.blend; halo.material.opacity = theme === 'light' ? .35 : .8;
    rings.forEach((r, i) => r.material.color.set(i % 2 ? c.vio : c.acc));
    orbitLine.material.color.set(c.acc); sm.color.set(c.star); sm.blending = c.blend;
    nodes.forEach((n) => { n.mesh.material.color.set(c.cli); n.wire.material.color.set(c.cli); n.beam.material.color.set(c.acc); n.pk.material.blending = c.blend; n.moons.forEach((m) => tint(m)); });
  }
  function tint(m) { const c = C(); m.mesh.material.color.set(m.state === 'pause' ? c.pause : m.state === 'on' ? c.on : c.off); m.glow.material.color.copy(m.mesh.material.color); m.glow.material.blending = c.blend; m.glow.visible = m.state === 'on'; }

  function ensureClient(id, host) {
    if (nodes.has(id)) return nodes.get(id);
    const group = new THREE.Group(); root.add(group);
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), new THREE.MeshBasicMaterial({ transparent: true, opacity: .85 }));
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.42)), new THREE.LineBasicMaterial({ transparent: true, opacity: .6 }));
    group.add(mesh, wire);
    const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ transparent: true, opacity: .25 }));
    root.add(beam);
    const PN = 40, pp = new Float32Array(PN * 3), pc = new Float32Array(PN * 3);
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
    const pk = new THREE.Points(pg, new THREE.PointsMaterial({ size: .22, map: tex, vertexColors: true, transparent: true, depthWrite: false }));
    root.add(pk);
    const parts = Array.from({ length: PN }, (_, i) => ({ t: Math.random(), dir: i % 2 ? 1 : -1, v: .25 + Math.random() * .5 }));
    const n = { group, mesh, wire, beam, pk, pg, parts, moons: new Map(), label: labelOf('cli', '💻 ' + host), angle: 0, activity: 0 };
    nodes.set(id, n); paint(); return n;
  }
  function ensureMoon(n, name) {
    if (n.moons.has(name)) return n.moons.get(name);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 16), new THREE.MeshBasicMaterial());
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: .9 }));
    glow.scale.set(.75, .75, 1);
    const g = new THREE.Group(); g.add(mesh, glow); n.group.add(g);
    const m = { g, mesh, glow, label: labelOf('', name), state: 'off', phase: Math.random() * Math.PI * 2, active: 0 };
    n.moons.set(name, m); return m;
  }
  function drop(map, key, onDrop) { const v = map.get(key); onDrop(v); map.delete(key); }

  function update(d) {
    const gw = window.__gw || { stats: {}, paused: {} };
    const cl = (d.clients || []).filter((c) => c.online);
    const ids = new Set(cl.map((c) => c.clientID));
    [...nodes.keys()].forEach((id) => { if (!ids.has(id)) drop(nodes, id, (n) => { root.remove(n.group, n.beam, n.pk); n.label.remove(); n.moons.forEach((m) => m.label.remove()); }); });
    cl.forEach((c, i) => { const n = ensureClient(c.clientID, c.hostname || c.clientID); n.angle = (i / Math.max(1, cl.length)) * Math.PI * 2; n.label.textContent = '💻 ' + (c.hostname || c.clientID); });
    const seen = new Map();
    (d.proxies || []).forEach((p) => {
      const n = nodes.get(p.clientID); if (!n) return;
      const sub = (p.spec && p.spec.http && p.spec.http.subdomain) || p.name;
      const m = ensureMoon(n, p.name);
      m.state = gw.paused[sub] ? 'pause' : p.status.phase === 'online' ? 'on' : 'off';
      const s = gw.stats[sub], recent = s ? (s.series[59] || 0) + (s.series[58] || 0) : 0;
      m.active = m.state === 'on' ? Math.min(1, (p.status.curConns || 0) * .35 + recent * .08) : 0;
      tint(m);
      if (!seen.has(n)) seen.set(n, new Set()); seen.get(n).add(p.name);
    });
    nodes.forEach((n) => {
      const keep = seen.get(n) || new Set();
      [...n.moons.keys()].forEach((k) => { if (!keep.has(k)) drop(n.moons, k, (m) => { n.group.remove(m.g); m.label.remove(); }); });
      let a = 0; n.moons.forEach((m) => { a = Math.max(a, m.active); }); n.activity = a;
    });
    empty.hidden = nodes.size > 0;
    if (reduced) frame(performance.now());
  }
  window.addEventListener('ad-data', (e) => update(e.detail));
  window.addEventListener('gw-update', () => { /* paused state is re-read on the next ad-data tick */ });
  window.addEventListener('tn-theme', (e) => { theme = e.detail === 'light' ? 'light' : 'dark'; paint(); if (reduced) frame(performance.now()); });

  // drag to rotate
  let rotY = 0, rotX = 0.18, vY = 0, drag = null;
  wrap.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, ry: rotY, rx: rotX }; wrap.setPointerCapture(e.pointerId); });
  wrap.addEventListener('pointermove', (e) => { if (!drag) return; rotY = drag.ry + (e.clientX - drag.x) * 0.008; rotX = Math.max(-0.5, Math.min(0.8, drag.rx + (e.clientY - drag.y) * 0.005)); vY = 0; if (reduced) frame(performance.now()); });
  wrap.addEventListener('pointerup', () => { drag = null; });

  let w = 0, h = 0;
  function resize() {
    const nw = wrap.clientWidth, nh = wrap.clientHeight;
    if (nw === w && nh === h) return; w = nw; h = nh;
    renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h);
    camera.position.z = w < 600 ? 13.5 : 10.5; camera.updateProjectionMatrix();
  }
  const v3 = new THREE.Vector3();
  function place(el, obj, dy) {
    obj.getWorldPosition(v3); v3.y += dy || 0; v3.project(camera);
    const vis = v3.z < 1 && Math.abs(v3.x) < 1.1 && Math.abs(v3.y) < 1.1;
    el.style.opacity = vis ? (v3.z > 0.985 ? '.55' : '1') : '0';
    el.style.transform = `translate(${((v3.x + 1) / 2) * w}px, ${((1 - v3.y) / 2) * h}px) translate(-50%, -140%)`;
  }
  const tmpA = new THREE.Vector3(), col = new THREE.Color();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    resize();
    if (!drag && !reduced) rotY += dt * 0.12 + vY;
    root.rotation.set(rotX, rotY, 0);
    const t = now / 1000;
    if (!reduced) { core.rotation.y = t * 0.35; icoE.rotation.x = t * 0.2; rings.forEach((r, i) => { r.rotation.z = t * (0.25 + i * 0.12) * (i % 2 ? -1 : 1); }); inner.scale.setScalar(1 + Math.sin(t * 2.2) * 0.05); }
    nodes.forEach((n) => {
      const a = n.angle + (reduced ? 0 : t * 0.05);
      n.group.position.set(Math.cos(a) * ORB, Math.sin(a * 2 + t * 0.4) * 0.25, Math.sin(a) * ORB);
      if (!reduced) { n.mesh.rotation.y = t * 0.8; n.wire.rotation.y = -t * 0.5; n.wire.rotation.x = t * 0.3; }
      const k = n.moons.size; let j = 0;
      n.moons.forEach((m) => { const b = m.phase + (j / Math.max(1, k)) * Math.PI * 2 + (reduced ? 0 : t * 0.6); m.g.position.set(Math.cos(b) * 0.85, Math.sin(b * 1.3) * 0.25, Math.sin(b) * 0.85); j++; place(m.label, m.g, 0.12); });
      const bp = n.beam.geometry.attributes.position; bp.setXYZ(0, 0, 0, 0); bp.setXYZ(1, n.group.position.x, n.group.position.y, n.group.position.z); bp.needsUpdate = true;
      n.beam.material.opacity = 0.18 + n.activity * 0.5;
      const pa = n.pg.attributes.position, pc = n.pg.attributes.color, act = n.activity;
      n.parts.forEach((p, i) => {
        const on = act > 0 && i < 6 + Math.round(act * 34);
        if (!reduced) p.t = (p.t + dt * p.v * (0.4 + act * 1.6)) % 1;
        const tt = p.dir > 0 ? p.t : 1 - p.t;
        tmpA.copy(n.group.position).multiplyScalar(tt);
        if (on) pa.setXYZ(i, tmpA.x, tmpA.y, tmpA.z); else pa.setXYZ(i, 0, -999, 0);
        col.set(p.dir > 0 ? C().acc : C().vio);
        pc.setXYZ(i, col.r, col.g, col.b);
      });
      pa.needsUpdate = true; pc.needsUpdate = true;
      n.pk.visible = act > 0;
      place(n.label, n.group, 0.35);
    });
    place(coreLabel, core, 1.25);
    renderer.render(scene, camera);
  }
  paint();
  if (reduced) { frame(performance.now()); addEventListener('resize', () => frame(performance.now())); }
  else renderer.setAnimationLoop(frame);
}

try {
  const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
  if (gl) start(); else empty.hidden = false, empty.textContent = 'WebGL yo\'q: 3D xarita o\'chirilgan';
} catch (e) {
  console.warn('orbit 3D', e);
}
