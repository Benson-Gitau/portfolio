import type { APIRoute } from 'astro';
import { getSettings, hasPlaceholder } from '../lib/content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const { siteUrl } = await getSettings();
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /keystatic', 'Disallow: /api/keystatic'];
  if (siteUrl && !hasPlaceholder(siteUrl)) lines.push('', `Sitemap: ${new URL('/sitemap-index.xml', siteUrl)}`);
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
