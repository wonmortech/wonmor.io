import type { T } from '../i18n/config';

/** Page keys whose text lives in src/content/docs/<key>/. */
export const docKeys = ['charter', 'rrp', 'open-source', 'transparency', 'security', 'sponsorship', 'careers', 'events', 'brand', 'contact', 'privacy', 'terms'] as const;

export const docUi = {
  updated: { en: 'Updated', uz: 'Yangilangan:', ru: 'Обновлено' },
  contents: { en: 'On this page', uz: 'Ushbu sahifada', ru: 'На этой странице' },
  level: { en: 'Level', uz: 'Daraja', ru: 'Уровень' },
  products: { en: 'Products at this level', uz: 'Shu darajadagi mahsulotlar', ru: 'Продукты на этом уровне' },
  none: { en: 'None yet', uz: 'Hozircha yoʻq', ru: 'Пока нет' },
  requires: { en: 'Requires', uz: 'Talab qiladi', ru: 'Требует' },
  files: { en: 'Files', uz: 'Fayllar', ru: 'Файлы' },
  colours: { en: 'Colours', uz: 'Ranglar', ru: 'Цвета' },
  film: { en: 'Brand film', uz: 'Brend filmi', ru: 'Брендовый фильм' },
  download: { en: 'Download', uz: 'Yuklab olish', ru: 'Скачать' },
  asOf: { en: 'As of November 13, 2026.', uz: '2026-yil 13-noyabr holatiga.', ru: 'На 13 ноября 2026 года.' },
  byLevel: { en: 'Products by release level', uz: 'Reliz darajasi boʻyicha mahsulotlar', ru: 'Продукты по уровню релиза' },
  openssf: { en: 'bitg on OpenSSF Best Practices', uz: 'bitg — OpenSSF Best Practices', ru: 'bitg в OpenSSF Best Practices' },
  public: { en: 'public repositories', uz: 'ochiq repozitoriy', ru: 'открытых репозиториев' },
} satisfies Record<string, T>;

/** Release levels (Responsible Release Policy). */
export const wrlLevels: { n: 1 | 2 | 3 | 4; name: T; req: T }[] = [
  { n: 1, name: { en: 'Prototype', uz: 'Prototip', ru: 'Прототип' },
    req: { en: 'Demo only. No promise of uptime or data retention.', uz: 'Faqat namoyish. Ishlash vaqti va maʼlumot saqlanishi kafolatlanmaydi.', ru: 'Только демонстрация. Без гарантий доступности и сохранности данных.' } },
  { n: 2, name: { en: 'MVP', uz: 'MVP', ru: 'MVP' },
    req: { en: 'CI on every change and working backups.', uz: 'Har oʻzgarishda CI va ishlaydigan zaxira nusxalar.', ru: 'CI на каждое изменение и рабочие резервные копии.' } },
  { n: 3, name: { en: 'Production', uz: 'Ishlab turibdi', ru: 'В работе' },
    req: { en: 'Status monitoring, tested rollback and a security review.', uz: 'Holat monitoringi, sinalgan orqaga qaytarish va xavfsizlik koʻrigi.', ru: 'Мониторинг состояния, проверенный откат и ревью безопасности.' } },
  { n: 4, name: { en: 'Critical', uz: 'Muhim', ru: 'Критичный' },
    req: { en: 'Reproducible builds, signed provenance and OpenSSF practices.', uz: 'Qayta yigʻiladigan buildʼlar, imzolangan kelib chiqish va OpenSSF amaliyotlari.', ru: 'Воспроизводимые сборки, подписанное происхождение и практики OpenSSF.' } },
];

export const brandColours = [
  { name: 'Wonmor Blue', hex: '#2969FF', on: '#FFFFFF' },
  { name: 'Ink', hex: '#090A1E', on: '#FFFFFF' },
  { name: 'White', hex: '#FFFFFF', on: '#090A1E' },
];

export const brandFiles = [
  { file: 'lockup-on-light.svg', label: 'Lockup · light', ground: '#faf9f5' },
  { file: 'lockup-on-dark.svg', label: 'Lockup · dark', ground: '#090A1E' },
  { file: 'mark-blue.svg', label: 'Mark · blue', ground: '#faf9f5' },
  { file: 'mark-white.svg', label: 'Mark · white', ground: '#2969FF' },
  { file: 'icon-blue.svg', label: 'App icon · blue', ground: '#ece9e1' },
  { file: 'icon-dark.svg', label: 'App icon · dark', ground: '#ece9e1' },
  { file: 'icon-light.svg', label: 'App icon · light', ground: '#ece9e1' },
  { file: 'icon-512.png', label: 'App icon · PNG 512', ground: '#ece9e1' },
];
