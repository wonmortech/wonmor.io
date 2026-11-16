/* /swarm product cards: one small three.js scene per product, drawn by the page's single WebGL renderer into each
   card's 3D area with a scissor rectangle. Every scene shows what the product does and its strongest point, so a
   card that used to be a screenshot of text now explains itself. Only cards on screen and already built render. */
import {
  BoxGeometry, CanvasTexture, CapsuleGeometry, CatmullRomCurve3, Color, CustomBlending, CylinderGeometry, DirectionalLight, DoubleSide, Group,
  HemisphereLight, IcosahedronGeometry, InstancedMesh, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  Object3D, OneMinusSrcAlphaFactor, OneFactor, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, RingGeometry, Scene, ShaderMaterial,
  SphereGeometry, SrcAlphaFactor, SRGBColorSpace, Sprite, SpriteMaterial, TorusGeometry, TorusKnotGeometry, TubeGeometry, Vector2, Vector3,
  AdditiveBlending, BufferAttribute, BufferGeometry, type ColorRepresentation, type Material, type WebGLRenderer,
} from 'three';

type Lc = 'en' | 'uz' | 'ru';
const W = {
  personal: { en: 'personal chats', uz: 'shaxsiy chatlar', ru: 'личные чаты' },
  company: { en: 'company server', uz: 'kompaniya serveri', ru: 'сервер компании' },
  revoke: { en: 'access revoked', uz: 'ruxsat olindi', ru: 'доступ отозван' },
  blocked: { en: 'blocked', uz: 'taqiqlangan', ru: 'запрещено' },
  size: { en: 'your size', uz: 'sizning oʻlcham', ru: 'ваш размер' },
  raw: { en: 'raw scans', uz: 'xom skanlar', ru: 'сырые сканы' },
  figures: { en: 'figures', uz: 'hisob', ru: 'итоги' },
  kitchen: { en: 'kitchen', uz: 'oshxona', ru: 'кухня' },
  courier: { en: 'courier', uz: 'kuryer', ru: 'курьер' },
  door: { en: 'door', uz: 'eshik', ru: 'дверь' },
  months: { en: '12 months', uz: '12 oy', ru: '12 месяцев' },
  kept: { en: 'English kept', uz: 'inglizcha tegilmaydi', ru: 'английский не трогаем' },
  live: { en: 'live', uz: 'jonli', ru: 'вживую' },
} satisfies Record<string, Record<Lc, string>>;

interface Kit {
  s: Scene; cam: PerspectiveCamera; g: Group; acc: Color; L: Lc;
  std(c: ColorRepresentation, o?: { e?: number; op?: number; wire?: boolean; metal?: number; rough?: number }): MeshStandardMaterial;
  glow(c: ColorRepresentation, op?: number): MeshBasicMaterial;
  text(t: string, o?: { c?: string; h?: number; bg?: string; serif?: boolean }): Sprite;
  w(k: keyof typeof W): string;
}
type Tick = (t: number, dt: number, hov: number) => void;
type Build = (k: Kit) => Tick;

const sm = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
let dotTex: CanvasTexture | null = null;
/** A soft round sprite for Points, so particles are dots and not squares. */
const dot = () => {
  if (dotTex) return dotTex;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const x = cv.getContext('2d')!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return (dotTex = new CanvasTexture(cv));
};
const fr = (x: number) => x - Math.floor(x);

