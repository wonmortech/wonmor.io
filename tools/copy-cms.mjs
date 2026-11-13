// Ships Sveltia CMS from node_modules (pinned in package.json) as site/admin/sveltia-cms.js, so
// /admin loads it from our own origin and the admin CSP needs no script CDN.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

const pkg = join('node_modules', '@sveltia', 'cms');
const from = join(pkg, 'dist', 'sveltia-cms.js');
const to = join('site', 'admin', 'sveltia-cms.js');

if (!existsSync(from)) { console.error(`copy-cms: ${from} not found`); process.exit(1); }
mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
console.log(`copy-cms ok: ${to} (${(statSync(to).size / 1024 / 1024).toFixed(1)} MB, v${JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8')).version})`);
