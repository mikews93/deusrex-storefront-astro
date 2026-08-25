import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Spec 004: switched from `output: 'hybrid'` + @astrojs/node middleware to a
// fully static build. Catalog detail/list shells fetch data client-side from
// the existing public organization API (see specs/004-astro-website-publishing/
// contracts/public-org-api.md). The Node adapter is intentionally absent so
// the build cannot fall back to per-request SSR — every page must be
// prerenderable.
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://example.deusrex.io',
  // Astro builds `services/_detail.astro` → `services/_detail.html` (not
  // `_detail/index.html`) so CloudFront's path-rewrite can target the file
  // directly without managing trailing-slash redirects.
  build: { format: 'file' },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // Astro 7 (Vite 8) minifies CSS to Media Queries Level 4 range syntax
    // (`@media (width>=40rem)`) by default. A browser without that support
    // ignores the whole query, so every breakpoint on a published customer
    // site would stop applying and the page would render at its base styles.
    // Pinning the target keeps the emitted syntax where Astro 5 had it.
    build: { cssTarget: ['chrome100', 'edge100', 'firefox100', 'safari15'] },
  },
});
