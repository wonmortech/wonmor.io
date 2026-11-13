// Writes src/components/ui/marks/marks.css (the morph keyframes of the area marks) from glyphs.mjs.
// tools/check-art.mjs fails the build when the committed CSS is out of date, so run this after editing a glyph.
import { writeFileSync } from 'node:fs';
import { css } from '../src/components/ui/marks/glyphs.mjs';
const out = new URL('../src/components/ui/marks/marks.css', import.meta.url);
writeFileSync(out, css());
console.log('gen-marks: wrote', out.pathname);
