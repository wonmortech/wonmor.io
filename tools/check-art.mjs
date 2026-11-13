// Post-build gate for the illustration system. Exits 1 on any failure.
// 1. Unique post art: on every built page, plates that carry a seed (post and news cards; Plate.astro emits data-seed
//    only when a seed is passed) must not share a data-art signature ("<motif>:<variant>:<tone>") across different seeds.
//    The same seed may repeat (a post shown twice on one page is the same picture on purpose).
// 2. The committed morph keyframes of the area marks (src/components/ui/marks/marks.css) match glyphs.mjs.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { css } from '../src/components/ui/marks/glyphs.mjs';

const ROOT = fileURLToPath(new URL('../site/', import.meta.url));
const pages = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (!['admin', 'pagefind'].includes(relative(ROOT, p).split(sep)[0])) walk(p); }
    else if (f === 'index.html') pages.push(p);
  }
})(ROOT);

const errors = [];
let plates = 0, seeded = 0;
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`)); return m ? (m[1] ?? m[2] ?? m[3]) : null; };
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const bySig = new Map();
  for (const [tag] of html.matchAll(/<div\b[^>]*\sdata-art=[^>]*>/g)) {
    plates++;
    const sig = attr(tag, 'data-art'), seed = attr(tag, 'data-seed');
    if (!sig || seed === null) continue;
    seeded++;
    if (!bySig.has(sig)) bySig.set(sig, new Set());
    bySig.get(sig).add(seed);
  }
  for (const [sig, seeds] of bySig) {
    if (seeds.size > 1) errors.push(`${relative(ROOT, file).split(sep).join('/')}: ${sig} shared by ${[...seeds].join(', ')}`);
  }
}

const marks = fileURLToPath(new URL('../src/components/ui/marks/marks.css', import.meta.url));
if (readFileSync(marks, 'utf8') !== css()) errors.push('src/components/ui/marks/marks.css is out of date: run node tools/gen-marks.mjs');

if (errors.length) {
  console.error(`check-art: ${errors.length} problem(s)\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`check-art ok: ${pages.length} pages, ${plates} plates, ${seeded} seeded, no repeated art`);
