// Letter-by-letter Uzbek Cyrillic -> 2026 Latin, driven only by alphabet/cyrillic-to-latin-2026.csv.
// The two conditional rows (е, ц) and the case rule follow alphabet/README.md, which documents bitg's
// behaviour. This is the letter table, not a full converter: names and foreign words are not protected.

export const VOWELS = new Set([...'аеёиоуўэюяы']);

export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const head = lines.shift().split(',');
  return lines.map((line) => {
    const cells = line.split(',');
    // the condition column can itself contain commas; everything after the 4th comma belongs to it
    const row = Object.fromEntries(head.slice(0, 4).map((h, i) => [h, cells[i] ?? '']));
    row.condition = cells.slice(4).join(',');
    return row;
  });
}

export function buildTable(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.cyrillic_lower)) map.set(r.cyrillic_lower, []);
    map.get(r.cyrillic_lower).push(r);
  }
  return map;
}

const isLetter = (ch) => !!ch && /\p{L}/u.test(ch);
const isUpper = (ch) => ch !== ch.toLowerCase() && ch === ch.toUpperCase();

function pickRow(rows, lower, prev) {
  if (rows.length === 1) return rows[0];
  const p = prev ? prev.toLowerCase() : '';
  let first;
  if (lower === 'е') first = !isLetter(prev) || VOWELS.has(p) || p === 'ъ' || p === 'ь';
  else if (lower === 'ц') first = VOWELS.has(p);
  else first = true;
  return first ? rows[0] : rows[1];
}

/** Convert text; returns { text, steps } where steps explain each converted letter. */
export function convert(input, table) {
  const chars = [...input];
  let out = '';
  const steps = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const lower = ch.toLowerCase();
    const rows = table.get(lower);
    if (!rows) { out += ch; continue; }
    const row = pickRow(rows, lower, chars[i - 1]);
    let latin = row.latin_lower;
    if (isUpper(ch)) {
      let s = i, e = i;
      while (s > 0 && isLetter(chars[s - 1])) s--;
      while (e < chars.length - 1 && isLetter(chars[e + 1])) e++;
      const word = chars.slice(s, e + 1).filter(isLetter);
      const allCaps = word.length > 1 && word.every((c) => !/\p{Ll}/u.test(c));
      latin = allCaps ? row.latin_lower.toUpperCase() : row.latin_upper;
    }
    out += latin;
    steps.push({ from: ch, to: latin, condition: row.condition });
  }
  return { text: out, steps };
}

export const hasCyrillic = (s) => /[Ѐ-ӿ]/.test(s || '');
