/**
 * robots.txt — prerendered (SSG).
 */
export const prerender = true;

import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() || 'https://example.deusrex.io';
  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${siteUrl}sitemap-index.xml
`,
    {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    },
  );
};
