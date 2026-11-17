'use strict';
// Live demo data layer (scripts/build-demo.mjs injects this before admin.js; production never loads it).
// Replaces fetch('/admin/api/...') and EventSource('/admin/api/live') with an in-memory gateway:
// fictional company "Acme", fictional people, RFC 5737 documentation IPs. Every change resets on reload.
(function () {
  const NOW = Date.now();
  const MIN = 60e3, HOUR = 3600e3, DAY = 86400e3;
  let seed = 20261117;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const hex = (n) => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // ---------------------------------------------------------------- connectors and tools
  const S = (description, extra = {}) => ({ type: 'string', description, ...extra });
  const N = (description, extra = {}) => ({ type: 'integer', description, ...extra });
  const DBS = ['acme_prod_ro', 'acme_stage', 'acme_billing_ro'];
  const PROJECTS = ['acme/platform', 'acme/billing', 'acme/web', 'acme/mobile'];
  const dbProp = S("ma'lumotlar bazasi", { enum: DBS });
  const projectProp = S('GitLab loyiha (odatiy acme/platform)', { enum: PROJECTS });
  const schema = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const ACME_TOOLS = [
    { name: 'jira_search', description: 'Jira tasklarini JQL bilan qidirish (masalan: project = ACME AND text ~ "invoice" ORDER BY updated DESC). Natija: key, holat, ijrochi, sarlavha.', inputSchema: schema({ jql: S("JQL so'rov"), limit: N('nechta (1..30, odatiy 15)', { minimum: 1, maximum: 30 }) }, ['jql']) },
    { name: 'jira_issue', description: "Bitta Jira taskini to'liq o'qish: tavsif, kommentlar, bog'langan tasklar, subtask, attachment nomlari.", inputSchema: schema({ key: S('Task kaliti, masalan ACME-1042', { pattern: '^[A-Z][A-Z0-9]+-\\d+$' }), comments: N('oxirgi nechta komment (odatiy 20)', { minimum: 0, maximum: 100 }) }, ['key']) },
    { name: 'gitlab_mrs', description: "Merge request'larni qidirish (sarlavha/tavsif bo'yicha, holat, muallif).", inputSchema: schema({ search: S('qidiruv matni, masalan ACME-1042'), state: S('opened | merged | closed | all', { enum: ['opened', 'merged', 'closed', 'all'] }), author: S('GitLab username'), limit: N('1..50, odatiy 20', { minimum: 1, maximum: 50 }), project: projectProp }) },
    { name: 'gitlab_mr', description: "Bitta merge request: sarlavha, tavsif, holat, pipeline, o'zgargan fayllar va diff (kesilgan).", inputSchema: schema({ iid: N('MR raqami (!123 → 123)', { minimum: 1 }), diff: N("diff uchun belgilar limiti (odatiy 40000, 0 = faqat fayl ro'yxati)", { minimum: 0, maximum: 100000 }), project: projectProp }, ['iid']) },
    { name: 'gitlab_file', description: "Repo faylini o'qish (ixtiyoriy qator oralig'i bilan).", inputSchema: schema({ path: S("fayl yo'li, masalan src/billing/invoice.ts"), ref: S('branch/tag/commit (odatiy main)'), from: N("boshlang'ich qator (1 dan)", { minimum: 1 }), to: N('oxirgi qator', { minimum: 1 }), project: projectProp }, ['path']) },
    { name: 'gitlab_search', description: "Repo kodi bo'yicha matn qidirish (blob search).", inputSchema: schema({ query: S('qidiruv matni'), ref: S('branch (odatiy main)'), limit: N('1..50, odatiy 20', { minimum: 1, maximum: 50 }), project: projectProp }, ['query']) },
    { name: 'gitlab_commits', description: "Branch (ixtiyoriy fayl) bo'yicha oxirgi commitlar.", inputSchema: schema({ ref: S('branch (odatiy main)'), path: S('fayl yoki papka (ixtiyoriy)'), limit: N('1..50, odatiy 20', { minimum: 1, maximum: 50 }), project: projectProp }) },
    { name: 'sql_schema', description: `SQL Server sxemasi: jadval nomi berilmasa — jadvallar ro'yxati (filtr bilan), berilsa — ustunlar, turlari va indekslar. DB'lar: ${DBS.join(', ')}.`, inputSchema: schema({ db: dbProp, table: S('jadval (masalan dbo.Invoice yoki Invoice)'), like: S('jadval nomi filtri (masalan %Invoice%)') }, ['db']) },
    { name: 'sql_query', description: `Faqat o'qish uchun SQL (bitta SELECT yoki WITH…SELECT). Tranzaksiya ichida yuradi va har doim ROLLBACK qilinadi, READ UNCOMMITTED, 30 s timeout. Ko'pi bilan 200 qator. DB'lar: ${DBS.join(', ')}.`, inputSchema: schema({ db: dbProp, sql: S('T-SQL SELECT'), maxRows: N('1..200, odatiy 50', { minimum: 1, maximum: 200 }) }, ['db', 'sql']) },
  ];
  const WH_TOOLS = [
    { name: 'stock_search', description: "Ombor qoldiqlari: mahsulot nomi yoki SKU bo'yicha qidirish.", inputSchema: schema({ query: S('mahsulot nomi yoki SKU'), warehouse: S('ombor', { enum: ['Sergeli', 'Chilonzor', 'Yunusobod'] }) }, ['query']) },
    { name: 'stock_moves', description: "Oxirgi kirim-chiqim harakatlari (sana oralig'i bilan).", inputSchema: schema({ sku: S('SKU'), days: N('necha kun (1..30)', { minimum: 1, maximum: 30 }) }, ['sku']) },
  ];
  const DOC_TOOLS = [
    { name: 'wiki_search', description: "Ichki wiki sahifalari bo'yicha qidirish.", inputSchema: schema({ query: S('qidiruv matni') }, ['query']) },
    { name: 'wiki_page', description: "Wiki sahifasini to'liq o'qish.", inputSchema: schema({ id: N('sahifa raqami', { minimum: 1 }) }, ['id']) },
  ];
  const health = (n, failFrom = -1, flaky = 0) => Array.from({ length: n }, (_, i) => (failFrom >= 0 && i >= failFrom ? 0 : rnd() < flaky ? 0 : 1));
  const connectors = {
    acme: { url: 'https://acme-office-gwc.tunnel.example/', enabled: true, online: true, latency: 38, server: 'acme-connector 0.4.2', hasSecret: true, health: health(120, -1, 0.012), lastOk: NOW - 22e3, lastErr: '', lastErrAt: 0, tools: ACME_TOOLS },
    warehouse: { url: 'https://acme-wh-gwc.tunnel.example/', enabled: true, online: false, latency: 0, server: 'acme-connector 0.4.1', hasSecret: true, health: health(120, 112, 0.03), lastOk: NOW - 9 * MIN, lastErr: 'connect ETIMEDOUT 198.51.100.24:443 (tunnel mijozi javob bermayapti)', lastErrAt: NOW - 40e3, tools: WH_TOOLS },
    docs: { url: 'https://acme-docs-gwc.tunnel.example/', enabled: false, online: true, latency: 61, server: 'acme-wiki-mcp 1.0.0', hasSecret: true, health: health(120, -1, 0.0), lastOk: NOW - 2 * HOUR, lastErr: '', lastErrAt: 0, tools: DOC_TOOLS },
  };
  const fullName = (c, t) => `${c}-${t}`;

  // ---------------------------------------------------------------- agents (fictional people)
  const agents = {
    'alisher-claude': { owner: 'Alisher Karimov · backend', note: 'Claude Code: billing xatolarini tahlil qilish', tools: ['acme-*'], rpm: 60, client: 'claude-code 2.4.1', lastIp: '203.0.113.14', created: NOW - 41 * DAY, rotated: NOW - 6 * DAY, expires: NOW + 84 * DAY, ipAllow: [], argAllow: {}, weight: 9 },
    'dilnoza-cursor': { owner: 'Dilnoza Rahimova · frontend', note: 'Cursor: MR va kod qidirish', tools: ['acme-gitlab_*', 'acme-jira_search', 'acme-jira_issue'], rpm: 30, client: 'cursor 1.9.3', lastIp: '203.0.113.27', created: NOW - 33 * DAY, rotated: 0, expires: NOW + 120 * DAY, ipAllow: ['203.0.113.'], argAllow: {}, weight: 6 },
    'sardor-codex': { owner: 'Sardor Tursunov · data', note: 'SQL hisobotlar, faqat stage va billing', tools: ['acme-sql_*'], rpm: 40, client: 'codex-cli 0.48.0', lastIp: '203.0.113.41', created: NOW - 27 * DAY, rotated: 0, expires: NOW + 60 * DAY, ipAllow: [], argAllow: { db: ['acme_stage', 'acme_billing_ro'] }, weight: 7 },
    'madina-claude': { owner: 'Madina Yusupova · QA', note: 'Test ssenariylari uchun Jira va SQL', tools: ['acme-jira_*', 'acme-sql_query'], rpm: 30, client: 'claude-code 2.4.0', lastIp: '203.0.113.52', created: NOW - 19 * DAY, rotated: 0, expires: NOW + 4 * DAY, ipAllow: [], argAllow: { db: ['acme_stage'] }, weight: 4 },
    'support-copilot': { owner: 'Nodira Saidova · support', note: "Mijoz murojaatlari bo'yicha task holati", tools: ['acme-jira_search', 'acme-jira_issue', 'acme-sql_query'], rpm: 20, client: 'copilot-agent 1.2.0', lastIp: '198.51.100.71', created: NOW - 14 * DAY, rotated: 0, expires: 0, ipAllow: ['198.51.100.71'], argAllow: { db: ['acme_prod_ro'] }, weight: 3 },
    'report-agent': { owner: 'Javohir Nematov · moliya', note: 'Kunlik tushum hisoboti (cron)', tools: ['acme-sql_query', 'warehouse-*'], rpm: 10, client: 'acme-report-bot 0.3', lastIp: '198.51.100.12', created: NOW - 52 * DAY, rotated: NOW - 20 * DAY, expires: 0, ipAllow: [], argAllow: { db: ['acme_billing_ro'] }, paused: { reason: '200 qatorli SELECT * so\'rovlari takrorlanmoqda, sozlama tekshiriladi', at: NOW - 3 * HOUR }, weight: 2 },
    'ci-reviewer': { owner: 'Bekzod Ergashev · DevOps', note: "MR review bot (eski token)", tools: ['acme-gitlab_mr', 'acme-gitlab_file'], rpm: 30, client: 'mr-review-bot 0.9', lastIp: '198.51.100.33', created: NOW - 95 * DAY, rotated: 0, expires: NOW - 2 * DAY, ipAllow: [], argAllow: {}, weight: 1 },
    'gulnora-zed': { owner: 'Gulnora Qodirova · mobile', note: "Zed editor: mobil ilova MR'lari", tools: ['acme-gitlab_*'], rpm: 30, client: 'zed 0.212', lastIp: '203.0.113.88', created: NOW - 5 * DAY, rotated: 0, expires: NOW + 90 * DAY, ipAllow: [], argAllow: {}, weight: 3 },
  };
  for (const a of Object.values(agents)) { a.calls = 0; a.lastSeen = 0; a.paused ||= null; }

  const state = {
    killed: null,
    mask: { pinfl: true, passport: true, phone: true, email: true, card: true, secret: true, inn: false },
    customMasks: [
      { id: 'm1', name: 'Hisob raqami (20 xona)', type: 'regex', pattern: '\\b\\d{20}\\b', ci: false, keepStart: 4, keepEnd: 4, replace: '', enabled: true },
      { id: 'm2', name: 'Ism-familiya ustunlari', type: 'column', pattern: '^(first_?name|last_?name|full_?name|director)$', ci: true, keepStart: 1, keepEnd: 0, replace: '', enabled: true },
      { id: 'm3', name: 'Manzil ustunlari', type: 'column', pattern: '^(address|street|manzil)$', ci: true, keepStart: 0, keepEnd: 0, replace: '[manzil]', enabled: false },
    ],
    alerts: { kill: true, mask: true, connector: true, agents: true, auth: true, adminLogin: true, burst: true, burstN: 5, bigRows: true, bigRowsN: 150 },
  };
  const alertLog = [
    { ts: NOW - 40e3, kind: 'connector', title: '🔌 warehouse offline', text: 'connect ETIMEDOUT · 2 ta tekshiruv ketma-ket', ok: true, err: '' },
    { ts: NOW - 3 * HOUR, kind: 'agents', title: '⏸ report-agent pauza qilindi', text: "200 qatorli SELECT * so'rovlari takrorlanmoqda", ok: true, err: '' },
    { ts: NOW - 3 * HOUR - 4 * MIN, kind: 'bigRows', title: '📦 report-agent: katta natija — 200 qator', text: 'acme-sql_query · SELECT * FROM dbo.Payment', ok: true, err: '' },
    { ts: NOW - 5 * HOUR, kind: 'auth', title: '🔐 ci-reviewer: ulanish rad etildi', text: 'token muddati tugagan · IP: 198.51.100.33', ok: true, err: '' },
    { ts: NOW - 26 * HOUR, kind: 'kill', title: '✅ Gateway qayta yoqildi', text: 'IP: 203.0.113.5', ok: true, err: '' },
    { ts: NOW - 26 * HOUR - 12 * MIN, kind: 'kill', title: '🛑 Kill-switch YOQILDI', text: "Sabab: prod DB'ga g'ayrioddiy ko'p so'rov · IP: 203.0.113.5", ok: true, err: '' },
    { ts: NOW - 2 * DAY, kind: 'mask', title: "🎭 Niqob o'chirildi", text: 'email=off — QA uchun 30 daqiqa · IP: 203.0.113.5', ok: false, err: 'Telegram: Too Many Requests: retry after 12' },
  ];

  // ---------------------------------------------------------------- response bodies
  const FIRST = ['Aziz', 'Bobur', 'Dilshod', 'Feruza', 'Gulbahor', 'Hamid', 'Iroda', 'Jasur', 'Kamola', 'Laziz', 'Malika', 'Nilufar', 'Otabek', 'Rustam', 'Sevara', 'Temur', 'Umida', 'Zarina', 'Shaxzod', 'Yulduz'];
  const LAST = ['Abdullayev', 'Boboyev', 'Hasanov', 'Ismoilov', 'Jurayev', 'Mirzayev', 'Nazarov', 'Olimov', 'Qosimov', 'Raximov', 'Sobirov', 'Toshmatov', 'Umarov', 'Valiyev', 'Xolmatov', 'Yoqubov'];
  const COMPANIES = ['"Samarqand Savdo" MChJ', '"Chilonzor Tekstil" MChJ', '"Orient Logistik" AJ', '"Navro\'z Agro" MChJ', '"Yashil Vodiy" XK', '"Toshkent Qurilish Servis" MChJ', '"Buxoro Ipak" MChJ', '"Farg\'ona Meva" MChJ', '"Andijon Avto Detal" MChJ', '"Zarafshon Energo" AJ', '"Sirdaryo Don" MChJ', '"Ipak Yo\'li Trans" MChJ'];
  const SUMMARIES = ['Hisob-faktura PDF da QQS summasi yaxlitlanmayapti', "To'lov qaytarilganda balans ikki marta yangilanadi", "Kontragent qidiruvi STIR bo'yicha sekin (4 s)", "Mobil ilovada imzo oynasi yopilmaydi", "Oylik hisobotga filial ustunini qo'shish", 'Callback navbati 15 daqiqa kechikmoqda', "Ombor qoldig'i manfiy bo'lib qolmoqda", 'Excel eksportda sana formati noto\'g\'ri', "Yangi tarif: yillik obuna chegirmasi", "Login sahifasida 2FA kod qayta yuborilmaydi", "Hamkor API: 429 limitini oshirish", "Faktura ro'yxati filtrlari URL'da saqlansin"];
  const STATUSES = ['To Do', 'In Progress', 'Code Review', 'Testing', 'Done'];
  const issues = Array.from({ length: 48 }, (_, i) => ({ key: `ACME-${1000 + i * 7}`, summary: pick(SUMMARIES), status: pick(STATUSES), type: pick(['Bug', 'Task', 'Story', 'Bug']), assignee: `${pick(FIRST)} ${pick(LAST)}`, updated: NOW - int(1, 400) * HOUR, prio: pick(['High', 'Medium', 'Medium', 'Low', 'Highest']) }));
  const d10 = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
  const phone = () => `+998 ** *** ** ${int(10, 99)}`;
  const card = () => `**** **** **** ${int(1000, 9999)}`;
  const mail = (f) => `${f[0].toLowerCase()}***@${pick(['mail.uz', 'gmail.com', 'acme.uz'])}`;
  const mdTable = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map((c) => String(c).replace(/\|/g, '\\|')).join(' | ')} |`)].join('\n');
  const SQLS = [
    { sql: 'SELECT TOP 20 i.Id, i.Number, c.Name AS Contractor, i.Total, i.Status, i.CreatedAt FROM dbo.Invoice i JOIN dbo.Contractor c ON c.Id = i.ContractorId WHERE i.Status = 3 ORDER BY i.CreatedAt DESC', kind: 'invoice' },
    { sql: "SELECT TOP 30 Id, FullName, Phone, Email, Pinfl, Branch FROM dbo.Customer WHERE Branch = N'Yunusobod' ORDER BY Id DESC", kind: 'customer' },
    { sql: 'SELECT CAST(PaidAt AS date) AS Day, COUNT(*) AS Payments, SUM(Amount) AS Amount FROM dbo.Payment WHERE PaidAt >= DATEADD(day, -14, GETDATE()) GROUP BY CAST(PaidAt AS date) ORDER BY Day DESC', kind: 'daily' },
    { sql: 'SELECT TOP 15 p.Id, p.CardNumber, p.Amount, p.Provider, p.State, p.Error FROM dbo.Payment p WHERE p.State = -1 ORDER BY p.Id DESC', kind: 'failed' },
    { sql: 'WITH q AS (SELECT Status, COUNT(*) n FROM dbo.Invoice WHERE CreatedAt >= CAST(GETDATE() AS date) GROUP BY Status) SELECT * FROM q ORDER BY n DESC', kind: 'status' },
    { sql: 'SELECT TOP 25 Id, Name, Inn, Director, Phone, Region FROM dbo.Contractor WHERE Region = N\'Toshkent sh.\' ORDER BY Id', kind: 'contractor' },
  ];
  function sqlResult(kind, n) {
    let head, rows, masked = {};
    const add = (k, v = 1) => { masked[k] = (masked[k] || 0) + v; };
    if (kind === 'invoice') { head = ['Id', 'Number', 'Contractor', 'Total', 'Status', 'CreatedAt']; rows = Array.from({ length: n }, (_, i) => [88412 - i * 3, `HF-2026/${11000 - i * 3}`, pick(COMPANIES), (int(12, 980) * 125000).toString(), 3, d10(NOW - i * 47 * MIN)]); }
    else if (kind === 'customer') { head = ['Id', 'FullName', 'Phone', 'Email', 'Pinfl', 'Branch']; rows = Array.from({ length: n }, (_, i) => { const f = pick(FIRST); add('phone'); add('email'); add('pinfl'); return [5120 - i, `${f} ${pick(LAST)}`, phone(), mail(f), `3${int(0, 9)}**********${int(10, 99)}`, 'Yunusobod']; }); }
    else if (kind === 'daily') { head = ['Day', 'Payments', 'Amount']; rows = Array.from({ length: Math.min(n, 14) }, (_, i) => [new Date(NOW - i * DAY).toISOString().slice(0, 10), int(380, 1240), (int(90, 420) * 1000000 + int(0, 999999)).toString()]); }
    else if (kind === 'failed') { head = ['Id', 'CardNumber', 'Amount', 'Provider', 'State', 'Error']; rows = Array.from({ length: n }, (_, i) => { add('card'); return [771200 - i * 11, card(), (int(5, 400) * 10000).toString(), pick(['Uzcard', 'Humo', 'Payme', 'Click']), -1, pick(['insufficient funds', 'card expired', 'timeout 30s', 'NULL'])]; }); }
    else if (kind === 'status') { head = ['Status', 'n']; rows = [[1, int(800, 1500)], [3, int(500, 900)], [2, int(100, 300)], [-1, int(5, 40)], [4, int(1, 20)]]; }
    else { head = ['Id', 'Name', 'Inn', 'Director', 'Phone', 'Region']; rows = Array.from({ length: n }, (_, i) => { add('phone'); add('c:m2'); const f = pick(FIRST); return [3301 + i, pick(COMPANIES), `30${int(1000000, 9999999)}`, `${f[0]}*** ${pick(LAST)}`, phone(), 'Toshkent sh.']; }); }
    return { text: `${mdTable(head, rows)}\n\n${rows.length} qator · ${int(20, 900)} ms · READ UNCOMMITTED · ROLLBACK`, rows: rows.length, masked };
  }
  function bodyFor(tool, args) {
    const t = tool.replace(/^[a-z0-9]+-/, '');
    if (t === 'sql_query') { const q = SQLS.find((x) => x.sql === args.sql) || pick(SQLS); return sqlResult(q.kind, Math.min(args.maxRows || 50, int(6, 24))); }
    if (t === 'sql_schema') {
      if (!args.table) { const rows = ['dbo.Invoice', 'dbo.InvoiceItem', 'dbo.Contractor', 'dbo.Customer', 'dbo.Payment', 'dbo.PaymentLog', 'dbo.Tariff', 'dbo.Subscription', 'dbo.Branch', 'dbo.AuditTrail', 'dbo.CallbackQueue', 'dbo.Warehouse'].map((n) => [n, 'USER_TABLE', int(1200, 9800000)]); return { text: mdTable(['table', 'kind', 'approx_rows'], rows), rows: rows.length, masked: {} }; }
      const cols = [['Id', 'bigint', 'NO', 'PK'], ['Number', 'nvarchar(40)', 'NO', 'IX_Invoice_Number'], ['ContractorId', 'int', 'NO', 'FK → dbo.Contractor'], ['Total', 'decimal(18,2)', 'NO', ''], ['Vat', 'decimal(18,2)', 'YES', ''], ['Status', 'tinyint', 'NO', 'IX_Invoice_Status'], ['CreatedAt', 'datetime2', 'NO', 'IX_Invoice_CreatedAt'], ['SignedAt', 'datetime2', 'YES', ''], ['Branch', 'nvarchar(60)', 'YES', '']];
      return { text: `# ${args.table}\n${mdTable(['column', 'type', 'nullable', 'index'], cols)}`, rows: cols.length, masked: {} };
    }
    if (t === 'jira_search') { const list = issues.slice(0, Math.min(args.limit || 15, int(6, 15))); return { text: `Jami: ${int(list.length, 140)} (ko'rsatildi ${list.length})\nkey | holat | tur | ijrochi | yangilangan | sarlavha\n${list.map((i) => `${i.key} | ${i.status} | ${i.type} | ${i.assignee} | ${d10(i.updated)} | ${i.summary}`).join('\n')}`, masked: {} }; }
    if (t === 'jira_issue') {
      const i = issues.find((x) => x.key === args.key) || issues[int(0, issues.length - 1)];
      const f = pick(FIRST);
      return { text: `# ${i.key}: ${i.summary}\nHolat: ${i.status} · Tur: ${i.type} · Muhimlik: ${i.prio} · Ijrochi: ${i.assignee}\nYangilangan: ${d10(i.updated)}\n\n## Tavsif\nMijoz ${pick(COMPANIES)} murojaati: muammo ${int(2, 9)} kundan beri takrorlanmoqda.\nAloqa: ${phone()}, ${mail(f)}\nQadamlar: 1) faktura yaratish 2) imzolash 3) PDF yuklab olish.\nKutilgan: QQS 12% to'g'ri yaxlitlangan. Haqiqatda: 0.01 so'm farq.\n\n## Kommentlar (3)\n- ${pick(FIRST)} ${pick(LAST)} (${d10(NOW - 30 * HOUR)}): stage'da takrorlandi, log biriktirildi.\n- ${pick(FIRST)} ${pick(LAST)} (${d10(NOW - 20 * HOUR)}): sabab Math.round o'rniga banker's rounding. MR tayyorlanmoqda.\n- ${pick(FIRST)} ${pick(LAST)} (${d10(NOW - 2 * HOUR)}): token [token] bilan test qilindi, ishlayapti.\n\n## Bog'langan\n- blocks ACME-${int(1000, 1400)} (In Progress) Oylik QQS hisoboti\n- relates to ACME-${int(1000, 1400)} (Done) PDF shablon yangilash`, masked: { phone: 1, email: 1, secret: 1 } };
    }
    if (t === 'gitlab_mrs') { const rows = Array.from({ length: int(5, 12) }, (_, i) => `!${412 - i * 3} | ${pick(['opened', 'merged', 'merged', 'closed'])} | ${pick(FIRST).toLowerCase()}.${pick(LAST).toLowerCase().slice(0, 4)} | ${d10(NOW - i * 9 * HOUR)} | ACME-${int(1000, 1400)}: ${pick(SUMMARIES)}`); return { text: `iid | holat | muallif | yangilangan | sarlavha\n${rows.join('\n')}`, masked: {} }; }
    if (t === 'gitlab_mr') {
      return { text: `# !${args.iid || 409}: ACME-1042 QQS yaxlitlash banker's rounding\nHolat: opened · Pipeline: success · ${PROJECTS[0]} · main ← fix/acme-1042-vat-rounding\n\n## Fayllar (3)\nsrc/billing/vat.ts +14 -6\nsrc/billing/vat.test.ts +38 -0\nCHANGELOG.md +1 -0\n\n## Diff\n--- a/src/billing/vat.ts\n+++ b/src/billing/vat.ts\n@@ -18,9 +18,17 @@ export function vatOf(total: number, rate = 0.12) {\n-  return Math.round(total * rate * 100) / 100\n+  // half-to-even: matches the tax office calculator (ACME-1042)\n+  const raw = total * rate * 100\n+  const floor = Math.floor(raw)\n+  const diff = raw - floor\n+  if (diff > 0.5) return (floor + 1) / 100\n+  if (diff < 0.5) return floor / 100\n+  return (floor % 2 === 0 ? floor : floor + 1) / 100\n }\n`, masked: {} };
    }
    if (t === 'gitlab_file') { const lines = ['import { vatOf } from \'./vat\'', '', 'export type Invoice = { id: number; total: number; vat: number; branch: string }', '', 'export function buildInvoice(id: number, total: number, branch: string): Invoice {', '  return { id, total, vat: vatOf(total), branch }', '}', '', '// API key is read from ACME_BILLING_KEY=[token]']; return { text: `## ${args.path || 'src/billing/invoice.ts'} @ ${args.ref || 'main'}\n${lines.map((l, i) => `${String(i + 1).padStart(3)}  ${l}`).join('\n')}`, masked: { secret: 1 } }; }
    if (t === 'gitlab_search') { return { text: `## src/billing/vat.ts:18\nexport function vatOf(total: number, rate = 0.12) {\n\n## src/reports/monthly.ts:44\n  const vat = rows.reduce((a, r) => a + vatOf(r.total), 0)\n\n## src/api/invoices.ts:121\n    vat: vatOf(body.total),`, masked: {} }; }
    if (t === 'gitlab_commits') { const rows = Array.from({ length: int(6, 14) }, (_, i) => `${hex(8)} | ${d10(NOW - i * 5 * HOUR)} | ${pick(FIRST)} ${pick(LAST)} | ${pick(['fix', 'feat', 'chore', 'refactor'])}: ${pick(SUMMARIES).toLowerCase()}`); return { text: `sha | sana | muallif | xabar\n${rows.join('\n')}`, masked: {} }; }
    if (t === 'stock_search') { const rows = Array.from({ length: 8 }, (_, i) => [`SKU-${4100 + i}`, pick(['Paxta mato 1.5 m', 'Qog\'oz A4 (500)', 'Kartrij HP 85A', 'Monitor 24"', 'Stul ofis', 'Router TP-Link']), int(-3, 400), pick(['Sergeli', 'Chilonzor', 'Yunusobod'])]); return { text: mdTable(['SKU', 'Nomi', 'Qoldiq', 'Ombor'], rows), rows: rows.length, masked: {} }; }
    if (t === 'wiki_search') return { text: '## 112 · Billing: QQS hisoblash qoidalari\n## 87 · Onboarding: yangi dasturchi uchun\n## 140 · Incident: callback navbati kechikishi', masked: {} };
    return { text: 'ok', masked: {} };
  }

  // ---------------------------------------------------------------- audit log (7 days of history)
  const log = []; // full entries, oldest first
  let seq = 4800;
  const light = (e) => { const { req, res, ...rest } = e; return rest; };
  const DENIED = ['denied', 'killed', 'paused', 'rate', 'unknown', 'expired', 'ip', 'arg'];
  const group = (s) => (s === 'ok' ? 'ok' : s === 'admin' ? 'admin' : DENIED.includes(s) ? 'denied' : 'error');
  const sids = {};
  const sidOf = (a, t) => { const k = `${a}:${Math.floor(t / (40 * MIN))}`; return (sids[k] ||= crypto.randomUUID ? crypto.randomUUID() : hex(32)); };
  function argsFor(tool) {
    const t = tool.replace(/^[a-z0-9]+-/, '');
    if (t === 'sql_query') { const q = pick(SQLS); return { db: pick(DBS), sql: q.sql, maxRows: pick([20, 50, 50, 100]) }; }
    if (t === 'sql_schema') return rnd() < 0.5 ? { db: pick(DBS), like: '%Invoice%' } : { db: pick(DBS), table: 'dbo.Invoice' };
    if (t === 'jira_search') return { jql: pick(['project = ACME AND status = "In Progress" ORDER BY updated DESC', 'project = ACME AND text ~ "QQS" ORDER BY created DESC', 'assignee = currentUser() AND resolution = Unresolved', 'project = ACME AND type = Bug AND priority in (High, Highest)']), limit: 15 };
    if (t === 'jira_issue') return { key: pick(issues).key, comments: 20 };
    if (t === 'gitlab_mrs') return { search: `ACME-${int(1000, 1400)}`, state: pick(['opened', 'all', 'merged']), project: pick(PROJECTS) };
    if (t === 'gitlab_mr') return { iid: int(380, 412), diff: 40000, project: PROJECTS[0] };
    if (t === 'gitlab_file') return { path: pick(['src/billing/invoice.ts', 'src/billing/vat.ts', 'src/api/payments.ts', 'README.md']), ref: 'main', from: 1, to: 80 };
    if (t === 'gitlab_search') return { query: pick(['vatOf', 'CallbackQueue', 'retryPolicy', 'Humo']), project: pick(PROJECTS) };
    if (t === 'gitlab_commits') return { ref: 'main', path: 'src/billing', limit: 20 };
    if (t === 'stock_search') return { query: pick(['kartrij', 'qog\'oz', 'monitor']), warehouse: pick(['Sergeli', 'Chilonzor']) };
    if (t === 'stock_moves') return { sku: `SKU-${int(4100, 4108)}`, days: 7 };
    return { query: 'qqs' };
  }
  const allowed = (a, full) => a.tools.some((p) => p === '*' || p === full || (p.endsWith('*') && full.startsWith(p.slice(0, -1))));
  const toolsOfAgent = (a) => Object.entries(connectors).flatMap(([cn, c]) => c.tools.map((t) => fullName(cn, t.name))).filter((f) => allowed(a, f));
  function makeCall(name, ts, opts = {}) {
    const a = agents[name];
    let tool = opts.tool || pick(toolsOfAgent(a).length ? toolsOfAgent(a) : ['acme-jira_search']);
    let args = opts.args || argsFor(tool);
    const cn = tool.split('-')[0];
    const conn = connectors[cn];
    let status = 'ok', err = '';
    const r = rnd();
    if (opts.status) status = opts.status;
    else if (state.killed && ts >= state.killed.at) status = 'killed';
    else if (a.paused && ts >= a.paused.at) status = 'paused';
    else if (a.expires && a.expires < ts) status = 'expired';
    else if (conn && (!conn.enabled)) status = 'unknown';
    else if (cn === 'warehouse' && ts > NOW - 9 * MIN) status = 'error';
    else if (r < 0.022) status = 'tool-error';
    else if (r < 0.03) status = 'error';
    else if (r < 0.048) { status = 'denied'; tool = pick(['acme-sql_query', 'acme-gitlab_file', 'warehouse-stock_moves']); args = argsFor(tool); }
    else if (r < 0.056) status = 'rate';
    else if (r < 0.066 && a.argAllow.db) { status = 'arg'; args = { ...argsFor('acme-sql_query'), db: 'acme_prod_ro' }; tool = 'acme-sql_query'; }
    else if (r < 0.069) { status = 'unknown'; tool = 'acme-sql_exec'; args = { db: 'acme_stage', sql: 'UPDATE dbo.Invoice SET Status = 1' }; }
    if (status === 'ok' && args.sql && /SELECT TOP 30 Id, FullName/.test(args.sql) && rnd() < 0.15) { status = 'tool-error'; }
    const errText = {
      'tool-error': "Msg 208: Invalid object name 'dbo.Customers'. (jadval nomi: dbo.Customer)",
      error: cn === 'warehouse' ? 'connector warehouse: connect ETIMEDOUT (tunnel)' : 'connector acme: 504 Gateway Timeout (30 s)',
      denied: `${tool} bu agent uchun ruxsat etilmagan`,
      rate: `limit: ${a.rpm} chaqiruv/daqiqa oshib ketdi`,
      arg: "db=acme_prod_ro ruxsat etilmagan (ruxsat: " + (a.argAllow.db || []).join(', ') + ')',
      unknown: tool === 'acme-sql_exec' ? "noma'lum tool: acme-sql_exec (faqat o'qish toollari mavjud)" : `${cn} konnektori o'chirilgan`,
      expired: 'token muddati tugagan',
      paused: `agent pauzada: ${a.paused?.reason || ''}`,
      killed: `gateway to'xtatilgan: ${state.killed?.reason || 'kill-switch'}`,
      ip: 'IP ruxsat etilmagan: 198.51.100.200',
    }[status] || '';
    err = errText;
    const e = { id: 0, ts, type: 'call', agent: name, tool, connector: status === 'unknown' && tool === 'acme-sql_exec' ? '' : cn, args: JSON.stringify(args).slice(0, 600), req: JSON.stringify(args), ok: status === 'ok', status, ms: 0, bytes: 0, masked: {}, err, ip: status === 'ip' ? '198.51.100.200' : a.lastIp, client: a.client, sid: sidOf(name, ts) };
    if (status === 'ok' || status === 'tool-error') {
      const b = status === 'ok' ? bodyFor(tool, args) : { text: `Xato: ${errText}`, masked: {} };
      e.res = b.text; e.bytes = b.text.length * 2; e.masked = b.masked;
      if (b.rows !== undefined) e.rows = b.rows;
      e.ms = tool.includes('sql_query') ? int(60, 1400) : tool.includes('gitlab_mr') ? int(300, 2200) : int(40, 700);
      if (e.rows !== undefined && opts.bigRows) { e.rows = 200; }
      const offK = Object.keys(state.mask).filter((k) => k !== 'inn' && !state.mask[k]);
      if (offK.length) e.maskOff = offK;
    } else if (status === 'error') { e.ms = cn === 'warehouse' ? int(8000, 15000) : 30000; }
    else e.ms = int(1, 4);
    if (opts.origin) e.origin = opts.origin;
    return e;
  }
  function adminEntry(ts, action, target, detail = '', ip = '203.0.113.5') {
    return { id: 0, ts, type: 'admin', agent: 'admin', tool: action, connector: '', action, target, detail, args: [target, detail].filter(Boolean).join(' · '), ip, ok: true, status: 'admin', ms: 0, bytes: 0, masked: {}, err: '' };
  }
  // history: calls spread over 7 days with a working-hours curve; a few stories (kill-switch, paused agent, expired token)
  const hist = [];
  const names = Object.keys(agents);
  const weightSum = names.reduce((s, n) => s + agents[n].weight, 0);
  const pickAgent = () => { let x = rnd() * weightSum; for (const n of names) { x -= agents[n].weight; if (x <= 0) return n; } return names[0]; };
  for (let h = 7 * 24; h >= 0; h--) {
    const t0 = NOW - h * HOUR;
    const hr = new Date(t0).getHours();
    const dow = new Date(t0).getDay();
    const base = hr >= 9 && hr <= 19 ? 16 : hr >= 7 && hr <= 22 ? 9 : 4;
    const n = Math.round(base * (dow === 0 || dow === 6 ? 0.35 : 1) * (0.6 + rnd() * 0.8));
    for (let i = 0; i < n; i++) {
      const ts = t0 - rnd() * HOUR;
      if (ts > NOW - 20e3) continue;
      hist.push({ ts, name: pickAgent() });
    }
  }
  hist.sort((a, b) => a.ts - b.ts);
  const killAt = NOW - 26 * HOUR - 12 * MIN, unkillAt = NOW - 26 * HOUR;
  const story = [
    adminEntry(NOW - 6 * DAY - 3 * HOUR, 'agent.create', 'gulnora-zed', 'tools: acme-gitlab_*'),
    adminEntry(NOW - 6 * DAY, 'agent.rotate', 'alisher-claude', 'rejali token yangilash'),
    adminEntry(NOW - 2 * DAY - 40 * MIN, 'mask', 'email=off', 'QA uchun 30 daqiqa'),
    adminEntry(NOW - 2 * DAY - 10 * MIN, 'mask', 'email=on', ''),
    adminEntry(NOW - 2 * DAY + 2 * HOUR, 'mask.custom.add', 'Hisob raqami (20 xona)', '\\b\\d{20}\\b'),
    adminEntry(killAt, 'kill', '', "prod DB'ga g'ayrioddiy ko'p so'rov"),
    adminEntry(unkillAt, 'unkill', '', ''),
    adminEntry(NOW - 20 * HOUR, 'connector.disable', 'docs', "wiki ko'chirilmoqda"),
    adminEntry(NOW - 9 * HOUR, 'agent.update', 'sardor-codex', 'argAllow db=acme_stage,acme_billing_ro'),
    adminEntry(NOW - 3 * HOUR, 'agent.pause', 'report-agent', agents['report-agent'].paused.reason),
    adminEntry(NOW - 70 * MIN, 'mask.custom.off', 'Manzil ustunlari', 'faqat sinov uchun'),
  ];
  const all = [];
  for (const x of hist) {
    let opts = {};
    if (x.ts >= killAt && x.ts < unkillAt) opts.status = 'killed';
    if (x.name === 'report-agent' && x.ts < NOW - 3 * HOUR && x.ts > NOW - 4 * HOUR) opts = { tool: 'acme-sql_query', args: { db: 'acme_billing_ro', sql: 'SELECT * FROM dbo.Payment', maxRows: 200 }, bigRows: true };
    if (x.name === 'ci-reviewer' && x.ts > NOW - 2 * DAY && rnd() < 0.3) opts.status = 'expired';
    if (x.name === 'support-copilot' && rnd() < 0.02) opts.status = 'ip';
    // the docs connector was switched off 20 h ago; before that its tools answered
    const e = makeCall(x.name, x.ts, opts);
    if (opts.status === 'killed') { e.err = "gateway to'xtatilgan: prod DB'ga g'ayrioddiy ko'p so'rov"; e.ok = false; delete e.res; e.ms = 1; e.masked = {}; delete e.rows; e.bytes = 0; }
    all.push(e);
  }
  for (const s of story) all.push(s);
  all.sort((a, b) => a.ts - b.ts);
  for (const e of all) { e.id = ++seq; log.push(e); const a = agents[e.agent]; if (a) { a.calls++; a.lastSeen = Math.max(a.lastSeen, e.ts); } }
  agents['ci-reviewer'].lastSeen = Math.min(agents['ci-reviewer'].lastSeen, NOW - 5 * HOUR);
  agents['report-agent'].lastSeen = NOW - 3 * HOUR;

  // ---------------------------------------------------------------- derived views
  // demo: "today" is the last 24 hours so the panel looks the same at any hour of the visit
  const sameDayTs = (t, ref) => t > ref - DAY && t <= ref + 60e3;
  const pct = (arr, p) => (arr.length ? arr[Math.min(arr.length - 1, Math.floor(arr.length * p))] : 0);
  function summarize(list) {
    const calls = list.filter((e) => e.type !== 'admin');
    const ms = calls.filter((e) => e.ok).map((e) => e.ms).sort((a, b) => a - b);
    const g = { ok: 0, error: 0, denied: 0 };
    for (const e of calls) g[group(e.status)]++;
    return { calls: calls.length, ...g, p50: pct(ms, 0.5), p95: pct(ms, 0.95), avg: ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : 0 };
  }
  function stats() {
    const t = Date.now();
    const today = log.filter((e) => sameDayTs(e.ts, t));
    const yest = log.filter((e) => sameDayTs(e.ts, t - DAY));
    const calls = today.filter((e) => e.type !== 'admin');
    const masked = {};
    for (const e of calls) for (const [k, v] of Object.entries(e.masked || {})) masked[k] = (masked[k] || 0) + v;
    const groupBy = (key) => { const m = {}; for (const e of calls) (m[e[key] || '—'] ||= []).push(e); return Object.entries(m).map(([name, l]) => ({ name, ...summarize(l), rows: l.reduce((a, e) => a + (e.rows || 0), 0), bytes: l.reduce((a, e) => a + (e.bytes || 0), 0), last: Math.max(...l.map((e) => e.ts)) })).sort((a, b) => b.calls - a.calls); };
    const start = Math.floor((t - 23 * HOUR) / HOUR) * HOUR;
    const series = Array.from({ length: 24 }, (_, i) => ({ t: start + i * HOUR, ok: 0, error: 0, denied: 0 }));
    for (const e of log) { if (e.type === 'admin' || e.ts < start) continue; const b = series[Math.floor((e.ts - start) / HOUR)]; if (b) b[group(e.status)]++; }
    const y = summarize(yest);
    return { day: new Date(t).toISOString().slice(0, 10), ...summarize(today), yesterday: { calls: y.calls, ok: y.ok, error: y.error, denied: y.denied, p95: y.p95 }, masked, maskedTotal: Object.values(masked).reduce((a, b) => a + b, 0), activeAgents: new Set(calls.map((e) => e.agent).filter((n) => n !== 'admin')).size, rows: calls.reduce((a, e) => a + (e.rows || 0), 0), byAgent: groupBy('agent'), byTool: groupBy('tool'), byConnector: groupBy('connector'), series, admin: today.filter((e) => e.type === 'admin').length };
  }
  const minute = {};
  const inflight = new Map();
  function publicState() {
    const cat = Object.entries(connectors).filter(([, c]) => c.enabled).reduce((n, [, c]) => n + c.tools.length, 0);
    return {
      version: '0.6.3', killed: state.killed, mask: { ...state.mask }, customMasks: clone(state.customMasks),
      alerts: { ...state.alerts, telegram: true, log: alertLog.slice(0, 20) },
      agents: Object.entries(agents).map(([name, a]) => ({ name, owner: a.owner, note: a.note, tools: a.tools, rpm: a.rpm, rpmNow: Date.now() - (minute[name]?.t || 0) < 60e3 ? minute[name].n : 0, paused: a.paused, created: a.created, rotated: a.rotated, lastSeen: a.lastSeen, lastIp: a.lastIp, calls: a.calls, client: a.client, expires: a.expires, ipAllow: a.ipAllow, argAllow: a.argAllow })).sort((x, y) => (y.lastSeen || 0) - (x.lastSeen || 0)),
      connectors: Object.entries(connectors).map(([n, c]) => ({ name: n, url: c.url, enabled: c.enabled, online: c.online, lastOk: c.lastOk, lastErr: c.lastErr, lastErrAt: c.lastErrAt, latency: c.latency, server: c.server, hasSecret: c.hasSecret, health: c.health.slice(-120), uptime: c.health.length ? Math.round((c.health.filter(Boolean).length / c.health.length) * 1000) / 10 : null, tools: c.tools.map((t) => ({ name: t.name, full: fullName(n, t.name), title: '', description: t.description, inputSchema: t.inputSchema })) })),
      tools: cat, inflight: [...inflight.entries()].map(([key, v]) => ({ key, ...v })), retention: 30,
      limits: { maxResult: 60000, callTimeout: 30000, logRes: 20000 }, uptime: Math.round((Date.now() - NOW) / 1000) + 11 * 86400 + 4 * 3600 + 17 * 60,
    };
  }
  function history(q) {
    const days = Math.max(1, Math.min(30, +(q.get('days') || 1)));
    const limit = Math.max(1, Math.min(+(q.get('limit') || 200), 5000));
    const before = +(q.get('before') || 0);
    const text = String(q.get('q') || '').toLowerCase();
    const f = { agent: q.get('agent'), tool: q.get('tool'), connector: q.get('connector'), group: q.get('status'), sid: q.get('sid') };
    const cut = Date.now() - days * DAY;
    const items = []; let more = false;
    for (let j = log.length - 1; j >= 0; j--) {
      const e = log[j];
      if (e.ts < cut) break;
      if (before && !(e.id < before)) continue;
      if (f.agent && e.agent !== f.agent) continue;
      if (f.tool && e.tool !== f.tool) continue;
      if (f.connector && e.connector !== f.connector) continue;
      if (f.sid && e.sid !== f.sid) continue;
      if (f.group && group(e.status) !== f.group) continue;
      if (text && !`${e.agent} ${e.tool} ${e.args} ${e.err} ${e.ip} ${e.client || ''} ${e.sid || ''}`.toLowerCase().includes(text)) continue;
      if (items.length >= limit) { more = true; break; }
      items.push(light(e));
    }
    return { items, more };
  }

  // ---------------------------------------------------------------- live stream
  const streams = new Set();
  const send = (type, data) => { for (const s of streams) s._emit(type, data); };
  const pushState = () => send('state', publicState());
  function record(e) {
    e.id = ++seq;
    log.push(e);
    const a = agents[e.agent];
    if (a && e.type !== 'admin') { a.calls++; a.lastSeen = e.ts; const m = (minute[e.agent] ||= { t: e.ts, n: 0 }); if (e.ts - m.t > 60e3) { m.t = e.ts; m.n = 0; } m.n++; }
    send('call', light(e));
    return e;
  }
  const adminDo = (action, target, detail) => record(adminEntry(Date.now(), action, target, detail));
  function liveTick() {
    const active = names.filter((n) => !agents[n].paused && !(agents[n].expires && agents[n].expires < Date.now()));
    const name = rnd() < 0.06 ? pick(names) : pick(active.length ? active : names);
    const e = makeCall(name, Date.now());
    const key = hex(8);
    if (e.ok || e.status === 'tool-error' || e.status === 'error') {
      inflight.set(key, { ts: Date.now(), agent: name, tool: e.tool, connector: e.connector, args: e.args.slice(0, 200) });
      send('start', { key, ts: Date.now(), agent: name, tool: e.tool, connector: e.connector, args: e.args.slice(0, 200) });
      const wait = Math.min(e.ms, 4200);
      setTimeout(() => { inflight.delete(key); send('end', { key }); e.ts = Date.now(); record(e); }, wait);
    } else record(e);
    setTimeout(liveTick, 1400 + Math.random() * 3200);
  }
  setTimeout(liveTick, 1500);
  setInterval(() => {
    for (const [n, c] of Object.entries(connectors)) {
      const ok = n === 'warehouse' ? false : c.enabled ? Math.random() > 0.01 : 1;
      c.health.push(ok ? 1 : 0); if (c.health.length > 240) c.health.shift();
      if (ok && c.enabled) { c.lastOk = Date.now(); c.latency = Math.max(12, Math.round(c.latency + (Math.random() - 0.5) * 12)); }
    }
    pushState();
  }, 20e3);

  class DemoEventSource {
    constructor(url) { this.url = url; this.readyState = 0; this._l = {}; streams.add(this); setTimeout(() => { this.readyState = 1; this._emit('open', null); this._emit('state', publicState()); }, 120); }
    addEventListener(t, f) { (this._l[t] ||= []).push(f); }
    removeEventListener(t, f) { this._l[t] = (this._l[t] || []).filter((x) => x !== f); }
    close() { this.readyState = 2; streams.delete(this); }
    _emit(type, data) { const ev = { type, data: data === null ? '' : JSON.stringify(data) }; for (const f of this._l[type] || []) f(ev); const h = this[`on${type}`]; if (typeof h === 'function') h(ev); }
  }
  const RealES = window.EventSource;
  window.EventSource = function (url, opt) { return String(url).includes('/admin/api/live') ? new DemoEventSource(url) : new RealES(url, opt); };

  // ---------------------------------------------------------------- mask tester
  function applyMask(m, sample, column) {
    if (m.type === 'column') {
      let re; try { re = new RegExp(m.pattern, 'i'); } catch (e) { throw new Error(`regex xato: ${e.message}`); }
      if (!column || !re.test(column)) return { matched: 0, output: sample };
      return { matched: 1, output: hide(m, String(sample)) };
    }
    let re; try { re = new RegExp(m.pattern, m.ci ? 'gi' : 'g'); } catch (e) { throw new Error(`regex xato: ${e.message}`); }
    let n = 0;
    const output = String(sample || '').replace(re, (x) => { n++; return hide(m, x); });
    return { matched: n, output };
  }
  function hide(m, x) {
    if (m.replace) return m.replace;
    const a = Math.min(m.keepStart || 0, x.length), b = Math.min(m.keepEnd || 0, Math.max(0, x.length - a));
    return x.slice(0, a) + '*'.repeat(Math.max(3, x.length - a - b)) + (b ? x.slice(-b) : '');
  }

  // ---------------------------------------------------------------- fetch router
  const ok = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  const fail = (msg, status = 400) => ok({ error: msg }, status);
  const tokenFor = (name) => `ag_${name.replace(/-/g, '')}_demo${hex(28)}`;
  function route(method, path, q, body) {
    let m;
    if (method === 'GET' && path === '/state') return ok(publicState());
    if (method === 'GET' && path === '/stats') return ok(stats());
    if (method === 'GET' && path === '/log') { const lim = +(q.get('limit') || 300); return ok(log.filter((e) => sameDayTs(e.ts, Date.now())).slice(-lim).map(light)); }
    if (method === 'GET' && path === '/history') return ok(history(q));
    if (method === 'GET' && (m = /^\/call\/(\d+)$/.exec(path))) { const e = log.find((x) => x.id === +m[1]); return e ? ok(e) : fail('topilmadi', 404); }
    if (method === 'POST' && path === '/agents') {
      if (body.rotate) { const a = agents[body.name]; if (!a) return fail('agent topilmadi', 404); a.rotated = Date.now(); adminDo('agent.rotate', body.name, ''); }
      else {
        if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(body.name || '')) return fail("nom: a-z, 0-9 va «-», 2..31 belgi");
        if (agents[body.name]) return fail('bunday agent bor');
        agents[body.name] = { owner: body.owner || '', note: body.note || '', tools: body.tools || ['*'], rpm: body.rpm || 30, client: '', lastIp: '', created: Date.now(), rotated: 0, expires: body.expires || 0, ipAllow: body.ipAllow || [], argAllow: body.argAllow || {}, paused: null, calls: 0, lastSeen: 0, weight: 0 };
        adminDo('agent.create', body.name, `tools: ${(body.tools || []).join(', ')}`);
      }
      pushState();
      const token = tokenFor(body.name);
      const mcp = 'https://gateway.acme.example/mcp';
      return ok({ name: body.name, token, mcp, claude: `claude mcp add --transport http acme ${mcp} --header "Authorization: Bearer ${token}"` });
    }
    if ((m = /^\/agents\/([a-z0-9-]+)(?:\/(pause|resume))?$/.exec(path))) {
      const a = agents[m[1]]; if (!a) return fail('agent topilmadi', 404);
      if (m[2] === 'pause') { a.paused = { reason: body.reason || '', at: Date.now() }; adminDo('agent.pause', m[1], body.reason || ''); }
      else if (m[2] === 'resume') { a.paused = null; adminDo('agent.resume', m[1], ''); }
      else if (method === 'PUT') { Object.assign(a, { owner: body.owner, note: body.note, rpm: body.rpm, tools: body.tools, expires: body.expires, ipAllow: body.ipAllow, argAllow: body.argAllow }); adminDo('agent.update', m[1], `tools: ${body.tools.join(', ')}`); }
      else if (method === 'DELETE') { delete agents[m[1]]; adminDo('agent.delete', m[1], ''); }
      pushState(); return ok({ ok: true });
    }
    if (method === 'POST' && path === '/connectors') {
      const name = body.name;
      if (!/^[a-z0-9]{2,20}$/.test(name || '')) return fail('nom: a-z, 0-9, 2..20 belgi');
      const c = connectors[name] || (connectors[name] = { enabled: true, health: [], tools: [], hasSecret: false, server: '', lastErr: '', lastErrAt: 0, lastOk: 0, latency: 0 });
      c.url = body.url; if (body.secret) c.hasSecret = true;
      if (/acme|example|tunnel/.test(body.url)) { c.online = true; c.latency = 44; c.lastOk = Date.now(); c.server ||= 'acme-connector 0.4.2'; if (!c.tools.length) c.tools = DOC_TOOLS.map((t) => ({ ...t, name: t.name.replace('wiki', name) })); c.health.push(1); c.lastErr = ''; }
      else { c.online = false; c.lastErr = `getaddrinfo ENOTFOUND ${String(body.url).replace(/^https?:\/\//, '').split('/')[0]}`; c.lastErrAt = Date.now(); c.health.push(0); }
      adminDo('connector.add', name, body.url);
      pushState();
      return ok({ name, online: c.online, lastErr: c.lastErr, tools: c.tools });
    }
    if ((m = /^\/connectors\/([a-z0-9]+)(?:\/(refresh|enable|disable))?$/.exec(path))) {
      const c = connectors[m[1]]; if (!c) return fail('konnektor topilmadi', 404);
      if (m[2] === 'enable') { c.enabled = true; adminDo('connector.enable', m[1], ''); }
      else if (m[2] === 'disable') { c.enabled = false; adminDo('connector.disable', m[1], ''); }
      else if (m[2] === 'refresh') { if (m[1] !== 'warehouse') { c.online = true; c.lastOk = Date.now(); c.health.push(1); } else { c.lastErrAt = Date.now(); c.health.push(0); } }
      else if (method === 'DELETE') { delete connectors[m[1]]; adminDo('connector.delete', m[1], ''); }
      pushState(); return ok({ ok: true });
    }
    if (method === 'POST' && path === '/kill') { state.killed = { reason: body.reason || '', at: Date.now() }; adminDo('kill', '', body.reason || ''); alertLog.unshift({ ts: Date.now(), kind: 'kill', title: '🛑 Kill-switch YOQILDI', text: `Sabab: ${body.reason || '—'}`, ok: true, err: '' }); pushState(); return ok({ ok: true }); }
    if (method === 'POST' && path === '/unkill') { state.killed = null; adminDo('unkill', '', ''); alertLog.unshift({ ts: Date.now(), kind: 'kill', title: '✅ Gateway qayta yoqildi', text: 'demo', ok: true, err: '' }); pushState(); return ok({ ok: true }); }
    if (method === 'PUT' && path === '/mask') { for (const [k, v] of Object.entries(body)) if (k in state.mask) { state.mask[k] = !!v; adminDo('mask', `${k}=${v ? 'on' : 'off'}`, body.reason || ''); } pushState(); return ok({ ok: true }); }
    if (method === 'POST' && path === '/masks/test') { try { return ok(applyMask(body.mask, body.sample, body.column)); } catch (e) { return fail(e.message); } }
    if (method === 'POST' && path === '/masks') { try { new RegExp(body.pattern); } catch (e) { return fail(`regex xato: ${e.message}`); } const mm = { id: `m${Date.now()}`, enabled: true, ...body }; state.customMasks.push(mm); adminDo('mask.custom.add', mm.name, mm.pattern); pushState(); return ok(mm); }
    if ((m = /^\/masks\/(\w+)$/.exec(path))) {
      const i = state.customMasks.findIndex((x) => x.id === m[1]); if (i < 0) return fail('niqob topilmadi', 404);
      if (method === 'DELETE') { adminDo('mask.custom.delete', state.customMasks[i].name, ''); state.customMasks.splice(i, 1); }
      else { Object.assign(state.customMasks[i], body); adminDo(body.enabled === false ? 'mask.custom.off' : 'mask.custom.update', state.customMasks[i].name, ''); }
      pushState(); return ok({ ok: true });
    }
    if (method === 'PUT' && path === '/alerts') { Object.assign(state.alerts, body); pushState(); return ok({ ok: true }); }
    if (method === 'POST' && path === '/alerts/test') { alertLog.unshift({ ts: Date.now(), kind: 'test', title: '🔔 Sinov xabari', text: 'demo: Telegram ulanishi ishlayapti', ok: true, err: '' }); pushState(); return ok({ ok: true }); }
    if (method === 'POST' && path === '/run') {
      const full = body.tool; const cn = full.split('-')[0]; const c = connectors[cn];
      const e = makeCall('alisher-claude', Date.now(), { tool: full, args: body.arguments || {}, status: !c?.enabled ? 'unknown' : !c.online ? 'error' : state.killed ? 'killed' : 'ok', origin: 'playground' });
      e.agent = 'admin'; e.client = 'admin panel'; e.ip = '203.0.113.5';
      if (e.status === 'ok' && !e.res) { const b = bodyFor(full, body.arguments || {}); e.res = b.text; }
      record(e);
      return ok({ result: { content: [{ type: 'text', text: e.res || e.err }], isError: e.status !== 'ok' }, entry: light(e) });
    }
    return fail(`demo: ${method} ${path} yo'q`, 404);
  }
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const i = url.pathname.indexOf('/admin/api');
    if (i < 0) return realFetch(input, init);
    const method = (init.method || 'GET').toUpperCase();
    let body = {};
    try { body = init.body ? JSON.parse(init.body) : {}; } catch { body = {}; }
    await new Promise((r) => setTimeout(r, 60 + Math.random() * 160));
    return route(method, url.pathname.slice(i + '/admin/api'.length), url.searchParams, body);
  };

  // CSV / JSONL export: build the file in the browser instead of navigating to the API
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest?.('[data-export]');
    if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    const f = new FormData(document.getElementById('filters'));
    const q = new URLSearchParams();
    for (const k of ['q', 'days', 'agent', 'tool', 'status', 'sid']) { const v = String(f.get(k) || '').trim(); if (v) q.set(k, v); }
    q.set('limit', '5000');
    const { items } = history(q);
    const isCsv = b.dataset.export === 'csv';
    const cols = ['id', 'ts', 'agent', 'tool', 'status', 'ms', 'rows', 'ip', 'args'];
    const text = isCsv ? [cols.join(','), ...items.map((e) => cols.map((c) => `"${String(c === 'ts' ? new Date(e.ts).toISOString() : e[c] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n') : items.map((e) => JSON.stringify(e)).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: isCsv ? 'text/csv' : 'application/x-ndjson' }));
    a.download = `gateway-audit-demo.${isCsv ? 'csv' : 'jsonl'}`;
    a.click();
  }, true);

  // demo pill
  const pill = () => { const d = document.createElement('div'); d.className = 'demo-pill'; d.innerHTML = "<b>Demo</b> · namuna ma'lumotlar, qayta yuklanganda tiklanadi"; document.body.append(d); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pill); else pill();
})();
