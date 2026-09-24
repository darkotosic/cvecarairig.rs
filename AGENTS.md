# AGENTS.md — cvecarairig.rs

## Mission

Build and maintain a production-ready **static florist storefront** for `cvecarairig.rs`.

- Git-managed catalog and store files are the production source of truth.
- The site requires no backend, database, admin authentication, or server-side checkout.
- Products are managed through files in `apps/web/data`.
- Product images live in `apps/web/public/proizvodi` and are served locally.
- Orders are arranged by phone and, when configured, WhatsApp.

## Principles

1. Production safety first; never invent prices or legal details.
2. Never commit secrets.
3. Keep the implementation deterministic, typed, simple, and dependency-light.
4. Every page must be responsive, accessible, and SEO-ready.
5. Preserve known product slugs and customer-facing information.
6. Catalog errors must fail validation/build rather than silently produce an empty site.
7. Do not add a database, CMS, remote media service, authentication system, or replacement admin panel.
8. Do not use clothing terminology or misleading live stock quantities.

## Architecture

- Next.js App Router and TypeScript in `apps/web`
- Tailwind CSS
- `output: 'export'`; Netlify publishes `apps/web/out`
- Local JSON catalog/store data and local WebP product images
- Client-side catalog filtering for the small product set

## Quality gates

Run from `apps/web` before completion:

```bash
npm ci
npm run validate:catalog
npm run lint
npm run type-check
npm run build
```

Confirm `out` exists and contains static HTML for every active product slug. The static build must pass before completion.

## Do not

- Do not introduce runtime API calls or remote product images.
- Do not hardcode catalog/store values throughout components; use structured data and typed adapters.
- Do not fabricate prices, availability, flower counts, dimensions, legal registration data, addresses, or social links.
- Do not make image optimization part of every production build.
- Do not retain obsolete backend, database, checkout, or admin infrastructure.
