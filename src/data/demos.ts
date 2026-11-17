import type { T } from '../i18n/config';

/* Live demos under /demo/<slug>/. Each one is a static build of the real app with fictional sample data
   (uz-open-data uses the real OpenStreetMap snapshot), served from public/demo/<slug>/. Nothing is sent to a
   server: writes stay in the tab and reset on reload. Cover images: public/demo/_covers/<slug>.webp. */

export type DemoGroup = 'dtwin' | 'work' | 'dev' | 'trust' | 'live';

export interface Demo {
  slug: string;
  title: string;
  group: DemoGroup;
  tagline: T;
  /** Product key in src/data/products.json, when the product has a page on wonmor.io. */
  product?: string;
  /** The real product site, when there is one. */
  site?: string;
  /** Public source repository only. */
  repo?: string;
  /** Sign-in shown to the visitor: `auto` = the demo opens signed in. */
  login?: { auto: boolean; creds?: string; who?: T };
  /** Honest status label, e.g. concept demo or real open data. */
  note?: T;
  /** No demo copy: the card opens the live site. */
  liveOnly?: boolean;
}

const concept: T = { en: 'Concept demo', uz: 'Konsept demo', ru: 'Концепт-демо' };

export const demoGroups: Record<DemoGroup, T> = {
  dtwin: { en: 'Everyday life', uz: 'Kundalik hayot', ru: 'Повседневная жизнь' },
  work: { en: 'Teams and business', uz: 'Jamoa va biznes', ru: 'Команды и бизнес' },
  dev: { en: 'Developer tools', uz: 'Dasturchilar uchun', ru: 'Инструменты разработчика' },
  trust: { en: 'Language, open data and proofs', uz: 'Til, ochiq maʼlumot va isbotlar', ru: 'Язык, открытые данные и доказательства' },
  live: { en: 'Live sites', uz: 'Jonli saytlar', ru: 'Живые сайты' },
};

