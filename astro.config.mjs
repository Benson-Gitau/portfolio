// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';
import cloudflare from '@astrojs/cloudflare';
import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Keystatic's local storage needs Node, so dev runs without the Workers adapter.
const isDev = process.argv.includes('dev');

// PUBLIC_SITE_URL (a Workers Builds build variable, or .env locally) drives canonical URLs, share
// images and the sitemap, with Keystatic's settings.siteUrl as the fallback. Neither is used until
// it is a real https URL, so a stand-in domain never reaches search engines.
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const realUrl = (/** @type {string | undefined} */ value) => (value && /^https:\/\/[^\s[\]]+$/.test(value) ? value : undefined);
const configuredSite =
  realUrl(env.PUBLIC_SITE_URL) ??
  realUrl(readFileSync('src/content/settings.yaml', 'utf8').match(/^siteUrl:\s*['"]?([^'"\s]+)/m)?.[1]);

// Lists any [PLACEHOLDER] still in the built pages, so an unfinished value cannot ship unnoticed.
const placeholderReport = {
  name: 'placeholder-report',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      const found = new Set();
      for (const file of readdirSync(root, { recursive: true })) {
        if (!String(file).endsWith('.html')) continue;
        const text = readFileSync(join(root, String(file)), 'utf8').replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ');
        for (const match of text.matchAll(/\[[A-Z][A-Za-z0-9_ ]+\]/g)) found.add(match[0]);
      }
      if (found.size) logger.warn(`Placeholders still in built pages: ${[...found].join(', ')}`);
    },
  },
};

// Output stays static: every page is prerendered. Only the routes the Keystatic integration injects
// (/keystatic and /api/keystatic, prerender: false) run on the Worker.
// imageService 'compile': images are optimised with sharp during the build (in Node) and the Worker
// gets the no-op service, so sharp is never needed at runtime and no Images binding is provisioned.
export default defineConfig({
  build: { format: 'file' },
  site: configuredSite,
  adapter: isDev ? undefined : cloudflare({ imageService: 'compile', prerenderEnvironment: 'node' }),
  session: false,
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    placeholderReport,
    ...(configuredSite
      ? [sitemap({ filter: (page) => !page.includes('/keystatic') && !page.includes('/api/') && !page.includes('/404') })]
      : []),
  ],
  fonts: [
    {
      name: 'Geist',
      cssVariable: '--font-geist',
      provider: fontProviders.fontsource(),
      weights: [300, 400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.fontsource(),
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      name: 'Instrument Serif',
      cssVariable: '--font-instrument',
      provider: fontProviders.fontsource(),
      weights: [400],
      styles: ['italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      provider: fontProviders.fontsource(),
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
