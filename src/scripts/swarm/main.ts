/* /swarm entry: starts the cursor swarm (engine.ts), lazy-loads the 3D swarm (scene.ts), wires the HUD and keys. */
import { Swarm } from './engine';
import type { SceneHandle } from './scene';

interface Cfg {
  verbs: Record<string, string>;
  you: string;
  locale: string;
  clusters: { color: string; products: number }[];
  agentColors: string[];
}

const root = document.getElementById('sw');
const html = document.documentElement;
if (root) {
  const cfg = JSON.parse(root.dataset.cfg || '{}') as Cfg;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const swarmOn = html.classList.contains('sw-on');
  let scene: SceneHandle | null = null;
  let meshPending = 0;

  /* ---------------- 3D ---------------- */
  const canvas = document.querySelector<HTMLCanvasElement>('[data-sw-canvas]');
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const glOk = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
  if (canvas && glOk && !saveData) {
    import('./scene').then(({ mount }) => {
      try {
        scene = mount({ canvas, clusters: cfg.clusters, agentColors: cfg.agentColors, reduced });
        canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); html.classList.add('sw-nogl'); }, { once: true });
        html.classList.add('sw-gl');
        if (!swarmOn || meshPending) scene.gather(swarmOn ? meshPending : 0);
        onScroll();
      } catch { html.classList.add('sw-nogl'); }
    }).catch(() => html.classList.add('sw-nogl'));
  } else html.classList.add('sw-nogl');

  /* scroll → formation: interpolate between the centres of [data-stage] sections */
  const stages = [...document.querySelectorAll<HTMLElement>('[data-stage]')];
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (!scene) return;
      const mid = innerHeight / 2;
      const pts = stages.map((s) => { const r = s.getBoundingClientRect(); return { c: r.top + r.height / 2, v: Number(s.dataset.stage) }; });
      let v = pts[0]?.v ?? 0;
      if (pts.length && mid >= pts[pts.length - 1].c) v = pts[pts.length - 1].v;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        if (mid >= a.c && mid < b.c) { v = a.v + (b.v - a.v) * ((mid - a.c) / (b.c - a.c)); break; }
      }
      scene.setStage(v);
      bar?.style.setProperty('--p', String(Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))));
    });
  };
  const bar = document.querySelector<HTMLElement>('[data-sw-bar]');
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !scene) return;
    scene.pointer((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1, true);
  }, { passive: true });
  html.addEventListener('pointerleave', () => scene?.pointer(0, 0, false));

  /* ---------------- swarm ---------------- */
  const hudA = document.querySelector('[data-sw-agents]');
  const hudT = document.querySelector('[data-sw-tasks]');
  const hudP = document.querySelector<HTMLElement>('[data-sw-meter]');
  let sw: Swarm | null = null;
  if (swarmOn) {
    sw = new Swarm({
      verbs: cfg.verbs as never,
      you: cfg.you,
      locale: cfg.locale,
      onMesh: (ms) => {
        if (ms < 0) { meshPending = 0; scene?.scatter(); return; }
        if (ms === 0 && meshPending > 1) return; // the swarm is already gathering
        meshPending = ms || 1;
        scene?.gather(ms);
      },
      onBurst: () => scene?.burst(),
      onProgress: (d, t) => {
        if (hudT) hudT.textContent = `${d}/${t}`;
        hudP?.style.setProperty('--p', String(t ? d / t : 1));
        html.classList.toggle('sw-done', d === t);
      },
    });
    (window as Window & { __swReady?: boolean }).__swReady = true;
    sw.start();
    if (hudA) hudA.textContent = String(sw.agentCount);
  } else {
    html.classList.add('sw-done');
  }

  /* ---------------- controls ---------------- */
  const speeds = [1, 2, .5];
  let si = 0;
  const act = (name: string, el?: HTMLElement) => {
    switch (name) {
      case 'rebuild':
        if (!sw) { location.search = ''; return; }
        if (scrollY > innerHeight * .5) scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => sw?.rebuild(), scrollY > innerHeight * .5 ? 650 : 0);
        break;
      case 'wreck': sw?.wreck(); break;
      case 'skip': sw?.skip(); scene?.gather(0); break;
      case 'speed': {
        si = (si + 1) % speeds.length;
        sw?.setSpeed(speeds[si]);
        document.querySelectorAll('[data-act="speed"] [data-v]').forEach((v) => { v.textContent = `${speeds[si]}×`; });
        break;
      }
      case 'log': {
        const on = html.classList.toggle('sw-log-on');
        document.querySelectorAll('[data-act="log"]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
        break;
      }
      case 'bp': {
        const on = html.classList.toggle('sw-bp');
        scene?.blueprint(on);
        document.querySelectorAll('[data-act="bp"]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
        break;
      }
    }
    el?.blur?.();
  };
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!b) return;
    e.preventDefault();
    act(b.dataset.act!, b);
  });
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (t.closest('input,textarea,select,[contenteditable]')) return;
    const k = e.key.toLowerCase();
    const map: Record<string, string> = { r: 'rebuild', w: 'wreck', b: 'bp', l: 'log', escape: 'skip' };
    if (map[k]) { act(map[k]); }
  });

  /* card tilt and light follow the mouse (transform only) */
  document.querySelectorAll<HTMLElement>('.sw-card').forEach((c) => {
    c.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || reduced) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--rx', `${(.5 - y) * 7}deg`);
      c.style.setProperty('--ry', `${(x - .5) * 9}deg`);
      c.style.setProperty('--mx', `${x * 100}%`);
      c.style.setProperty('--my', `${y * 100}%`);
    });
    c.addEventListener('pointerleave', () => { c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); });
  });
}
