import { siSalesforce, siHubspot, siSlack, siZoom, siGooglemeet, siGmail, siZendesk, siNotion, siJira } from 'simple-icons';
import { lockupSVG, markSVG, stepSVG } from './brand.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

$$('[data-lockup]').forEach((n) => { n.innerHTML = lockupSVG({ text: n.dataset.text || 'currentColor' }); });
$$('[data-mark]').forEach((n) => { n.innerHTML = markSVG({ fill: n.dataset.fill || 'currentColor' }); });
$$('[data-step]').forEach((n) => { n.innerHTML = stepSVG(+n.dataset.step); });

const ICONS = { salesforce: siSalesforce, hubspot: siHubspot, slack: siSlack, zoom: siZoom, googlemeet: siGooglemeet, gmail: siGmail, zendesk: siZendesk, notion: siNotion, jira: siJira };
$$('[data-si]').forEach((n) => {
  const i = ICONS[n.dataset.si];
  if (!i) return;
  n.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#${i.hex}" d="${i.path}"/></svg>`);
});

// nav: solid once the page moves, full-screen menu on small screens
const nav = $('#wm-nav');
const onScroll = () => nav.classList.toggle('wm-solid', scrollY > 8);
onScroll();
addEventListener('scroll', onScroll, { passive: true });
const burger = $('.wm-burger');
const menu = $('#wm-menu');
const setMenu = (open) => {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.hidden = !open;
  document.body.classList.toggle('wm-locked', open);
};
burger.addEventListener('click', () => setMenu(menu.hidden));
$$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

// brand film: both videos share one pause control; they rest under reduced motion
const film = $('#wm-film');
const phone = $('#wm-film-phone');
const vids = [film, phone].filter(Boolean);
let held = reduced;
const play = $('#wm-play');
const snd = $('#wm-sound');
const sync = () => { play.textContent = held ? 'Play film' : 'Pause film'; play.setAttribute('aria-pressed', String(held)); };
if (reduced) vids.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
sync();
play.addEventListener('click', () => {
  held = !held;
  vids.forEach((v) => (held ? v.pause() : v.play().catch(() => {})));
  sync();
});
snd.addEventListener('click', () => {
  const on = film.muted;
  film.muted = !on;
  snd.setAttribute('aria-pressed', String(on));
  snd.textContent = on ? 'Turn sound off' : 'Turn sound on';
  if (on) { held = false; film.play().catch(() => {}); sync(); }
});
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) e.target.pause();
  else if (!held) e.target.play().catch(() => {});
}), { threshold: 0.1 });
vids.forEach((v) => io.observe(v));

// demo form: open the mail client with the address filled in
$('.wm-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#wm-email').value.trim();
  location.href = `mailto:hello@wonmor.example?subject=${encodeURIComponent('wonmor demo')}&body=${encodeURIComponent('Work email: ' + v)}`;
});
