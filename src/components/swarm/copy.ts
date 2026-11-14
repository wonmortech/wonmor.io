/** Every string on /swarm. `{n}` is filled from src/data at build time. */
export const copy = {
  title: { en: 'Swarm · Wonmor', uz: 'Swarm · Wonmor', ru: 'Swarm · Wonmor' },
  description: {
    en: 'A page that a swarm of cursors builds in front of you: every Wonmor product, number and milestone, assembled live together with a 3D particle swarm.',
    uz: 'Koʻz oldingizda kursorlar toʻdasi quradigan sahifa: Wonmorʼning barcha mahsulotlari, raqamlari va bosqichlari 3D zarralar toʻdasi bilan birga jonli yigʻiladi.',
    ru: 'Страница, которую на ваших глазах собирает рой курсоров: все продукты, цифры и вехи Wonmor вместе с 3D-роем частиц.',
  },
  eyebrow: { en: 'wonmor.io/swarm · a live build', uz: 'wonmor.io/swarm · jonli qurilish', ru: 'wonmor.io/swarm · живая сборка' },
  h1: {
    en: ['A page that', 'builds itself', 'in front of you.'],
    uz: ['Koʻz oldingizda', 'oʻzini oʻzi', 'quradigan sahifa.'],
    ru: ['Страница,', 'которая строит', 'себя сама.'],
  } as Record<'en' | 'uz' | 'ru', string[]>,
  sub: {
    en: 'A swarm of cursors draws the frames, types the words, paints the screenshots and checks its own work. Everything it builds is real.',
    uz: 'Kursorlar toʻdasi ramkalarni chizadi, soʻzlarni yozadi, skrinshotlarni boʻyaydi va oʻz ishini oʻzi tekshiradi. U qurgan hamma narsa haqiqiy.',
    ru: 'Рой курсоров рисует рамки, печатает слова, прокрашивает скриншоты и сам проверяет свою работу. Всё, что он собирает, настоящее.',
  },
  rebuild: { en: 'Wreck and rebuild', uz: 'Buzib, qayta qurish', ru: 'Сломать и собрать' },
  skip: { en: 'Skip the build', uz: 'Qurilishni oʻtkazish', ru: 'Пропустить сборку' },
  keys: {
    en: 'R rebuild · W wreck · B blueprint · L log · Esc skip',
    uz: 'R qayta qurish · W buzish · B chizma · L jurnal · Esc oʻtkazish',
    ru: 'R пересобрать · W сломать · B чертёж · L журнал · Esc пропустить',
  },

  productsH: { en: 'Everything we make', uz: 'Biz yaratgan hamma narsa', ru: 'Всё, что мы делаем' },
  productsLede: {
    en: '{n} products, from a prayer-anchored planner to an Uzbek keyboard. Real screenshots, real status.',
    uz: '{n} ta mahsulot: namozga tayangan rejalashtirgichdan oʻzbekcha klaviaturagacha. Haqiqiy skrinshotlar, haqiqiy holat.',
    ru: '{n} продуктов: от планировщика вокруг намаза до узбекской клавиатуры. Настоящие скриншоты, настоящий статус.',
  },
  numbersH: { en: 'Counted, not invented', uz: 'Toʻqilmagan, sanalgan', ru: 'Посчитано, а не придумано' },
  timelineH: { en: 'How we got here', uz: 'Bu yergacha qanday keldik', ru: 'Как мы сюда пришли' },
  timelineLede: {
    en: 'From the first lines of C in 2021 to three releases in a single day.',
    uz: '2021-yildagi birinchi C kodidan bir kunda uchta relizgacha.',
    ru: 'От первых строчек на C в 2021 году до трёх релизов за один день.',
  },
  stackH: { en: 'What it is made of', uz: 'Nimadan yasalgan', ru: 'Из чего это сделано' },
  stackLede: {
    en: 'Every technology named on a product page, sized by how many products use it.',
    uz: 'Mahsulot sahifalarida tilga olingan har bir texnologiya: nechta mahsulotda ishlatilganiga qarab kattalashadi.',
    ru: 'Каждая технология со страниц продуктов: чем больше продуктов её используют, тем она крупнее.',
  },
  howH: { en: 'How the swarm works', uz: 'Toʻda qanday ishlaydi', ru: 'Как работает рой' },
  steps: [
    { k: { en: 'Frame', uz: 'Ramka', ru: 'Рамка' },
      t: { en: 'An architect drags the outline of every block before anything inside it appears.', uz: 'Ichidagi narsa koʻrinishidan oldin arxitektor har bir blokning chegarasini tortib chiqadi.', ru: 'Архитектор вытягивает контур каждого блока, прежде чем внутри что-то появится.' } },
    { k: { en: 'Type', uz: 'Yozish', ru: 'Текст' },
      t: { en: 'Typists write each heading letter by letter, and now and then fix their own typo.', uz: 'Yozuvchilar har bir sarlavhani harfma-harf yozadi, goho oʻz xatosini oʻzi tuzatadi.', ru: 'Наборщики печатают каждый заголовок по букве и иногда сами исправляют опечатку.' } },
    { k: { en: 'Paint', uz: 'Boʻyash', ru: 'Краска' },
      t: { en: 'Painters sweep screenshots, panels and paragraphs into view with one stroke.', uz: 'Rassomlar skrinshot, panel va matnlarni bitta mazok bilan ochadi.', ru: 'Художники проявляют скриншоты, панели и абзацы одним мазком.' } },
    { k: { en: 'Review', uz: 'Tekshiruv', ru: 'Ревью' },
      t: { en: 'A critic checks each finished section and signs it off before the swarm moves on.', uz: 'Tanqidchi tayyor boʻlgan har bir boʻlimni tekshirib, imzo qoʻyadi, keyin toʻda davom etadi.', ru: 'Критик проверяет каждый готовый раздел и подписывает его, после чего рой идёт дальше.' } },
  ],
  howNote: {
    en: 'The content is in the page from the first millisecond, so search engines, screen readers and visitors without JavaScript get all of it at once. The cursors only decide when you see it.',
    uz: 'Kontent birinchi millisekunddan sahifada bor: qidiruv tizimlari, ekran oʻquvchi dasturlar va JavaScriptsiz kirganlar hammasini birdaniga oladi. Kursorlar faqat uni qachon koʻrishingizni hal qiladi.',
    ru: 'Контент есть на странице с первой миллисекунды: поисковики, скринридеры и посетители без JavaScript получают его сразу. Курсоры решают только, когда вы его увидите.',
  },
  honest: {
    en: 'The cursors are choreography: a script running in your browser, not AI agents. The products, numbers and dates are real and come from the same data as the rest of wonmor.io.',
    uz: 'Kursorlar — xoreografiya: brauzeringizda ishlayotgan skript, AI agentlar emas. Mahsulotlar, raqamlar va sanalar esa haqiqiy va wonmor.ioʼning qolgan sahifalari bilan bir xil maʼlumotdan olingan.',
    ru: 'Курсоры — это хореография: скрипт в вашем браузере, а не ИИ-агенты. Продукты, цифры и даты настоящие и взяты из тех же данных, что и весь wonmor.io.',
  },
  finalH: { en: 'Your turn', uz: 'Navbat sizda', ru: 'Ваша очередь' },
  finalLede: { en: 'Knock it down. The swarm will put it back.', uz: 'Uni buzing. Toʻda qaytadan quradi.', ru: 'Сломайте её. Рой соберёт заново.' },
  wreckAll: { en: 'Wreck this page', uz: 'Sahifani buzish', ru: 'Сломать страницу' },
  back: { en: 'Back to wonmor.io', uz: 'wonmor.io ga qaytish', ru: 'На wonmor.io' },
  plain: { en: 'View without the swarm', uz: 'Toʻdasiz koʻrish', ru: 'Без роя' },
  products: { en: 'Products', uz: 'Mahsulotlar', ru: 'Продукты' },

  hud: {
    agents: { en: 'agents', uz: 'agent', ru: 'агентов' },
    tasks: { en: 'tasks', uz: 'vazifa', ru: 'задач' },
    log: { en: 'Log', uz: 'Jurnal', ru: 'Журнал' },
    speed: { en: 'Speed', uz: 'Tezlik', ru: 'Скорость' },
    rebuild: { en: 'Rebuild', uz: 'Qayta qurish', ru: 'Пересобрать' },
    wreck: { en: 'Wreck', uz: 'Buzish', ru: 'Сломать' },
    blueprint: { en: 'Blueprint', uz: 'Chizma', ru: 'Чертёж' },
    skip: { en: 'Skip', uz: 'Oʻtkazish', ru: 'Пропустить' },
    you: { en: 'you', uz: 'siz', ru: 'вы' },
  },
  /** Log verbs, read by the script from data-cfg. */
  verbs: {
    join: { en: 'joined', uz: 'qoʻshildi', ru: 'подключился' },
    frame: { en: 'frames', uz: 'ramka chizmoqda', ru: 'рисует рамку' },
    type: { en: 'types', uz: 'yozmoqda', ru: 'печатает' },
    paint: { en: 'paints', uz: 'boʻyamoqda', ru: 'красит' },
    stamp: { en: 'stamps', uz: 'muhr bosmoqda', ru: 'ставит штамп' },
    count: { en: 'counts', uz: 'sanamoqda', ru: 'считает' },
    ink: { en: 'inks', uz: 'chizmoqda', ru: 'чертит' },
    mesh: { en: 'assembles the 3D swarm', uz: '3D toʻdani yigʻmoqda', ru: 'собирает 3D-рой' },
    typo: { en: 'fixed a typo', uz: 'xatoni tuzatdi', ru: 'исправил опечатку' },
    review: { en: 'review: approved', uz: 'tekshiruv: maʼqul', ru: 'ревью: одобрено' },
    flag: { en: 'flagged, then approved', uz: 'belgiladi, keyin maʼqulladi', ru: 'отметил, затем одобрил' },
    wreck: { en: 'wrecked', uz: 'buzildi', ru: 'сломано' },
    done: { en: 'build complete', uz: 'qurilish tugadi', ru: 'сборка завершена' },
  },
};

export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
