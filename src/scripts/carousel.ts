// Small carousel shared by the featured blocks and "Explore other areas".
// [data-carousel] holds [data-slide] children, [data-prev]/[data-next] buttons and an optional [data-index] ("01").
// Mode "fade" (default): one slide shown, the others inert. Mode "track": slides sit in a scrollable row
// ([data-track]) and the buttons scroll by one slide. Swipe works on touch; arrow keys work while focus is inside.
export function initCarousels() {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
    const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
    const prev = root.querySelector<HTMLButtonElement>('[data-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-next]');
    const idx = root.querySelector<HTMLElement>('[data-index]');
    const track = root.querySelector<HTMLElement>('[data-track]');
    if (slides.length < 2) { prev?.setAttribute('hidden', ''); next?.setAttribute('hidden', ''); return; }
    const pad = (n: number) => String(n).padStart(2, '0');
    let i = 0;
    const show = (n: number, focus = false) => {
      i = (n + slides.length) % slides.length;
      if (idx) idx.textContent = pad(i + 1);
      if (track) {
        const s = slides[i];
        track.scrollTo({ left: s.offsetLeft - track.offsetLeft - (parseFloat(getComputedStyle(track).paddingLeft) || 0), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        return;
      }
      slides.forEach((s, k) => {
        const on = k === i;
        s.toggleAttribute('data-active', on);
        s.toggleAttribute('inert', !on);
        s.setAttribute('aria-hidden', String(!on));
      });
      if (focus) slides[i].querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    };
    prev?.addEventListener('click', () => show(i - 1));
    next?.addEventListener('click', () => show(i + 1));
    root.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement).closest('input, textarea')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1, true); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1, true); }
    });
    if (track) {
      // keep the counter in step when the row is scrolled by hand
      let t = 0;
      track.addEventListener('scroll', () => {
        cancelAnimationFrame(t);
        t = requestAnimationFrame(() => {
          const x = track.scrollLeft;
          let best = 0;
          slides.forEach((s, k) => { if (Math.abs(s.offsetLeft - track.offsetLeft - x) < Math.abs(slides[best].offsetLeft - track.offsetLeft - x)) best = k; });
          i = best; if (idx) idx.textContent = pad(i + 1);
        });
      }, { passive: true });
    } else {
      let x0 = 0, y0 = 0;
      root.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } }, { passive: true });
      root.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse' || !x0) return;
        const dx = e.clientX - x0, dy = e.clientY - y0; x0 = 0;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) show(i + (dx < 0 ? 1 : -1));
      }, { passive: true });
      show(0);
    }
  });
}
