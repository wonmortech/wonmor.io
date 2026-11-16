/* /swarm 3D: one Points cloud of tiny agents that morphs between five formations as the page scrolls:
   0 the Wonmor mark (two V's, the left one dimmer, sampled from the real favicon paths), 1 the 16-product
   constellation in cluster colours, 2 a timeline helix, 3 a sphere, 4 the mark again. Each particle has its own
   delay, so formations flow like a swarm instead of cross-fading. */
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, PerspectiveCamera, Points, Scene, ShaderMaterial, SRGBColorSpace, Vector3, WebGLRenderer,
} from 'three';
import { cardViews } from './products3d';

export interface SceneOpts {
  canvas: HTMLCanvasElement;
  clusters: { color: string; products: number }[];
  agentColors: string[];
  reduced: boolean;
  /** Product card 3D areas ([data-p]), each rendered with its own small scene. */
  cards?: HTMLElement[];
  locale?: string;
}
export interface SceneHandle {
  setStage(s: number): void;
  gather(ms: number): void;
  scatter(): void;
  burst(): void;
  blueprint(on: boolean): void;
  pointer(nx: number, ny: number, on: boolean): void;
  render(): void;
  dispose(): void;
}

const MARK_V = [
  'M9.3704 3H22.6265C23.8941 3 25.0353 3.7685 25.5119 4.94317L27.25 9.22751H4.75L6.48432 4.94496C6.93972 3.82046 8.00401 3.06766 9.20572 3.00434L9.3704 3Z',
  'M4.75 12.3411H10.6056C11.6407 12.3411 12.6081 12.8555 13.187 13.7136L16 17.8836L18.8115 13.7141C19.3904 12.8557 20.3579 12.3411 21.3932 12.3411H27.25L16 29.0206Z',
];

const VERT = /* glsl */`
uniform float uTime, uStage, uGather, uBurst, uSize, uPR, uBlue, uSpin1, uSpin3, uMouseOn;
uniform vec2 uMouse;
attribute vec3 a1, a2, a3, aSc, aCol0, aCol1;
attribute float aSeed, aDim;
varying vec3 vCol;
varying float vA;
float sm(float x) { return smoothstep(0., 1., clamp(x, 0., 1.)); }
vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
vec3 shapeAt(float k) { return k < .5 ? position : k < 1.5 ? rotY(a1, uSpin1) : k < 2.5 ? rotX(a2, uTime * .12) : k < 3.5 ? rotY(a3, uSpin3) : position; }
void main() {
  // staggered morph: at a whole stage every particle sits exactly in its formation; between stages each one leaves on its own delay
  float st = clamp(uStage, 0., 4.);
  float k = min(floor(st), 3.), f = st - k;
  float fi = sm((f - aSeed * .45) / .55);
  vec3 p = mix(shapeAt(k), shapeAt(k + 1.), fi);
  float tr = 4. * fi * (1. - fi);
  float ph = aSeed * 62.83;
  vec3 sw = vec3(sin(ph + uTime * .9), cos(ph * 1.3 + uTime * .7), sin(ph * .7 + uTime * 1.1));
  p += sw * (tr * 1.15 + .012);
  float w1 = (k < .5 ? fi : k < 1.5 ? 1. - fi : 0.);
  float wm = (k < .5 ? 1. - fi : k > 2.5 ? fi : 0.);
  float g = sm(uGather * 1.4 - aSeed * .4);
  p = mix(aSc + sw * .6, p, g);
  p += normalize(sw + vec3(0., 0., .001)) * uBurst * (2.4 + aSeed * 4.5);
  vec4 wp = modelMatrix * vec4(p, 1.);
  vec2 d = wp.xy - uMouse;
  float km = exp(-dot(d, d) * 1.4) * uMouseOn;
  wp.xy += normalize(d + 1e-4) * km * .8;
  wp.z += km * .7;
  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPR * (.5 + aSeed * .95) * (1. + km * 1.6) / -mv.z;
  vec3 c = mix(aCol0, aCol1, w1);
  c = mix(c, vec3(.16, .41, 1.), uBlue);
  vCol = c * mix(1., aDim, wm) * (1. + km * 1.3);
  vA = mix(.22, 1., g) * (1. - uBurst * .25);
}`;
const FRAG = /* glsl */`
varying vec3 vCol;
varying float vA;
void main() {
  float r = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .0, r);
  gl_FragColor = vec4(vCol, a * a * vA);
}`;

