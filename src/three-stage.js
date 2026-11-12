import * as THREE from 'three';
import { markShapes } from './geometry.js';

// One renderer per canvas. Modes: 'gems' (a cut brilliant) and 'mark' (extruded W mark).
// Mark finishes follow the reference: 'glass' on blue, 'satin' on dark, 'brand' for the viewer.
export function createStage(canvas, { interactive = false } = {}) {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) throw new Error('webgl');
  const small = matchMedia('(max-width: 720px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: !small, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.debug.checkShaderErrors = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  scene.environment = buildEnv(renderer);

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 5, 6);
  const rim = new THREE.DirectionalLight(0x7fd8ff, 3);
  rim.position.set(-5, 2, -3);
  scene.add(key, rim, new THREE.HemisphereLight(0xcfe3ff, 0x0b1030, 0.5));

  // ---- the gem: mirrored facets inside, refracting brilliant outside ----
  const gemGeo = brilliant();
  const inner = new THREE.Mesh(gemGeo, new THREE.MeshStandardMaterial({
    color: 0x3a9bff, metalness: 0.9, roughness: 0.04, envMapIntensity: 4.5, side: THREE.BackSide, flatShading: true,
    emissive: new THREE.Color(0x0b4cff), emissiveIntensity: 0.45,
  }));
  const outer = new THREE.Mesh(gemGeo, new THREE.MeshPhysicalMaterial({
    color: 0x6cc0ff, metalness: 0.1, roughness: 0, transparent: true, opacity: 0.6, depthWrite: false,
    envMapIntensity: 5, clearcoat: 1, clearcoatRoughness: 0, specularIntensity: 1, specularColor: 0xffffff,
    emissive: new THREE.Color(0x0a46ff), emissiveIntensity: 0.25, flatShading: true,
  }));
  const gem = new THREE.Group();
  gem.add(inner, outer);
  scene.add(gem);

  // ---- the extruded mark ----
  const markGeo = new THREE.ExtrudeGeometry(markShapes(THREE), {
    depth: 0.26, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.028, bevelSegments: 4, curveSegments: 6,
  });
  markGeo.center();
  const finishes = {
    brand: [
      new THREE.MeshPhysicalMaterial({ color: 0x1f5bff, metalness: 0.2, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.3 }),
      new THREE.MeshPhysicalMaterial({ color: 0x8fdcff, metalness: 0.35, roughness: 0.18, clearcoat: 1, envMapIntensity: 1.8 }),
    ],
    glass: [
      new THREE.MeshPhysicalMaterial({ color: 0xf4f8ff, metalness: 0, roughness: 0.12, transparent: true, opacity: 0.62, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2.2, specularIntensity: 1 }),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.9, clearcoat: 1, envMapIntensity: 2.6 }),
    ],
    satin: [
      new THREE.MeshPhysicalMaterial({ color: 0x4a5cf0, metalness: 0.1, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 1 }),
      new THREE.MeshPhysicalMaterial({ color: 0xc8d2ff, metalness: 0.5, roughness: 0.22, envMapIntensity: 1.1 }),
    ],
  };
  const mark = new THREE.Mesh(markGeo, finishes.brand);
  scene.add(mark);

  const state = {
    mode: interactive ? 'mark' : 'gems', finish: 'brand',
    gemX: 0, gemScale: 1, gemOpacity: 1, spin: 0, time: 0,
    markRotY: 0.4, markRotX: -0.12, markScale: 1, markY: 0, markOpacity: 1,
  };

  let w = 1, h = 1, ppu = 1, raf = 0, running = false, last = 0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    ppu = h / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z);
  }

  // Map stage content units (1000 = min(w,h)) to world units at z = 0.
  const u2w = (u) => (u * Math.min(w, h) / 1000) / ppu;

  function frame(t) {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    state.spin += dt * 0.9;
    state.time += dt;
    render();
    raf = requestAnimationFrame(frame);
  }

  function render() {
    gem.visible = state.mode === 'gems' && state.gemOpacity > 0.01;
    mark.visible = state.mode === 'mark' && state.markOpacity > 0.01;
    canvas.style.opacity = String(gem.visible ? state.gemOpacity : state.markOpacity);
    if (gem.visible) {
      gem.scale.setScalar(u2w(state.gemScale) / 2.3);
      gem.position.x = u2w(state.gemX);
      gem.rotation.set(0.2, state.spin, 0.04);
    }
    if (mark.visible) {
      if (mark.material !== finishes[state.finish]) mark.material = finishes[state.finish];
      const s = u2w(state.markScale);
      mark.scale.set(s, s, s);
      mark.position.y = u2w(state.markY);
      mark.rotation.set(state.markRotX, state.markRotY, 0);
    }
    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); canvas.dispatchEvent(new Event('wm-lost')); });

  resize();
  return { state, resize, start, stop, render, dispose() { stop(); renderer.dispose(); } };
}

