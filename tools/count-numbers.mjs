// Recounts the home "numbers" band and writes src/data/numbers.json.
// Run by the owner with the GitHub CLI logged in as an account that can see every dtwinuz repository,
// because some repositories are private: `node tools/count-numbers.mjs`. CI never runs this, so a build
// without access cannot silently publish smaller, public-only numbers. Commit the JSON it writes.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const ORG = 'dtwinuz';
const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const lines = (s) => (s ? s.split('\n').filter(Boolean) : []);

const repos = lines(gh('api', '--paginate', `orgs/${ORG}/repos?per_page=100&type=all`, '-q', '.[] | select(.archived | not) | .name'));
const privateCount = Number(gh('api', `orgs/${ORG}`, '-q', '.total_private_repos // 0'));
if (privateCount === 0) console.warn('warning: no private repositories visible; is gh logged in with owner access?');

const mergedPRs = Number(gh('api', '-X', 'GET', 'search/issues', '-f', `q=org:${ORG} is:pr is:merged`, '-q', '.total_count'));
let releases = 0;
for (const r of repos) releases += lines(gh('api', '--paginate', `repos/${ORG}/${r}/releases?per_page=100`, '-q', '.[] | select(.draft | not) | .id')).length;

const out = { asOf: new Date().toISOString().slice(0, 10), org: ORG, repos: repos.length, mergedPRs, releases };
writeFileSync(new URL('../src/data/numbers.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(out);