function markSamples(n: number) {
  const S = 512, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d', { willReadFrequently: true })!;
  const k = S / 44.66;
  const draw = (dx: number, color: string) => {
    ctx.save(); ctx.scale(k, k); ctx.translate(1.63 + dx, 6.32); ctx.fillStyle = color;
    for (const d of MARK_V) ctx.fill(new Path2D(d));
    ctx.restore();
  };
  draw(0, '#f00');
  draw(9.4, '#0f0');
  const data = ctx.getImageData(0, 0, S, S).data;
  const left: number[] = [], right: number[] = [];
  for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) {
    const i = (y * S + x) * 4;
    if (data[i + 1] > 128) right.push(x, y); else if (data[i] > 128) left.push(x, y);
  }
  const out = new Float32Array(n * 3), dim = new Float32Array(n);
  // mark centre in canvas px: x 4.75..36.65, y 3..29 in viewBox units
  const cx = (20.7 + 1.63) * k, cy = (16 + 6.32) * k, sc = 6.6 / (31.9 * k);
  for (let i = 0; i < n; i++) {
    const isL = i % 5 < 2 && left.length, src = isL ? left : right, j = Math.floor(Math.random() * (src.length / 2)) * 2;
    out[i * 3] = (src[j] + Math.random() * 2 - cx) * sc;
    out[i * 3 + 1] = -(src[j + 1] + Math.random() * 2 - cy) * sc;
    out[i * 3 + 2] = (Math.random() - .5) * .32 + (isL ? -.3 : 0);
    dim[i] = isL ? .5 : 1;
  }
  return { pos: out, dim };
}

const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

