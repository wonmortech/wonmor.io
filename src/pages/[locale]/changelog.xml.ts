import type { APIRoute } from 'astro';
import { changelogRss } from '../../i18n/changelog';
import type { Locale } from '../../i18n/config';

export const getStaticPaths = () => [{ params: { locale: 'uz' } }, { params: { locale: 'ru' } }];
export const GET: APIRoute = ({ params, site }) => changelogRss(params.locale as Locale, site);
