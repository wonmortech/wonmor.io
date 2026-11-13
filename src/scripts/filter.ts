// Client-side list filter shared by /changelog and /news.
// Markup: a [data-filter] wrapper with data-filter-param="product" (the URL query key), chips [data-filter-set="<key>"]
// ("" = all), items [data-filter-key="<key>"], optional groups [data-filter-group] hidden when empty, and an optional
// [data-filter-count]. The choice is kept in the query string with replaceState, so a filtered view can be shared.
export function initFilters() {
  document.querySelectorAll<HTMLElement>('[data-filter]').forEach((wrap) => {
    const param = wrap.dataset.filterParam || 'filter';
    const scope = wrap.closest<HTMLElement>('[data-filter-scope]') ?? document.body;
    const chips = [...wrap.querySelectorAll<HTMLButtonElement>('[data-filter-set]')];
    const items = [...scope.querySelectorAll<HTMLElement>('[data-filter-key]')];
    const groups = [...scope.querySelectorAll<HTMLElement>('[data-filter-group]')];
    const count = scope.querySelector<HTMLElement>('[data-filter-count]');
    const known = new Set(chips.map((c) => c.dataset.filterSet ?? ''));
    const apply = (key: string, save: boolean) => {
      if (!known.has(key)) key = '';
      chips.forEach((c) => c.setAttribute('aria-pressed', String((c.dataset.filterSet ?? '') === key)));
      let n = 0;
      items.forEach((it) => { const on = !key || it.dataset.filterKey === key; it.hidden = !on; if (on) n++; });
      groups.forEach((g) => { g.hidden = !g.querySelector('[data-filter-key]:not([hidden])'); });
      if (count) count.textContent = String(n);
      if (save) {
        const url = new URL(location.href);
        if (key) url.searchParams.set(param, key); else url.searchParams.delete(param);
        history.replaceState(null, '', url);
      }
    };
    chips.forEach((c) => c.addEventListener('click', () => apply(c.dataset.filterSet ?? '', true)));
    apply(new URL(location.href).searchParams.get(param) ?? '', false);
  });
}