export const demos: Demo[] = [
  // ---------------- everyday life ----------------
  { slug: 'dtwin', title: 'dtwin', group: 'dtwin', product: 'dtwin', site: 'https://dtwin.uz', login: { auto: true },
    tagline: { en: 'A personal life OS built around the five daily prayers: day plan, habits, worship, money and a 96-tool MCP server.',
      uz: 'Besh vaqt namoz atrofida qurilgan shaxsiy hayot tizimi: kun rejasi, odatlar, ibodat, moliya va 96 toolʼli MCP server.',
      ru: 'Личная система жизни вокруг пяти намазов: план дня, привычки, ибадат, финансы и MCP-сервер на 96 инструментов.' } },
  { slug: 'masjid-map', title: 'Masjid xarita', group: 'dtwin', site: 'https://map.dtwin.uz', login: { auto: true, creds: 'demo@namuna.uz / demo1234' },
    tagline: { en: 'Map of 188 Tashkent mosques with typo-tolerant search, a Fajr challenge tracker, a route advisor and an MCP console.',
      uz: 'Toshkentdagi 188 masjid xaritasi: xatoga chidamli qidiruv, bomdod challenge tracker, yoʻl maslahatchisi va MCP konsol.',
      ru: 'Карта 188 мечетей Ташкента: поиск с опечатками, трекер фаджр-челленджа, советник маршрута и MCP-консоль.' } },
  { slug: 'gym', title: 'gym.dtwin', group: 'dtwin', product: 'gym', site: 'https://gym.dtwin.uz', repo: 'https://github.com/dtwinuz/gym-dtwin',
    tagline: { en: 'A workout log with 1,827 exercises, plans, rest timer, PRs and progress charts, no account needed.',
      uz: '1827 mashqli mashgʻulot kundaligi: reja, taymer, rekordlar va progress, akkauntsiz.',
      ru: 'Дневник тренировок: 1827 упражнений, планы, таймер отдыха, рекорды и прогресс без аккаунта.' } },
  { slug: 'med', title: 'med.dtwin', group: 'dtwin', product: 'med', site: 'https://med.dtwin.uz',
    tagline: { en: 'A clinical knowledge platform for doctors and students: 163 topics, 199 drugs, 951 exam questions and 13 clinical cases.',
      uz: 'Shifokor va talabalar uchun klinik bilim platformasi: 163 mavzu, 199 dori, 951 test va 13 klinik holat.',
      ru: 'Платформа клинических знаний для врачей и студентов: 163 темы, 199 препаратов, 951 тестовый вопрос и 13 клинических случаев.' } },
  { slug: 'shop', title: 'shop.dtwin', group: 'dtwin', product: 'shop', site: 'https://shop.dtwin.uz',
    tagline: { en: 'One catalogue for Instagram clothing shops: search by size, fit advice, price alerts and a 3D store twin.',
      uz: 'Instagram kiyim doʻkonlari bitta katalogda: oʻlcham boʻyicha qidiruv, razmer maslahati, narx alertlari va 3D doʻkon.',
      ru: 'Instagram-магазины одежды в одном каталоге: поиск по размеру, подбор размера, ценовые алерты и 3D-двойник магазина.' } },

  // ---------------- teams and business ----------------
  { slug: 'teletwin', title: 'TeleTwin', group: 'work', product: 'teletwin', site: 'https://tele.dtwin.uz', login: { auto: true, creds: 'demo / demo' },
    tagline: { en: 'Corporate Telegram on your own server: one click revokes a leaving employee everywhere.',
      uz: 'Oʻz serveringizdagi korporativ Telegram: ketgan xodimning kirishi bir tugma bilan hamma joyda oʻchadi.',
      ru: 'Корпоративный Telegram на своём сервере: один клик отзывает доступ ушедшего сотрудника везде.' } },
  { slug: 'teletwin-web', title: 'TeleTwin Web', group: 'work', product: 'teletwin', repo: 'https://github.com/dtwinuz/teletwin-web', login: { auto: true, creds: 'demo / demo' },
    tagline: { en: 'Telegram and your company chats in one list; company chats stay on your own server.',
      uz: 'Telegram va korxona chatlari bitta roʻyxatda; korxona chatlari oʻz serveringizda qoladi.',
      ru: 'Telegram и рабочие чаты в одном списке; рабочие чаты остаются на вашем сервере.' } },
  { slug: 'attendo', title: 'Attendo', group: 'work', product: 'attendo', login: { auto: true, creds: 'demo / demo' },
    tagline: { en: 'Face ID attendance: live office, timesheets, rules and a Telegram Mini App, filled with 47 sample employees.',
      uz: 'Face ID davomat: jonli ofis, tabel, qoidalar va Telegram Mini App, 47 ta namuna xodim bilan.',
      ru: 'Учёт посещаемости по Face ID: живой офис, табель, правила и Telegram Mini App на 47 примерных сотрудниках.' } },
  { slug: 'oilaviy', title: 'Oilaviy shaharcha', group: 'work', product: 'oilaviy', site: 'https://oilaviyshaharcha.uz', login: { auto: true },
    tagline: { en: 'Restaurant site, Telegram Mini App and a live admin board: 105 dishes, orders in every state, staff courses and certificates.',
      uz: 'Restoran sayti, Telegram Mini App va jonli admin: 105 taom, har holatdagi buyurtmalar, xodimlar uchun kurs va sertifikat.',
      ru: 'Сайт ресторана, Telegram Mini App и живая админка: 105 блюд, заказы во всех статусах, курсы и сертификаты для персонала.' } },
  { slug: 'primus-library', title: 'Primus Library', group: 'work', product: 'primus-library', site: 'https://primus-library.dtwin.uz', login: { auto: true },
    tagline: { en: 'Studio 3D model library with 61 models, episodes, a work board, a review queue and version history.',
      uz: 'Studiya 3D model kutubxonasi: 61 model, epizodlar, ish doskasi, koʻrib chiqish navbati va versiyalar tarixi.',
      ru: 'Библиотека 3D-моделей студии: 61 модель, эпизоды, рабочая доска, очередь ревью и история версий.' } },
  { slug: 'operobot2', title: 'operobot2', group: 'work', product: 'operobot', site: 'https://operobot2.dtwin.uz', repo: 'https://github.com/dtwinuz/operobot2', login: { auto: true, creds: 'demo@namuna.uz / demo' },
    tagline: { en: 'AI sales and call-center SaaS: 5 chat channels in one inbox, AI agents, a CRM board and outbound calls.',
      uz: 'AI sotuv va call-markaz SaaS: 5 kanal bitta inboxʼda, AI agentlar, CRM doska va chiquvchi qoʻngʻiroqlar.',
      ru: 'SaaS для AI-продаж и колл-центра: 5 каналов в одном инбоксе, AI-агенты, CRM-доска и исходящие звонки.' } },
  { slug: 'operobot', title: 'operobot', group: 'work', product: 'operobot', site: 'https://operobot.dtwin.uz',
    tagline: { en: 'Auto-call robot: Google Sheet leads go through an Asterisk IVR to a live operator, 4 lines in parallel.',
      uz: 'Avto-qoʻngʻiroq roboti: Google Sheet lidlari Asterisk IVR orqali jonli operatorga, 4 liniya parallel.',
      ru: 'Робот автообзвона: лиды из Google Sheet через IVR Asterisk к живому оператору, 4 линии параллельно.' } },
  { slug: 'faktura-twin', title: 'Faktura Twin', group: 'work', product: 'faktura-twin', login: { auto: false, creds: 'demo / demo' },
    tagline: { en: 'A live 3D digital twin of an office: people, servers, code, Jira and business pulse in one scene, on a fictional company.',
      uz: 'Ofisning jonli 3D raqamli egizagi: odamlar, serverlar, kod, Jira va biznes puls bitta sahnada, toʻqima kompaniya misolida.',
      ru: 'Живой 3D-цифровой двойник офиса: люди, серверы, код, Jira и бизнес-пульс в одной сцене, на вымышленной компании.' } },
  { slug: 'halvet', title: 'Halvet', group: 'work', product: 'halvet', site: 'https://halvet.dtwin.uz', repo: 'https://github.com/dtwinuz/halvet', note: concept,
    tagline: { en: 'Premium site for private hammam, sauna and pool builders: three languages, WebGL steam, 3D cutaways and engineering blueprints.',
      uz: 'Shaxsiy hammom, sauna va basseyn quruvchilarining premium sayti: uch til, WebGL bugʻ, 3D kesimlar va muhandislik chizmalari.',
      ru: 'Премиальный сайт строителей частных хаммамов, саун и бассейнов: три языка, WebGL-пар, 3D-разрезы и инженерные схемы.' } },

  // ---------------- developer tools ----------------
  { slug: 'gateway', title: 'dtwin Gateway', group: 'dev', product: 'gateway',
    tagline: { en: 'An MCP gateway that gives AI agents read-only, masked and audited access to Jira, GitLab and SQL.',
      uz: 'AI agentlarga Jira, GitLab va SQLʼga faqat oʻqish uchun, niqoblangan va audit qilinadigan kirish beruvchi MCP gateway.',
      ru: 'MCP-шлюз: AI-агенты получают доступ к Jira, GitLab и SQL только на чтение, с маскированием и аудитом.' } },
  { slug: 'tunnel', title: 'dtwin Tunnel', group: 'dev', product: 'tunnel',
    tagline: { en: 'Self-hosted ngrok alternative: expose a local HTTP server on your own subdomain with one command.',
      uz: 'Oʻz serverimizdagi ngrok muqobili: lokal HTTP serverni bitta buyruq bilan oʻz subdomeningizga chiqaring.',
      ru: 'Своя альтернатива ngrok: локальный HTTP-сервер на собственном поддомене одной командой.' } },
  { slug: 'fam', title: 'Fam', group: 'dev', product: 'fam', login: { auto: true, creds: 'demo@fam.uz / demo' },
    tagline: { en: 'Self-hosted bug capture: video, DOM replay, console and network in one link, with 70 sample reports.',
      uz: 'Oʻz serverimizdagi bug yozish vositasi: video, DOM replay, console va network bitta havolada, 70 ta namuna bilan.',
      ru: 'Self-hosted запись багов: видео, DOM-replay, консоль и сеть в одной ссылке, 70 примеров.' } },
  { slug: 'design-system', title: 'Wonmor design tokens', group: 'dev', repo: 'https://github.com/wonmortech/design-system',
    tagline: { en: 'Interactive playground for 115 Wonmor design tokens: colour, contrast, type, layout, motion and themes.',
      uz: '115 ta Wonmor dizayn tokeni uchun interaktiv playground: rang, kontrast, shrift, setka, harakat va mavzular.',
      ru: 'Интерактивная песочница для 115 дизайн-токенов Wonmor: цвет, контраст, шрифт, сетка, анимация и темы.' } },

  // ---------------- language, open data and proofs ----------------
  { slug: 'bitg', title: 'bitg', group: 'trust', product: 'bitg', site: 'https://bitg.uz', repo: 'https://github.com/dtwinuz/bitg',
    tagline: { en: 'The real bitg settings window with the real conversion core: type old-style Uzbek, get the 2026 Latin alphabet.',
      uz: 'Haqiqiy bitg sozlamalar oynasi va haqiqiy oʻgirish yadrosi: eskicha yozing, 2026-yilgi lotin alifbosi chiqadi.',
      ru: 'Настоящее окно настроек bitg с настоящим ядром: пишите по-старому — получайте латиницу 2026 года.' } },
  { slug: 'uz-open-data', title: 'uz-open-data explorer', group: 'trust', repo: 'https://github.com/wonmortech/uz-open-data',
    note: { en: 'Real open data', uz: 'Haqiqiy ochiq maʼlumot', ru: 'Реальные открытые данные' },
    tagline: { en: 'Explore 2,289 mosques from OpenStreetMap on a map and table, plus a live Cyrillic to 2026 Latin converter.',
      uz: 'OpenStreetMapʼdagi 2 289 masjidni xarita va jadvalda koʻring, kirill-2026 lotin konvertori bilan.',
      ru: 'Исследуйте 2 289 мечетей из OpenStreetMap на карте и в таблице, плюс конвертер кириллицы в латиницу 2026.' } },
  { slug: 'tilo', title: 'Tilo', group: 'trust', site: 'https://tilo.wonmor.io', repo: 'https://github.com/wonmortech/tilouz', note: concept,
    login: { auto: false, creds: 'demo / demo', who: { en: 'interpreter cabinet', uz: 'tarjimon kabineti', ru: 'кабинет переводчика' } },
    tagline: { en: 'Deaf-hearing communication platform: interpreter calls, live captions, sign cards and a dictionary.',
      uz: 'Kar va eshituvchilar muloqot platformasi: tarjimon qoʻngʻirogʻi, jonli subtitr, kartalar va lugʻat.',
      ru: 'Платформа общения глухих и слышащих: вызов переводчика, субтитры, карточки и словарь жестов.' } },
  { slug: 'muhr', title: 'Muhr', group: 'trust', site: 'https://muhr.wonmor.io', repo: 'https://github.com/wonmortech/muhr', note: concept,
    tagline: { en: 'Stamp any file in your browser and verify its timestamp proof against a public Merkle log.',
      uz: 'Istalgan faylni brauzerda muhrlang va vaqt isbotini ochiq Merkle jurnali orqali tekshiring.',
      ru: 'Заверьте любой файл в браузере и проверьте доказательство времени по публичному Merkle-журналу.' } },
  { slug: 'sanad', title: 'Sanad', group: 'trust', site: 'https://sanad.wonmor.io', repo: 'https://github.com/wonmortech/sanad', note: concept,
    tagline: { en: 'Issue certificates as signed W3C Verifiable Credentials and verify them offline.',
      uz: 'Sertifikatlarni imzolangan W3C Verifiable Credentials sifatida bering va oflayn tekshiring.',
      ru: 'Выдавайте сертификаты как подписанные W3C Verifiable Credentials и проверяйте их офлайн.' } },
  { slug: 'shaffof', title: 'Shaffof', group: 'trust', site: 'https://shaffof.wonmor.io', repo: 'https://github.com/wonmortech/shaffof', note: concept,
    login: { auto: false, creds: 'demo / demo', who: { en: 'fund console', uz: 'fond konsoli', ru: 'консоль фонда' } },
    tagline: { en: 'Merkle-sealed charity reports, receipt proofs and a 4-school zakat calculator on 16 fictional funds.',
      uz: 'Merkle bilan muhrlangan xayriya hisobotlari, kvitansiya isboti va 4 mazhabli zakot kalkulyatori, 16 ta toʻqima fond.',
      ru: 'Благотворительные отчёты с Merkle-печатью, проверка квитанций и калькулятор закята четырёх мазхабов на 16 вымышленных фондах.' } },

  // ---------------- live sites ----------------
  { slug: 'portfolio', title: 'xnosir.io', group: 'live', product: 'xnosir', site: 'https://xnosir.io', liveOnly: true,
    tagline: { en: 'An immersive WebGL portfolio where you descend through 7 stack layers, each with its own 3D particle world.',
      uz: 'Immersiv WebGL portfolio: stekning 7 qatlami boʻylab tushish, har birida oʻz 3D zarra dunyosi.',
      ru: 'Иммерсивное WebGL-портфолио: спуск через 7 слоёв стека, у каждого свой 3D-мир из частиц.' } },
];

export const demoPath = (slug: string) => `/demo/${slug}/`;
/** Demos for one product page (products.json key). */
export const demosOf = (product: string) => demos.filter((d) => d.product === product && !d.liveOnly);
