// three.js scenes, loaded on demand (never on first paint).
//  - mountConstellation: the product ecosystem as a slowly turning star map; hover/tap a star to see it, click to open.
//  - mountMorph: a point cloud that assembles into a product-specific shape (used where no public screenshot exists).
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, LineBasicMaterial, LineSegments, PerspectiveCamera,
  Points, Raycaster, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer,
} from 'three';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function makeRenderer(host: HTMLElement) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y';
  host.prepend(renderer.domElement);
  return renderer;
}

/** Runs `frame` only while the host is on screen and the tab is visible. */
function loop(host: HTMLElement, frame: (dt: number, t: number) => void) {
  let visible = false, raf = 0, last = performance.now(), t = 0;
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    frame(dt, t);
    raf = requestAnimationFrame(tick);
  };
  const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }, { rootMargin: '80px' }).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  return { kick: () => { if (!raf) frame(0, t); } };
}

const pointVert = /* glsl */ `
  attribute float aSize; attribute vec3 color; attribute float aDelay;
  uniform float uTime; uniform float uPixel; uniform float uHover; uniform float uHoverIndex;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float grow = clamp((uTime - aDelay) / 0.9, 0.0, 1.0);
    grow = 1.0 - pow(1.0 - grow, 3.0);
    float hovered = step(abs(float(gl_VertexID) - uHoverIndex), 0.5) * uHover;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * grow * (1.0 + hovered * 0.7) * uPixel * (10.0 / -mv.z);
    vColor = color; vAlpha = grow;
  }`;
