import type { T } from '../i18n/config';

/** How the products relate: clusters around dtwin. Used by the 3D constellation and its list fallback. */
export interface Cluster { key: string; label: T; color: string; products: string[] }

export const clusters: Cluster[] = [
  { key: 'core', color: '#d9c39a', label: { en: 'Core', uz: 'Yadro', ru: 'Ядро' }, products: ['dtwin'] },
  { key: 'agents', color: '#6a9bcc', label: { en: 'Agents and infrastructure', uz: 'Agentlar va infratuzilma', ru: 'Агенты и инфраструктура' }, products: ['gateway', 'tunnel', 'fam'] },
  { key: 'language', color: '#8fa86f', label: { en: 'Language', uz: 'Til', ru: 'Язык' }, products: ['bitg'] },
  { key: 'telegram', color: '#bcd1ca', label: { en: 'Telegram', uz: 'Telegram', ru: 'Telegram' }, products: ['teletwin'] },
  { key: 'experiments', color: '#cbcadb', label: { en: 'Experiments', uz: 'Tajribalar', ru: 'Эксперименты' }, products: ['shop', 'gym', 'med'] },
  { key: 'built', color: '#d18a64', label: { en: 'Built with others', uz: 'Boshqalar bilan qurilgan', ru: 'Сделано вместе с другими' }, products: ['oilaviy', 'primus-library', 'halvet', 'operobot'] },
  { key: 'spatial', color: '#ebcece', label: { en: '3D and spatial', uz: '3D va makon', ru: '3D и пространство' }, products: ['faktura-twin', 'attendo', 'xnosir'] },
];

/** Product key (as in src/data/products.json) → page key in src/i18n/pages.ts. */
export const pageKey = (product: string) => `p-${product}`;