/* ---------------- the sixteen scenes ---------------- */
const SCENES: Record<string, Build> = {
  // a day that runs from Maghrib to Maghrib, the sun passing five prayer anchors that hold the tasks
  dtwin(k) {
    const g = new Group(); g.rotation.x = -.42; k.g.add(g);
    g.add(new Mesh(new TorusGeometry(2.05, .022, 8, 180), k.glow(k.acc, .85)));
    g.add(new Mesh(new PlaneGeometry(5.6, .012), k.glow('#ffffff', .18)));
    const names = ['Maghrib', 'Isha', 'Fajr', 'Dhuhr', 'Asr'];
    const angs = [Math.PI, Math.PI + .5, Math.PI * 2 - .38, Math.PI * 2.5 + .08, Math.PI * 2.5 + .78];
    const beads = angs.map((a, i) => {
      const b = new Mesh(new SphereGeometry(.13, 20, 14), k.std(k.acc, { e: .5 }));
      b.position.set(Math.cos(a) * 2.05, Math.sin(a) * 2.05, 0); g.add(b);
      const l = k.text(names[i], { h: .26, c: '#f3e6c4' }); l.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.5, 0); g.add(l);
      return b;
    });
    const tasks = Array.from({ length: 12 }, (_, i) => {
      const m = new Mesh(new BoxGeometry(.16, .16, .16), k.std(['#ffffff', '#9fd0ff', '#ffd27a'][i % 3], { e: .25 }));
      g.add(m); return { m, b: i % 5, ph: i * 1.7 };
    });
    const sun = new Mesh(new SphereGeometry(.24, 24, 16), k.glow('#fff1c9')); g.add(sun);
    const halo = new Mesh(new SphereGeometry(.45, 20, 14), k.glow(k.acc, .22)); sun.add(halo);
    const c = k.text('Maghrib → Maghrib', { h: .3, c: '#d9c39a' }); c.position.set(0, -.15, 0); g.add(c);
    return (t) => {
      const a = Math.PI + fr(t * .06) * Math.PI * 2;
      sun.position.set(Math.cos(a) * 2.05, Math.sin(a) * 2.05, .02);
      beads.forEach((b, i) => {
        const d = Math.abs(Math.atan2(Math.sin(a - angs[i]), Math.cos(a - angs[i])));
        b.scale.setScalar(1 + Math.max(0, 1 - d * 3) * 1.1);
      });
      for (const q of tasks) {
        const b = beads[q.b].position, o = q.ph + t * .9;
        q.m.position.set(b.x * .78 + Math.cos(o) * .3, b.y * .78 + Math.sin(o) * .3, Math.sin(o * 1.3) * .2);
        q.m.rotation.set(o, o * .7, 0);
      }
      halo.scale.setScalar(1 + Math.sin(t * 3) * .08);
    };
  },

  // split-flap tiles flip old Latin to the 2026 alphabet; the English tile does not move
  bitg(k) {
    const g = new Group(); k.g.add(g);
    const pairs: [string, string][] = [['sh', 'ş'], ['ch', 'ç'], ['gʻ', 'ğ'], ['oʻ', 'ö'], ['API', 'API']];
    const face = (s: string, bg: string, fg: string, flip: boolean) => {
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 300;
      const x = cv.getContext('2d')!;
      if (flip) { x.translate(256, 300); x.rotate(Math.PI); }
      x.fillStyle = bg; x.beginPath(); x.roundRect(6, 6, 244, 288, 26); x.fill();
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(6, 148, 244, 4);
      x.fillStyle = fg; x.font = `600 ${s.length > 2 ? 92 : 150}px Georgia, serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(s, 128, 158);
      const tx = new CanvasTexture(cv); tx.colorSpace = SRGBColorSpace; tx.anisotropy = 4; return tx;
    };
    const side = k.std('#1a1f2e');
    const tiles = pairs.map(([a, b], i) => {
      const en = i === 4;
      const mats = [side, side, side, side,
        new MeshStandardMaterial({ map: face(a, '#161b2b', '#e8ecf8', false), roughness: .5 }),
        new MeshStandardMaterial({ map: face(b, en ? '#1d3b2a' : '#c7d6a8', en ? '#8ef0b0' : '#16200d', true), roughness: .5 })];
      const m = new Mesh(new BoxGeometry(.92, 1.08, .14), mats);
      m.position.set((i - 2) * 1.08, .25, 0); g.add(m); return m;
    });
    const kept = k.text(k.w('kept'), { h: .2, c: '#8ef0b0' }); kept.position.set(2.16, -.62, 0); g.add(kept);
    const word = k.text('oʻzbekcha → özbekça', { h: .32, c: '#d6e3b8', serif: true }); word.position.set(0, -1.25, 0); g.add(word);
    return (t) => {
      const cyc = fr(t / 6.5) * 6.5;
      tiles.forEach((m, i) => {
        if (i === 4) { m.rotation.y = Math.sin(t * 1.4) * .12; return; }
        const on = sm((cyc - .5 - i * .28) / .45) - sm((cyc - 4.4 - i * .2) / .45);
        m.rotation.x = on * Math.PI;
        m.position.z = Math.sin(on * Math.PI) * .35;
      });
      g.rotation.y = Math.sin(t * .35) * .18;
    };
  },

  // personal chats stay on Telegram; one revoke pulls every company folder back to the company server
  teletwin(k) {
    const g = new Group(); g.rotation.set(.5, -.5, 0); g.position.y = -.1; k.g.add(g);
    const top = new Mesh(new BoxGeometry(4.2, .05, 2.2), k.std('#2aa3ff', { op: .3, e: .25 })); top.position.y = .95; g.add(top);
    const bot = new Mesh(new BoxGeometry(4.2, .05, 2.2), k.std(k.acc, { op: .35, e: .2 })); bot.position.y = -.65; g.add(bot);
    const bubbles = Array.from({ length: 7 }, (_, i) => {
      const m = new Mesh(new CapsuleGeometry(.1, .42, 4, 10), k.std(i % 2 ? '#e8f4ff' : '#2aa3ff', { e: .35 }));
      m.rotation.z = Math.PI / 2; m.position.set(-1.6 + (i % 4) * 1.05, 1.15, -.6 + Math.floor(i / 4) * .9); g.add(m); return m;
    });
    const server = new Mesh(new BoxGeometry(.6, 1.9, .7), k.std('#121726', { metal: .4 })); server.position.set(2.75, -.2, -.2); g.add(server);
    for (let i = 0; i < 6; i++) { const l = new Mesh(new BoxGeometry(.4, .03, .02), k.glow('#6ef0a0')); l.position.set(2.75, -.95 + i * .3, .16); g.add(l); }
    const home = new Vector3(2.75, .2, -.2);
    const folders = Array.from({ length: 6 }, (_, i) => {
      const m = new Mesh(new BoxGeometry(.5, .32, .38), k.std('#f0c674', { e: .15 }));
      const p = new Vector3(-1.5 + (i % 3) * 1.15, -.42, -.45 + Math.floor(i / 3) * .9); m.position.copy(p); g.add(m); return { m, p };
    });
    const pulse = new Mesh(new RingGeometry(.2, .26, 48), k.glow('#ff5d6c', .9)); pulse.rotation.x = -Math.PI / 2; pulse.position.y = -.6; g.add(pulse);
    const l1 = k.text(`Telegram · ${k.w('personal')}`, { h: .22, c: '#9fd6ff' }); l1.position.set(-1.1, 1.6, 0); g.add(l1);
    const l2 = k.text(k.w('company'), { h: .2, c: '#cfe0f0' }); l2.position.set(2.75, 1.1, -.2); g.add(l2);
    const l3 = k.text(k.w('revoke'), { h: .24, c: '#fff', bg: '#ff5d6c' }); l3.position.set(-.3, -1.35, .4); g.add(l3);
    return (t) => {
      const c = fr(t / 7) * 7;
      bubbles.forEach((b, i) => { b.position.y = 1.18 + Math.sin(t * 2 + i) * .07; });
      const go = sm((c - 3.6) / 1.1), back = sm((c - 5.7) / .9), f = go * (1 - back);
      folders.forEach(({ m, p }, i) => {
        const e = sm(f * 1.3 - i * .05);
        m.position.lerpVectors(p, home, e); m.scale.setScalar(Math.max(.01, 1 - e * .75));
      });
      const pp = c > 3.4 && c < 5 ? (c - 3.4) / 1.6 : 0;
      pulse.scale.setScalar(1 + pp * 14); (pulse.material as MeshBasicMaterial).opacity = pp ? (1 - pp) * .9 : 0;
      l3.material.opacity = c > 3.5 && c < 5.8 ? 1 : 0;
    };
  },

  // agents pass one gate: each gets its own token check, personal data is masked, refused calls bounce
  gateway(k) {
    const g = new Group(); g.rotation.y = -.35; k.g.add(g);
    const gate = new Mesh(new TorusGeometry(1.15, .07, 12, 80), k.std(k.acc, { e: .9 })); gate.rotation.y = Math.PI / 2; g.add(gate);
    const inner = new Mesh(new TorusGeometry(.9, .015, 6, 80), k.glow('#8fb0ff', .7)); inner.rotation.y = Math.PI / 2; g.add(inner);
    const dbs = [-1.1, 0, 1.1].map((y) => { const m = new Mesh(new CylinderGeometry(.34, .34, .5, 28), k.std('#1f2a44', { e: .1, metal: .3 })); m.position.set(3.1, y, 0); g.add(m); return m; });
    const cols = ['#2969ff', '#ff6b3d', '#34d399', '#ffb020', '#ff4fa3', '#22d3ee'];
    const agents = Array.from({ length: 16 }, (_, i) => {
      const m = new Mesh(new BoxGeometry(.2, .2, .2), k.std(cols[i % cols.length], { e: .5 }));
      g.add(m); return { m, ph: i / 16, y: ((i * 7) % 5 - 2) * .32, z: ((i * 3) % 4 - 1.5) * .3, bad: i % 5 === 2, c: new Color(cols[i % cols.length]) };
    });
    const grey = new Color('#8c93a8'), red = new Color('#ff4d5e');
    const l1 = k.text('token · allow-list · rate', { h: .2, c: '#c8d6ff' }); l1.position.set(-2.1, 1.65, 0); g.add(l1);
    const l2 = k.text('PII → ***', { h: .28, c: '#e8ecff', bg: '#26324f' }); l2.position.set(2.2, 1.75, 0); g.add(l2);
    const l3 = k.text('audit ✓', { h: .2, c: '#7ff0b0' }); l3.position.set(0, -1.65, 0); g.add(l3);
    return (t) => {
      gate.rotation.x = t * .5; inner.rotation.x = -t * .8;
      for (const a of agents) {
        const u = fr(t * .16 + a.ph);
        const mat = a.m.material as MeshStandardMaterial;
        if (a.bad) {
          const x = u < .5 ? -3.6 + u * 2 * 3.3 : -.3 - (u - .5) * 2 * 3.3;
          a.m.position.set(x, a.y, a.z);
          mat.color.copy(u < .5 ? a.c : red); mat.emissive.copy(mat.color);
          a.m.scale.setScalar(1);
        } else {
          const x = -3.6 + u * 6.6;
          a.m.position.set(x, a.y * (x > 2.4 ? .5 : 1), a.z);
          const past = x > 0;
          mat.color.copy(past ? grey : a.c); mat.emissive.copy(mat.color).multiplyScalar(.5);
          a.m.scale.setScalar(past ? .7 : 1);
        }
        a.m.rotation.set(t + a.ph * 9, t * .7, 0);
      }
      dbs.forEach((d, i) => { (d.material as MeshStandardMaterial).emissiveIntensity = .3 + Math.max(0, Math.sin(t * 3 + i * 2)) * .8; });
    };
  },

  // localhost on one side, the public internet on the other, one tube between them
  tunnel(k) {
    const g = new Group(); k.g.add(g);
    const curve = new CatmullRomCurve3([new Vector3(-2.6, -.55, 0), new Vector3(-1.2, .9, .8), new Vector3(.6, -.6, -.6), new Vector3(2.5, .55, 0)]);
    g.add(new Mesh(new TubeGeometry(curve, 120, .2, 14), new MeshBasicMaterial({ color: k.acc, wireframe: true, transparent: true, opacity: .22 })));
    g.add(new Mesh(new TubeGeometry(curve, 120, .035, 8), k.glow('#8fb0ff', .9)));
    const lap = new Group(); lap.position.set(-2.95, -.85, 0); lap.rotation.y = .5; g.add(lap);
    lap.add(new Mesh(new BoxGeometry(1.05, .05, .72), k.std('#2b3146', { metal: .5 })));
    const scr = new Mesh(new BoxGeometry(1.05, .68, .04), k.std('#141a2c', { e: .1 })); scr.position.set(0, .36, -.34); scr.rotation.x = -.18; lap.add(scr);
    const glowScr = new Mesh(new PlaneGeometry(.92, .56), k.glow('#2969ff', .5)); glowScr.position.set(0, .36, -.31); glowScr.rotation.x = -.18; lap.add(glowScr);
    const globe = new Mesh(new IcosahedronGeometry(.8, 2), new MeshBasicMaterial({ color: '#8fd3ff', wireframe: true, transparent: true, opacity: .55 }));
    globe.position.set(2.9, .65, 0); g.add(globe);
    const pk = Array.from({ length: 12 }, (_, i) => { const m = new Mesh(new SphereGeometry(.07, 10, 8), k.glow(i % 3 ? '#ffffff' : '#7ff0b0')); g.add(m); return m; });
    const l1 = k.text('localhost:3000', { h: .22, c: '#c8d6ff' }); l1.position.set(-2.8, -1.45, 0); g.add(l1);
    const l2 = k.text('https://name.tunnel.dtwin.uz', { h: .2, c: '#7ff0b0' }); l2.position.set(1.7, 1.8, 0); g.add(l2);
    const p = new Vector3();
    return (t) => {
      pk.forEach((m, i) => { const u = fr(t * .22 + i / pk.length); curve.getPointAt(i % 2 ? u : 1 - u, p); m.position.copy(p); });
      globe.rotation.y = t * .3; glowScr.material.opacity = .35 + Math.sin(t * 4) * .15;
      g.rotation.y = Math.sin(t * .3) * .15;
    };
  },

  // a reel of captured frames with the bug in it, rewinding to replay it
  fam(k) {
    const g = new Group(); g.rotation.x = .18; k.g.add(g);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 170;
    const x = cv.getContext('2d')!;
    x.fillStyle = '#121626'; x.fillRect(0, 0, 256, 170); x.fillStyle = '#2a3150'; x.fillRect(0, 0, 256, 22);
    x.fillStyle = '#3c4670'; for (let i = 0; i < 5; i++) x.fillRect(18, 40 + i * 22, 100 + ((i * 53) % 110), 9);
    x.fillStyle = '#ebcece'; x.fillRect(150, 40, 86, 60);
    const tx = new CanvasTexture(cv); tx.colorSpace = SRGBColorSpace;
    const reel = new Group(); g.add(reel);
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, bug = i === 3;
      const m = new Mesh(new PlaneGeometry(1.05, .7), new MeshBasicMaterial({ map: tx, side: DoubleSide, color: bug ? '#ff8a8a' : '#ffffff' }));
      m.position.set(Math.sin(a) * 2.3, 0, Math.cos(a) * 2.3); m.rotation.y = a; reel.add(m);
      if (bug) { const r = new Mesh(new RingGeometry(.2, .25, 32), k.glow('#ff4d5e')); r.position.z = .01; m.add(r); }
    }
    const head = new Mesh(new BoxGeometry(.04, 1.3, .04), k.glow('#ffffff', .9)); head.position.z = 2.5; g.add(head);
    const tags = ['console', 'network', 'clicks', 'device'].map((s, i) => { const l = k.text(s, { h: .2, c: '#ebcece', bg: '#2a2030' }); g.add(l); return { l, i }; });
    const rec = k.text('● REC 2:00', { h: .22, c: '#ff6b7a' }); rec.position.set(0, 1.25, 2.3); g.add(rec);
    let rot = 0;
    return (t, dt) => {
      const c = fr(t / 6) * 6;
      rot += dt * (c < 4.6 ? .35 : -2.6); reel.rotation.y = rot;
      rec.material.opacity = c < 4.6 ? (Math.sin(t * 6) > 0 ? 1 : .35) : 1;
      tags.forEach(({ l, i }) => { const a = t * .5 + i * Math.PI / 2; l.position.set(Math.cos(a) * 1.3, -.95 + Math.sin(a * 2) * .12, Math.sin(a) * 1.3); });
    };
  },

  // a 24-hour dial: calls go out only while the hand is inside 09:00–18:00
  operobot(k) {
    const g = new Group(); k.g.add(g);
    const th = (h: number) => Math.PI / 2 - (h / 24) * Math.PI * 2;
    for (let h = 0; h < 24; h++) {
      const m = new Mesh(new BoxGeometry(h % 6 ? .04 : .07, h % 6 ? .16 : .3, .04), k.glow('#ffffff', h % 6 ? .35 : .8));
      m.position.set(Math.cos(th(h)) * 2.05, Math.sin(th(h)) * 2.05, 0); m.rotation.z = th(h) - Math.PI / 2; g.add(m);
    }
    const ok = new Mesh(new TorusGeometry(1.75, .09, 10, 90, (9 / 24) * Math.PI * 2), k.std('#3ee58f', { e: .8 })); ok.rotation.z = th(18); g.add(ok);
    const no = new Mesh(new TorusGeometry(1.75, .03, 6, 120, (15 / 24) * Math.PI * 2), k.glow('#ff4d5e', .45)); no.rotation.z = th(9); g.add(no);
    const hand = new Mesh(new BoxGeometry(.06, 1.6, .06), k.glow('#ffffff')); g.add(hand);
    const phone = new Mesh(new SphereGeometry(.28, 24, 16), k.std('#bcd1ca', { e: .4 })); g.add(phone);
    const rings = Array.from({ length: 3 }, () => { const r = new Mesh(new RingGeometry(.3, .34, 48), k.glow('#3ee58f', .01)); g.add(r); return r; });
    const l9 = k.text('09:00', { h: .24, c: '#7ff0b0' }); l9.position.set(Math.cos(th(9)) * 2.65, Math.sin(th(9)) * 2.55, 0); g.add(l9);
    const l18 = k.text('18:00', { h: .24, c: '#7ff0b0' }); l18.position.set(Math.cos(th(18)) * 2.7, Math.sin(th(18)) * 2.55, 0); g.add(l18);
    const stop = k.text(`× ${k.w('blocked')}`, { h: .24, c: '#fff', bg: '#c4303e' }); stop.position.set(0, -.75, .2); g.add(stop);
    return (t) => {
      const h = fr(t / 12) * 24, a = th(h);
      hand.position.set(Math.cos(a) * .8, Math.sin(a) * .8, .05); hand.rotation.z = a - Math.PI / 2;
      const on = h >= 9 && h < 18;
      (hand.material as MeshBasicMaterial).color.set(on ? '#7ff0b0' : '#ff6b7a');
      rings.forEach((r, i) => {
        const p = fr(t * .9 + i / 3);
        r.scale.setScalar(1 + p * 4); (r.material as MeshBasicMaterial).opacity = on ? (1 - p) * .8 : 0;
      });
      stop.material.opacity = on ? 0 : 1;
      g.rotation.y = Math.sin(t * .4) * .15;
    };
  },

  // three folded sizes on a turntable; the scanner lights up the one that fits the shopper
  shop(k) {
    const g = new Group(); g.rotation.x = .35; g.position.y = -.2; k.g.add(g);
    const base = new Mesh(new CylinderGeometry(2.4, 2.4, .12, 64), k.std('#2a1f1a', { metal: .2 })); base.position.y = -.5; g.add(base);
    const spin = new Group(); g.add(spin);
    const sizes = [['S', .7], ['M', .95], ['L', 1.2]] as const;
    const shirts = sizes.map(([s, w], i) => {
      const grp = new Group(); const a = (i / 3) * Math.PI * 2; grp.position.set(Math.sin(a) * 1.4, 0, Math.cos(a) * 1.4); grp.rotation.y = a; spin.add(grp);
      for (let j = 0; j < 3; j++) { const m = new Mesh(new BoxGeometry(w, .14, w * .75), k.std(['#c47a55', '#e3a17f', '#8f4f33'][j], { e: .05 })); m.position.y = -.36 + j * .15; grp.add(m); }
      const l = k.text(s, { h: .4, c: '#fff', serif: true }); l.position.y = .45; grp.add(l);
      return grp;
    });
    const body = new Mesh(new CapsuleGeometry(.32, 1.1, 6, 16), new MeshBasicMaterial({ color: '#ffd9c2', wireframe: true, transparent: true, opacity: .45 }));
    body.position.set(-2.9, .3, 0); g.add(body);
    const beam = new Mesh(new PlaneGeometry(.06, 2.2), k.glow('#ffd9c2', .7)); beam.position.set(0, .3, 1.2); g.add(beam);
    const yes = k.text(`✓ ${k.w('size')}`, { h: .24, c: '#16200d', bg: '#c7f0a8' }); yes.position.set(0, 1.35, 0); g.add(yes);
    const gl = new Color('#ffd9c2');
    return (t) => {
      spin.rotation.y = t * .5;
      beam.position.x = Math.sin(t * 1.3) * 2.2;
      let shown = false;
      shirts.forEach((s, i) => {
        const front = Math.cos(spin.rotation.y + (i / 3) * Math.PI * 2) > .6;
        const hit = i === 1 && front;
        if (hit) shown = true;
        s.scale.setScalar(hit ? 1.12 : 1);
        s.children.forEach((c) => { if (c instanceof Mesh && c.material instanceof MeshStandardMaterial) c.material.emissive.copy(gl).multiplyScalar(hit ? .35 : 0); });
      });
      yes.material.opacity = shown ? 1 : .15;
    };
  },

  // a year of workouts as a living heatmap
  gym(k) {
    const g = new Group(); g.rotation.set(.75, -.55, 0); k.g.add(g);
    const cols = 26, rows = 7, n = cols * rows;
    const mesh = new InstancedMesh(new BoxGeometry(.18, 1, .18), new MeshStandardMaterial({ roughness: .5 }), n);
    g.add(mesh);
    const seed = Array.from({ length: n }, (_, i) => fr(Math.sin(i * 91.7) * 4375.5));
    const o = new Object3D(), c = new Color(), lo = new Color('#1b2414'), hi = new Color('#b6f07e');
    const lab = k.text(k.w('months'), { h: .26, c: '#cfe8b0' }); lab.position.set(0, -1.15, 1.2); g.add(lab);
    return (t) => {
      for (let i = 0; i < n; i++) {
        const x = Math.floor(i / rows), y = i % rows;
        const wave = .5 + .5 * Math.sin(x * .45 - t * 1.6 + y * .3);
        const v = seed[i] > .25 ? Math.min(1, seed[i] * .7 + wave * .5) : .05;
        o.position.set((x - cols / 2) * .23, v * .45, (y - rows / 2) * .23); o.scale.set(1, .06 + v * .9, 1); o.updateMatrix();
        mesh.setMatrixAt(i, o.matrix); c.copy(lo).lerp(hi, v); mesh.setColorAt(i, c);
      }
      mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      g.rotation.y = -.55 + Math.sin(t * .25) * .2;
    };
  },

  // eleven topics orbiting five specialties around a cross, a heartbeat running underneath
  med(k) {
    const g = new Group(); k.g.add(g);
    const cross = new Group(); g.add(cross);
    const cm = k.std('#ff8fa3', { e: .55 });
    cross.add(new Mesh(new BoxGeometry(.32, 1.1, .32), cm), new Mesh(new BoxGeometry(1.1, .32, .32), cm));
    const per = [3, 2, 2, 2, 2];
    const orbits = per.map((cnt, i) => {
      const o = new Group(); o.rotation.set(i * .7 + .3, i * 1.1, 0); g.add(o);
      o.add(new Mesh(new TorusGeometry(1.25 + i * .22, .008, 4, 100), k.glow('#ffd1db', .35)));
      const sats = Array.from({ length: cnt }, () => { const m = new Mesh(new SphereGeometry(.09, 12, 10), k.std('#ffffff', { e: .6 })); o.add(m); return m; });
      return { r: 1.25 + i * .22, sats, v: .5 + i * .12 };
    });
    const N = 220, pos = new Float32Array(N * 3);
    const ecg = new BufferGeometry(); ecg.setAttribute('position', new BufferAttribute(pos, 3));
    const line = new Line(ecg, new LineBasicMaterial({ color: '#ff6b81', transparent: true, opacity: .9 })); line.position.set(0, -1.75, .5); line.frustumCulled = false; g.add(line);
    const beat = (x: number) => { const p = fr(x); return p < .4 ? Math.sin(p * 30) * .02 : p < .45 ? -(p - .4) * 4 : p < .5 ? (p - .45) * 30 - .2 : p < .56 ? 1.3 - (p - .5) * 30 : p < .65 ? -.5 + (p - .56) * 5.5 : 0; };
    const tag = k.text('ICD-10', { h: .22, c: '#ffd1db', bg: '#3a1f2a' }); tag.position.set(2.2, 1.4, 0); g.add(tag);
    return (t) => {
      cross.rotation.y = t * .6;
      orbits.forEach((q) => q.sats.forEach((m, j) => { const a = t * q.v + (j / q.sats.length) * Math.PI * 2; m.position.set(Math.cos(a) * q.r, Math.sin(a) * q.r, 0); }));
      for (let i = 0; i < N; i++) { const x = (i / (N - 1) - .5) * 6.4; pos[i * 3] = x; pos[i * 3 + 1] = beat(x * .32 - t * .6) * .45; pos[i * 3 + 2] = 0; }
      ecg.attributes.position.needsUpdate = true;
    };
  },

  // an office in miniature: rooms, racks and blinking status lights, camera orbiting
  'faktura-twin'(k) {
    const g = new Group(); k.g.add(g);
    const floor = new Mesh(new BoxGeometry(5.2, .06, 3.4), k.std('#26304c', { e: .15 })); floor.position.y = -.03; g.add(floor);
    const wall = k.std('#5a6a96', { op: .75, e: .2 });
    for (const [x, z, w, d] of [[0, -1.7, 5.2, .06], [-2.6, 0, .06, 3.4], [-.8, 0, .06, 3.4], [1.1, -.4, .06, 2.6], [-1.7, .3, 1.8, .06]] as const) {
      const m = new Mesh(new BoxGeometry(w, .45, d), wall); m.position.set(x, .22, z); g.add(m);
    }
    const racks: Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const m = new Mesh(new BoxGeometry(.32, .95, .5), k.std('#1d2335', { metal: .5 }));
      m.position.set(1.55 + (i % 4) * .42, .48, -1.05 + Math.floor(i / 4) * 1.3); g.add(m); racks.push(m);
    }
    const leds = new InstancedMesh(new BoxGeometry(.05, .03, .02), new MeshBasicMaterial(), racks.length * 6);
    const o = new Object3D(), c = new Color();
    racks.forEach((r, i) => { for (let j = 0; j < 6; j++) { o.position.set(r.position.x - .08 + (j % 2) * .16, .2 + Math.floor(j / 2) * .25, r.position.z + .26); o.updateMatrix(); leds.setMatrixAt(i * 6 + j, o.matrix); } });
    g.add(leds);
    for (let i = 0; i < 6; i++) { const d = new Mesh(new BoxGeometry(.55, .05, .32), k.std('#3a4566')); d.position.set(-2 + (i % 3) * .6, .38, .9 + Math.floor(i / 3) * .5); g.add(d); }
    const hot = racks[5], hm = hot.material as MeshStandardMaterial;
    hm.emissiveIntensity = 1;
    const tag = k.text(`● ${k.w('live')} · SignalR`, { h: .22, c: '#7ff0b0', bg: '#13261d' }); g.add(tag);
    return (t) => {
      const a = t * .16;
      k.cam.position.set(Math.sin(a) * 4.7, 3.1, Math.cos(a) * 4.7); k.cam.lookAt(0, -.3, 0);
      for (let i = 0; i < racks.length * 6; i++) { const v = Math.sin(t * (3 + (i % 5)) + i * 1.3) > .2; leds.setColorAt(i, c.set(i % 7 === 3 ? (v ? '#ffb020' : '#3a2a10') : v ? '#5cf09a' : '#163322')); }
      if (leds.instanceColor) leds.instanceColor.needsUpdate = true;
      hm.emissive.set('#2969ff').multiplyScalar(.25 + Math.max(0, Math.sin(t * 3)) * .6);
      tag.position.set(hot.position.x, 1.35 + Math.sin(t * 2) * .05, hot.position.z);
    };
  },

  // a face scan becomes attendance figures; the raw scan itself is never edited
  attendo(k) {
    const g = new Group(); k.g.add(g);
    const N = 1600, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996;
      const nose = Math.exp(-((Math.cos(a) - 1) ** 2 + (y + .05) ** 2) * 18) * .18;
      pos[i * 3] = Math.sin(a) * r * .82; pos[i * 3 + 1] = y * 1.12; pos[i * 3 + 2] = Math.cos(a) * r * (.85 + nose);
    }
    const hg = new BufferGeometry(); hg.setAttribute('position', new BufferAttribute(pos, 3));
    const head = new Points(hg, new PointsMaterial({ color: '#cfe7e0', map: dot(), size: .07, transparent: true, opacity: .9, depthWrite: false, blending: AdditiveBlending }));
    head.position.x = -1.6; g.add(head);
    const scan = new Mesh(new PlaneGeometry(2.3, .03), k.glow('#5cf0c8')); scan.position.set(-1.6, 0, 1.1); g.add(scan);
    const box = new Mesh(new RingGeometry(1.25, 1.3, 4), k.glow('#5cf0c8', .7)); box.position.set(-1.6, 0, 1); box.rotation.z = Math.PI / 4; box.scale.y = 1.25; g.add(box);
    const bars = Array.from({ length: 5 }, (_, i) => { const m = new Mesh(new BoxGeometry(.32, 1, .32), k.std(i === 3 ? '#ffb020' : '#5cf0c8', { e: .35 })); m.position.set(.9 + i * .48, -1, 0); g.add(m); return m; });
    const dots = Array.from({ length: 8 }, () => { const m = new Mesh(new SphereGeometry(.05, 8, 6), k.glow('#ffffff')); g.add(m); return m; });
    const l1 = k.text(k.w('raw'), { h: .22, c: '#cfe7e0' }); l1.position.set(-1.6, -1.6, 0); g.add(l1);
    const l2 = k.text(k.w('figures'), { h: .22, c: '#cfe7e0' }); l2.position.set(1.85, -1.6, 0); g.add(l2);
    const hts = [.9, 1.3, 1.1, .6, 1.4];
    return (t) => {
      head.rotation.y = Math.sin(t * .6) * .5;
      scan.position.y = Math.sin(t * 1.8) * 1.1;
      const grow = sm(fr(t / 5) * 1.6);
      bars.forEach((b, i) => { const h = .05 + hts[i] * grow; b.scale.y = h; b.position.y = -1.25 + h / 2; });
      dots.forEach((d, i) => { const u = fr(t * .45 + i / dots.length); const tx = .9 + (i % 5) * .48; d.position.set(-1.1 + (tx + 1.1) * u, Math.sin(u * Math.PI) * .9 - .2, .2); });
    };
  },

  // an order travelling from the kitchen to the guest's door, each station lighting up as it passes
  oilaviy(k) {
    const g = new Group(); g.rotation.x = .55; k.g.add(g);
    const curve = new CatmullRomCurve3([new Vector3(-2.7, 0, .4), new Vector3(-1.2, 0, -.8), new Vector3(.3, 0, .6), new Vector3(1.4, 0, -.4), new Vector3(2.7, 0, .3)]);
    g.add(new Mesh(new TubeGeometry(curve, 100, .04, 8), k.glow('#ffcf9e', .6)));
    const st = ([0, .5, 1] as const).map((u, i) => {
      const p = curve.getPointAt(u);
      const m = new Mesh(new CylinderGeometry(.42, .42, .18, 32), k.std('#3a2a20', { e: 1 })); m.position.copy(p); m.position.y = -.1; g.add(m);
      const l = k.text(k.w((['kitchen', 'courier', 'door'] as const)[i]), { h: .24, c: '#ffe2c8' }); l.position.set(p.x, .75, p.z); g.add(l);
      return { m, u };
    });
    const bowl = new Group(); g.add(bowl);
    bowl.add(new Mesh(new SphereGeometry(.28, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), k.std('#c47a55', { e: .2 })));
    const food = new Mesh(new CylinderGeometry(.26, .26, .04, 24), k.std('#ffcf6a', { e: .3 })); food.position.y = -.02; bowl.add(food);
    const steam = Array.from({ length: 5 }, () => { const m = new Mesh(new SphereGeometry(.06, 8, 6), k.glow('#ffffff', .4)); bowl.add(m); return m; });
    const p = new Vector3(), on = new Color('#3ee58f').multiplyScalar(.7), off = new Color('#1c1410');
    return (t) => {
      const u = Math.min(1, fr(t / 6) * 1.15);
      curve.getPointAt(u, p); bowl.position.set(p.x, .3 + Math.abs(Math.sin(t * 6)) * .05, p.z);
      st.forEach((s) => { (s.m.material as MeshStandardMaterial).emissive.copy(u >= s.u - .02 ? on : off); });
      steam.forEach((m, i) => { const q = fr(t * .7 + i / 5); m.position.set(Math.sin(i * 2 + t) * .1, .1 + q * .6, Math.cos(i * 3) * .08); (m.material as MeshBasicMaterial).opacity = (1 - q) * .45; });
    };
  },

  // a shelf of models on turntables, each with its version tag
  'primus-library'(k) {
    const g = new Group(); g.rotation.x = .2; k.g.add(g);
    const geos = [new TorusKnotGeometry(.42, .14, 120, 16), new IcosahedronGeometry(.6, 0), new CapsuleGeometry(.3, .55, 6, 16)];
    const mats = [k.std('#cbcadb', { metal: .6, rough: .25 }), k.std('#8fb0ff', { metal: .3, rough: .4 }), k.std('#f0c674', { metal: .2, rough: .5 })];
    mats[1].flatShading = true;
    const items = geos.map((geo, i) => {
      const x = (i - 1) * 2;
      const plate = new Mesh(new CylinderGeometry(.72, .72, .08, 48), k.std('#232838', { metal: .4 })); plate.position.set(x, -.75, 0); g.add(plate);
      const ring = new Mesh(new TorusGeometry(.74, .012, 4, 80), k.glow('#cbcadb', .6)); ring.rotation.x = Math.PI / 2; ring.position.set(x, -.7, 0); g.add(ring);
      const m = new Mesh(geo, mats[i]); m.position.set(x, .05, 0); g.add(m);
      const l = k.text(`v${7 + i}`, { h: .24, c: '#ffffff', bg: i === 2 ? '#2969ff' : '#2a2f42' }); l.position.set(x, 1.05, 0); g.add(l);
      return m;
    });
    const path = k.text('//studio/assets/hero_v9.glb', { h: .19, c: '#a9adc8' }); path.position.set(0, -1.35, 0); g.add(path);
    return (t) => { items.forEach((m, i) => { m.rotation.y = t * (.6 + i * .15); m.position.y = .05 + Math.sin(t * 1.4 + i) * .06; }); };
  },

  // a dome over warm water, steam rising, ripples spreading
  halvet(k) {
    const g = new Group(); g.rotation.x = .38; g.position.y = -.35; k.g.add(g);
    const pool = new Mesh(new BoxGeometry(4.2, .1, 2.4), k.std('#0f5d68', { e: .25, rough: .15, metal: .2 })); pool.position.y = -.5; g.add(pool);
    const rim = new Mesh(new BoxGeometry(4.5, .08, 2.7), k.std('#d6c19a', { rough: .7 })); rim.position.y = -.56; g.add(rim);
    const dome = new Mesh(new SphereGeometry(1.7, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), new MeshBasicMaterial({ color: '#e8c98a', wireframe: true, transparent: true, opacity: .35 }));
    dome.position.set(0, -.45, -.4); g.add(dome);
    const ripples = Array.from({ length: 3 }, () => { const r = new Mesh(new RingGeometry(.2, .23, 48), k.glow('#bff3ff', .5)); r.rotation.x = -Math.PI / 2; r.position.y = -.44; g.add(r); return r; });
    const N = 260, sp = new Float32Array(N * 3), sd = Array.from({ length: N }, (_, i) => fr(Math.sin(i * 12.9898) * 43758.5));
    const sg = new BufferGeometry(); sg.setAttribute('position', new BufferAttribute(sp, 3));
    const steam = new Points(sg, new PointsMaterial({ color: '#ffffff', map: dot(), size: .34, transparent: true, opacity: .3, depthWrite: false, blending: AdditiveBlending }));
    steam.frustumCulled = false; g.add(steam);
    const lamp = new Mesh(new SphereGeometry(.12, 16, 10), k.glow('#ffd28a')); lamp.position.set(0, 1.15, -.4); g.add(lamp);
    const lh = new Mesh(new SphereGeometry(.4, 16, 10), k.glow('#ffb84d', .18)); lamp.add(lh);
    return (t) => {
      for (let i = 0; i < N; i++) {
        const q = fr(t * (.08 + sd[i] * .1) + sd[i]);
        sp[i * 3] = (sd[i] - .5) * 3.6 + Math.sin(t + i) * .15 * q; sp[i * 3 + 1] = -.4 + q * 2.4; sp[i * 3 + 2] = (fr(sd[i] * 7.3) - .5) * 1.8;
      }
      sg.attributes.position.needsUpdate = true;
      ripples.forEach((r, i) => { const p = fr(t * .35 + i / 3); r.scale.setScalar(1 + p * 7); (r.material as MeshBasicMaterial).opacity = (1 - p) * .55; });
      dome.rotation.y = t * .08;
      lh.scale.setScalar(1 + Math.sin(t * 2.2) * .1);
    };
  },

  // a descent through the layers of a software stack
  xnosir(k) {
    const g = new Group(); g.rotation.set(.42, -.5, 0); k.g.add(g);
    const names = ['design', 'code', 'infra', 'data', 'projects'];
    const cols = ['#8fb0ff', '#6a9bcc', '#22d3ee', '#34d399', '#facc15'];
    const layers = names.map((n, i) => {
      const y = 1.5 - i * .75;
      const m = new Mesh(new BoxGeometry(3, .04, 1.9), k.std(cols[i], { op: .3, e: .2 })); m.position.y = y; g.add(m);
      const e = new Mesh(new BoxGeometry(3.02, .05, 1.92), new MeshBasicMaterial({ color: cols[i], wireframe: true, transparent: true, opacity: .35 })); e.position.y = y; g.add(e);
      const l = k.text(n, { h: .22, c: cols[i] }); l.position.set(-2.05, y, .9); g.add(l);
      return m;
    });
    const orb = new Mesh(new SphereGeometry(.16, 20, 14), k.glow('#ffffff')); g.add(orb);
    const halo = new Mesh(new SphereGeometry(.38, 16, 10), k.glow('#8fb0ff', .25)); orb.add(halo);
    const term = k.text('$ descend --stack', { h: .2, c: '#7ff0b0', bg: '#0c1410' }); term.position.set(1.6, 2.15, 0); g.add(term);
    return (t) => {
      const y = 2.1 - fr(t / 4.5) * 4.6;
      orb.position.set(Math.sin(t * 2) * .3, y, Math.cos(t * 2) * .2);
      layers.forEach((m) => { const d = Math.abs(m.position.y - y); m.material.emissiveIntensity = .2 + Math.max(0, 1 - d * 4) * 1.6; });
    };
  },
};

/* ---------------- shared pieces ---------------- */
const BG_V = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy * 2., .9999, 1.); }`;
const BG_F = /* glsl */`
uniform vec3 uA, uB, uC; uniform vec2 uRes; uniform float uRad;
varying vec2 vUv;
void main() {
  vec2 p = vUv * uRes;
  vec2 q = vec2(min(p.x, uRes.x - p.x), uRes.y - p.y);
  float a = 1.;
  if (q.x < uRad && q.y < uRad) a = 1. - smoothstep(uRad - 1.2, uRad + .4, length(vec2(uRad) - q));
  vec3 col = mix(uB, uA, vUv.y);
  vec2 d = vUv - vec2(.5, .48);
  col += uC * exp(-dot(d, d) * 6.) * .28;
  vec2 g = abs(fract(p / (22. * uRes.y / 300.)) - .5);
  col += smoothstep(.47, .5, max(g.x, g.y)) * .03;
  col *= .82 + .18 * smoothstep(1.1, .2, length(d * vec2(1., 1.4)));
  gl_FragColor = vec4(col, a);
}`;

function textSprite(t: string, o: { c?: string; h?: number; bg?: string; serif?: boolean } = {}) {
  const px = 64, pad = o.bg ? 26 : 8;
  const font = `600 ${px}px ${o.serif ? 'Georgia, serif' : 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'}`;
  const cv = document.createElement('canvas'), x = cv.getContext('2d')!;
  x.font = font;
  const w = Math.ceil(x.measureText(t).width) + pad * 2, h = px + (o.bg ? 30 : 16);
  cv.width = w; cv.height = h;
  x.font = font; x.textBaseline = 'middle'; x.textAlign = 'center';
  if (o.bg) { x.fillStyle = o.bg; x.beginPath(); x.roundRect(0, 0, w, h, h / 2); x.fill(); }
  x.fillStyle = o.c ?? '#ffffff';
  x.fillText(t, w / 2, h / 2 + 3);
  const tx = new CanvasTexture(cv); tx.colorSpace = SRGBColorSpace; tx.anisotropy = 4;
  const s = new Sprite(new SpriteMaterial({ map: tx, transparent: true, depthWrite: false, depthTest: false }));
  const H = o.h ?? .25;
  s.scale.set(H * (w / h), H, 1);
  s.renderOrder = 10;
  return s;
}

interface View {
  el: HTMLElement; s: Scene; cam: PerspectiveCamera; g: Group; tick: Tick; res: Vector2; rad: { value: number };
  t: number; hov: number; hovT: number; mx: number; my: number; off: () => void;
}

export interface CardViews { render(dt: number, W: number, H: number): void; count(): number; dispose(): void }

/** Build a scene for every `[data-p]` element in `els` that has a builder. */
export function cardViews(renderer: WebGLRenderer, els: HTMLElement[], locale: string, reduced: boolean): CardViews {
  const L: Lc = locale.startsWith('uz') ? 'uz' : locale.startsWith('ru') ? 'ru' : 'en';
  const html = document.documentElement;
  const views: View[] = [];
  for (const el of els) {
    const build = SCENES[el.dataset.p ?? ''];
    if (!build) continue;
    const s = new Scene();
    const cam = new PerspectiveCamera(36, 1.6, .1, 60);
    cam.position.set(0, .2, 7.6); cam.lookAt(0, 0, 0);
    const acc = new Color(el.dataset.c || '#2969ff');
    const res = new Vector2(1, 1), rad = { value: 17 };
    const bg = new Mesh(new PlaneGeometry(1, 1), new ShaderMaterial({
      vertexShader: BG_V, fragmentShader: BG_F,
      uniforms: { uA: { value: new Color('#0b0f22').lerp(acc, .1) }, uB: { value: new Color('#04050c') }, uC: { value: acc.clone() }, uRes: { value: res }, uRad: rad },
      depthTest: false, depthWrite: false, transparent: false,
      blending: CustomBlending, blendSrc: SrcAlphaFactor, blendDst: OneMinusSrcAlphaFactor, blendSrcAlpha: OneFactor, blendDstAlpha: OneMinusSrcAlphaFactor,
    }));
    bg.frustumCulled = false; bg.renderOrder = -10; s.add(bg);
    s.add(new HemisphereLight('#c9d8ff', '#120f1c', 1.25));
    const dl = new DirectionalLight('#ffffff', 2); dl.position.set(3, 5, 4); s.add(dl);
    const rim = new DirectionalLight(acc, 1.2); rim.position.set(-4, 1, -3); s.add(rim);
    const g = new Group(); s.add(g);
    const kit: Kit = {
      s, cam, g, acc, L,
      std: (c, o = {}) => new MeshStandardMaterial({
        color: c, emissive: c, emissiveIntensity: o.e ?? 0, roughness: o.rough ?? .45, metalness: o.metal ?? .1,
        transparent: o.op !== undefined, opacity: o.op ?? 1, wireframe: !!o.wire, depthWrite: o.op === undefined,
      }),
      glow: (c, op = 1) => new MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op, depthWrite: op >= 1 }),
      text: textSprite,
      w: (key) => W[key][L],
    };
    let tick: Tick;
    try { tick = build(kit); } catch { continue; }
    const v: View = { el, s, cam, g, tick, res, rad, t: Math.random() * 4, hov: 0, hovT: 0, mx: 0, my: 0, off: () => {} };
    const card = el.closest<HTMLElement>('.sw-card') ?? el;
    const mv = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      v.mx = ((e.clientX - r.left) / r.width) * 2 - 1; v.my = ((e.clientY - r.top) / r.height) * 2 - 1; v.hovT = 1;
    };
    const lv = () => { v.hovT = 0; };
    card.addEventListener('pointermove', mv, { passive: true });
    card.addEventListener('pointerleave', lv);
    v.off = () => { card.removeEventListener('pointermove', mv); card.removeEventListener('pointerleave', lv); };
    views.push(v);
  }

  const rv = (el: HTMLElement) => {
    const x = (el as HTMLElement & { __rv?: number }).__rv;
    return x === undefined ? (html.classList.contains('sw-on') ? 0 : 1) : x;
  };

  return {
    count: () => views.length,
    render(dt, Wd, Hd) {
      const pr = renderer.getPixelRatio();
      let any = false;
      for (const v of views) {
        const r = rv(v.el);
        if (r <= 0) continue;
        const b = v.el.getBoundingClientRect();
        if (b.bottom < 0 || b.top > Hd || b.width < 4 || b.height < 4) continue;
        if (!any) { renderer.setScissorTest(true); any = true; }
        const x = b.left, y = Hd - b.bottom, w = b.width, h = b.height;
        renderer.setViewport(x, y, w, h);
        renderer.setScissor(x, y + h * (1 - r), w, h * r);
        v.cam.aspect = w / h;
        v.cam.fov = w / h < 1.3 ? 46 : 36;
        v.cam.updateProjectionMatrix();
        v.res.set(w * pr, h * pr);
        v.rad.value = 17 * pr;
        v.hov += (v.hovT - v.hov) * (1 - Math.exp(-dt * 6));
        const step = reduced ? 0 : dt * (1 + v.hov * 1.4);
        v.t += step;
        v.g.rotation.y = v.mx * .45 * v.hov;
        v.g.rotation.x = v.my * .25 * v.hov;
        v.g.scale.setScalar(.94 + v.hov * .05);
        v.g.position.set(.15, -.32, 0); // leave the top left to the headline number and the bottom right to the screenshot
        v.tick(reduced ? 2.2 : v.t, step, v.hov);
        renderer.render(v.s, v.cam);
      }
      if (any) { renderer.setScissorTest(false); renderer.setViewport(0, 0, Wd, Hd); }
    },
    dispose() {
      for (const v of views) {
        v.off();
        v.s.traverse((o) => {
          const m = o as Mesh;
          m.geometry?.dispose?.();
          const mats = (Array.isArray(m.material) ? m.material : m.material ? [m.material] : []) as Material[];
          for (const mt of mats) { (mt as MeshBasicMaterial).map?.dispose(); mt.dispose(); }
        });
      }
    },
  };
}
