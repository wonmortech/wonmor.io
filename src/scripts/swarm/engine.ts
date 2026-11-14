/* Swarm Rebuild engine for /swarm.
   Every element with data-b="frame|type|paint|stamp|count|ink|mesh" is a task. Named cursors (agents) pick the
   visible tasks they are skilled at, fly there on soft curved paths and build the element in front of the visitor.
   A task waits for its nearest task ancestor, so frames come before what is inside them. The content is in the
   HTML from the start: the engine only hides it (html.sw-on) and decides when it shows. */

export type Kind = 'frame' | 'type' | 'paint' | 'stamp' | 'count' | 'ink' | 'mesh';
type Verb = Kind | 'join' | 'typo' | 'review' | 'flag' | 'wreck' | 'done';

interface AgentDef { name: string; color: string; skills: Kind[]; critic?: boolean }
const ROSTER: AgentDef[] = [
  { name: 'Atlas', color: '#2969ff', skills: ['frame', 'paint'] },
  { name: 'Quill', color: '#ff6b3d', skills: ['type'] },
  { name: 'Brush', color: '#ff4fa3', skills: ['paint', 'ink'] },
  { name: 'Tally', color: '#34d399', skills: ['count', 'stamp', 'paint'] },
  { name: 'Orbit', color: '#22d3ee', skills: ['mesh', 'paint', 'ink'] },
  { name: 'Mono', color: '#ffb020', skills: ['type'] },
  { name: 'Lint', color: '#f43f5e', skills: ['stamp'], critic: true },
  { name: 'Vera', color: '#8b6cff', skills: ['frame', 'stamp', 'paint'] },
  { name: 'Pixel', color: '#a3e635', skills: ['paint', 'stamp'] },
  { name: 'Lede', color: '#f5d0a9', skills: ['type', 'count', 'paint'] },
  { name: 'Ship', color: '#facc15', skills: ['stamp', 'frame', 'paint'] },
  { name: 'Kern', color: '#60a5fa', skills: ['type', 'paint'] },
];

interface Move { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number; t0: number; dur: number; done?: () => void }
interface Agent extends AgentDef { el: HTMLElement; tag: HTMLElement; x: number; y: number; mv?: Move; busy: boolean; wanderAt: number; mode: string }
interface Task {
  el: HTMLElement; kind: Kind; i: number; parent?: Task; sec?: Sec;
  state: 'pending' | 'active' | 'done'; visible: boolean; seen: number; text?: string; typo?: boolean; to?: number;
}
interface Sec { el: HTMLElement; tasks: Task[]; reviewed: boolean; head?: HTMLElement }
type TEl = HTMLElement & { _t?: Task };

export interface EngineOpts {
  verbs: Record<Verb, string>;
  you: string;
  locale: string;
  onMesh?: (ms: number) => void;
  onBurst?: () => void;
  onProgress?: (done: number, total: number) => void;
}

const ease = (t: number) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const soft = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const ARROW = '<svg viewBox="0 0 20 22" width="20" height="22" aria-hidden="true"><path d="M2 1.6 2 18.4 6.6 14.2 9.7 21 13 19.5 9.9 12.9 16.3 12.6Z" fill="var(--c)" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';

export class Swarm {
  private o: EngineOpts;
  private layer: HTMLElement;
  private logEl: HTMLElement | null;
  private agents: Agent[] = [];
  private tasks: Task[] = [];
  private secs: Sec[] = [];
  private clock = 0;
  private last = 0;
  private timers: { at: number; fn: () => void }[] = [];
  private tweens: { t0: number; dur: number; fn: (p: number) => void; done: () => void }[] = [];
  private speed = 1;
  private skipping = false;
  private started = false;
  private raf = 0;
  private mouse = { x: -1e4, y: -1e4, on: false };
  private youEl: HTMLElement;
  private io: IntersectionObserver;
  private fmt: Intl.NumberFormat;
  private finishedLogged = false;
  private reviewing = false;
  private lastHud = -1e9;

