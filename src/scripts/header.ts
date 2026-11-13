// Header behaviour: logo fold/unfold, hide-on-scroll, dropdowns, search, full-screen menu,
// and the slate swap when the footer slides under the header.
const doc = document.documentElement;
const header = document.querySelector<HTMLElement>('[data-header]');
const logo = document.querySelector<HTMLElement>('[data-logo]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- logo ---------------- */
const FOLD_AT = 40;
let folded = false;
function setFold(v: boolean) {
  if (!logo || v === folded) return;
  folded = v;
  logo.toggleAttribute('data-collapsed', v);
}
// First visit of the session: the W opens from a single V once the page has painted.
if (logo && !reduce && scrollY < FOLD_AT) {
  let seen = false;
  try { seen = sessionStorage.getItem('wm-intro') === '1'; sessionStorage.setItem('wm-intro', '1'); } catch { /* storage blocked */ }
  if (!seen) {
    logo.setAttribute('data-instant', '');
    logo.setAttribute('data-collapsed', '');
    void logo.offsetWidth;
    logo.removeAttribute('data-instant');
    setTimeout(() => { logo.removeAttribute('data-collapsed'); folded = false; }, 350);
  }
}

/* ---------------- dropdowns ---------------- */
const dds = [...document.querySelectorAll<HTMLElement>('[data-dd]')];
function anyOpen() { return dds.some((d) => d.querySelector('[aria-expanded="true"]')); }

/* ---------------- scroll: fold + hide/show ---------------- */
let lastY = scrollY, ticking = false;
function onScroll() {
  const y = scrollY;
  setFold(y > FOLD_AT);
  if (header && !header.hasAttribute('data-search-open') && !anyOpen()) {
    header.toggleAttribute('data-hidden', y > lastY && y > 320);
  }
  lastY = y;
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* ---------------- footer swap ---------------- */
const footer = document.querySelector('[data-footer]');
if (header && footer && 'IntersectionObserver' in window) {
  let io: IntersectionObserver | undefined;
  const watch = () => {
    io?.disconnect();
    io = new IntersectionObserver(([e]) => header.classList.toggle('theme-slate', e.isIntersecting),
      { rootMargin: `0px 0px -${Math.max(0, innerHeight - 84)}px 0px` });
    io.observe(footer);
  };
  watch();
  addEventListener('resize', watch, { passive: true });
}

function close(dd: HTMLElement, focus = false) {
  const btn = dd.querySelector<HTMLButtonElement>('.nav-dd__trigger');
  const pop = dd.querySelector<HTMLElement>('.nav-dd__popup');
  if (!btn || !pop || btn.getAttribute('aria-expanded') !== 'true') return;
  btn.setAttribute('aria-expanded', 'false');
  pop.setAttribute('data-starting', '');
  setTimeout(() => { if (btn.getAttribute('aria-expanded') === 'false') pop.hidden = true; }, reduce ? 0 : 150);
  if (focus) btn.focus();
}
function open(dd: HTMLElement) {
  dds.forEach((d) => d !== dd && close(d));
  const btn = dd.querySelector<HTMLButtonElement>('.nav-dd__trigger')!;
  const pop = dd.querySelector<HTMLElement>('.nav-dd__popup')!;
  btn.setAttribute('aria-expanded', 'true');
  pop.hidden = false;
  pop.setAttribute('data-starting', '');
  requestAnimationFrame(() => requestAnimationFrame(() => pop.removeAttribute('data-starting')));
}
for (const dd of dds) {
  const btn = dd.querySelector<HTMLButtonElement>('.nav-dd__trigger');
  if (!btn) continue;
  btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? close(dd) : open(dd)));
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); open(dd); dd.querySelector<HTMLElement>('.nav-item')?.focus(); }
  });
  dd.addEventListener('keydown', (e) => {
    const items = [...dd.querySelectorAll<HTMLElement>('.nav-item')];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') { e.preventDefault(); close(dd, true); }
    else if (i >= 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    } else if (i >= 0 && (e.key === 'Home' || e.key === 'End')) {
      e.preventDefault(); items[e.key === 'Home' ? 0 : items.length - 1].focus();
    }
  });
  dd.addEventListener('focusout', (e) => { if (e.relatedTarget && !dd.contains(e.relatedTarget as Node)) close(dd); });
}
document.addEventListener('pointerdown', (e) => { for (const dd of dds) if (!dd.contains(e.target as Node)) close(dd); });

/* ---------------- search ---------------- */
const form = document.querySelector<HTMLFormElement>('[data-search]');
const openBtn = document.querySelector<HTMLButtonElement>('[data-search-open]');
const closeBtn = document.querySelector<HTMLButtonElement>('[data-search-close]');
const input = form?.querySelector<HTMLInputElement>('input');
function setSearch(on: boolean) {
  if (!header || !input || !openBtn || !closeBtn) return;
  header.toggleAttribute('data-search-open', on);
  openBtn.setAttribute('aria-expanded', String(on));
  input.tabIndex = on ? 0 : -1; closeBtn.tabIndex = on ? 0 : -1;
  if (on) { header.removeAttribute('data-hidden'); setTimeout(() => input.focus(), 50); }
  else openBtn.focus();
}
openBtn?.addEventListener('click', () => setSearch(true));
closeBtn?.addEventListener('click', () => setSearch(false));
form?.addEventListener('keydown', (e) => { if (e.key === 'Escape') setSearch(false); });
form?.addEventListener('submit', (e) => { if (!input?.value.trim()) e.preventDefault(); });
document.addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.isContentEditable && !doc.hasAttribute('data-menu-open')) { e.preventDefault(); setSearch(true); }
});

/* ---------------- full-screen menu ---------------- */
const panel = document.querySelector<HTMLElement>('[data-menu-panel]');
const menuOpen = document.querySelector<HTMLButtonElement>('[data-menu-open]');
const menuClose = panel?.querySelector<HTMLButtonElement>('[data-menu-close]');
function setMenu(on: boolean) {
  if (!panel || !menuOpen) return;
  menuOpen.setAttribute('aria-expanded', String(on));
  doc.toggleAttribute('data-menu-open', on);
  if (on) {
    panel.hidden = false; panel.setAttribute('data-starting', '');
    requestAnimationFrame(() => requestAnimationFrame(() => panel.removeAttribute('data-starting')));
    menuClose?.focus();
  } else {
    panel.setAttribute('data-starting', '');
    setTimeout(() => { panel.hidden = true; }, reduce ? 0 : 150);
    menuOpen.focus();
  }
}
menuOpen?.addEventListener('click', () => setMenu(true));
menuClose?.addEventListener('click', () => setMenu(false));
panel?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { setMenu(false); return; }
  if (e.key !== 'Tab') return;
  const f = [...panel.querySelectorAll<HTMLElement>('a[href], button, summary')].filter((el) => el.offsetParent !== null);
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ---------------- reveal-on-scroll ---------------- */
const ups = document.querySelectorAll('.reveal-up');
if (ups.length && 'IntersectionObserver' in window) {
  const ro = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  ups.forEach((el) => ro.observe(el));
}
