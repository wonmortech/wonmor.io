// Rasterises the IG profile screen and alpha PNGs of the mark for Blender textures.
// Usage: node film/tools/raster.cjs   (needs PW_CORE = path to playwright-core, CHROME = chrome.exe)
const path = require('path');
const fs = require('fs');
const { chromium } = require(process.env.PW_CORE);

const ROOT = path.resolve(__dirname, '..');
const GEO = JSON.parse(fs.readFileSync(path.join(ROOT, 'out', 'data', 'geo.json'), 'utf8'));
const OUT = path.join(ROOT, 'out', 'textures');
fs.mkdirSync(OUT, { recursive: true });
const url = (p) => 'file:///' + p.replace(/\\/g, '/');

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME });
  const p = await b.newPage({ viewport: { width: 1179, height: 2556 } });
  await p.goto(url(path.join(ROOT, 'plates', 'ig-screen.html')));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  const ava = await p.evaluate(() => { const r = document.getElementById('ava').getBoundingClientRect(); return { cx: r.x + r.width / 2, cy: r.y + r.height / 2, r: r.width / 2, w: innerWidth, h: innerHeight }; });
  await p.screenshot({ path: path.join(OUT, 'ig-screen.png') });
  fs.writeFileSync(path.join(OUT, 'ig-screen.json'), JSON.stringify(ava));

  for (const [svg, w] of [['mark-w_blue', 2048], ['mark-w_white', 2048], ['mark-w_ink', 2048]]) {
    const q = await b.newPage({ viewport: { width: w, height: Math.round(w * GEO.mark.h / GEO.mark.w) } });
    const src = fs.readFileSync(path.join(ROOT, 'out', 'vectors', svg + '.svg'), 'utf8').replace(/ width="[^"]+" height="[^"]+"/, ' width="100%" height="100%" preserveAspectRatio="xMidYMid meet"');
    await q.setContent(`<html><body style="margin:0;background:transparent;width:100vw;height:100vh;overflow:hidden">${src}</body></html>`);
    await q.waitForTimeout(100);
    await q.screenshot({ path: path.join(OUT, svg + '.png'), omitBackground: true });
    await q.close();
  }
  await b.close();
  console.log('avatar', JSON.stringify(ava));
})();
