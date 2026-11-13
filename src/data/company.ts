import type { T } from '../i18n/config';

/** Home "numbers" band. Counted from the GitHub API and the product list on 2026-11-13. */
export const numbers: { value: number; suffix?: string; label: T; source: string }[] = [
  { value: 15, label: { en: 'live products', uz: 'jonli mahsulot', ru: 'работающих продуктов' }, source: 'wonmor.io/products' },
  { value: 26, label: { en: 'repositories', uz: 'repozitoriy', ru: 'репозиториев' }, source: 'github.com/dtwinuz' },
  { value: 635, label: { en: 'merged pull requests', uz: 'birlashtirilgan pull request', ru: 'принятых pull request' }, source: 'GitHub search: org:dtwinuz is:pr is:merged' },
  { value: 21, label: { en: 'releases', uz: 'reliz', ru: 'релиз' }, source: 'GitHub releases, all dtwinuz repositories' },
  { value: 3, label: { en: 'desktop systems for bitg', uz: 'bitg uchun kompyuter tizimi', ru: 'настольные системы для bitg' }, source: 'github.com/dtwinuz/bitg/releases' },
];
export const numbersAsOf: T = { en: 'As of November 13, 2026. Counted from GitHub.', uz: '2026-yil 13-noyabr holatiga. GitHubʼdan sanalgan.', ru: 'На 13 ноября 2026 года. Подсчитано по GitHub.' };
export const numbersTitle: T = { en: 'Wonmor in numbers', uz: 'Raqamlarda Wonmor', ru: 'Wonmor в цифрах' };

/** /company */
export const about = {
  purposeTitle: { en: 'Our purpose', uz: 'Maqsadimiz', ru: 'Наша цель' },
  purpose: [
    { title: { en: 'Useful first', uz: 'Avval foydali boʻlsin', ru: 'Сначала польза' },
      body: { en: 'We build tools people in Uzbekistan use every day: for prayer, language, work, food and health. A product earns its place by being used.', uz: 'Biz Oʻzbekistondagi odamlar har kuni ishlatadigan vositalarni yaratamiz: namoz, til, ish, ovqat va salomatlik uchun. Mahsulot oʻz oʻrnini ishlatilishi bilan oqlaydi.', ru: 'Мы делаем инструменты, которыми люди в Узбекистане пользуются каждый день: для намаза, языка, работы, еды и здоровья. Продукт оправдывает себя тем, что им пользуются.' } },
    { title: { en: 'Engineered like infrastructure', uz: 'Infratuzilmadek puxta', ru: 'Надёжно, как инфраструктура' },
      body: { en: 'Small products still get release levels, backups, monitoring and rollbacks. bitg ships signed, attested and reproducible packages.', uz: 'Kichik mahsulotlar ham reliz darajasi, zaxira nusxa, monitoring va orqaga qaytarish imkoniga ega. bitg imzolangan, attestatsiyalangan va qayta yigʻiladigan paketlar bilan chiqadi.', ru: 'Даже у небольших продуктов есть уровни релиза, резервные копии, мониторинг и откат. bitg выходит подписанными, аттестованными и воспроизводимыми пакетами.' } },
    { title: { en: 'Built in the open', uz: 'Ochiq holda quriladi', ru: 'Открыто' },
      body: { en: 'Decisions live in issues, pull requests and ADRs. Eight repositories are public today, and we publish what we learn.', uz: 'Qarorlar issue, pull request va ADRʼlarda saqlanadi. Bugun sakkizta repozitoriy ochiq, oʻrganganlarimizni eʼlon qilamiz.', ru: 'Решения живут в issues, pull requests и ADR. Сегодня открыты восемь репозиториев, и мы публикуем то, чему научились.' } },
    { title: { en: 'Independent', uz: 'Mustaqil', ru: 'Независимо' },
      body: { en: 'Wonmor is a self-funded brand, not a company with investors. It pays for servers, domains, CI and design time so the work can continue.', uz: 'Wonmor — oʻz mablagʻi hisobiga ishlaydigan brend, investorli kompaniya emas. Ish davom etishi uchun serverlar, domenlar, CI va dizayn vaqtiga pul toʻlaydi.', ru: 'Wonmor — бренд на собственные средства, а не компания с инвесторами. Он оплачивает серверы, домены, CI и время на дизайн, чтобы работа продолжалась.' } },
  ],
  teamTitle: { en: 'How the work is organised', uz: 'Ish qanday tashkil etilgan', ru: 'Как устроена работа' },
  team: {
    en: 'Today Wonmor is one founder working with a small set of AI agents: an orchestrator plans, a reasoner investigates, a worker does mechanical changes and a critic tries to break the result. Every change still goes through a pull request, CI and a human merge.',
    uz: 'Bugun Wonmor — bir asoschi va bir nechta AI agent: orkestrator rejalashtiradi, tahlilchi izlanadi, ijrochi mexanik oʻzgarishlarni qiladi, tanqidchi natijani sindirishga urinadi. Har bir oʻzgarish baribir pull request, CI va inson tasdigʻidan oʻtadi.',
    ru: 'Сегодня Wonmor — это один основатель и небольшой набор ИИ-агентов: оркестратор планирует, аналитик исследует, исполнитель делает механические правки, а критик пытается сломать результат. Каждое изменение всё равно проходит через pull request, CI и слияние человеком.',
  },
  governanceTitle: { en: 'Governance', uz: 'Boshqaruv', ru: 'Управление' },
  governance: {
    en: 'There is no board and there are no investors, and we will not pretend otherwise. Decisions are made by the founder and recorded in public repositories. A legal entity and an open-source fund are planned, not done.',
    uz: 'Kengash ham, investor ham yoʻq va biz buni yashirmaymiz. Qarorlarni asoschi qabul qiladi va ular ochiq repozitoriylarda yozib boriladi. Yuridik shaxs va ochiq kod fondi — reja, hali bajarilmagan.',
    ru: 'Совета директоров и инвесторов нет, и мы не будем делать вид, что они есть. Решения принимает основатель, и они записаны в публичных репозиториях. Юридическое лицо и фонд открытого кода — в планах, а не сделаны.',
  },
  ctaTitle: { en: 'Build with us', uz: 'Biz bilan quring', ru: 'Стройте с нами' },
  cta: { en: 'The open repositories accept issues and pull requests today.', uz: 'Ochiq repozitoriylar bugunoq issue va pull request qabul qiladi.', ru: 'Открытые репозитории уже принимают issues и pull requests.' },
};

