# @deusrex/storefront-astro

Astro skeleton for AI-generated DeusRex websites. Consumed by the
[deusrex](https://github.com/mikews93/deusrex) backend's publish worker;
the worker copies this skeleton into a temp dir, injects per-org site
data + bundle CSS/HTML, runs `astro build`, and uploads the resulting
static site to S3 + CloudFront.

## What's inside

- `src/islands/` — React islands for catalog list/detail, booking, cart, home-page widgets
- `src/layouts/` — Astro layouts (`BaseLayout`, `SubPageLayout`)
- `src/components/` — `Header.astro`, `Footer.astro` (regenerated per-build from the AI bundle)
- `src/pages/` — `/`, `/services/*`, `/store/*`, `/courses/*`, `/book/*`, `/checkout/*`, `llms.txt`, `robots.txt`
- `src/styles/` — `global.css`, `storefront.css`
- `src/runtime/public-api-config.ts` — placeholder constants the generator overwrites per-build

## How it's consumed

The backend's `AstroSiteGeneratorService` resolves this package via
`require.resolve('@deusrex/storefront-astro/package.json')` and copies the
skeleton into a temp dir per publish. See the deusrex repo for the
generator + worker setup.

## Development

```bash
bun install
bun run dev      # local astro dev server with placeholder data
bun run build    # static build into dist/
```

## License

Private — proprietary to DeusRex.