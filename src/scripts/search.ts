// Search page: Pagefind static index (built after `astro build`). The index is per language
// (Pagefind reads <html lang>), so each locale only searches its own pages.
const root = document.querySelector<HTMLElement>('[data-search-page]');
if (root) {
  const form = root.querySelector<HTMLFormElement>('[data-search-form]')!;
  const input = form.querySelector<HTMLInputElement>('input')!;
  const status = root.querySelector<HTMLElement>('[data-search-status]')!;
  const list = root.querySelector<HTMLOListElement>('[data-search-results]')!;
  const base = (document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.getAttribute('href') ?? '/favicon.svg').replace(/favicon\.svg$/, '');
  const empty = status.textContent ?? '';
  const lang = document.documentElement.lang.slice(0, 2);
  const words = { en: ['result', 'results', 'No results for'], uz: ['natija', 'natija', 'Hech narsa topilmadi:'], ru: ['результат', 'результатов', 'Ничего не найдено по запросу'] }[lang as 'en'] ?? ['result', 'results', 'No results for'];

  type PF = { search: (q: string) => Promise<{ results: { data: () => Promise<{ url: string; excerpt: string; meta: { title?: string } }> }[] }>; init?: () => Promise<void> };
  let pf: Promise<PF> | undefined;
  const load = () => (pf ??= import(/* @vite-ignore */ `${base}pagefind/pagefind.js`) as Promise<PF>);

  let seq = 0;
  async function run(q: string) {
    const my = ++seq;
    const url = new URL(location.href);
    if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    if (!q.trim()) { list.replaceChildren(); status.textContent = empty; return; }
    try {
      const p = await load();
      const res = await p.search(q);
      const data = await Promise.all(res.results.slice(0, 20).map((r) => r.data()));
      if (my !== seq) return;
      list.replaceChildren(...data.map((d) => {
        const li = document.createElement('li'); li.className = 'dim-item';
        const a = document.createElement('a'); a.href = d.url;
        const t = document.createElement('span'); t.className = 't-headline-5'; t.textContent = d.meta.title ?? d.url;
        const e = document.createElement('span'); e.className = 't-body-4 fg-2'; e.innerHTML = d.excerpt; // Pagefind escapes and marks the excerpt
        a.append(t, e); li.append(a); return li;
      }));
      status.textContent = data.length ? `${data.length} ${data.length === 1 ? words[0] : words[1]}` : `${words[2]} “${q}”`;
    } catch {
      status.textContent = ({ uz: 'Qidiruv hozir ishlamayapti. Sahifani yangilab koʻring.', ru: 'Поиск сейчас недоступен. Попробуйте обновить страницу.' } as Record<string, string>)[lang] ?? 'Search is not available right now. Try reloading the page.';
    }
  }
  let timer = 0;
  input.addEventListener('input', () => { clearTimeout(timer); timer = window.setTimeout(() => run(input.value), 140); });
  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); });
  const q0 = new URL(location.href).searchParams.get('q');
  if (q0) { input.value = q0; run(q0); }
  input.focus();
}
