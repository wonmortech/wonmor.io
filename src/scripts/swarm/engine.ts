/* Swarm Rebuild engine for /swarm.
   Every element with data-b="frame|type|paint|stamp|count|ink|mesh|cast" is a task. Named cursors (agents) pick the
   visible tasks they are skilled at, fly there the way a hand moves a mouse (fast start, soft landing, a little
   overshoot) and build the element in front of the visitor, the way people do it in a design tool: they select it,
   drag its frame out, type the words, select text line by line, place every chip one click at a time and render
   the 3D scenes. A task waits for its nearest task ancestor, so frames come before what is inside them. The content
   is in the HTML from the start: the engine only hides it (html.sw-on) and decides when it shows. */

export type Kind = 'frame' | 'type' | 'paint' | 'stamp' | 'count' | 'ink' | 'mesh' | 'cast';
type Verb = Kind | 'join' | 'typo' | 'review' | 'flag' | 'wreck' | 'done';
type Chat = 'start' | 'typo' | 'ok' | 'flag' | 'cast' | 'done' | 'wreck' | 'ping' | 'help';

interface AgentDef { name: string; color: string; skills: Kind[]; critic?: boolean }
const ROSTER: AgentDef[] = [
  { name: 'Atlas', color: '#2969ff', skills: ['frame', 'paint'] },
  { name: 'Quill', color: '#ff6b3d', skills: ['type'] },
  { name: 'Brush', color: '#ff4fa3', skills: ['paint', 'ink'] },
  { name: 'Tally', color: '#34d399', skills: ['count', 'stamp', 'paint'] },
  { name: 'Orbit', color: '#22d3ee', skills: ['mesh', 'cast', 'ink'] },
  { name: 'Mono', color: '#ffb020', skills: ['type'] },
  { name: 'Lint', color: '#f43f5e', skills: ['stamp'], critic: true },
  { name: 'Vera', color: '#8b6cff', skills: ['frame', 'stamp', 'cast'] },
  { name: 'Pixel', color: '#a3e635', skills: ['cast', 'paint', 'stamp'] },
  { name: 'Lede', color: '#f5d0a9', skills: ['type', 'count', 'paint'] },
  { name: 'Ship', color: '#facc15', skills: ['stamp', 'frame', 'paint'] },
  { name: 'Kern', color: '#60a5fa', skills: ['type', 'paint'] },
];

interface Move { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number; t0: number; dur: number; done?: () => void }
interface Agent extends AgentDef { el: HTMLElement; tag: HTMLElement; x: number; y: number; mv?: Move; busy: boolean; wanderAt: number; mode: string; said: number }
interface Task {
  el: HTMLElement; kind: Kind; i: number; parent?: Task; sec?: Sec;
  state: 'pending' | 'active' | 'done'; visible: boolean; seen: number; text?: string; typo?: boolean; to?: number;
}
interface Sec { el: HTMLElement; tasks: Task[]; reviewed: boolean; head?: HTMLElement }
type TEl = HTMLElement & { _t?: Task; __rv?: number };
interface R { x: number; y: number; w: number; h: number }

export interface EngineOpts {
  verbs: Record<Verb, string>;
  chat?: Partial<Record<Chat, string[]>>;
  you: string;
  locale: string;
  onMesh?: (ms: number) => void;
  onBurst?: () => void;
  onProgress?: (done: number, total: number) => void;
}

