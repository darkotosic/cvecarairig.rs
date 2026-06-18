# AGENTS.md - SimeonShop.rs

## Mission

Build a production-ready e-commerce platform for `simeonshop.rs`.

The system consists of:

- public storefront
- protected admin dashboard
- backend API
- PostgreSQL database

## Core Principles

1. Production safety first.
2. No hardcoded secrets.
3. Use environment variables for external URLs and credentials.
4. Keep frontend and backend decoupled through API contracts.
5. Maintain clean, typed, scalable code.
6. Every feature must be mobile-friendly.
7. Every public page must be SEO-ready.
8. Admin routes must be protected.
9. Checkout must never lose customer order data.
10. Avoid unnecessary dependencies.

## Frontend Requirements

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- clean component architecture
- reusable API client
- responsive layout
- SEO metadata
- product listing
- product detail
- cart
- checkout
- legal pages
- admin dashboard

## Backend Requirements

Use:

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic
- JWT authentication
- CORS configuration
- structured API routes

## Required API Groups

- health
- auth
- products
- categories
- orders
- admin/products
- admin/categories
- admin/orders
- admin/settings

## Database Requirements

Create models for:

- users
- products
- categories
- product_images
- product_variants
- orders
- order_items
- store_settings

## Deployment Targets

Frontend:

- Netlify
- domain: `simeonshop.rs`

Backend:

- Render.com
- PostgreSQL on Render

## Quality Gates

Before completing production tasks, run:

```bash
cd apps/web
npm run lint
npm run build
```

```bash
cd apps/api
pytest
```

If tests are not implemented yet, add minimal smoke tests for API health and core models.

## Do Not

- Do not hardcode API URLs.
- Do not expose JWT secrets.
- Do not make admin routes public.
- Do not store passwords in plain text.
- Do not break mobile layout.
- Do not remove existing working functionality without reason.
- Do not use fake static fallback data as final production source of truth.

## Completion Format

For every completed task, provide:

- Summary of changes
- Files changed
- Commands run
- Environment variables needed
- Manual QA checklist
- Next recommended step

## Additional Production Rules

- Fake static product data must never be used as the final source of truth; public storefront data must come from API contracts.
- Admin routes and admin UI data must be protected by backend admin authorization.
- Checkout must persist customer order data and must not fail because optional email delivery is unavailable.
- Every backend model/schema change must have an Alembic migration.
- Every new endpoint must have a test or at least a smoke test.
- CI must not swallow errors with `|| true`, echo-only fallbacks, or equivalent bypasses.