/** /company/founder */
export const founder = {
  name: 'Nosirbek Xakimov',
  role: { en: 'Founder and engineer', uz: 'Asoschi va muhandis', ru: 'Основатель и инженер' },
  bio: {
    en: 'Nosirbek Xakimov is a full-stack software engineer from Tashkent who builds and runs the dtwin ecosystem. The work spans .NET and React products, Rust input methods, three.js scenes, Telegram bots, MCP servers for AI agents and the self-hosted infrastructure underneath them. Before dtwin came five years of .NET work in education, payments, banking and e-invoicing.',
    uz: 'Nosirbek Xakimov — Toshkentlik full-stack dasturiy muhandis, dtwin ekotizimini yaratadi va yuritadi. Ish .NET va React mahsulotlari, Rust kiritish usullari, three.js sahnalari, Telegram botlar, AI agentlar uchun MCP serverlar va ularning ostidagi oʻz infratuzilmasini qamrab oladi. dtwinʼdan oldin taʼlim, toʻlovlar, bank va elektron hisob-faktura sohalarida besh yillik .NET tajribasi bor.',
    ru: 'Носирбек Хакимов — full-stack инженер из Ташкента, создатель экосистемы dtwin. В работе — продукты на .NET и React, методы ввода на Rust, сцены на three.js, Telegram-боты, MCP-серверы для ИИ-агентов и собственная инфраструктура под ними. До dtwin было пять лет работы с .NET в образовании, платежах, банках и электронных счетах-фактурах.',
  },
  careerTitle: { en: 'Career', uz: 'Karyera', ru: 'Карьера' },
  career: [
    { period: '2026 —', org: 'dtwin · Wonmor', role: { en: 'Founder and engineer', uz: 'Asoschi va muhandis', ru: 'Основатель и инженер' },
      text: { en: 'A product ecosystem built and operated end to end: a prayer-anchored life planner, an Uzbek keyboard, gateways, tunnels and tools.', uz: 'Boshidan oxirigacha qurilgan va yuritiladigan mahsulotlar ekotizimi: namozga tayangan hayot rejalashtirgichi, oʻzbekcha klaviatura, gateway, tunnel va vositalar.', ru: 'Экосистема продуктов, построенная и поддерживаемая от начала до конца: планировщик жизни вокруг намаза, узбекская клавиатура, шлюзы, туннели и инструменты.' } },
    { period: '2026 —', org: 'Faktura.uz', role: { en: 'Full-stack software engineer and DevOps', uz: 'Full-stack dasturiy muhandis va DevOps', ru: 'Full-stack инженер и DevOps' },
      text: { en: 'Engineering on a national e-invoicing and document-flow platform integrated with the tax authority’s roaming network and E-IMZO digital signatures.', uz: 'Soliq organining rouming tarmogʻi va E-IMZO elektron imzosi bilan bogʻlangan milliy elektron hisob-faktura va hujjat aylanishi platformasida muhandislik.', ru: 'Разработка национальной платформы электронных счетов-фактур и документооборота, интегрированной с роуминговой сетью налоговой и ЭЦП E-IMZO.' } },
    { period: '2022 — 2026', org: 'Fincube', role: { en: 'Full-stack .NET developer', uz: 'Full-stack .NET dasturchi', ru: 'Full-stack .NET-разработчик' },
      text: { en: 'Client software for an insurance company and a bank of the APEX group: workflow automation, integrations and internal systems.', uz: 'APEX guruhidagi sugʻurta kompaniyasi va bank uchun dasturlar: ish jarayonlarini avtomatlashtirish, integratsiyalar va ichki tizimlar.', ru: 'Программы для страховой компании и банка группы APEX: автоматизация процессов, интеграции и внутренние системы.' } },
    { period: '2022', org: 'UZCARD', role: { en: '.NET developer', uz: '.NET dasturchi', ru: '.NET-разработчик' },
      text: { en: 'Work at the national interbank payment card system.', uz: 'Milliy banklararo toʻlov kartalari tizimida ish.', ru: 'Работа в национальной межбанковской платёжной системе.' } },
    { period: '2021 — 2022', org: 'Ilmhub IT School', role: { en: 'Software developer and C#/.NET instructor', uz: 'Dasturchi va C#/.NET oʻqituvchisi', ru: 'Разработчик и преподаватель C#/.NET' },
      text: { en: 'Taught the C#/.NET bootcamp and contributed to the school’s open-source student projects.', uz: 'C#/.NET bootcampʼida dars berdi va maktabning ochiq kodli talaba loyihalariga hissa qoʻshdi.', ru: 'Преподавание на буткемпе C#/.NET и участие в открытых студенческих проектах школы.' } },
    { period: '2021', org: 'Najot Taʼlim', role: { en: 'Student', uz: 'Talaba', ru: 'Обучение' },
      text: { en: 'C and Python foundations, then competitive programming on RoboContest and LeetCode.', uz: 'C va Python asoslari, keyin RoboContest va LeetCodeʼda musobaqaviy dasturlash.', ru: 'Основы C и Python, затем олимпиадное программирование на RoboContest и LeetCode.' } },
  ],
  skillsTitle: { en: 'What the work covers', uz: 'Ish nimalarni qamraydi', ru: 'Что охватывает работа' },
  skills: [
    { group: { en: 'Backend', uz: 'Backend', ru: 'Backend' }, items: ['C#', '.NET 10', 'ASP.NET Core', 'gRPC', 'SignalR', 'Node', 'Fastify'] },
    { group: { en: 'Data', uz: 'Maʼlumotlar', ru: 'Данные' }, items: ['SQL Server', 'PostgreSQL', 'SQLite', 'RabbitMQ', 'Redis'] },
    { group: { en: 'Frontend', uz: 'Frontend', ru: 'Frontend' }, items: ['TypeScript', 'React 19', 'Astro', 'Telegram Mini Apps', 'PWA'] },
    { group: { en: 'Systems', uz: 'Tizimlar', ru: 'Системы' }, items: ['Rust', 'C++/Qt', 'Windows TSF', 'IBus', 'Fcitx5', 'InputMethodKit'] },
    { group: { en: '3D and motion', uz: '3D va harakat', ru: '3D и анимация' }, items: ['three.js', 'React Three Fiber', 'GLSL', 'GSAP', 'Blender'] },
    { group: { en: 'Infrastructure', uz: 'Infratuzilma', ru: 'Инфраструктура' }, items: ['Docker', 'Caddy', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'frp'] },
    { group: { en: 'AI agents', uz: 'AI agentlar', ru: 'ИИ-агенты' }, items: ['MCP servers', 'OAuth 2.1', 'Claude Code', 'Multi-agent orchestration'] },
  ],
  openTitle: { en: 'Open source', uz: 'Ochiq kod', ru: 'Открытый код' },
  open: {
    en: 'Maintainer of bitg, the open-source Uzbek keyboard (OpenSSF Best Practices gold). In 2022 translated Hassan Habib’s “The Standard” into Uzbek.',
    uz: 'Ochiq kodli oʻzbekcha klaviatura bitg maintainerʼi (OpenSSF Best Practices oltin). 2022-yilda Hassan Habibning “The Standard” qoʻllanmasini oʻzbek tiliga tarjima qildi.',
    ru: 'Мейнтейнер bitg — открытой узбекской клавиатуры (золото OpenSSF Best Practices). В 2022 году — перевод «The Standard» Хассана Хабиба на узбекский.',
  },
  linksTitle: { en: 'Elsewhere', uz: 'Boshqa joylarda', ru: 'В других местах' },
  links: [
    { label: 'xnosir.io', href: 'https://xnosir.io' },
    { label: 'GitHub', href: 'https://github.com/XakimovNosirbek' },
    { label: 'Telegram', href: 'https://t.me/xnosir' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nosirbek-xakimov-a64b72265/' },
    { label: 'X', href: 'https://x.com/XNosirbek' },
  ],
};

/** /company/timeline. Only public, dated events. */
export type TLKind = 'career' | 'product' | 'org' | 'release';
export const timeline: { date: string; kind: TLKind; title: T; text?: T; href?: string }[] = [
  { date: '2026-11-13', kind: 'org', title: { en: 'wonmor.io becomes the studio site', uz: 'wonmor.io studiya saytiga aylandi', ru: 'wonmor.io становится сайтом студии' }, href: '/news/introducing-wonmor-io' },
  { date: '2026-11-13', kind: 'release', title: { en: 'bitg 0.3.1, then OpenSSF silver and gold', uz: 'bitg 0.3.1, keyin OpenSSF kumush va oltin', ru: 'bitg 0.3.1, затем серебро и золото OpenSSF' }, href: '/news/bitg-openssf-silver' },
  { date: '2026-11-13', kind: 'product', title: { en: 'Zero-downtime deploys on the dtwin edge', uz: 'dtwin edgeʼida uzilishsiz deploylar', ru: 'Деплои без простоя на edge dtwin' }, href: '/news/zero-downtime-deploys' },
  { date: '2026-11-12', kind: 'release', title: { en: 'bitg 0.1, 0.2 and 0.3 in one day; bitg.uz goes live', uz: 'Bir kunda bitg 0.1, 0.2 va 0.3; bitg.uz ishga tushdi', ru: 'bitg 0.1, 0.2 и 0.3 за один день; запуск bitg.uz' }, href: '/news/introducing-bitg-0-3' },
  { date: '2026-11-11', kind: 'product', title: { en: 'Fam, self-hosted bug capture', uz: 'Fam — oʻz serveringizda xato yozib olish', ru: 'Fam — запись багов на своём сервере' }, href: '/products/fam' },
  { date: '2026-11-10', kind: 'product', title: { en: 'Telegram HTML widgets in production', uz: 'Telegram HTML vidjetlari ishlab turibdi', ru: 'HTML-виджеты Telegram в работе' } },
  { date: '2026-11-09', kind: 'org', title: { en: 'xnosir.io, the founder’s portfolio', uz: 'xnosir.io — asoschi portfoliosi', ru: 'xnosir.io — портфолио основателя' }, href: '/products/xnosir-io' },
  { date: '2026-11-07', kind: 'product', title: { en: 'Oilaviy restaurant ordering in production', uz: 'Oilaviy restoran buyurtmalari ishlab turibdi', ru: 'Заказы ресторана Oilaviy в работе' }, href: '/products/oilaviy' },
  { date: '2026-11-04', kind: 'product', title: { en: 'operobot, outbound calling for Uzbek rules', uz: 'operobot — oʻzbek qoidalariga mos chiquvchi qoʻngʻiroqlar', ru: 'operobot — исходящие звонки по узбекским правилам' }, href: '/products/operobot' },
  { date: '2026-11-02', kind: 'product', title: { en: 'Gateway and Tunnel go live', uz: 'Gateway va Tunnel ishga tushdi', ru: 'Запуск Gateway и Tunnel' }, href: '/products/gateway' },
  { date: '2026-10-30', kind: 'org', title: { en: 'dtwin becomes a GitHub organization', uz: 'dtwin GitHub tashkilotiga aylandi', ru: 'dtwin становится организацией на GitHub' } },
  { date: '2026-10-30', kind: 'product', title: { en: 'shop, gym and med experiments', uz: 'shop, gym va med tajribalari', ru: 'Эксперименты shop, gym и med' } },
  { date: '2026-10-29', kind: 'product', title: { en: 'TeleTwin and the office digital twin begin', uz: 'TeleTwin va ofis raqamli egizagi boshlandi', ru: 'Начало TeleTwin и цифрового двойника офиса' } },
  { date: '2026-10-27', kind: 'product', title: { en: '2,285 mosques imported from OpenStreetMap', uz: 'OpenStreetMapʼdan 2 285 ta masjid import qilindi', ru: 'Из OpenStreetMap импортировано 2 285 мечетей' } },
  { date: '2026-10-26', kind: 'release', title: { en: 'dtwin.uz opens, with an MCP server for Claude', uz: 'dtwin.uz ochildi, Claude uchun MCP server bilan', ru: 'Открытие dtwin.uz с MCP-сервером для Claude' }, href: '/products/dtwin' },
  { date: '2026-10-23', kind: 'org', title: { en: 'dtwin starts', uz: 'dtwin boshlandi', ru: 'Старт dtwin' } },
  { date: '2026-10-21', kind: 'product', title: { en: 'Claude Code, controlled from Telegram', uz: 'Claude Code Telegramʼdan boshqariladi', ru: 'Claude Code под управлением из Telegram' } },
  { date: '2026-04-01', kind: 'career', title: { en: 'Faktura.uz: full-stack engineer and DevOps', uz: 'Faktura.uz: full-stack muhandis va DevOps', ru: 'Faktura.uz: full-stack инженер и DevOps' } },
  { date: '2022-10-01', kind: 'career', title: { en: 'Fincube: full-stack .NET developer', uz: 'Fincube: full-stack .NET dasturchi', ru: 'Fincube: full-stack .NET-разработчик' } },
  { date: '2022-08-01', kind: 'career', title: { en: '“The Standard”, translated into Uzbek', uz: '“The Standard” oʻzbek tiliga tarjima qilindi', ru: '«The Standard» переведён на узбекский' } },
  { date: '2022-04-01', kind: 'career', title: { en: 'UZCARD: .NET developer', uz: 'UZCARD: .NET dasturchi', ru: 'UZCARD: .NET-разработчик' } },
  { date: '2021-10-01', kind: 'career', title: { en: 'Ilmhub IT School: developer and C#/.NET instructor', uz: 'Ilmhub IT School: dasturchi va C#/.NET oʻqituvchisi', ru: 'Ilmhub IT School: разработчик и преподаватель C#/.NET' } },
  { date: '2021-05-01', kind: 'career', title: { en: 'First code: C and Python at Najot Taʼlim', uz: 'Birinchi kod: Najot Taʼlimda C va Python', ru: 'Первый код: C и Python в Najot Taʼlim' } },
];
export const timelineKinds: Record<TLKind, T> = {
  career: { en: 'Career', uz: 'Karyera', ru: 'Карьера' },
  product: { en: 'Product', uz: 'Mahsulot', ru: 'Продукт' },
  org: { en: 'Studio', uz: 'Studiya', ru: 'Студия' },
  release: { en: 'Release', uz: 'Reliz', ru: 'Релиз' },
};
