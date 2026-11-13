import type { APIRoute } from 'astro';
import { changelogRss } from '../i18n/changelog';

export const GET: APIRoute = ({ site }) => changelogRss('en', site);
