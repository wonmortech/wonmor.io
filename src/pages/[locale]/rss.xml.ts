import type { APIRoute } from 'astro';
import { rss } from '../../i18n/rss';
import type { Locale } from '../../i18n/config';

export const getStaticPaths = () => [{ params: { locale: 'uz' } }, { params: { locale: 'ru' } }];
export const GET: APIRoute = ({ params, site }) => rss(params.locale as Locale, site);
