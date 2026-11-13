import type { APIRoute } from 'astro';
import { rss } from '../i18n/rss';

export const GET: APIRoute = ({ site }) => rss('en', site);
