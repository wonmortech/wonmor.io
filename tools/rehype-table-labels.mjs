// Markdown tables → each body cell gets data-label (its column header), and tables with 3+ columns get
// class "table--stack" so prose.css can lay rows out as labelled cards on phones. Build time only (CSP: no inline scripts).
import { visit } from 'unist-util-visit';

const text = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(text).join(''));
const cells = (row) => row.children.filter((c) => c.type === 'element' && (c.tagName === 'td' || c.tagName === 'th'));

export default function rehypeTableLabels() {
  return (tree) => {
    visit(tree, 'element', (table) => {
      if (table.tagName !== 'table') return;
      const rows = [];
      visit(table, 'element', (n) => { if (n.tagName === 'tr') rows.push(n); });
      if (!rows.length) return;
      const head = cells(rows[0]).map((c) => text(c).trim());
      if (head.length < 3) return;
      table.properties.className = [...(table.properties.className ?? []), 'table--stack'];
      for (const row of rows.slice(1)) {
        cells(row).forEach((c, i) => {
          if (head[i]) c.properties.dataLabel = head[i];
          // one wrapper keeps mixed text and links together as a single grid item next to the label
          c.children = [{ type: 'element', tagName: 'span', properties: { className: ['td__v'] }, children: c.children }];
        });
      }
    });
  };
}
