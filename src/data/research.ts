import type { T } from '../i18n/config';

export type Area = 'agents' | 'language' | 'infrastructure' | 'supply-chain' | 'interfaces' | 'faith-society' | 'digital-assets';

/** Research areas in menu order; page key = `research-${area}`, colour = card ground. */
export const areaList: { key: Area; color: string; products: string[] }[] = [
  { key: 'agents', color: '#6a9bcc', products: ['gateway', 'dtwin', 'fam'] },
  { key: 'language', color: '#8fa86f', products: ['bitg'] },
  { key: 'infrastructure', color: '#bcd1ca', products: ['tunnel', 'gateway'] },
  { key: 'supply-chain', color: '#d9c39a', products: ['bitg'] },
  { key: 'interfaces', color: '#ebcece', products: ['faktura-twin', 'halvet', 'xnosir'] },
  { key: 'faith-society', color: '#d18a64', products: ['dtwin'] },
  { key: 'digital-assets', color: '#cbcadb', products: [] },
];
export const areaPageKey = (a: Area) => `research-${a}`;

export const researchUi = {
  areas: { en: 'Research areas', uz: 'Tadqiqot yoʻnalishlari', ru: 'Направления исследований' },
  featured: { en: 'Featured', uz: 'Tanlangan', ru: 'Избранное' },
  all: { en: 'All research and engineering', uz: 'Barcha tadqiqot va muhandislik postlari', ru: 'Все исследования и инженерные заметки' },
  posts: { en: 'posts', uz: 'ta post', ru: 'публ.' },
  noPosts: { en: 'No posts yet.', uz: 'Hozircha post yoʻq.', ru: 'Пока нет публикаций.' },
  research: { en: 'Research', uz: 'Tadqiqot', ru: 'Исследование' },
  engineering: { en: 'Engineering', uz: 'Muhandislik', ru: 'Инженерия' },
  read: { en: 'min read', uz: 'daqiqa oʻqish', ru: 'мин чтения' },
  contents: { en: 'On this page', uz: 'Ushbu sahifada', ru: 'На этой странице' },
  reproduce: { en: 'Reproduce this', uz: 'Buni takrorlang', ru: 'Повторите сами' },
  repo: { en: 'Repository', uz: 'Repozitoriy', ru: 'Репозиторий' },
  commit: { en: 'Commit', uz: 'Commit', ru: 'Коммит' },
  private: { en: 'The repository is private; the commands use public tools only.', uz: 'Repozitoriy yopiq; buyruqlar faqat ommaviy vositalardan foydalanadi.', ru: 'Репозиторий закрыт; команды используют только публичные инструменты.' },
  sources: { en: 'Sources', uz: 'Manbalar', ru: 'Источники' },
  area: { en: 'Area', uz: 'Yoʻnalish', ru: 'Направление' },
  type: { en: 'Type', uz: 'Turi', ru: 'Тип' },
  published: { en: 'Date', uz: 'Sana', ru: 'Дата' },
  author: { en: 'Author', uz: 'Muallif', ru: 'Автор' },
  related: { en: 'Related products', uz: 'Bogʻliq mahsulotlar', ru: 'Связанные продукты' },
  more: { en: 'More from this area', uz: 'Shu yoʻnalishdan yana', ru: 'Ещё по этому направлению' },
  readPost: { en: 'Read the post', uz: 'Postni oʻqish', ru: 'Читать' },
  allAreas: { en: 'All areas', uz: 'Barcha yoʻnalishlar', ru: 'Все направления' },
} satisfies Record<string, T>;

/** "1 post" / "3 posts" / "5 публикаций" — plural forms per language. */
export function postCount(n: number, locale: 'en' | 'uz' | 'ru'): string {
  if (locale === 'uz') return `${n} ta post`;
  if (locale === 'en') return `${n} ${n === 1 ? 'post' : 'posts'}`;
  const m10 = n % 10, m100 = n % 100;
  const w = m10 === 1 && m100 !== 11 ? 'публикация' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'публикации' : 'публикаций';
  return `${n} ${w}`;
}

/** ~220 words per minute; Markdown punctuation is stripped first. */
export function readingMinutes(body = ''): number {
  const words = body.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`\[\]()|-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
