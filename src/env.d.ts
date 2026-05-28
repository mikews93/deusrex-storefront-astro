/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly ORG_SLUG: string;
  readonly BACKEND_API_URL: string;
  readonly SITE_URL: string;
  readonly LOCALE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
