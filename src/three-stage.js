import * as THREE from 'three';
import { markShapes } from './geometry.js';

// One renderer per canvas. Modes: 'gems' (two faceted diamonds) and 'mark' (extruded W mark).
export function createStage(canvas, { interactive = false } = {}) {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) throw new Error('webgl');
  const small = matchMedia('(max-width: 720px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: !small, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.debug.checkShaderErrors = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.environment = buildEnv(renderer);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 5, 6);
  const rim = new THREE.DirectionalLight(0x7fd8ff, 2.4);
  rim.position.set(-5, 2, -3);
  scene.add(key, rim, new THREE.HemisphereLight(0xcfe3ff, 0x0b1030, 0.6));

  const gemGeo = gemGeometry();
  const gemMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a6bff, metalness: 0.05, roughness: 0.04, transparent: true, opacity: 0.88,
    iridescence: 0.9, iridescenceIOR: 1.6, iridescenceThicknessRange: [180, 620],
    clearcoat: 1, clearcoatRoughness: 0.02, flatShading: true, envMapIntensity: 2.2,
    specularIntensity: 1, specularColor: 0xbfe8ff, side: THREE.DoubleSide,
  });
  const gems = new THREE.Group();
  const gemA = new THREE.Mesh(gemGeo, gemMat);
  const gemB = new THREE.Mesh(gemGeo, gemMat);
  gems.add(gemA, gemB);
  scene.add(gems);

  const markGeo = new THREE.ExtrudeGeometry(markShapes(THREE), {
    depth: 0.26, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.028, bevelSegments: 4, curveSegments: 6,
  });
  markGeo.center();
  const markMat = [
    new THREE.MeshPhysicalMaterial({ color: 0x1f5bff, metalness: 0.2, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.3 }),
    new THREE.MeshPhysicalMaterial({ color: 0x8fdcff, metalness: 0.35, roughness: 0.18, clearcoat: 1, envMapIntensity: 1.8 }),
  ];
  const mark = new THREE.Mesh(markGeo, markMat);
  scene.add(mark);

  const state = {
    mode: interactive ? 'mark' : 'gems',
    gemX: 1.6, gemScale: 1, gemOpacity: 1, spin: 0,
    markRotY: 0.4, markRotX: -0.12, markScale: 1, markY: 0, markOpacity: 1,
  };

  let w = 1, h = 1, ppu = 1, raf = 0, running = false, last = 0;
  const visible = { v: true };

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
    render();
    raf = requestAnimationFrame(frame);
  }

  function render() {
    const gemsOn = state.mode === 'gems';
    gems.visible = gemsOn && state.gemOpacity > 0.01;
    mark.visible = state.mode === 'mark' && state.markOpacity > 0.01;
    if (gems.visible) {
      const s = u2w(state.gemScale);
      gemA.scale.setScalar(s); gemB.scale.setScalar(s);
      gemA.position.x = -u2w(state.gemX); gemB.position.x = u2w(state.gemX);
      gemA.rotation.set(0.32, state.spin, 0.08);
      gemB.rotation.set(0.32, -state.spin + 0.6, -0.08);
      gemMat.opacity = 0.88 * state.gemOpacity;
    }
    if (mark.visible) {
      const s = u2w(state.markScale);
      mark.scale.set(s, s, s);
      mark.position.y = u2w(state.markY);
      mark.rotation.set(state.markRotX, state.markRotY, 0);
      markMat.forEach((m) => { m.transparent = state.markOpacity < 1; m.opacity = state.markOpacity; });
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
  return { state, resize, start, stop, render, visible, dispose() { stop(); renderer.dispose(); } };
}

function gemGeometry() {
  // Brilliant-like profile: culet, pavilion, girdle, crown, table. Lathe with 8 sides, flat shaded.
  const pts = [
    new THREE.Vector2(0.0001, -0.62), new THREE.Vector2(0.5, 0.06), new THREE.Vector2(0.5, 0.12),
    new THREE.Vector2(0.33, 0.36), new THREE.Vector2(0.0001, 0.36),
  ];
  const g = new THREE.LatheGeometry(pts, 8).toNonIndexed();
  g.computeVertexNormals();
  return g;
}

function buildEnv(renderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), new THREE.MeshBasicMaterial({ color: 0x0a1030, side: THREE.BackSide }));
  env.add(room);
  const panel = (color, x, y, z, sx, sy, ry = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); m.rotation.z += ry;
    env.add(m);
  };
  panel(new THREE.Color(6, 6, 6.5), 0, 3.6, 2, 6, 1.2);
  panel(new THREE.Color(1.2, 3.2, 5), -5, 0.5, 1, 1.4, 5);
  panel(new THREE.Color(0.6, 1.2, 6), 5, -0.5, -1, 1.2, 4);
  panel(new THREE.Color(4, 2.4, 4.6), 2, -3, 4, 3, 0.8);
  const tex = pm.fromScene(env, 0.035).texture;
  pm.dispose();
  return tex;
}
