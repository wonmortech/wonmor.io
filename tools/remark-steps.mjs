// Markdown ```steps blocks → a numbered flow diagram rendered at build time (no client JS; the site's CSP forbids inline scripts).
// Each line: "Title :: one-sentence note". Lines without "::" become a title only.
import { visit } from 'unist-util-visit';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

export default function remarkSteps() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'steps' || !parent || index == null) return;
      const rows = node.value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const [t, ...rest] = l.split('::');
        return { t: t.trim(), n: rest.join('::').trim() };
      });
      const items = rows.map((r, i) =>
        `<li class="flow__step" style="--i:${i}"><span class="flow__node" aria-hidden="true">${i + 1}</span>` +
        `<span class="flow__title">${inline(r.t)}</span>${r.n ? `<span class="flow__note">${inline(r.n)}</span>` : ''}</li>`).join('');
      parent.children[index] = { type: 'html', value: `<figure class="flow reveal-up" style="--n:${rows.length}"><ol class="flow__list">${items}</ol></figure>` };
    });
  };
}
