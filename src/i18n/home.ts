import type { T } from './config';

export const categories: Record<string, T> = {
  announcements: { en: 'Announcements', uz: 'Eʼlonlar', ru: 'Анонсы' },
  product: { en: 'Product', uz: 'Mahsulot', ru: 'Продукт' },
  research: { en: 'Research', uz: 'Tadqiqot', ru: 'Исследование' },
  engineering: { en: 'Engineering', uz: 'Muhandislik', ru: 'Инженерия' },
  company: { en: 'Company', uz: 'Studiya', ru: 'Студия' },
};

export const home = {
  title: { en: 'Wonmor — independent software from Uzbekistan', uz: 'Wonmor — Oʻzbekistondan mustaqil dasturiy taʼminot', ru: 'Wonmor — независимые программы из Узбекистана' },
  description: {
    en: 'Wonmor is an independent studio from Uzbekistan. It builds and supports the dtwin ecosystem — tools for faith, language, work and everyday life.',
    uz: 'Wonmor — Oʻzbekistondagi mustaqil studiya. U dtwin ekotizimini — eʼtiqod, til, ish va kundalik hayot uchun vositalarni yaratadi va qoʻllab-quvvatlaydi.',
    ru: 'Wonmor — независимая студия из Узбекистана. Она создаёт и поддерживает экосистему dtwin — инструменты для веры, языка, работы и повседневной жизни.',
  },
  lead: {
    en: 'Software from Uzbekistan, built in the open and made to last.',
    uz: 'Oʻzbekistonda yaratilgan, ochiq quriladigan va uzoq xizmat qiladigan dasturlar.',
    ru: 'Программы из Узбекистана — открытые и сделанные надолго.',
  },
  statement: {
    en: 'Wonmor is an independent studio. It builds and supports the dtwin ecosystem — tools for faith, language, work and everyday life — and engineers them with the care of critical infrastructure.',
    uz: 'Wonmor — mustaqil studiya. U dtwin ekotizimini — eʼtiqod, til, ish va kundalik hayot uchun vositalarni yaratadi, qoʻllab-quvvatlaydi va ularni muhim infratuzilmadek puxta quradi.',
    ru: 'Wonmor — независимая студия. Она создаёт и поддерживает экосистему dtwin — инструменты для веры, языка, работы и повседневной жизни — и строит их с той же тщательностью, что и критическую инфраструктуру.',
  },
  heroLine1: { en: 'dtwin,', uz: 'dtwin', ru: 'dtwin' },
  heroLine2: { en: 'and everything around it', uz: 'va uning atrofidagi hamma narsa', ru: 'и всё, что вокруг него' },
  heroBody: {
    en: 'A prayer-anchored life planner, an Uzbek keyboard for three operating systems, and the gateways, tunnels and tools that keep them running.',
    uz: 'Namozga tayangan hayot rejalashtirgichi, uch operatsion tizim uchun oʻzbekcha klaviatura hamda ularni ishlatib turadigan gateway, tunnel va vositalar.',
    ru: 'Планировщик жизни вокруг намаза, узбекская клавиатура для трёх операционных систем и шлюзы, туннели и инструменты, на которых всё это держится.',
  },
  heroCta1: { en: 'Explore dtwin', uz: 'dtwinʼni ochish', ru: 'Открыть dtwin' },
  heroCta2: { en: 'All products', uz: 'Barcha mahsulotlar', ru: 'Все продукты' },
  filmLabel: { en: 'Wonmor brand film: one diamond becomes a V, the V splits and becomes a W.', uz: 'Wonmor brend filmi: bitta olmos V ga aylanadi, V ikkiga boʻlinib W boʻladi.', ru: 'Брендовый фильм Wonmor: бриллиант становится V, V раздваивается и становится W.' },
  learnMore: [
    { key: 'charter', art: 'charter',
      sub: { en: 'Seven principles that decide what we build and how.', uz: 'Nimani va qanday qurishimizni belgilaydigan yetti tamoyil.', ru: 'Семь принципов, которые определяют, что и как мы строим.' } },
    { key: 'sponsorship', art: 'sponsorship',
      sub: { en: 'What an independent, self-funded studio pays for, and why.', uz: 'Mustaqil, oʻz mablagʻi hisobiga ishlaydigan studiya nimaga pul sarflaydi va nega.', ru: 'Что оплачивает независимая студия на собственные средства — и почему.' } },
    { key: 'research', art: 'research',
      sub: { en: 'Agents, language, infrastructure, supply chains, interfaces and faith.', uz: 'Agentlar, til, infratuzilma, yetkazib berish zanjiri, interfeyslar va eʼtiqod.', ru: 'Агенты, язык, инфраструктура, цепочки поставок, интерфейсы и вера.' } },
    { key: 'careers', art: 'careers',
      sub: { en: 'Not hiring yet — but the open-source projects are open today.', uz: 'Hozircha ishga olinmaydi, lekin ochiq kodli loyihalar bugun ochiq.', ru: 'Пока не нанимаем, но открытые проекты открыты уже сегодня.' } },
  ],
} as const;