const soft = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
/** A hand on a mouse: quick start, long soft landing, a small overshoot that settles. */
const fly = (t: number) => { const p = Math.pow(t, 1.25) - 1, s = .9; return 1 + (s + 1) * p * p * p + s * p * p; };
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
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
  private skipped = false;
  private started = false;
  private raf = 0;
  private mouse = { x: -1e4, y: -1e4, on: false };
  private youEl: HTMLElement;
  private io: IntersectionObserver;
  private fmt: Intl.NumberFormat;
  private finishedLogged = false;
  private reviewing = false;
  private lastHud = -1e9;
  private lastSay = -1e9;

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
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0.01 });
  }

  /* ---------------- setup ---------------- */
  start() {
    const mobile = matchMedia('(max-width: 720px), (pointer: coarse)').matches;
    const roster = mobile ? ROSTER.filter((_, i) => [0, 1, 2, 3, 4, 6, 7, 8].includes(i)) : ROSTER;
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
      const a: Agent = { ...d, el, tag, x, y, busy: false, wanderAt: 1e9, mode: '', said: -1e9 };
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
    this.agents.forEach((a, i) => this.after(70 * i, () => { this.log(a, 'join'); a.wanderAt = this.clock + rnd(900, 1800); this.park(a, 520); }));
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
    el.classList.remove('is-built', 'is-active', 'is-settle');
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
    if (t.kind === 'stamp') for (const c of el.children) c.classList.remove('is-in');
    if (t.kind === 'cast') (el as TEl).__rv = 0;
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
    if (t.kind === 'cast') (el as TEl).__rv = 1;
  }

  /* ---------------- clock ---------------- */
  private wait(ms: number) { return new Promise<void>((r) => this.after(ms, r)); }
  private after(ms: number, fn: () => void) { this.timers.push({ at: this.clock + (this.skipping ? 0 : ms), fn }); }
  private tween(ms: number, fn: (p: number) => void) {
    return new Promise<void>((done) => { fn(0); this.tweens.push({ t0: this.clock, dur: Math.max(1, ms), fn, done }); });
  }

  /** The more visible work is waiting, the faster the whole swarm runs. */
  private turbo() {
    let waiting = 0;
    for (const t of this.tasks) if (t.state === 'pending' && t.visible) waiting++;
    return clamp(waiting / (this.agents.length * 1.1), 1, 3.2);
  }

  private tick(now: number) {
    // a slow device drops frames, not speed: the clock follows real time up to 120 ms per frame
    const raw = Math.min(120, now - this.last);
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
        const m = a.mv, p = clamp((c - m.t0) / m.dur, 0, 1), e = fly(p), u = 1 - e;
        a.x = u * u * m.x0 + 2 * u * e * m.cx + e * e * m.x1;
        a.y = u * u * m.y0 + 2 * u * e * m.cy + e * e * m.y1;
        if (p >= 1) { a.x = m.x1; a.y = m.y1; a.mv = undefined; m.done?.(); }
      }
      if (!a.busy) this.idle(a);
      this.place(a, now);
    }
    if (!this.skipping) this.assign();
    this.reviewSections();
    this.progress();
  }

  /** A resting hand is never perfectly still: a sub-pixel tremor on idle cursors. */
  private place(a: Agent, now = 0) {
    const j = a.mv || a.busy ? 0 : .6;
    const x = a.x + Math.sin(now / 410 + a.color.length * 3) * j, y = a.y + Math.cos(now / 530 + a.name.length) * j;
    a.el.style.transform = `translate3d(${x}px,${y}px,0)`;
  }

  /* ---------------- motion ---------------- */
  private move(a: Agent, x: number, y: number, ms?: number) {
    return new Promise<void>((done) => {
      const dx = x - a.x, dy = y - a.y, d = Math.hypot(dx, dy) || 1;
      // Fitts: time grows with the log of the distance
      const dur = ms ?? clamp(130 + 100 * Math.log2(1 + d / 40), 150, 620);
      const bend = rnd(-.13, .13) * Math.min(d, 700);
      const prev = a.mv;
      a.mv = { x0: a.x, y0: a.y, cx: a.x + dx / 2 - (dy / d) * bend, cy: a.y + dy / 2 + (dx / d) * bend, x1: x, y1: y, t0: this.clock, dur: this.skipping ? 1 : dur, done };
      prev?.done?.();
    });
  }

  /** Go and wait next to the work that is coming: the nearest visible task still waiting for its parent. */
  private park(a: Agent, ms?: number) {
    const vw = innerWidth, vh = innerHeight, sy = scrollY;
    const next = this.tasks.find((t) => t.state === 'pending' && t.visible && (!t.parent || t.parent.state !== 'done') && a.skills.includes(t.kind));
    let x: number, y: number;
    if (next) {
      const r = next.el.getBoundingClientRect();
      x = clamp(r.left + rnd(-30, Math.min(r.width, 260)), 24, vw - 120); y = sy + clamp(r.top + rnd(-24, 24), 70, vh - 50);
    } else { x = rnd(60, vw - 140); y = sy + rnd(110, vh - 80); }
    void this.move(a, x, y, ms);
  }

  private idle(a: Agent) {
    if (a.mv || a.wanderAt >= 1e9) return;
    const sy = scrollY, vh = innerHeight;
    if (a.y < sy - 40 || a.y > sy + vh + 40) { this.park(a, 420); a.wanderAt = this.clock + rnd(1600, 3000); return; }
    if (this.mouse.on && Math.hypot(a.x - this.mouse.x, a.y - this.mouse.y) < 70) {
      const dx = a.x - this.mouse.x, dy = a.y - this.mouse.y, d = Math.hypot(dx, dy) || 1;
      void this.move(a, a.x + (dx / d) * 90, a.y + (dy / d) * 90, 260);
      return;
    }
    if (this.clock > a.wanderAt) {
      // a short, purposeful re-position instead of an aimless lap around the screen
      a.wanderAt = this.clock + rnd(2600, 4800);
      if (Math.random() < .5) this.park(a, rnd(380, 560));
      else void this.move(a, clamp(a.x + rnd(-60, 60), 24, innerWidth - 120), clamp(a.y + rnd(-40, 40), sy + 70, sy + vh - 50), rnd(420, 700));
    }
  }

  private setMode(a: Agent, mode: string, verb?: string) {
    if (a.mode) a.el.classList.remove(`is-${a.mode}`);
    a.mode = mode;
    if (mode) a.el.classList.add(`is-${mode}`);
    a.tag.textContent = verb ? `${a.name} · ${verb}` : a.name;
  }

  /** Cursor chat: a short line next to the name tag, rate limited so it stays rare. */
  private say(a: Agent, key: Chat, force = false) {
    const lines = this.o.chat?.[key];
    if (!lines?.length || this.skipping) return;
    if (!force && (this.clock - this.lastSay < 1400 || this.clock - a.said < 4000)) return;
    this.lastSay = this.clock; a.said = this.clock;
    a.el.querySelector('.sw-say')?.remove();
    const b = document.createElement('span'); b.className = 'sw-say'; b.textContent = pick(lines);
    a.el.appendChild(b);
    setTimeout(() => { b.classList.add('is-out'); setTimeout(() => b.remove(), 300); }, 1700);
  }

  private ping(x: number, y: number) {
    const r = this.mk('div', 'sw-ping');
    r.style.transform = `translate3d(${x}px,${y}px,0)`;
    setTimeout(() => r.remove(), 900);
    const free = this.agents.filter((a) => !a.busy).sort((p, q) => Math.hypot(p.x - x, p.y - y) - Math.hypot(q.x - x, q.y - y)).slice(0, 5);
    free.forEach((a, i) => {
      const ang = (i / free.length) * Math.PI * 2;
      void this.move(a, x + Math.cos(ang) * 46, y + Math.sin(ang) * 46);
      a.wanderAt = this.clock + rnd(1600, 2400);
    });
    if (free[0]) this.say(free[0], 'ping', true);
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
        if (!skilled && this.clock - t.seen < 550) continue;
        let r = rects.get(t);
        if (!r) { r = t.el.getBoundingClientRect(); rects.set(t, r); }
        const s = r.top * 1.1 + Math.hypot(r.left + scrollX - a.x, r.top + scrollY - a.y) * .55 + (skilled ? 0 : 420);
        if (s < score) { score = s; best = t; }
      }
      if (best) { if (!a.skills.includes(best.kind)) this.say(a, 'help'); void this.run(a, best); }
    }
  }

  private async run(a: Agent, t: Task) {
    a.busy = true;
    t.state = 'active';
    this.log(a, t.kind, this.describe(t.el));
    if (Math.random() < .14) this.say(a, 'start');
    try {
      switch (t.kind) {
        case 'frame': await this.doFrame(a, t); break;
        case 'type': await this.doType(a, t); break;
        case 'paint': await this.doPaint(a, t); break;
        case 'stamp': await this.doStamp(a, t); break;
        case 'count': await this.doCount(a, t); break;
        case 'ink': await this.doInk(a, t); break;
        case 'mesh': await this.doMesh(a, t); break;
        case 'cast': await this.doCast(a, t); break;
      }
    } catch { /* a task that fails still ends built */ } finally {
      if (t.state === 'active') this.built(t);
      this.setMode(a, '');
      a.busy = false;
      a.wanderAt = this.clock + rnd(500, 1200);
    }
  }

  private rect(el: Element): R {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  }

  /** Multiplayer selection: outline, four handles and the agent's name, like a shared design file. */
  private select(a: Agent, r: R, label = true) {
    const b = this.mk('div', 'sw-sel', `<i></i><i></i><i></i><i></i>${label ? `<b>${a.name}</b>` : ''}`);
    b.style.cssText = `--c:${a.color};left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`;
    return b;
  }
  private drop(el: HTMLElement, ms = 420) { el.classList.add('is-out'); setTimeout(() => el.remove(), ms); }

  /* ---------------- tasks ---------------- */
  private async doFrame(a: Agent, t: Task) {
    const el = t.el, r = this.rect(el), cs = getComputedStyle(el);
    await this.move(a, r.x, r.y);
    this.setMode(a, 'drag', this.o.verbs.frame);
    this.click(a);
    el.classList.add('is-active');
    el.style.clipPath = 'inset(0 100% 100% 0)';
    const box = this.select(a, { ...r, w: 0, h: 0 });
    const dim = document.createElement('span'); dim.className = 'sw-dim'; box.appendChild(dim);
    let insp: HTMLElement | null = null;
    if (r.w > 230 && r.h > 120) {
      const bg = cs.backgroundColor.replace(/\s/g, '');
      const fill = cs.backgroundImage !== 'none' ? 'gradient' : bg === 'rgba(0,0,0,0)' || bg === 'transparent' ? 'glass · 3D' : bg;
      insp = this.mk('div', 'sw-insp');
      const right = r.x + r.w + 196 < scrollX + innerWidth;
      insp.style.cssText = `--c:${a.color};left:${right ? r.x + r.w + 12 : r.x + 12}px;top:${r.y + (right ? 0 : 12)}px`;
      insp.innerHTML = `<p class="sw-insp__h">${el.tagName.toLowerCase()}.${(el.className.split(' ')[0] || 'frame')}</p><p><span>W</span><b data-w>0</b><span>H</span><b data-h>0</b></p><p><span>radius</span><b>${parseFloat(cs.borderTopLeftRadius) || 0}</b></p><p><span>fill</span><b>${fill.slice(0, 18)}</b></p>`;
    }
    const iw = insp?.querySelector<HTMLElement>('[data-w]'), ih = insp?.querySelector<HTMLElement>('[data-h]');
    const dur = clamp(Math.hypot(r.w, r.h) * .55, 320, 780);
    await this.tween(dur, (p) => {
      const e = soft(p), w = r.w * e, h = r.h * e;
      a.x = r.x + w; a.y = r.y + h;
      box.style.width = `${w}px`; box.style.height = `${h}px`;
      el.style.clipPath = `inset(0 ${(1 - e) * 100}% ${(1 - e) * 100}% 0)`;
      dim.textContent = `${Math.round(w)} × ${Math.round(h)}`;
      if (iw && ih) { iw.textContent = String(Math.round(w)); ih.textContent = String(Math.round(h)); }
    });
    this.built(t);
    el.classList.add('is-settle');
    setTimeout(() => el.classList.remove('is-settle'), 500);
    await this.wait(140);
    this.drop(box);
    if (insp) { const i = insp; setTimeout(() => this.drop(i), 500); }
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
    this.click(a);
    el.classList.add('is-active');
    this.setMode(a, 'text', this.o.verbs.type);
    // human rhythm: uneven keys, a beat after spaces and punctuation
    const times: number[] = [];
    let acc = 0;
    for (const ch of text) { acc += 22 * rnd(.55, 1.45) + (ch === ' ' ? rnd(8, 34) : 0) + (/[.,:;!?—]/.test(ch) ? 60 : 0); times.push(acc); }
    const k = Math.min(1, clamp(text.length * 26, 260, 1250) / (acc || 1));
    const count = (ms: number) => { let n = 0; while (n < times.length && times[n] * k <= ms) n++; return n; };
    let shown = -1;
    const write = (s: string) => { node.data = s; const p = at(); a.x = p.x; a.y = p.y; };
    const typoAt = t.typo ? Math.floor(text.length * rnd(.35, .7)) : -1;
    if (typoAt > 0) {
      const t1 = times[typoAt - 1] * k;
      await this.tween(t1, (p) => { const n = Math.min(typoAt, count(p * t1)); if (n !== shown) { shown = n; write(text.slice(0, n)); } });
      write(text.slice(0, typoAt) + 'qwertyuiopasdfghjklzxcvbnm'[Math.floor(Math.random() * 26)]);
      await this.wait(300);
      write(text.slice(0, typoAt));
      this.log(a, 'typo');
      this.say(a, 'typo', true);
      await this.wait(120);
    }
    const from = Math.max(0, typoAt), base = from ? times[from - 1] * k : 0, total = acc * k - base;
    await this.tween(Math.max(1, total), (p) => {
      const n = Math.max(from, count(base + p * total));
      if (n !== shown) { shown = n; write(text.slice(0, n)); }
    });
    write(text);
    this.built(t);
    await this.wait(80);
  }

  /** The lines of text inside an element, relative to it, merged per visual line. */
  private lines(el: HTMLElement) {
    const er = el.getBoundingClientRect(), rg = document.createRange();
    rg.selectNodeContents(el);
    const out: { l: number; r: number; t: number; b: number }[] = [];
    for (const q of rg.getClientRects()) {
      if (q.width < 1 || q.height < 1) continue;
      const last = out[out.length - 1];
      const t = q.top - er.top, b = q.bottom - er.top;
      if (last && Math.abs(last.t - t) < 6) { last.l = Math.min(last.l, q.left - er.left); last.r = Math.max(last.r, q.right - er.left); last.b = Math.max(last.b, b); }
      else out.push({ l: q.left - er.left, r: q.right - er.left, t, b });
    }
    return out.slice(0, 40);
  }

  private async doPaint(a: Agent, t: Task) {
    const el = t.el, r = this.rect(el);
    const ls = this.lines(el);
    this.setMode(a, 'text', this.o.verbs.paint);
    if (!ls.length || r.h > 900) {
      await this.move(a, r.x, r.y + r.h * .5);
      el.classList.add('is-active');
      await this.tween(clamp(r.w * .7, 260, 700), (p) => {
        const e = soft(p);
        a.x = r.x + r.w * e; a.y = r.y + r.h * (.5 + Math.sin(p * Math.PI * 3) * .28);
        el.style.clipPath = `inset(-2px ${(1 - e) * 100}% -2px -2px)`;
      });
      this.built(t);
      return;
    }
    // select the text line by line, the way you drag over it with the mouse; each line appears under the selection
    await this.move(a, r.x + ls[0].l, r.y + (ls[0].t + ls[0].b) / 2);
    this.click(a);
    el.classList.add('is-active');
    el.style.clipPath = 'inset(0 100% 100% 0)';
    const hl = this.mk('div', 'sw-hl');
    const widths = ls.map((q) => Math.max(1, q.r - q.l)), sum = widths.reduce((s, w) => s + w, 0);
    const W = r.w + 6;
    await this.tween(clamp(sum * .55 + ls.length * 40, 240, 1300), (p) => {
      let left = p * sum, i = 0;
      while (i < ls.length - 1 && left > widths[i]) { left -= widths[i]; i++; }
      const q = ls[i], x = q.l + Math.min(left, widths[i]);
      el.style.clipPath = `polygon(-4px -4px, ${W}px -4px, ${W}px ${q.t}px, ${x}px ${q.t}px, ${x}px ${q.b + 2}px, -4px ${q.b + 2}px)`;
      hl.style.cssText = `--c:${a.color};left:${r.x + q.l}px;top:${r.y + q.t}px;width:${x - q.l}px;height:${q.b - q.t}px`;
      a.x = r.x + x; a.y = r.y + (q.t + q.b) / 2;
    });
    this.built(t);
    this.drop(hl, 360);
  }

  private async doStamp(a: Agent, t: Task) {
    const el = t.el, r = this.rect(el);
    const kids = [...el.children] as HTMLElement[];
    this.setMode(a, 'click', this.o.verbs.stamp);
    el.classList.add('is-active');
    const centres = kids.map((k) => { const q = this.rect(k); return { x: q.x + q.w / 2, y: q.y + q.h / 2 }; });
    if (!kids.length) { await this.move(a, r.x + r.w / 2, r.y + r.h / 2); this.click(a); this.built(t); return; }
    if (kids.length <= 9) {
      // place every chip with its own click
      for (let i = 0; i < kids.length; i++) {
        await this.move(a, centres[i].x, centres[i].y, i ? clamp(Math.hypot(centres[i].x - a.x, centres[i].y - a.y) * .9, 110, 260) : undefined);
        this.click(a);
        kids[i].classList.add('is-in');
        await this.wait(30);
      }
    } else {
      await this.move(a, centres[0].x, centres[0].y);
      const box = this.select(a, r);
      let k = -1;
      await this.tween(clamp(kids.length * 34, 500, 2100), (p) => {
        const n = Math.min(kids.length - 1, Math.floor(p * kids.length));
        while (k < n) { k++; kids[k].classList.add('is-in'); if (k % 3 === 0) this.click(a); }
        a.x = centres[n].x; a.y = centres[n].y;
      });
      this.drop(box);
    }
    this.built(t);
    await this.wait(90);
  }

  private async doCount(a: Agent, t: Task) {
    const r = this.rect(t.el);
    await this.move(a, r.x + 8, r.y + r.h);
    this.setMode(a, 'drag', this.o.verbs.count);
    this.click(a);
    t.el.classList.add('is-active');
    const box = this.select(a, r, false);
    const to = t.to!;
    await this.tween(820, (p) => {
      const e = 1 - Math.pow(1 - p, 3);
      a.x = r.x + 8 + r.w * .8 * e; a.y = r.y + r.h - r.h * e;
      t.el.textContent = this.fmt.format(Math.round(to * e));
    });
    this.drop(box);
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
      await this.move(a, s0.x, s0.y);
      await this.tween(clamp(len * 2.2, 260, 900), (p) => {
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
    this.o.onMesh?.(2000);
    await this.tween(1800, (p) => {
      const ang = soft(p) * Math.PI * 3.2, rr = rad * (1 - p * .55);
      a.x = cx + Math.cos(ang) * rr; a.y = cy + Math.sin(ang) * rr * .62;
    });
  }

  /** Render a product's 3D scene: press render, then a scanline draws the scene from top to bottom. */
  private async doCast(a: Agent, t: Task) {
    const el = t.el as TEl, r = this.rect(el);
    await this.move(a, r.x + r.w - 40, r.y + 22);
    this.setMode(a, 'click', this.o.verbs.cast);
    this.click(a);
    this.say(a, 'cast');
    const box = this.select(a, r);
    const scan = this.mk('div', 'sw-scan', '<span></span>');
    scan.style.cssText = `--c:${a.color};left:${r.x}px;top:${r.y}px;width:${r.w}px`;
    const pct = scan.firstElementChild as HTMLElement;
    const name = el.dataset.p ?? 'scene';
    await this.tween(1050, (p) => {
      const e = soft(p);
      el.__rv = e;
      scan.style.transform = `translate3d(0,${r.h * e}px,0)`;
      pct.textContent = `render ${name}.scene  ${Math.round(e * 100)}%`;
      a.x = r.x + r.w * (.2 + .6 * (.5 + .5 * Math.sin(p * 10))); a.y = r.y + r.h * e;
    });
    this.built(t);
    this.drop(scan, 500);
    this.drop(box);
  }

  private click(a: Agent) {
    const r = this.mk('div', 'sw-click');
    r.style.cssText = `--c:${a.color};transform:translate3d(${a.x}px,${a.y}px,0)`;
    a.el.classList.remove('is-press'); void a.el.offsetWidth; a.el.classList.add('is-press');
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
        this.say(a, 'flag', true);
        await this.tween(700, (p) => {
          const ang = soft(p) * Math.PI * 2;
          a.x = ox + w / 2 + Math.cos(ang) * (w / 2 - 3); a.y = oy + h / 2 + Math.sin(ang) * (h / 2 - 3);
          el.style.strokeDashoffset = String(1 - soft(p));
        });
        await this.wait(380);
        svg.classList.add('is-out');
        setTimeout(() => svg.remove(), 800);
      }
      const svg = this.svg(x - 4, y - 18, 40, 34, '<path d="M4 18 L15 29 L36 4" pathLength="1"/>', 'sw-mark');
      const path = svg.querySelector('path') as SVGPathElement;
      await this.move(a, x, y);
      this.setMode(a, 'brush', '✓');
      const len = path.getTotalLength();
      await this.tween(420, (p) => {
        const q = path.getPointAtLength(len * soft(p));
        a.x = x - 4 + q.x; a.y = y - 18 + q.y;
        path.style.strokeDashoffset = String(1 - soft(p));
      });
      this.log(a, flag ? 'flag' : 'review', this.describe(head));
      if (!flag) this.say(a, 'ok');
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

  /** Build complete: the free cursors meet in a ring around the middle of the screen, spin once and click together. */
  private async celebrate() {
    if (this.skipped || document.hidden) return;
    const crew = this.agents.filter((a) => !a.busy);
    if (crew.length < 3) return;
    const cx = innerWidth / 2, cy = scrollY + innerHeight * .5, R = Math.min(innerWidth, innerHeight) * .2;
    crew.forEach((a) => { a.busy = true; });
    try {
      await Promise.all(crew.map((a, i) => { const ang = (i / crew.length) * Math.PI * 2; return this.move(a, cx + Math.cos(ang) * R, cy + Math.sin(ang) * R * .75); }));
      this.say(crew[0], 'done', true);
      await this.tween(1300, (p) => {
        const e = soft(p);
        crew.forEach((a, i) => { const ang = (i / crew.length) * Math.PI * 2 + e * Math.PI, rr = R * (1 - Math.sin(p * Math.PI) * .35); a.x = cx + Math.cos(ang) * rr; a.y = cy + Math.sin(ang) * rr * .75; });
      });
      crew.forEach((a) => this.click(a));
      this.o.onBurst?.();
    } finally {
      crew.forEach((a) => { a.busy = false; a.wanderAt = this.clock + rnd(300, 1200); });
    }
  }

  /* ---------------- controls ---------------- */
  skip() {
    this.skipping = true;
    this.skipped = true;
    for (const t of this.tasks) if (t.state !== 'done') this.built(t);
    for (const t of this.tasks) if (t.kind === 'stamp') for (const c of t.el.children) c.classList.add('is-in');
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
    this.skipped = false;
    this.o.onBurst?.();
    const lint = this.agents.find((a) => a.critic) ?? this.agents[0];
    this.log(lint, 'wreck', `${hit.length}`);
    this.say(lint, 'wreck', true);
    for (const t of hit) {
      if (t.kind === 'cast') (t.el as TEl).__rv = 0;
      if (t.parent && hit.includes(t.parent)) continue; // children fly with their frame
      const el = t.el;
      el.style.transition = 'transform .95s cubic-bezier(.55,0,.85,.25), opacity .95s ease-in';
      el.style.transform = `translate(${rnd(-260, 260)}px,${rnd(260, 820)}px) rotate(${rnd(-38, 38)}deg)`;
      el.style.opacity = '0';
    }
    for (const a of this.agents) if (!a.busy) { void this.move(a, rnd(40, innerWidth - 100), scrollY + rnd(60, vh - 60), rnd(300, 480)); a.wanderAt = this.clock + 1200; }
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
      setTimeout(() => void this.celebrate(), 250);
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
