import type { T } from '../i18n/config';
import raw from './products.json';

export interface Product {
  status: string;
  wrl: 1 | 2 | 3 | 4;
  since: string | null;
  repo: string | null;
  stack: string[];
  summary: T;
  features: { title: T; body: T }[];
  how: { title: T; body: T }[];
  facts: { value: string | T; label: T; source: string }[];
  milestones: { date: string; text: T }[];
  accent: string;
}

export const products = raw as unknown as Record<string, Product>;

/** Page key "p-bitg" → product key "bitg". */
export const productKeyOf = (pageKey: string) => pageKey.replace(/^p-/, '');

export const wrlLabel: Record<number, T> = {
  1: { en: 'WRL-1 · Prototype', uz: 'WRL-1 · Prototip', ru: 'WRL-1 · Прототип' },
  2: { en: 'WRL-2 · MVP', uz: 'WRL-2 · MVP', ru: 'WRL-2 · MVP' },
  3: { en: 'WRL-3 · Production', uz: 'WRL-3 · Ishlab turibdi', ru: 'WRL-3 · В работе' },
  4: { en: 'WRL-4 · Critical', uz: 'WRL-4 · Muhim', ru: 'WRL-4 · Критичный' },
};

export const productUi = {
  overview: { en: 'Overview', uz: 'Umumiy', ru: 'Обзор' },
  features: { en: 'What it does', uz: 'Nima qiladi', ru: 'Что умеет' },
  how: { en: 'How it works', uz: 'Qanday ishlaydi', ru: 'Как это работает' },
  facts: { en: 'In numbers', uz: 'Raqamlarda', ru: 'В цифрах' },
  stack: { en: 'Built with', uz: 'Texnologiyalar', ru: 'Технологии' },
  milestones: { en: 'Milestones', uz: 'Bosqichlar', ru: 'Этапы' },
  release: { en: 'Release level', uz: 'Reliz darajasi', ru: 'Уровень релиза' },
  since: { en: 'Live since', uz: 'Ishga tushgan', ru: 'Работает с' },
  source: { en: 'Source code', uz: 'Manba kod', ru: 'Исходный код' },
  site: { en: 'Website', uz: 'Sayt', ru: 'Сайт' },
  more: { en: 'More products', uz: 'Boshqa mahsulotlar', ru: 'Другие продукты' },
  support: { en: 'Built and supported by Wonmor.', uz: 'Wonmor tomonidan yaratilgan va qoʻllab-quvvatlanadi.', ru: 'Создано и поддерживается Wonmor.' },
  map: { en: 'The dtwin ecosystem', uz: 'dtwin ekotizimi', ru: 'Экосистема dtwin' },
  mapHint: { en: 'Drag to turn · hover a star', uz: 'Aylantirish uchun torting · yulduz ustiga keling', ru: 'Потяните, чтобы повернуть · наведите на звезду' },
  open: { en: 'Open', uz: 'Ochish', ru: 'Открыть' },
  sceneNote: { en: 'Generated scene: this product has no public interface to show.', uz: 'Yaratilgan sahna: bu mahsulotning ommaga ochiq interfeysi yoʻq.', ru: 'Сгенерированная сцена: у продукта нет публичного интерфейса.' },
  screenshotOf: { en: 'Screenshot of', uz: 'Skrinshot:', ru: 'Скриншот:' },
  asOf: { en: 'Screenshots taken on November 13, 2026.', uz: 'Skrinshotlar 2026-yil 13-noyabrda olingan.', ru: 'Скриншоты сделаны 13 ноября 2026 года.' },
} satisfies Record<string, T>;