  constructor(o: EngineOpts) {
    this.o = o;
    this.fmt = new Intl.NumberFormat(o.locale);
    this.layer = document.createElement('div');
    this.layer.className = 'sw-layer';
    this.layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.layer);
    this.logEl = document.querySelector('[data-sw-log]');
    this.youEl = this.mk('div', 'sw-you', `<span>${o.you}</span>`);
    this.io = new IntersectionObserver((es) => {
      for (const e of es) {
        const t = (e.target as TEl)._t;
        if (!t) continue;
        t.visible = e.isIntersecting;
        if (t.visible && !t.seen) t.seen = this.clock || 1;
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
  }

  /* ---------------- setup ---------------- */
  start() {
    const mobile = matchMedia('(max-width: 720px), (pointer: coarse)').matches;
    const roster = mobile ? ROSTER.filter((_, i) => [0, 1, 2, 3, 4, 6, 7].includes(i)) : ROSTER;
    const vw = innerWidth, vh = innerHeight, sy = scrollY;
    roster.forEach((d, i) => {
      const el = this.mk('div', 'sw-a', `${ARROW}<b class="sw-a__tag"></b>`);
      el.style.setProperty('--c', d.color);
      const tag = el.querySelector('b') as HTMLElement;
      tag.textContent = d.name;
      // enter from the four edges
      const side = i % 4, k = (i + .5) / roster.length;
      const x = side === 0 ? -40 : side === 1 ? vw + 40 : k * vw;
      const y = side === 2 ? sy - 40 : side === 3 ? sy + vh + 40 : sy + k * vh;
      const a: Agent = { ...d, el, tag, x, y, busy: false, wanderAt: 1e9, mode: '' };
      this.agents.push(a);
      this.place(a);
    });

    this.collect();
    for (const s of document.querySelectorAll<HTMLElement>('[data-sw-sec]')) {
      this.secs.push({ el: s, tasks: this.tasks.filter((t) => s.contains(t.el)), reviewed: false, head: s.querySelector<HTMLElement>('[data-sw-h]') ?? undefined });
    }
    for (const t of this.tasks) t.sec = this.secs.find((s) => s.tasks.includes(t));

    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      this.mouse = { x: e.pageX, y: e.pageY, on: true };
      this.youEl.style.transform = `translate3d(${e.pageX + 14}px,${e.pageY + 20}px,0)`;
      this.youEl.classList.add('is-on');
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { this.mouse.on = false; this.youEl.classList.remove('is-on'); });
    addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('a,button,input,select,textarea')) return;
      this.ping(e.pageX, e.pageY);
    }, { passive: true });

    this.started = true;
    this.agents.forEach((a, i) => this.after(110 * i, () => { this.log(a, 'join'); this.wander(a, 760); }));
    this.last = performance.now();
    const loop = (now: number) => { this.tick(now); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }

  /** Prepare every data-b element: remember its text, split typed text into ghost + live layers. */
  private collect() {
    const els = [...document.querySelectorAll<HTMLElement>('[data-b]')];
    els.forEach((el, i) => {
      const kind = el.dataset.b as Kind;
      const t: Task = { el, kind, i, state: 'pending', visible: false, seen: 0 };
      (el as TEl)._t = t;
      if (kind === 'type') { t.text = el.textContent ?? ''; t.typo = t.text.length > 7 && /^H\d$/.test(el.tagName) && Math.random() < .45; }
      if (kind === 'count') t.to = Number(el.dataset.to ?? 0);
      if (kind === 'stamp') [...el.children].forEach((c, j) => (c as HTMLElement).style.setProperty('--i', String(j)));
      this.tasks.push(t);
      this.prep(t);
      this.io.observe(el);
    });
    for (const t of this.tasks) {
      let p = t.el.parentElement;
      while (p && !(p as TEl)._t) p = p.parentElement;
      t.parent = p ? (p as TEl)._t : undefined;
    }
  }

  private prep(t: Task) {
    const el = t.el;
    el.classList.remove('is-built', 'is-active');
    el.style.clipPath = '';
    if (t.kind === 'type') {
      el.classList.add('sw-tp');
      el.textContent = '';
      const g = document.createElement('span'); g.className = 'sw-gh'; g.textContent = t.text!;
      const l = document.createElement('span'); l.className = 'sw-lv'; l.setAttribute('aria-hidden', 'true');
      l.append(document.createTextNode(''), Object.assign(document.createElement('i'), { className: 'sw-caret' }));
      el.append(g, l);
    }
    if (t.kind === 'count') el.textContent = this.fmt.format(0);
    if (t.kind === 'ink') el.querySelectorAll<SVGElement>('path,line,circle,rect,polyline,ellipse').forEach((p) => { p.style.strokeDashoffset = '1'; });
  }

  private built(t: Task) {
    if (t.state === 'done') return;
    t.state = 'done';
    const el = t.el;
    el.classList.remove('is-active');
    el.classList.add('is-built');
    el.style.clipPath = '';
    if (t.kind === 'type') el.querySelector('.sw-lv')?.remove();
    if (t.kind === 'count') el.textContent = this.fmt.format(t.to!);
    if (t.kind === 'ink') el.querySelectorAll<SVGElement>('path,line,circle,rect,polyline,ellipse').forEach((p) => { p.style.strokeDashoffset = '0'; });
    if (t.kind === 'mesh') this.o.onMesh?.(0);
  }

  /* ---------------- clock ---------------- */
  private wait(ms: number) { return new Promise<void>((r) => this.after(ms, r)); }
  private after(ms: number, fn: () => void) { this.timers.push({ at: this.clock + (this.skipping ? 0 : ms), fn }); }
  private tween(ms: number, fn: (p: number) => void) {
    return new Promise<void>((done) => { fn(0); this.tweens.push({ t0: this.clock, dur: Math.max(1, ms), fn, done }); });
  }

  private turbo() {
    let waiting = 0;
    for (const t of this.tasks) if (t.state === 'pending' && t.visible) waiting++;
    return clamp(waiting / (this.agents.length * 1.6), 1, 2.6);
  }

  private tick(now: number) {
    const raw = Math.min(64, now - this.last);
    this.last = now;
    this.clock += raw * this.speed * (this.skipping ? 1e3 : this.turbo());
    const c = this.clock;
    for (let i = this.timers.length - 1; i >= 0; i--) if (this.timers[i].at <= c) { const f = this.timers[i].fn; this.timers.splice(i, 1); f(); }
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      if (!tw) continue;
      const p = clamp((c - tw.t0) / tw.dur, 0, 1);
      tw.fn(p);
      if (p >= 1) { this.tweens.splice(this.tweens.indexOf(tw), 1); tw.done(); }
    }
    for (const a of this.agents) {
      if (a.mv) {
        const m = a.mv, p = clamp((c - m.t0) / m.dur, 0, 1), e = ease(p), u = 1 - e;
        a.x = u * u * m.x0 + 2 * u * e * m.cx + e * e * m.x1;
        a.y = u * u * m.y0 + 2 * u * e * m.cy + e * e * m.y1;
        if (p >= 1) { a.mv = undefined; m.done?.(); }
      }
      if (!a.busy) this.idle(a);
      this.place(a);
    }
    if (!this.skipping) this.assign();
    this.reviewSections();
    this.progress();
  }

  private place(a: Agent) { a.el.style.transform = `translate3d(${a.x}px,${a.y}px,0)`; }

  /* ---------------- motion ---------------- */
  private move(a: Agent, x: number, y: number, ms?: number) {
    return new Promise<void>((done) => {
      const dx = x - a.x, dy = y - a.y, d = Math.hypot(dx, dy) || 1;
      const dur = ms ?? clamp(d * .95, 380, 1150);
      const bend = rnd(-.22, .22) * d;
      const prev = a.mv;
      a.mv = { x0: a.x, y0: a.y, cx: a.x + dx / 2 - (dy / d) * bend, cy: a.y + dy / 2 + (dx / d) * bend, x1: x, y1: y, t0: this.clock, dur: this.skipping ? 1 : dur, done };
      prev?.done?.();
    });
  }

  private wander(a: Agent, ms?: number) {
    const vw = innerWidth, vh = innerHeight, sy = scrollY;
    let x = rnd(48, vw - 120), y = sy + rnd(90, vh - 70);
    if (this.mouse.on) {
      // keep a respectful distance from the visitor's cursor
      const dx = x - this.mouse.x, dy = y - this.mouse.y, d = Math.hypot(dx, dy) || 1;
      if (d < 180) { x += (dx / d) * (180 - d); y += (dy / d) * (180 - d); }
    }
    a.wanderAt = this.clock + rnd(1600, 3600);
    void this.move(a, clamp(x, 24, vw - 100), y, ms ?? rnd(1500, 2600));
  }

  private idle(a: Agent) {
    const sy = scrollY, vh = innerHeight;
    const away = a.y < sy - 60 || a.y > sy + vh + 60;
    if (this.clock > a.wanderAt || (away && !a.mv && a.wanderAt < 1e9)) this.wander(a, away ? 900 : undefined);
    else if (this.mouse.on && !a.mv && Math.hypot(a.x - this.mouse.x, a.y - this.mouse.y) < 110) this.wander(a, 700);
  }

  private setMode(a: Agent, mode: string, verb?: string) {
    if (a.mode) a.el.classList.remove(`is-${a.mode}`);
    a.mode = mode;
    if (mode) a.el.classList.add(`is-${mode}`);
    a.tag.textContent = verb ? `${a.name} · ${verb}` : a.name;
  }

  private ping(x: number, y: number) {
    const r = this.mk('div', 'sw-ping');
    r.style.transform = `translate3d(${x}px,${y}px,0)`;
    setTimeout(() => r.remove(), 900);
    const free = this.agents.filter((a) => !a.busy).sort((p, q) => Math.hypot(p.x - x, p.y - y) - Math.hypot(q.x - x, q.y - y)).slice(0, 5);
    free.forEach((a, i) => {
      const ang = (i / free.length) * Math.PI * 2;
      void this.move(a, x + Math.cos(ang) * 46, y + Math.sin(ang) * 46, rnd(520, 760));
      a.wanderAt = this.clock + rnd(1400, 2200);
    });
  }

  /* ---------------- scheduling ---------------- */
  private ready(t: Task) {
    if (t.state !== 'pending') return false;
    if (t.parent && t.parent.state !== 'done') return false;
    if (!t.visible) {
      // scrolled past while still waiting: show it without a show
      if (t.seen && t.el.getBoundingClientRect().bottom < 0) this.built(t);
      return false;
    }
    return true;
  }

  private assign() {
    const free = this.agents.filter((a) => !a.busy && !a.critic && a.wanderAt < 1e9);
    if (!free.length) return;
    const open = this.tasks.filter((t) => this.ready(t));
    if (!open.length) return;
    const rects = new Map<Task, DOMRect>();
    for (const a of free) {
      let best: Task | undefined, score = Infinity;
      for (const t of open) {
        if (t.state !== 'pending') continue;
        const skilled = a.skills.includes(t.kind);
        // anyone may help when a task has waited for its specialist for too long
        if (!skilled && this.clock - t.seen < 1300) continue;
        let r = rects.get(t);
        if (!r) { r = t.el.getBoundingClientRect(); rects.set(t, r); }
        const s = r.top * 1.2 + Math.hypot(r.left + scrollX - a.x, r.top + scrollY - a.y) * .5 + (skilled ? 0 : 500);
        if (s < score) { score = s; best = t; }
      }
      if (best) void this.run(a, best);
    }
  }

  private async run(a: Agent, t: Task) {
    a.busy = true;
    t.state = 'active';
    this.log(a, t.kind, this.describe(t.el));
    try {
      switch (t.kind) {
        case 'frame': await this.doFrame(a, t); break;
        case 'type': await this.doType(a, t); break;
        case 'paint': await this.doPaint(a, t); break;
        case 'stamp': await this.doStamp(a, t); break;
        case 'count': await this.doCount(a, t); break;
        case 'ink': await this.doInk(a, t); break;
        case 'mesh': await this.doMesh(a, t); break;
      }
    } catch { /* a task that fails still ends built */ } finally {
      if (t.state === 'active') this.built(t);
      this.setMode(a, '');
      a.busy = false;
      a.wanderAt = this.clock + rnd(200, 900);
    }
  }

  private rect(el: Element) {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  }

  /* ---------------- tasks ---------------- */
  private async doFrame(a: Agent, t: Task) {
    const r = this.rect(t.el);
    await this.move(a, r.x, r.y);
    this.setMode(a, 'drag', this.o.verbs.frame);
    const box = this.mk('div', 'sw-box');
    box.style.cssText = `--c:${a.color};left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;border-radius:${getComputedStyle(t.el).borderRadius}`;
    const dim = document.createElement('span'); dim.className = 'sw-dim'; box.appendChild(dim);
    const dur = clamp(Math.hypot(r.w, r.h) * 1.1, 520, 1250);
    await this.tween(dur, (p) => {
      const e = soft(p);
      a.x = r.x + r.w * e; a.y = r.y + r.h * e;
      box.style.clipPath = `inset(0 ${(1 - e) * 100}% ${(1 - e) * 100}% 0)`;
      dim.textContent = `${Math.round(r.w * e)} × ${Math.round(r.h * e)}`;
    });
    this.built(t);
    box.classList.add('is-out');
    setTimeout(() => box.remove(), 900);
    await this.wait(160);
  }

  private async doType(a: Agent, t: Task) {
    const el = t.el, live = el.querySelector('.sw-lv'), caret = el.querySelector<HTMLElement>('.sw-caret');
    if (!live || !caret) return;
    const node = live.firstChild as Text, text = t.text!;
    const at = () => { const r = caret.getBoundingClientRect(); return { x: r.left + scrollX + 2, y: r.top + scrollY + r.height * .55 }; };
    const g = el.querySelector('.sw-gh')?.firstChild;
    let p0 = { x: 0, y: 0 };
    if (g) { const rg = document.createRange(); rg.setStart(g, 0); rg.setEnd(g, Math.min(1, (g as Text).length)); const r = rg.getBoundingClientRect(); p0 = { x: r.left + scrollX, y: r.top + scrollY + r.height * .55 }; }
    await this.move(a, p0.x, p0.y);
    el.classList.add('is-active');
    this.setMode(a, 'text', this.o.verbs.type);
    const total = clamp(text.length * 34, 420, 1900);
    let shown = -1;
    const typoAt = t.typo ? Math.floor(text.length * rnd(.35, .7)) : -1;
    const write = (s: string) => { node.data = s; const p = at(); a.x = p.x; a.y = p.y; };
    if (typoAt > 0) {
      await this.tween(total * (typoAt / text.length), (p) => { const n = Math.floor(p * typoAt); if (n !== shown) { shown = n; write(text.slice(0, n)); } });
      write(text.slice(0, typoAt) + 'qwertyuiopasdfghjklzxcvbnm'[Math.floor(Math.random() * 26)]);
      await this.wait(380);
      write(text.slice(0, typoAt));
      this.log(a, 'typo');
      await this.wait(160);
    }
    const from = Math.max(0, typoAt);
    await this.tween(total * ((text.length - from) / text.length), (p) => {
      const n = from + Math.round(p * (text.length - from));
      if (n !== shown) { shown = n; write(text.slice(0, n)); }
    });
    this.built(t);
    await this.wait(120);
  }

  private async doPaint(a: Agent, t: Task) {
    const r = this.rect(t.el);
    await this.move(a, r.x, r.y + r.h * .5);
    this.setMode(a, 'brush', this.o.verbs.paint);
    t.el.classList.add('is-active');
    const edge = this.mk('div', 'sw-edge');
    edge.style.cssText = `--c:${a.color};top:${r.y}px;height:${r.h}px;left:${r.x}px`;
    await this.tween(clamp(r.w * 1.3, 480, 1200), (p) => {
      const e = soft(p);
      a.x = r.x + r.w * e; a.y = r.y + r.h * (.5 + Math.sin(p * Math.PI * 3) * .28);
      t.el.style.clipPath = `inset(-2px ${(1 - e) * 100}% -2px -2px)`;
      edge.style.transform = `translate3d(${r.w * e}px,0,0)`;
    });
    edge.classList.add('is-out');
    setTimeout(() => edge.remove(), 500);
    this.built(t);
  }

  private async doStamp(a: Agent, t: Task) {
    const r = this.rect(t.el);
    const n = t.el.children.length;
    await this.move(a, r.x + Math.min(r.w, 160) * .5, r.y + r.h * .5);
    this.setMode(a, 'click', this.o.verbs.stamp);
    this.click(a);
    this.built(t);
    if (n > 2) {
      // walk along the row while the children pop in one after another
      await this.tween(clamp(n * 70, 300, 1300), (p) => { a.x = r.x + 20 + (r.w - 40) * soft(p); a.y = r.y + r.h * (.5 + Math.sin(p * 9) * .2); });
    } else await this.wait(220);
  }

  private async doCount(a: Agent, t: Task) {
    const r = this.rect(t.el);
    await this.move(a, r.x + 8, r.y + r.h);
    this.setMode(a, 'drag', this.o.verbs.count);
    t.el.classList.add('is-active');
    const to = t.to!;
    await this.tween(1100, (p) => {
      const e = 1 - Math.pow(1 - p, 3);
      a.x = r.x + 8 + r.w * .8 * e; a.y = r.y + r.h - r.h * e;
      t.el.textContent = this.fmt.format(Math.round(to * e));
    });
  }

  private async doInk(a: Agent, t: Task) {
    const shapes = [...t.el.querySelectorAll<SVGGeometryElement>('path,line,circle,rect,polyline,ellipse')];
    this.setMode(a, 'brush', this.o.verbs.ink);
    t.el.classList.add('is-active');
    for (const s of shapes) {
      const len = s.getTotalLength(), m = s.getScreenCTM();
      if (!m) continue;
      const pt = (l: number) => { const q = s.getPointAtLength(l), sp = new DOMPoint(q.x, q.y).matrixTransform(m); return { x: sp.x + scrollX, y: sp.y + scrollY }; };
      const s0 = pt(0);
      await this.move(a, s0.x, s0.y, 420);
      await this.tween(clamp(len * 4, 420, 1400), (p) => {
        const e = soft(p), q = pt(len * e);
        a.x = q.x; a.y = q.y;
        s.style.strokeDashoffset = String(1 - e);
      });
    }
  }

  private async doMesh(a: Agent, t: Task) {
    const r = this.rect(t.el), cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) * .32;
    await this.move(a, cx + rad, cy);
    this.setMode(a, 'spin', this.o.verbs.mesh);
    this.o.onMesh?.(2600);
    await this.tween(2400, (p) => {
      const ang = soft(p) * Math.PI * 3.2, rr = rad * (1 - p * .55);
      a.x = cx + Math.cos(ang) * rr; a.y = cy + Math.sin(ang) * rr * .62;
    });
  }

  private click(a: Agent) {
    const r = this.mk('div', 'sw-click');
    r.style.cssText = `--c:${a.color};transform:translate3d(${a.x}px,${a.y}px,0)`;
    setTimeout(() => r.remove(), 700);
  }

  /* ---------------- review ---------------- */
  private reviewSections() {
    if (this.reviewing || this.skipping) return;
    const critic = this.agents.find((a) => a.critic && !a.busy && a.wanderAt < 1e9);
    if (!critic) return;
    const s = this.secs.find((x) => !x.reviewed && x.head && x.tasks.length && x.tasks.every((t) => t.state === 'done') && this.onScreen(x.head));
    if (!s) return;
    s.reviewed = true;
    this.reviewing = true;
    void this.review(critic, s).finally(() => { this.reviewing = false; });
  }

  private onScreen(el: Element) { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }

  private async review(a: Agent, s: Sec) {
    a.busy = true;
    try {
      const head = s.head!;
      const range = document.createRange(); range.selectNodeContents(head);
      const rr = [...range.getClientRects()].pop() ?? head.getBoundingClientRect();
      const hr = head.getBoundingClientRect();
      const x = Math.min(rr.right + scrollX + 18, innerWidth - 48), y = rr.top + scrollY + rr.height * .5;
      const flag = Math.random() < .35;
      if (flag) {
        // circle the heading in red ink first
        const w = Math.min(hr.width, rr.right - hr.left) + 36, h = hr.height + 26, ox = hr.left + scrollX - 18, oy = hr.top + scrollY - 13;
        const svg = this.svg(ox, oy, w, h, `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - 3}" ry="${h / 2 - 3}" pathLength="1"/>`, 'sw-mark sw-mark--flag');
        const el = svg.querySelector('ellipse') as SVGEllipseElement;
        await this.move(a, ox + w - 3, oy + h / 2);
        this.setMode(a, 'brush', '…');
        await this.tween(900, (p) => {
          const ang = soft(p) * Math.PI * 2;
          a.x = ox + w / 2 + Math.cos(ang) * (w / 2 - 3); a.y = oy + h / 2 + Math.sin(ang) * (h / 2 - 3);
          el.style.strokeDashoffset = String(1 - soft(p));
        });
        await this.wait(420);
        svg.classList.add('is-out');
        setTimeout(() => svg.remove(), 800);
      }
      const svg = this.svg(x - 4, y - 18, 40, 34, '<path d="M4 18 L15 29 L36 4" pathLength="1"/>', 'sw-mark');
      const path = svg.querySelector('path') as SVGPathElement;
      await this.move(a, x, y);
      this.setMode(a, 'brush', '✓');
      const len = path.getTotalLength();
      await this.tween(520, (p) => {
        const q = path.getPointAtLength(len * soft(p));
        a.x = x - 4 + q.x; a.y = y - 18 + q.y;
        path.style.strokeDashoffset = String(1 - soft(p));
      });
      this.log(a, flag ? 'flag' : 'review', this.describe(head));
      setTimeout(() => { svg.classList.add('is-out'); setTimeout(() => svg.remove(), 800); }, 2600);
    } finally {
      this.setMode(a, '');
      a.busy = false;
      a.wanderAt = this.clock + 400;
    }
  }

  private svg(x: number, y: number, w: number, h: number, inner: string, cls: string) {
    const d = this.mk('div', cls);
    d.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    d.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;
    return d;
  }

  /* ---------------- controls ---------------- */
  skip() {
    this.skipping = true;
    for (const t of this.tasks) if (t.state !== 'done') this.built(t);
    for (const s of this.secs) s.reviewed = true;
    this.o.onMesh?.(0);
    setTimeout(() => { this.skipping = false; }, 80);
  }

  setSpeed(v: number) { this.speed = v; }

  /** Knock down every built block in `scope` (default: what is on screen), then let the swarm rebuild it. */
  wreck(scope?: Element) {
    if (!this.started) return;
    const vh = innerHeight;
    const hit = this.tasks.filter((t) => {
      if (t.state !== 'done') return false;
      if (scope) return scope.contains(t.el);
      const r = t.el.getBoundingClientRect();
      return r.bottom > -40 && r.top < vh + 40;
    });
    if (!hit.length) return;
    this.o.onBurst?.();
    this.log(this.agents.find((a) => a.critic) ?? this.agents[0], 'wreck', `${hit.length}`);
    for (const t of hit) {
      if (t.parent && hit.includes(t.parent)) continue; // children fly with their frame
      const el = t.el;
      el.style.transition = 'transform .95s cubic-bezier(.55,0,.85,.25), opacity .95s ease-in';
      el.style.transform = `translate(${rnd(-260, 260)}px,${rnd(260, 820)}px) rotate(${rnd(-38, 38)}deg)`;
      el.style.opacity = '0';
    }
    for (const a of this.agents) if (!a.busy) { void this.move(a, rnd(40, innerWidth - 100), scrollY + rnd(60, vh - 60), rnd(380, 620)); a.wanderAt = this.clock + 1400; }
    setTimeout(() => {
      for (const t of hit) {
        const el = t.el;
        el.style.transition = 'none';
        el.style.transform = '';
        el.style.opacity = '';
        t.state = 'pending';
        t.seen = this.clock || 1;
        this.prep(t);
        if (t.kind === 'mesh') this.o.onMesh?.(-1);
      }
      for (const s of this.secs) if (s.tasks.some((t) => hit.includes(t))) s.reviewed = false;
      void document.body.offsetWidth;
      for (const t of hit) t.el.style.transition = '';
      this.finishedLogged = false;
    }, 1000);
  }

  /** Wreck what is on screen and quietly reset everything else, so the whole page builds again. */
  rebuild() {
    const vh = innerHeight;
    for (const t of this.tasks) {
      const r = t.el.getBoundingClientRect();
      if (t.state === 'done' && (r.bottom < -40 || r.top > vh + 40)) { t.state = 'pending'; t.seen = 0; this.prep(t); }
    }
    for (const s of this.secs) s.reviewed = false;
    this.wreck();
  }

  /* ---------------- HUD ---------------- */
  private progress() {
    if (this.clock - this.lastHud < 160 && !this.skipping) return;
    this.lastHud = this.clock;
    let done = 0;
    for (const t of this.tasks) if (t.state === 'done') done++;
    this.o.onProgress?.(done, this.tasks.length);
    if (done === this.tasks.length && !this.finishedLogged) {
      this.finishedLogged = true;
      this.log(this.agents[0], 'done', `${done}/${this.tasks.length}`);
    }
  }

  get agentCount() { return this.agents.length; }

  private log(a: Agent, verb: Verb, what = '') {
    if (!this.logEl) return;
    const s = this.clock / 1000;
    const line = document.createElement('li');
    const time = document.createElement('time'); time.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`;
    const who = document.createElement('b'); who.textContent = a.name; who.style.color = a.color;
    const v = document.createElement('span'); v.textContent = ` ${this.o.verbs[verb]}${what ? ' ' : ''}`;
    const w = document.createElement('em'); w.textContent = what;
    line.append(time, who, v, w);
    this.logEl.appendChild(line);
    while (this.logEl.children.length > 7) this.logEl.firstElementChild?.remove();
  }

  private describe(el: HTMLElement) {
    if (el.dataset.label) return el.dataset.label;
    const txt = (el.querySelector('.sw-gh')?.textContent ?? el.textContent ?? '').trim().replace(/\s+/g, ' ');
    const tag = el.tagName.toLowerCase();
    return txt ? `${tag} “${txt.length > 26 ? txt.slice(0, 25) + '…' : txt}”` : `<${tag}>`;
  }

  private mk(tag: string, cls: string, html = '') {
    const el = document.createElement(tag);
    el.className = cls;
    if (html) el.innerHTML = html;
    this.layer.appendChild(el);
    return el;
  }
}
