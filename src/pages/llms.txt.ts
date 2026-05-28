/**
 * llms.txt endpoint — prerendered (SSG).
 * Content is injected by AstroSiteGeneratorService at build time.
 */
export const prerender = true;

import type { APIRoute } from 'astro';

// This content will be replaced at build time with real business data
const LLMS_TXT_CONTENT = `# [PLACEHOLDER]
> This content will be generated from business data at build time.
`;

export const GET: APIRoute = () => {
  return new Response(LLMS_TXT_CONTENT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
    },
  });
};
