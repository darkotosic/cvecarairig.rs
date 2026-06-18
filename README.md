# SimeonShop.rs

Pre-production e-commerce foundation for selling clothing through Instagram/Facebook channels with a decoupled storefront, protected admin dashboard, FastAPI backend, PostgreSQL database, order lifecycle controls, checkout validation, and Cloudinary-ready product media.

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, App Router, Tailwind CSS
- **Backend:** FastAPI, SQLAlchemy, Pydantic, JWT authentication, SlowAPI rate limiting
- **Database:** Render PostgreSQL in production, Alembic migrations, isolated test database setup
- **Deployment:** Netlify frontend, Render backend, Render PostgreSQL

## Project status

This repository is in **pre-production e-commerce foundation** status: the core storefront, admin dashboard, backend API, migrations, protected admin proxy, guest checkout, order lifecycle, and product media foundations are in place, with final launch verification tracked in the production docs.

## Core API endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/bootstrap-admin`
- `GET /api/v1/products`
- `GET /api/v1/products/{slug}`
- `GET /api/v1/categories`
- `POST /api/v1/orders/guest-checkout` (canonical public storefront checkout)
- `POST /api/v1/orders/checkout` (legacy/internal authenticated-user checkout only)

## Admin API endpoints

All admin endpoints require `Authorization: Bearer <token>` from an admin user:

- `GET /api/v1/admin/summary`
- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `PATCH /api/v1/admin/products/{product_id}`
- `DELETE /api/v1/admin/products/{product_id}` (soft delete)
- `POST /api/v1/admin/products/{product_id}/images`
- `PATCH /api/v1/admin/products/{product_id}/images/{image_id}`
- `DELETE /api/v1/admin/products/{product_id}/images/{image_id}`
- `PATCH /api/v1/admin/products/{product_id}/images/{image_id}/primary`
- `POST /api/v1/admin/products/{product_id}/variants`
- `PATCH /api/v1/admin/products/{product_id}/variants/{variant_id}`
- `DELETE /api/v1/admin/products/{product_id}/variants/{variant_id}` (soft delete)
- `GET /api/v1/admin/orders`
- `PATCH /api/v1/admin/orders/{order_id}/status`
- `GET /api/v1/admin/categories`
- `POST /api/v1/admin/categories`
- `PATCH /api/v1/admin/categories/{category_id}`
- `DELETE /api/v1/admin/categories/{category_id}` (soft delete)
- `GET /api/v1/admin/settings`
- `PATCH /api/v1/admin/settings/{key}`

## Local development

### Backend

```bash
cd apps/api
py -3.12 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd apps/web
cp .env.example .env.local
npm ci
npm run dev
```

## Required environment variables

See `apps/api/.env.example`, `apps/web/.env.example`, [DEPLOYMENT.md](DEPLOYMENT.md), [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md), and [docs/PRODUCTION_RUNBOOK.md](docs/PRODUCTION_RUNBOOK.md). Do not hardcode API URLs, JWT secrets, SMTP credentials, Cloudinary credentials, admin bootstrap tokens or database URLs.

## Quality gates

```bash
cd apps/api
python -m compileall app
pytest
alembic upgrade head
```

```bash
cd apps/web
npm ci
npm run lint
npm run type-check
npm run build
```


## Production operations

- [Production runbook](docs/PRODUCTION_RUNBOOK.md)
- [Launch checklist](docs/LAUNCH_CHECKLIST.md)