// Round brilliant, 57 facets: table, 8 stars, 8 bezels, 16 upper girdles, girdle band,
// 16 lower girdles, 8 pavilion mains to the culet. Deep pavilion like the reference gem.
function brilliant() {
  const R = 1, table = 0.56, crownH = 0.4, starR = 0.8, starH = 0.27, girdle = 0.03, depth = 1.6, lowR = 0.44, lowH = -0.78;
  const P = (r, a, y) => new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a));
  const step = Math.PI / 8;
  const T = [], M = [], Gt = [], Gb = [], L = [];
  for (let i = 0; i < 8; i++) {
    T.push(P(table, i * 2 * step, crownH));
    M.push(P(starR, (i * 2 + 1) * step, starH));
    L.push(P(lowR, (i * 2 + 1) * step, lowH));
  }
  for (let j = 0; j < 16; j++) {
    Gt.push(P(R, j * step, girdle));
    Gb.push(P(R, j * step, -girdle));
  }
  const top = new THREE.Vector3(0, crownH, 0);
  const culet = new THREE.Vector3(0, -depth, 0);
  const tris = [];
  const tri = (a, b, c) => tris.push(a, b, c);
  for (let i = 0; i < 8; i++) {
    const n = (i + 1) % 8, p = (i + 7) % 8;
    tri(top, T[n], T[i]);
    tri(T[i], T[n], M[i]);
    tri(T[i], M[i], Gt[2 * i]);
    tri(T[i], Gt[2 * i], M[p]);
    tri(M[i], Gt[2 * i + 1], Gt[2 * i]);
    tri(M[i], Gt[(2 * i + 2) % 16], Gt[2 * i + 1]);
    tri(Gb[2 * i], Gb[2 * i + 1], L[i]);
    tri(Gb[2 * i + 1], Gb[(2 * i + 2) % 16], L[i]);
    tri(Gb[2 * i], L[i], culet);
    tri(Gb[2 * i], culet, L[p]);
  }
  for (let j = 0; j < 16; j++) {
    const k = (j + 1) % 16;
    tri(Gt[j], Gt[k], Gb[k]);
    tri(Gt[j], Gb[k], Gb[j]);
  }
  const pos = [];
  const c = new THREE.Vector3(0, -0.3, 0);
  for (let i = 0; i < tris.length; i += 3) {
    let [a, b, d] = [tris[i], tris[i + 1], tris[i + 2]];
    const nrm = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(d, a));
    const mid = new THREE.Vector3().add(a).add(b).add(d).divideScalar(3).sub(c);
    if (nrm.dot(mid) < 0) [b, d] = [d, b];
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

// Dark studio with strip lights: facets read as hard dark/bright cuts, tinted blue and cyan.
function buildEnv(renderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(14, 10, 14), new THREE.MeshBasicMaterial({ color: 0x03050d, side: THREE.BackSide })));
  const panel = (color, x, y, z, sx, sy) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel(new THREE.Color(10, 10, 10), 0, 4.6, 2, 7, 0.5);
  panel(new THREE.Color(8, 8, 8), 3, 1.5, 6, 0.35, 4);
  panel(new THREE.Color(6, 6, 6), -4, -1, 5, 0.3, 3);
  panel(new THREE.Color(0.6, 3.6, 7), -6, 1, 1, 0.7, 6);
  panel(new THREE.Color(0.3, 1.2, 8), 6, -0.5, -2, 0.9, 5);
  panel(new THREE.Color(0.2, 0.9, 5), 0, -4.6, 2, 6, 0.6);
  panel(new THREE.Color(5, 5, 5), 1, 0.5, -6, 4, 0.3);
  const tex = pm.fromScene(env, 0.01).texture;
  pm.dispose();
  return tex;
}
