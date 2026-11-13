// Post bodies (news + research): images, ```steps diagrams (tools/remark-steps.mjs) and tables become numbered
// <figure>s with a "FIGURE n" caption, so the article layout can break them out of the reading column on a mat.
// Build time only (CSP: no inline scripts). Policy documents (src/content/docs) are left alone.
const LABEL = { en: 'Figure', uz: 'Rasm', ru: 'Рисунок' };
const POSTS = /[\\/]src[\\/]content[\\/](news|research)[\\/]/;

const el = (tagName, className, children, properties = {}) => ({ type: 'element', tagName, properties: { ...(className ? { className } : {}), ...properties }, children });
const txt = (value) => ({ type: 'text', value });
const isBlank = (n) => n.type === 'text' && !n.value.trim();

/** <p> holding just one image (optionally wrapped in a link) → that child */
function loneImage(node) {
  if (node.type !== 'element' || node.tagName !== 'p') return null;
  const kids = node.children.filter((c) => !isBlank(c));
  if (kids.length !== 1) return null;
  const k = kids[0];
  if (k.type === 'element' && k.tagName === 'img') return { media: k, img: k };
  if (k.type === 'element' && k.tagName === 'a') {
    const inner = k.children.filter((c) => !isBlank(c));
    if (inner.length === 1 && inner[0].type === 'element' && inner[0].tagName === 'img') return { media: k, img: inner[0] };
  }
  return null;
}

export default function rehypeFigures() {
  return (tree, file) => {
    const path = String(file?.path ?? file?.history?.[0] ?? '');
    if (!POSTS.test(path)) return;
    const locale = (path.match(/[\\/](en|uz|ru)\.md$/) ?? [])[1] ?? 'en';
    let n = 0;
    const figure = (kind, body, caption) => {
      n += 1;
      const cap = [el('span', ['fig__label'], [txt(`${LABEL[locale]} ${n}`)])];
      if (caption) cap.push(el('span', ['fig__text'], [txt(caption)]));
      return el('figure', ['fig', `fig--${kind}`], [el('div', ['fig__panel'], body), el('figcaption', ['fig__cap'], cap)]);
    };
    // Only top-level blocks: a table inside a list or a quote stays where it is.
    tree.children = tree.children.map((node) => {
      if (node.type === 'element' && node.tagName === 'table') {
        // the panel scrolls sideways on narrow screens, so it needs a keyboard stop (axe: scrollable-region-focusable)
        const f = figure('table', [node]);
        f.children[0].properties.tabIndex = 0;
        return f;
      }
      if (node.type === 'raw' && /^\s*<figure class="flow\b/.test(node.value)) {
        // the steps diagram becomes the figure's panel content; one <figure> per diagram, not two nested
        const value = node.value.trim().replace(/^<figure\b/, '<div').replace(/<\/figure>$/, '</div>');
        return figure('steps', [{ type: 'raw', value }]);
      }
      const lone = loneImage(node);
      if (lone) {
        const { title, alt } = lone.img.properties ?? {};
        const caption = String(title || alt || '').trim();
        return figure('image', [lone.media], caption);
      }
      return node;
    });
  };
}
