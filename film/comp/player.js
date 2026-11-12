// Deterministic canvas renderer for timeline_*.json. film.renderAt(t) draws one frame (with motion blur).
const BEZ_CACHE = new Map();

function cubicBezier(x1, y1, x2, y2) {
  const key = [x1, y1, x2, y2].join();
  if (BEZ_CACHE.has(key)) return BEZ_CACHE.get(key);
  const bx = (t) => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  const by = (t) => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  const f = (x) => {
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 40; i++) { t = (lo + hi) / 2; if (bx(t) < x) lo = t; else hi = t; }
    return by(t);
  };
  BEZ_CACHE.set(key, f);
  return f;
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const toHex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

function lerp(a, b, u) {
  if (typeof a === 'number') return a + (b - a) * u;
  if (typeof a === 'string') { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * u)); }
  if (Array.isArray(a)) return a.map((v, i) => lerp(v, b[i], u));
  return u < 1 ? a : b;
}

export function value(v, t) {
  if (!v || typeof v !== 'object' || !v.k) return v;
  const k = v.k;
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [t0, v0, e] = k[i];
    const [t1, v1] = k[i + 1];
    if (t < t1) {
      if (e === 'hold') return v0;
      let u = (t - t0) / (t1 - t0);
      if (Array.isArray(e)) u = cubicBezier(...e)(u);
      return lerp(v0, v1, u);
    }
  }
  return k[k.length - 1][1];
}

function contoursPath(contours) {
  const p = new Path2D();
  for (const c of contours) {
    p.moveTo(c[0][0][0], c[0][0][1]);
    for (const s of c) p.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]);
    p.closePath();
  }
  return p;
}

// Stroke path cut at `trim` (0..1) of each contour's length, like AE Trim Paths End.
function trimmedPath(contours, trim) {
  const p = new Path2D();
  for (const c of contours) {
    const pts = [];
    c.forEach((s, si) => {
      for (let i = si ? 1 : 0; i <= 24; i++) {
        const t = i / 24, u = 1 - t;
        pts.push([u * u * u * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t * t * t * s[3][0],
          u * u * u * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t * t * t * s[3][1]]);
      }
    });
    const len = [0];
    for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const end = len[len.length - 1] * trim;
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      if (len[i] <= end) { p.lineTo(pts[i][0], pts[i][1]); continue; }
      const u = (end - len[i - 1]) / (len[i] - len[i - 1] || 1);
      p.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u);
      break;
    }
  }
  return p;
}