export function mount(o: SceneOpts): SceneHandle {
  const gl2 = o.canvas.getContext('webgl2', { antialias: false, alpha: true, powerPreference: 'high-performance' });
  if (!gl2) throw new Error('webgl2 unavailable');
  const small = matchMedia('(max-width: 720px), (pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  let N = small ? 9000 : cores >= 8 ? 26000 : 16000;
  let dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 1.6);

  const renderer = new WebGLRenderer({ canvas: o.canvas, context: gl2, antialias: false, alpha: true });
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.debug.checkShaderErrors = import.meta.env.DEV;
  renderer.setPixelRatio(dpr);
  const scene = new Scene();
  const cards = o.cards?.length ? cardViews(renderer, o.cards, o.locale ?? 'en', o.reduced) : null;
  const camera = new PerspectiveCamera(40, 1, .1, 100);
  camera.position.set(0, 0, 11);

  // ---------------- formations ----------------
  const mark = markSamples(N);
  const a1 = new Float32Array(N * 3), a2 = new Float32Array(N * 3), a3 = new Float32Array(N * 3), sc = new Float32Array(N * 3);
  const c0 = new Float32Array(N * 3), c1 = new Float32Array(N * 3), seed = new Float32Array(N);
  const agentCols = o.agentColors.map((h) => new Color(h));
  const cobalt = new Color('#2969ff'), mist = new Color('#c9d6ff');

  // product constellation: dtwin in the middle, the other clusters on a tilted ring, products around each cluster
  const centers: Vector3[] = [], prodPos: { p: Vector3; c: Color; big: boolean }[] = [];
  const rest = o.clusters.length - 1;
  o.clusters.forEach((cl, ci) => {
    const col = new Color(cl.color);
    const c = ci === 0 ? new Vector3() : new Vector3(Math.cos((ci - 1) / rest * Math.PI * 2) * 3.3, Math.sin((ci - 1) / rest * Math.PI * 2) * 1.25, Math.sin((ci - 1) / rest * Math.PI * 2) * 2.6);
    centers.push(c);
    for (let k = 0; k < cl.products; k++) {
      const ang = (k / cl.products) * Math.PI * 2 + ci;
      const off = cl.products === 1 ? new Vector3() : new Vector3(Math.cos(ang) * .62, Math.sin(ang) * .62, Math.sin(ang * 1.7) * .3);
      prodPos.push({ p: c.clone().add(off), c: col, big: ci === 0 });
    }
  });
  const totalW = prodPos.reduce((s, q) => s + (q.big ? 3 : 1), 0);

  for (let i = 0; i < N; i++) {
    const r = Math.random();
    seed[i] = r;
    // 1 · constellation (78% in product spheres, 22% along the links)
    let pc: Color;
    if (i % 100 < 78) {
      let pick = Math.random() * totalW, q = prodPos[0];
      for (const it of prodPos) { pick -= it.big ? 3 : 1; if (pick <= 0) { q = it; break; } }
      const rad = q.big ? .5 : .26;
      a1[i * 3] = q.p.x + gauss() * rad; a1[i * 3 + 1] = q.p.y + gauss() * rad; a1[i * 3 + 2] = q.p.z + gauss() * rad;
      pc = q.c;
    } else {
      const q = prodPos[Math.floor(Math.random() * prodPos.length)], t = Math.random();
      const from = q.big ? new Vector3() : centers[o.clusters.findIndex((cl) => new Color(cl.color).equals(q.c))] ?? new Vector3();
      const hub = from.lengthSq() ? (Math.random() < .5 ? new Vector3() : from) : from;
      a1[i * 3] = hub.x + (q.p.x - hub.x) * t + gauss() * .03; a1[i * 3 + 1] = hub.y + (q.p.y - hub.y) * t + gauss() * .03; a1[i * 3 + 2] = hub.z + (q.p.z - hub.z) * t + gauss() * .03;
      pc = mist;
    }
    c1[i * 3] = pc.r; c1[i * 3 + 1] = pc.g; c1[i * 3 + 2] = pc.b;
    // 2 · helix along x: two strands and rungs
    const u = Math.random();
    if (i % 7 === 0) {
      const k = Math.floor(u * 46) / 46, ang = k * Math.PI * 2 * 3.4, t = Math.random();
      const y0 = Math.cos(ang) * 1.15, z0 = Math.sin(ang) * 1.15;
      a2[i * 3] = (k - .5) * 13; a2[i * 3 + 1] = y0 * (1 - 2 * t); a2[i * 3 + 2] = z0 * (1 - 2 * t);
    } else {
      const ang = u * Math.PI * 2 * 3.4 + (i % 2) * Math.PI;
      a2[i * 3] = (u - .5) * 13 + gauss() * .03; a2[i * 3 + 1] = Math.cos(ang) * 1.15 + gauss() * .05; a2[i * 3 + 2] = Math.sin(ang) * 1.15 + gauss() * .05;
    }
    // 3 · sphere shell (fibonacci) with a faint core
    if (i % 10 === 0) {
      const v = new Vector3(gauss(), gauss(), gauss()).normalize().multiplyScalar(Math.random() * 1.4);
      a3[i * 3] = v.x; a3[i * 3 + 1] = v.y; a3[i * 3 + 2] = v.z;
    } else {
      const y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.399963, R = 2.7 + gauss() * .06;
      a3[i * 3] = Math.cos(th) * rr * R; a3[i * 3 + 1] = y * R; a3[i * 3 + 2] = Math.sin(th) * rr * R;
    }
    // scatter: a wide shell the swarm gathers from
    const v = new Vector3(gauss(), gauss(), gauss()).normalize().multiplyScalar(9 + Math.random() * 7);
    sc[i * 3] = v.x; sc[i * 3 + 1] = v.y * .7; sc[i * 3 + 2] = v.z - 4;
    // agent colour: mostly cobalt and mist, one in six takes an agent's colour
    const ac = i % 9 === 0 ? agentCols[i % agentCols.length] : (r < .55 ? cobalt : mist);
    c0[i * 3] = ac.r; c0[i * 3 + 1] = ac.g; c0[i * 3 + 2] = ac.b;
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(mark.pos, 3));
  geo.setAttribute('a1', new BufferAttribute(a1, 3));
  geo.setAttribute('a2', new BufferAttribute(a2, 3));
  geo.setAttribute('a3', new BufferAttribute(a3, 3));
  geo.setAttribute('aSc', new BufferAttribute(sc, 3));
  geo.setAttribute('aCol0', new BufferAttribute(c0, 3));
  geo.setAttribute('aCol1', new BufferAttribute(c1, 3));
  geo.setAttribute('aSeed', new BufferAttribute(seed, 1));
  geo.setAttribute('aDim', new BufferAttribute(mark.dim, 1));

  const U = {
    uTime: { value: 0 }, uStage: { value: 0 }, uGather: { value: o.reduced ? 1 : 0 }, uBurst: { value: 0 },
    uSize: { value: small ? 34 : 30 }, uPR: { value: dpr }, uBlue: { value: 0 }, uSpin1: { value: 0 }, uSpin3: { value: 0 },
    uMouse: { value: { x: 99, y: 99 } }, uMouseOn: { value: 0 },
  };
  const mat = new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, transparent: true, depthWrite: false, blending: AdditiveBlending });
  const pts = new Points(geo, mat);
  pts.frustumCulled = false;
  scene.add(pts);

  // per-formation placement: [x, y, scale] (desktop keeps the hero mark to the right of the text)
  const PLACE = small
    ? [[0, 2.75, .42], [0, .2, .66], [0, 0, .58], [0, .2, .78], [0, 1.2, .62]]
    : [[2.85, .1, 1], [.4, 0, 1.08], [0, -.2, 1], [3.1, 0, 1], [0, .55, .95]];

  // ---------------- state ----------------
  let stageTarget = 0, stage = 0, gatherTarget = U.uGather.value, gatherSpeed = .6, burst = 0, blue = 0, blueT = 0;
  const mouse = { x: 0, y: 0, on: false, wx: 99, wy: 99 };
  let w = 0, h = 0, raf = 0, last = performance.now(), slow = 0, frames = 0, visible = true, onScreen = true;

  const resize = () => {
    w = innerWidth; h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < .8 ? 52 : 40;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize', resize, { passive: true });
  const onVis = () => { visible = !document.hidden; if (visible && !raf && !o.reduced) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  document.addEventListener('visibilitychange', onVis);
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onVis(); });
  io.observe(o.canvas);

  const place = () => {
    const s = Math.min(Math.max(stage, 0), 4), i = Math.floor(s), f = s - i, a = PLACE[i], b = PLACE[Math.min(i + 1, 4)];
    const e = f * f * (3 - 2 * f);
    pts.position.set(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, 0);
    pts.scale.setScalar(a[2] + (b[2] - a[2]) * e);
  };

  const frame = (dt: number, t: number) => {
    const k = 1 - Math.exp(-dt * 2.2);
    stage += (stageTarget - stage) * k;
    U.uStage.value = stage;
    const g = U.uGather.value;
    U.uGather.value = g + Math.sign(gatherTarget - g) * Math.min(Math.abs(gatherTarget - g), dt * gatherSpeed);
    burst += (0 - burst) * (1 - Math.exp(-dt * 1.6));
    U.uBurst.value = burst;
    blue += (blueT - blue) * (1 - Math.exp(-dt * 4));
    U.uBlue.value = blue;
    U.uTime.value = t;
    const w1 = Math.max(0, 1 - Math.abs(stage - 1)), w3 = Math.max(0, 1 - Math.abs(stage - 3));
    U.uSpin1.value += dt * (.1 + .25 * w1);
    U.uSpin3.value += dt * (.08 + .2 * w3);
    place();
    // camera drifts with the mouse; the mark gently sways
    const tx = mouse.on ? mouse.x * .45 : Math.sin(t * .2) * .25, ty = mouse.on ? mouse.y * .3 : Math.cos(t * .17) * .15;
    camera.position.x += (tx - camera.position.x) * (1 - Math.exp(-dt * 2));
    camera.position.y += (ty - camera.position.y) * (1 - Math.exp(-dt * 2));
    camera.lookAt(0, 0, 0);
    // pointer on the z = 0 plane
    if (mouse.on) {
      const v = new Vector3(mouse.x, mouse.y, .5).unproject(camera).sub(camera.position).normalize();
      const d = -camera.position.z / v.z;
      mouse.wx = camera.position.x + v.x * d; mouse.wy = camera.position.y + v.y * d;
    }
    U.uMouse.value = { x: mouse.wx, y: mouse.wy };
    U.uMouseOn.value += ((mouse.on ? 1 : 0) - U.uMouseOn.value) * (1 - Math.exp(-dt * 5));
    renderer.render(scene, camera);
    cards?.render(dt || 1 / 60, w, h);
  };

  const loop = (now: number) => {
    raf = 0;
    if (!visible || !onScreen) return;
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    // a frame budget guard: lower the resolution first, then the particle count
    frames++;
    if (dt > .028) slow++;
    if (frames === 120) {
      if (slow > 50) {
        if (dpr > 1) { dpr = 1; renderer.setPixelRatio(1); U.uPR.value = 1; resize(); }
        else if (N > 6000) { N = Math.floor(N * .6); geo.setDrawRange(0, N); }
      }
      frames = 0; slow = 0;
    }
    frame(dt, now / 1000);
    raf = requestAnimationFrame(loop);
  };

  if (o.reduced) { stage = stageTarget; frame(0, 0); } else raf = requestAnimationFrame(loop);

  return {
    setStage(s) { stageTarget = s; if (o.reduced) { stage = s; frame(0, 0); } },
    gather(ms) { gatherTarget = 1; gatherSpeed = ms > 0 ? 1000 / ms : 50; if (o.reduced) { U.uGather.value = 1; frame(0, 0); } },
    scatter() { gatherTarget = 0; gatherSpeed = 2.5; },
    burst() { burst = 1; },
    blueprint(on) { blueT = on ? 1 : 0; if (o.reduced) { blue = blueT; frame(0, 0); } },
    pointer(nx, ny, on) { mouse.x = nx; mouse.y = ny; mouse.on = on; },
    render() { frame(0, performance.now() / 1000); },
    dispose() {
      cancelAnimationFrame(raf); io.disconnect();
      removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onVis);
      cards?.dispose(); geo.dispose(); mat.dispose(); renderer.renderLists.dispose(); renderer.forceContextLoss(); renderer.dispose();
    },
  };
}
