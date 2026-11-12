// Renders the film frame by frame from comp/index.html and encodes it with ffmpeg.
// Usage: node film/tools/capture.cjs <9x16|16x9> [--sheet t1,t2,...] [--samples 4] [--from s --to s]
// Env: PW_CORE (playwright-core path), CHROME (chrome.exe)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require(process.env.PW_CORE);

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const fmt = args[0] || '9x16';
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const samples = +opt('--samples', 4);
const sheet = opt('--sheet', null);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const [W, H] = fmt === '9x16' ? [1080, 1920] : [1920, 1080];
  const b = await chromium.launch({ executablePath: process.env.CHROME });
  const page = await b.newPage({ viewport: { width: W, height: H } });
  page.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') console.log('[page]', m.text()); });
  await page.goto(`http://127.0.0.1:${port}/comp/index.html?fmt=${fmt}`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
  const missing = await page.evaluate(() => window.film.missing);
  if (missing.length) console.log('missing assets:', missing.length, missing.slice(0, 5));
  const { fps, duration } = await page.evaluate(() => window.timeline);
  const outDir = path.join(ROOT, 'out', 'film');
  fs.mkdirSync(outDir, { recursive: true });

  if (sheet) {
    const ts = sheet.split(',').map(Number);
    const dir = path.join(outDir, 'sheet_' + fmt);
    fs.mkdirSync(dir, { recursive: true });
    for (const t of ts) {
      await page.evaluate(([t, s]) => window.film.renderAt(t, s), [t, 1]);
      await page.screenshot({ path: path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`) });
    }
    console.log('sheet frames:', ts.length, dir);
  } else {
    const from = +opt('--from', 0), to = +opt('--to', duration);
    const f0 = Math.round(from * fps), f1 = Math.round(to * fps);
    const out = path.join(outDir, `wonmor_film_${fmt}${from || to !== duration ? `_${from}-${to}` : ''}.mp4`);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = f0; f < f1; f++) {
      await page.evaluate(([t, s]) => window.film.renderAt(t, s), [f / fps, samples]);
      const png = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
      if ((f - f0) % 30 === 0) console.log(`frame ${f}/${f1} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    console.log('wrote', out);
  }
  await b.close();
  server.close();
})();