export async function createFilm(canvas, timeline, base) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = timeline.width;
  canvas.height = timeline.height;
  const byId = new Map(timeline.layers.map((l) => [l.id, l]));
  const images = new Map();
  const load = (src) => {
    if (!images.has(src)) {
      const im = new Image();
      const p = new Promise((res) => { im.onload = () => res(im); im.onerror = () => { console.warn('missing ' + src); res(null); }; });
      im.src = base + src;
      images.set(src, { im, p, ok: () => im.complete && im.naturalWidth > 0 });
    }
    return images.get(src).p;
  };
  const jobs = [];
  for (const l of timeline.layers) {
    if (l.type === 'image') jobs.push(load(l.src));
    if (l.type === 'seq') for (let i = 0; i < l.count; i++) jobs.push(load(`${l.dir}/${String(i).padStart(4, '0')}.png`));
    if (l.type === 'grain') for (let i = 0; i < l.tiles; i++) jobs.push(load(`textures/grain_${i}.png`));
  }
  await Promise.all(jobs);
  const missing = [...images.entries()].filter(([, v]) => !v.ok()).map(([k]) => k);
  const get = (src) => { const e = images.get(src); return e && e.ok() ? e.im : null; };
  const off = document.createElement('canvas');
  off.width = canvas.width;
  off.height = canvas.height;
  const octx = off.getContext('2d', { willReadFrequently: true });

  function matrixOf(l, t) {
    const chain = [];
    for (let c = l; c; c = c.parent ? byId.get(c.parent) : null) chain.unshift(c);
    let m = new DOMMatrix();
    let alpha = 1;
    for (const c of chain) {
      const s = value(c.scale, t) * c.unit;
      m = m.translate(value(c.x, t), value(c.y, t)).rotate(value(c.rotation, t)).scale(s).translate(-c.anchor[0], -c.anchor[1]);
      alpha *= value(c.opacity, t);
    }
    return { m, alpha };
  }
  const visible = (l, t) => {
    for (let c = l; c; c = c.parent ? byId.get(c.parent) : null) if (t < c.in || t >= c.out) return false;
    return true;
  };

  function draw(g, t) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#000';
    g.fillRect(0, 0, canvas.width, canvas.height);
    const frame = Math.floor(t * timeline.fps + 1e-6);
    for (const l of timeline.layers) {
      if (l.type === 'group' || !visible(l, t)) continue;
      const { m, alpha } = matrixOf(l, t);
      if (alpha <= 0) continue;
      g.save();
      g.globalAlpha = alpha;
      if (l.type === 'solid') {
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = value(l.color, t);
        g.fillRect(0, 0, l.w, l.h);
      } else if (l.type === 'grain') {
        const im = get(`textures/grain_${frame % l.tiles}.png`);
        if (im) {
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.globalCompositeOperation = 'overlay';
          g.globalAlpha = Math.min(1, l.amount * 4);
          g.fillStyle = g.createPattern(im, 'repeat');
          g.fillRect(0, 0, l.w, l.h);
        }
      } else if (l.type === 'image' || l.type === 'seq') {
        g.setTransform(m);
        const idx = l.type === 'seq' ? Math.max(0, Math.min(l.count - 1, Math.floor(value(l.frame, t) + 1e-6))) : 0;
        const im = get(l.type === 'image' ? l.src : `${l.dir}/${String(idx).padStart(4, '0')}.png`);
        if (im) g.drawImage(im, 0, 0, l.iw, l.ih);
      } else if (l.type === 'shape') {
        g.setTransform(m);
        const contours = value(l.contours, t);
        const sc = Math.hypot(m.a, m.b) || 1;
        const fill = value(l.fill, t);
        if (fill) {
          const p = contoursPath(contours);
          if (l.gradient) {
            const gr = g.createLinearGradient(l.gradient.x0, l.gradient.y0, l.gradient.x1, l.gradient.y1);
            gr.addColorStop(0, l.gradient.c0);
            gr.addColorStop(1, l.gradient.c1);
            g.fillStyle = gr;
          } else g.fillStyle = fill;
          if (l.glow) {
            g.save();
            g.shadowColor = l.glow.color;
            g.shadowBlur = l.glow.r;
            g.globalAlpha = alpha * l.glow.alpha;
            g.fill(p);
            g.fill(p);
            g.restore();
          }
          g.globalAlpha = alpha * (l.fillOpacity ?? 1);
          g.fill(p);
          g.globalAlpha = alpha;
        }
        const stroke = value(l.stroke, t);
        const trim = l.trimEnd !== undefined ? value(l.trimEnd, t) : 1;
        if (stroke && trim > 0) {
          g.strokeStyle = stroke;
          g.lineWidth = l.strokeWidth / sc;
          g.lineJoin = 'round';
          g.lineCap = 'round';
          g.stroke(trim < 1 ? trimmedPath(contours, trim) : contoursPath(contours));
        }
      }
      g.restore();
    }
  }

  // Motion blur: average sub-frames over a 180 degree shutter (half a frame interval).
  const acc = new Float32Array(canvas.width * canvas.height * 4);
  function renderAt(t, samples = 4) {
    if (samples <= 1) { draw(ctx, t); return; }
    acc.fill(0);
    for (let s = 0; s < samples; s++) {
      draw(octx, t + (s / samples) * (0.5 / timeline.fps));
      const d = octx.getImageData(0, 0, off.width, off.height).data;
      for (let i = 0; i < d.length; i++) acc[i] += d[i];
    }
    const out = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < acc.length; i++) out.data[i] = acc[i] / samples + 0.5;
    ctx.putImageData(out, 0, 0);
  }
  return { renderAt, missing };
}