const pointFrag = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.22, 0.16, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.45;
    float a = (core + halo) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.35), a);
  }`;

export interface StarNode { key: string; label: string; group: string; href: string; color: string; cluster: string }

export function mountConstellation(host: HTMLElement, nodes: StarNode[], tip: HTMLElement) {
  const renderer = makeRenderer(host);
  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.6, 10.5);
  const world = new Group();
  world.rotation.x = 0.28;
  scene.add(world);

  // Layout: hub at the centre, each cluster on a tilted ring, its products on a small shell around the cluster centre.
  const clusterKeys = [...new Set(nodes.map((n) => n.cluster))].filter((c) => c !== 'core');
  const centre = new Map<string, Vector3>();
  clusterKeys.forEach((c, i) => {
    const a = (i / clusterKeys.length) * Math.PI * 2 + 0.4;
    centre.set(c, new Vector3(Math.cos(a) * 3.4, Math.sin(a * 2) * 0.9, Math.sin(a) * 3.4));
  });
  const pos: Vector3[] = [];
  const counters = new Map<string, number>();
  for (const n of nodes) {
    if (n.cluster === 'core') { pos.push(new Vector3(0, 0, 0)); continue; }
    const k = counters.get(n.cluster) ?? 0; counters.set(n.cluster, k + 1);
    const size = nodes.filter((m) => m.cluster === n.cluster).length;
    const c = centre.get(n.cluster)!;
    if (size === 1) { pos.push(c.clone()); continue; }
    const phi = Math.acos(1 - (2 * (k + 0.5)) / size), th = Math.PI * (1 + Math.sqrt(5)) * k;
    pos.push(c.clone().add(new Vector3(Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)).multiplyScalar(0.95)));
  }

  const N = nodes.length;
  const g = new BufferGeometry();
  const P = new Float32Array(N * 3), Cl = new Float32Array(N * 3), S = new Float32Array(N), D = new Float32Array(N);
  nodes.forEach((n, i) => {
    P.set([pos[i].x, pos[i].y, pos[i].z], i * 3);
    const col = new Color(n.color); Cl.set([col.r, col.g, col.b], i * 3);
    S[i] = n.cluster === 'core' ? 34 : 20; D[i] = 0.15 + i * 0.06;
  });
  g.setAttribute('position', new BufferAttribute(P, 3));
  g.setAttribute('color', new BufferAttribute(Cl, 3));
  g.setAttribute('aSize', new BufferAttribute(S, 1));
  g.setAttribute('aDelay', new BufferAttribute(D, 1));
  const uniforms = { uTime: { value: reduce() ? 99 : 0 }, uPixel: { value: renderer.getPixelRatio() }, uHover: { value: 0 }, uHoverIndex: { value: -1 } };
  const stars = new Points(g, new ShaderMaterial({ uniforms, vertexShader: pointVert, fragmentShader: pointFrag, transparent: true, depthWrite: false, blending: AdditiveBlending }));
  world.add(stars);

  // Links: every product to dtwin, plus a chain inside each cluster.
  const L: number[] = [], LC: number[] = [];
  const hub = nodes.findIndex((n) => n.cluster === 'core');
  const link = (a: number, b: number) => {
    L.push(pos[a].x, pos[a].y, pos[a].z, pos[b].x, pos[b].y, pos[b].z);
    const ca = new Color(nodes[a].color), cb = new Color(nodes[b].color);
    LC.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
  };
  nodes.forEach((n, i) => { if (i !== hub) link(i, hub); });
  for (const c of clusterKeys) {
    const idx = nodes.map((n, i) => (n.cluster === c ? i : -1)).filter((i) => i >= 0);
    for (let i = 1; i < idx.length; i++) link(idx[i - 1], idx[i]);
    if (idx.length > 2) link(idx[idx.length - 1], idx[0]);
  }
  const lg = new BufferGeometry();
  lg.setAttribute('position', new BufferAttribute(new Float32Array(L), 3));
  lg.setAttribute('color', new BufferAttribute(new Float32Array(LC), 3));
  const lineMat = new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false });
  world.add(new LineSegments(lg, lineMat));

  // Dust: a faint shell of tiny points for depth.
  const DN = 700, dP = new Float32Array(DN * 3), dC = new Float32Array(DN * 3), dS = new Float32Array(DN), dD = new Float32Array(DN);
  for (let i = 0; i < DN; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 5 + Math.random() * 4;
    dP.set([Math.sqrt(1 - u * u) * Math.cos(th) * r, u * r * 0.6, Math.sqrt(1 - u * u) * Math.sin(th) * r], i * 3);
    const v = 0.35 + Math.random() * 0.25; dC.set([v, v, v * 0.95], i * 3); dS[i] = 2 + Math.random() * 3; dD[i] = Math.random() * 1.2;
  }
  const dg = new BufferGeometry();
  dg.setAttribute('position', new BufferAttribute(dP, 3)); dg.setAttribute('color', new BufferAttribute(dC, 3));
  dg.setAttribute('aSize', new BufferAttribute(dS, 1)); dg.setAttribute('aDelay', new BufferAttribute(dD, 1));
  const dustUniforms = { ...uniforms, uHover: { value: 0 }, uHoverIndex: { value: -1 } };
  const dust = new Points(dg, new ShaderMaterial({ uniforms: dustUniforms, vertexShader: pointVert, fragmentShader: pointFrag, transparent: true, depthWrite: false, blending: AdditiveBlending }));
  scene.add(dust);

  // Interaction: drag to turn, hover/tap to pick, click to open.
  const ray = new Raycaster(); ray.params.Points = { threshold: 0.32 };
  const ndc = new Vector2(); let hovered = -1, dragging = false, moved = 0, lastX = 0, lastY = 0, vel = 0, pointerIn = false;
  const toNdc = (e: PointerEvent) => { const r = host.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
  const pick = () => { ray.setFromCamera(ndc, camera); const hit = ray.intersectObject(stars)[0]; return hit ? hit.index ?? -1 : -1; };
  const setHover = (i: number) => {
    hovered = i; uniforms.uHover.value = i >= 0 ? 1 : 0; uniforms.uHoverIndex.value = i;
    host.style.cursor = i >= 0 ? 'pointer' : dragging ? 'grabbing' : 'grab';
    host.dispatchEvent(new CustomEvent('star', { detail: i >= 0 ? nodes[i].key : null }));
    if (i < 0) { tip.hidden = true; return; }
    tip.querySelector('[data-tip-title]')!.textContent = nodes[i].label;
    tip.querySelector('[data-tip-group]')!.textContent = nodes[i].group;
    (tip.querySelector('a') as HTMLAnchorElement).href = nodes[i].href;
    tip.hidden = false; placeTip();
  };
  const placeTip = () => {
    if (hovered < 0) return;
    const v = pos[hovered].clone().applyMatrix4(world.matrixWorld).project(camera);
    const r = host.getBoundingClientRect();
    const x = (v.x * 0.5 + 0.5) * r.width, y = (-v.y * 0.5 + 0.5) * r.height;
    tip.style.transform = `translate(${Math.round(Math.min(Math.max(x, 90), r.width - 90))}px, ${Math.round(y)}px)`;
  };
  host.addEventListener('pointerdown', (e) => { dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', (e) => {
    pointerIn = true;
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY; moved += Math.abs(dx) + Math.abs(dy);
      world.rotation.y += dx * 0.006; world.rotation.x = Math.max(-0.4, Math.min(0.8, world.rotation.x + dy * 0.004));
      vel = dx * 0.006; lastX = e.clientX; lastY = e.clientY; placeTip();
    } else if (e.pointerType === 'mouse') { toNdc(e); const i = pick(); if (i !== hovered) setHover(i); }
  });
  host.addEventListener('pointerup', (e) => {
    dragging = false;
    if (moved < 6) {
      toNdc(e); const i = pick();
      if (i >= 0 && (e.pointerType === 'mouse' || i === hovered)) location.href = nodes[i].href;
      else setHover(i);
    }
  });
  host.addEventListener('pointerleave', () => { pointerIn = false; if (!dragging) setHover(-1); });

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height, false); camera.aspect = width / Math.max(1, height);
    camera.position.z = width < 640 ? 13.5 : 10.5; camera.updateProjectionMatrix(); run.kick();
  };
  const still = reduce();
  const run = loop(host, (dt) => {
    uniforms.uTime.value += dt; dustUniforms.uTime.value = uniforms.uTime.value;
    lineMat.opacity = Math.min(0.22, uniforms.uTime.value * 0.12);
    if (!dragging) { vel *= 0.94; world.rotation.y += vel + (still || (pointerIn && hovered >= 0) ? 0 : dt * 0.06); }
    dust.rotation.y -= still ? 0 : dt * 0.01;
    renderer.render(scene, camera); placeTip();
  });
  new ResizeObserver(resize).observe(host); resize();
  if (still) { lineMat.opacity = 0.22; renderer.render(scene, camera); }

  return {
    /** Highlight a product from outside (list hover). */
    focus(key: string | null) { const i = key ? nodes.findIndex((n) => n.key === key) : -1; setHover(i); },
  };
}

/** Sample points for the morph target. */
function shape(variant: string, n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  for (let i = 0; i < n; i++) {
    let x = 0, y = 0, z = 0;
    if (variant === 'twin') {
      // A floor of rooms and server racks drawn as point-edged boxes.
      const boxes = [[-2.2, -1.4, 1.6, 0.9, 1.2], [-0.4, -1.4, 1.6, 0.9, 1.2], [1.4, -1.4, 1.2, 0.9, 1.2], [-2.2, 0.0, 2.2, 0.9, 1.4], [0.2, 0.0, 1.0, 1.6, 1.4], [1.4, 0.0, 1.2, 0.9, 1.4]];
      const [bx, bz, w, h, d] = boxes[i % boxes.length];
      const e = Math.floor(Math.random() * 12), t = Math.random();
      const c = [[0, 0, 0], [w, 0, 0], [w, 0, d], [0, 0, d], [0, h, 0], [w, h, 0], [w, h, d], [0, h, d]];
      const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]][e];
      const a = c[E[0]], b = c[E[1]];
      x = bx + a[0] + (b[0] - a[0]) * t; y = -0.6 + a[1] + (b[1] - a[1]) * t; z = bz + a[2] + (b[2] - a[2]) * t;
      if (i % 5 === 0) { x = rnd(-2.4, 2.8); y = -0.6; z = rnd(-1.6, 1.6); } // floor grid dust
    } else if (variant === 'face') {
      // A recognition frame: head-shaped shell, scan rings and corner brackets.
      const k = i % 10;
      if (k < 6) { const u = rnd(-1, 1), th = rnd(0, Math.PI * 2); x = Math.sqrt(1 - u * u) * Math.cos(th) * 1.25; y = u * 1.6; z = Math.sqrt(1 - u * u) * Math.sin(th) * 1.1; }
      else if (k < 8) { const th = rnd(0, Math.PI * 2), r = k === 6 ? 2.05 : 2.35; x = Math.cos(th) * r; y = (k === 6 ? 0.2 : -0.4) + rnd(-0.02, 0.02); z = Math.sin(th) * r; }
      else { const sx = Math.random() < 0.5 ? -1 : 1, sy = Math.random() < 0.5 ? -1 : 1, t = rnd(0, 0.7), along = Math.random() < 0.5; x = sx * (along ? 2.2 - t : 2.2); y = sy * (along ? 2.4 : 2.4 - t); z = 0; }
    } else {
      const u = rnd(-1, 1), th = rnd(0, Math.PI * 2), r = 2 * Math.cbrt(Math.random());
      x = Math.sqrt(1 - u * u) * Math.cos(th) * r; y = u * r; z = Math.sqrt(1 - u * u) * Math.sin(th) * r;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

export function mountMorph(host: HTMLElement, variant: string, accent: string) {
  const renderer = makeRenderer(host);
  const scene = new Scene();
  const camera = new PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 2.2, 8.5); camera.lookAt(0, 0, 0);
  const N = 5200;
  const target = shape(variant, N);
  const start = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 6 + Math.random() * 5; start.set([Math.sqrt(1 - u * u) * Math.cos(th) * r, u * r, Math.sqrt(1 - u * u) * Math.sin(th) * r], i * 3); }
  const delay = new Float32Array(N).map(() => Math.random() * 0.8);
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(target, 3));
  g.setAttribute('aStart', new BufferAttribute(start, 3));
  g.setAttribute('aDelay', new BufferAttribute(delay, 1));
  const base = new Color(accent), hi = new Color('#ffffff');
  const uniforms = { uP: { value: reduce() ? 1 : 0 }, uTime: { value: 0 }, uPixel: { value: renderer.getPixelRatio() }, uA: { value: base }, uB: { value: hi } };
  const mat = new ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 aStart; attribute float aDelay; uniform float uP; uniform float uTime; uniform float uPixel;
      varying float vMix;
      void main() {
        float p = clamp((uP * 1.8 - aDelay), 0.0, 1.0); p = p * p * (3.0 - 2.0 * p);
        vec3 pos = mix(aStart, position, p);
        pos.y += sin(uTime * 0.8 + position.x * 1.7) * 0.03 * p;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (2.2 + 2.0 * fract(aDelay * 13.0)) * uPixel * (12.0 / -mv.z);
        vMix = fract(aDelay * 7.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uA; uniform vec3 uB; varying float vMix;
      void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.1, d); if (a < 0.02) discard;
        gl_FragColor = vec4(mix(uA, uB, 0.3 + vMix * 0.5), a); }`,
  });
  const cloud = new Points(g, mat);
  const group = new Group(); group.add(cloud); scene.add(group);
  let tx = 0, ty = 0;
  host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5) * 0.5; ty = ((e.clientY - r.top) / r.height - 0.5) * 0.3; });
  const still = reduce();
  const run = loop(host, (dt) => {
    uniforms.uTime.value += dt;
    if (!still) uniforms.uP.value = Math.min(1, uniforms.uP.value + dt * 0.45);
    group.rotation.y += ((still ? 0.5 : uniforms.uTime.value * 0.12) + tx - group.rotation.y) * 0.05;
    group.rotation.x += (ty - group.rotation.x) * 0.05;
    renderer.render(scene, camera);
  });
  const resize = () => { const { width, height } = host.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix(); run.kick(); };
  new ResizeObserver(resize).observe(host); resize();
}
