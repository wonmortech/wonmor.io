// A small canvas map: no tiles, no network. Borders come from Natural Earth (public domain), the points from
// mosques.geojson. Supports drag, wheel and button zoom, hover tooltips, click to select and a density layer.

const LAT0 = 41;
const K = Math.cos((LAT0 * Math.PI) / 180);
const proj = (lon, lat) => [lon * K, -lat];
export const BBOX = [55.9, 37.0, 73.3, 45.7];

function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

export class MapView {
  constructor(el, { borders, cities = [], onSelect, onHover, interactive = true } = {}) {
    this.el = el;
    this.borders = borders;
    this.cities = cities;
    this.onSelect = onSelect;
    this.onHover = onHover;
    this.points = [];
    this.selected = null;
    this.density = false;
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', 'Map of Uzbekistan with mosque locations');
    el.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.tip = el.querySelector('.tip');
    this.view = null;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(el);
    if (interactive) this.bind();
  }

  destroy() { this.ro.disconnect(); }

  setPoints(points) { this.points = points; this.draw(); }
  select(p) { this.selected = p; this.draw(); }

  fit(b = BBOX, pad = 24) {
    const [x0, y0] = proj(b[0], b[3]);
    const [x1, y1] = proj(b[2], b[1]);
    const w = this.w, h = this.h;
    const s = Math.min((w - pad * 2) / (x1 - x0), (h - pad * 2) / (y1 - y0));
    this.view = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, s };
    this.draw();
  }
  focus(lon, lat, s) {
    const [x, y] = proj(lon, lat);
    this.view = { cx: x, cy: y, s: s || Math.max(this.view?.s || 0, 900) };
    this.draw();
  }
  zoom(f, ox = this.w / 2, oy = this.h / 2) {
    const v = this.view;
    const wx = v.cx + (ox - this.w / 2) / v.s, wy = v.cy + (oy - this.h / 2) / v.s;
    v.s = Math.min(60000, Math.max(20, v.s * f));
    v.cx = wx - (ox - this.w / 2) / v.s; v.cy = wy - (oy - this.h / 2) / v.s;
    this.draw();
  }
  toScreen(lon, lat) {
    const [x, y] = proj(lon, lat);
    const v = this.view;
    return [(x - v.cx) * v.s + this.w / 2, (y - v.cy) * v.s + this.h / 2];
  }

  resize() {
    const r = this.el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const first = !this.w;
    this.w = r.width; this.h = r.height;
    this.canvas.width = Math.round(r.width * dpr); this.canvas.height = Math.round(r.height * dpr);
    this.canvas.style.width = r.width + 'px'; this.canvas.style.height = r.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (first || !this.view) this.fit(); else this.draw();
    if (first && this.pending) { const p = this.pending; this.pending = null; p(); }
  }
  ready(fn) { if (this.view) fn(); else this.pending = fn; }

  draw() {
    if (!this.view || !this.w) return;
    const c = this.ctx, w = this.w, h = this.h;
    c.clearRect(0, 0, w, h);
    c.fillStyle = css('--water'); c.fillRect(0, 0, w, h);
    const ring = (pts) => { pts.forEach(([lon, lat], i) => { const [x, y] = this.toScreen(lon, lat); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); };
    for (const country of this.borders.countries) {
      const uz = country.id === '860';
      c.beginPath();
      for (const poly of country.polys) for (const r of poly) ring(r);
      c.fillStyle = uz ? css('--land-uz') : css('--land');
      c.fill('evenodd');
      c.lineWidth = uz ? 1.4 : 0.8;
      c.strokeStyle = uz ? css('--border') : css('--line2');
      c.stroke();
      if (!uz && this.view.s < 900) {
        const [lon, lat] = { '398': [64.5, 45.2], '795': [58.5, 38.6], '762': [70.2, 38.3], '417': [73.0, 41.6], '004': [66.5, 37.1] }[country.id] || [];
        if (lon) { const [x, y] = this.toScreen(lon, lat); c.fillStyle = css('--fg4'); c.font = 'italic 12px ' + css('--sans'); c.textAlign = 'center'; c.fillText(country.name, x, y); }
      }
    }
    const pts = this.points;
    if (this.density) this.drawDensity(pts);
    else {
      const r = Math.max(1.6, Math.min(4.5, 1.2 + Math.log2(this.view.s / 60)));
      const col = { node: css('--node'), way: css('--way'), relation: css('--rel') };
      c.globalAlpha = 0.82;
      for (const p of pts) {
        const [x, y] = this.toScreen(p.lon, p.lat);
        if (x < -10 || y < -10 || x > w + 10 || y > h + 10) continue;
        c.beginPath(); c.arc(x, y, p.type === 'node' ? r : r + 0.6, 0, Math.PI * 2);
        c.fillStyle = col[p.type]; c.fill();
      }
      c.globalAlpha = 1;
    }
    c.font = '600 12px ' + css('--sans'); c.textAlign = 'left';
    for (const city of this.cities) {
      if (city.minScale && this.view.s < city.minScale) continue;
      const [x, y] = this.toScreen(city.lon, city.lat);
      c.lineWidth = 3; c.strokeStyle = css('--land-uz'); c.strokeText(city.name, x + 6, y - 6);
      c.fillStyle = css('--fg2'); c.fillText(city.name, x + 6, y - 6);
    }
    if (this.selected) {
      const [x, y] = this.toScreen(this.selected.lon, this.selected.lat);
      c.beginPath(); c.arc(x, y, 11, 0, Math.PI * 2); c.lineWidth = 2.5; c.strokeStyle = css('--focus'); c.stroke();
      c.beginPath(); c.arc(x, y, 4.5, 0, Math.PI * 2); c.fillStyle = css('--focus'); c.fill();
    }
  }

  drawDensity(pts) {
    const c = this.ctx;
    const cell = this.view.s > 1500 ? 0.05 : this.view.s > 500 ? 0.1 : 0.2;
    const bins = new Map();
    for (const p of pts) {
      const k = Math.floor(p.lon / cell) + ':' + Math.floor(p.lat / cell);
      bins.set(k, (bins.get(k) || 0) + 1);
    }
    const max = Math.max(1, ...bins.values());
    c.fillStyle = css('--way');
    for (const [k, n] of bins) {
      const [i, j] = k.split(':').map(Number);
      const [x0, y0] = this.toScreen(i * cell, (j + 1) * cell);
      const [x1, y1] = this.toScreen((i + 1) * cell, j * cell);
      c.globalAlpha = 0.15 + 0.85 * Math.sqrt(n / max);
      c.fillRect(x0, y0, x1 - x0 + 0.5, y1 - y0 + 0.5);
    }
    c.globalAlpha = 1;
  }

  hit(mx, my) {
    let best = null, bd = 12 * 12;
    for (const p of this.points) {
      const [x, y] = this.toScreen(p.lon, p.lat);
      const d = (x - mx) ** 2 + (y - my) ** 2;
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  bind() {
    const cv = this.canvas;
    let drag = null, moved = false;
    cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, cx: this.view.cx, cy: this.view.cy }; moved = false; cv.setPointerCapture(e.pointerId); cv.classList.add('drag'); });
    cv.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        this.view.cx = drag.cx - dx / this.view.s; this.view.cy = drag.cy - dy / this.view.s;
        this.draw();
        return;
      }
      if (this.density || !this.tip) return;
      const p = this.hit(e.clientX - r.left, e.clientY - r.top);
      if (p) {
        const [x, y] = this.toScreen(p.lon, p.lat);
        this.tip.textContent = p.label;
        this.tip.style.left = x + 'px'; this.tip.style.top = y + 'px'; this.tip.style.display = 'block';
        cv.style.cursor = 'pointer';
      } else { this.tip.style.display = 'none'; cv.style.cursor = ''; }
    });
    const end = (e) => {
      if (!drag) return;
      cv.classList.remove('drag');
      drag = null;
      if (!moved && this.onSelect && !this.density) {
        const r = cv.getBoundingClientRect();
        const p = this.hit(e.clientX - r.left, e.clientY - r.top);
        if (p) this.onSelect(p);
      }
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', () => { drag = null; cv.classList.remove('drag'); });
    cv.addEventListener('pointerleave', () => { if (this.tip) this.tip.style.display = 'none'; });
    cv.addEventListener('wheel', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(); this.zoom(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    cv.addEventListener('dblclick', (e) => { const r = cv.getBoundingClientRect(); this.zoom(2, e.clientX - r.left, e.clientY - r.top); });
  }
}
