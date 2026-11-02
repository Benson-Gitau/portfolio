// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

// Keystatic's local storage needs Node, so dev runs without the Workers adapter.
const isDev = process.argv.includes('dev');

// settings.siteUrl drives canonical URLs and the sitemap. Neither exists until it is a real URL.
const configuredSite = readFileSync('src/content/settings.yaml', 'utf8').match(/^siteUrl:\s*['"]?(https:\/\/[^'"\s]+)/m)?.[1];

// Public pages are prerendered. Only the /keystatic admin runs on the Worker.
export default defineConfig({
  build: { format: 'file' },
  site: configuredSite,
  adapter: isDev ? undefined : cloudflare({ imageService: 'compile', prerenderEnvironment: 'node' }),
  session: false,
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    ...(configuredSite ? [sitemap({ filter: (page) => !page.includes('/keystatic') && !page.includes('/404') })] : []),
  ],
  fonts: [
    {
      name: 'Geist',
      cssVariable: '--font-geist',
      provider: fontProviders.fontsource(),
      weights: [500, 600],
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
