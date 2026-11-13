// Pointer spotlight for the "dots" and "glass" themes (styles in src/styles/fx.css).
// Moves the round light window and counter-moves the lit lattice inside it, transforms only (compositor), so following
// the pointer never repaints; the soft follow is the CSS transition, not a JS loop. Touch screens move it to the last tap.
const lit = document.querySelector<HTMLElement>('[data-fx-lit]');
const litDots = lit?.firstElementChild as HTMLElement | null;
const root = document.documentElement;

if (lit && litDots) {
  let x = 0, y = 0, raf = 0, listening = false;
  const write = () => {
    raf = 0;
    const r = lit.offsetWidth / 2;
    lit.style.transform = `translate3d(${x - r}px, ${y - r}px, 0)`;
    litDots.style.transform = `translate3d(${r - x}px, ${r - y}px, 0)`;
  };
  const move = (e: PointerEvent) => {
    x = e.clientX; y = e.clientY;
    lit.setAttribute('data-on', '');
    if (!raf) raf = requestAnimationFrame(write);
  };
  const leave = (e: PointerEvent) => { if (e.pointerType === 'mouse') lit.removeAttribute('data-on'); };
  const sync = () => {
    const on = root.dataset.theme === 'dots' || root.dataset.theme === 'glass';
    if (on && !listening) {
      addEventListener('pointermove', move, { passive: true });
      addEventListener('pointerdown', move, { passive: true });
      document.addEventListener('pointerleave', leave);
      listening = true;
      // start the light near the top third so the lattice is never flat before the first move
      x = innerWidth * .62; y = innerHeight * .28; write(); lit.setAttribute('data-on', '');
    } else if (!on && listening) {
      removeEventListener('pointermove', move);
      removeEventListener('pointerdown', move);
      document.removeEventListener('pointerleave', leave);
      lit.removeAttribute('data-on');
      listening = false;
    }
  };
  sync();
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
}
