# cvecarairig.rs Production Runbook

## Architecture

- **Frontend:** Next.js App Router deployed on Netlify for `https://cvecarairig.rs`.
- **Backend:** FastAPI deployed on Render.com.
- **Database:** Render PostgreSQL managed database.
- **Media:** Cloudinary for product image uploads.

## Canonical checkout flow

The canonical production checkout endpoint is `/api/v1/orders/guest-checkout`. The authenticated `/api/v1/orders/checkout` endpoint is legacy/internal and reserved for future authenticated-user carts; do not expose it in the public storefront until idempotency and full order item snapshots are implemented.

Canonical production checkout endpoint:
`POST /api/v1/orders/guest-checkout`

Legacy endpoint:
`POST /api/v1/orders/checkout`
Koristi se samo za budući authenticated cart system.

## Verify frontend

1. Open `https://cvecarairig.rs` and confirm homepage renders.
2. Open `/products`, one product detail page, `/cart`, `/checkout`, and legal pages.
3. Confirm Netlify build used `npm run build` from `apps/web`.
4. Confirm the public footer does not link to `/admin/login`.

## Verify backend health

```bash
curl -fsS https://<render-api-host>/api/v1/health
```

Expected: JSON with `status: "ok"` and `database: "ok"`.

## Verify CORS

- `ALLOWED_ORIGINS` must include `https://cvecarairig.rs`.
- Browser requests from the storefront to backend should not show CORS errors.

## Verify environment variables

Backend required:

- `APP_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`
- `ALLOWED_ORIGINS`
- `FRONTEND_URL`
- `MEDIA_PROVIDER=cloudinary`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Frontend required:

- `API_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL=https://cvecarairig.rs`
- `ADMIN_ALLOWED_ORIGINS=https://cvecarairig.rs,https://www.cvecarairig.rs`

## Run migrations

Render Docker start must use `/app/start.sh`. The script runs migrations before Uvicorn:

```bash
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers
```

For manual verification in Render shell:

```bash
cd /app
alembic upgrade head
```

## Create the first admin

1. Temporarily set a strong `BOOTSTRAP_ADMIN_TOKEN` in Render.
2. Call the bootstrap admin endpoint documented in the API README or internal deployment notes.
3. Confirm admin can log in at `/admin/login`.

### Kako ukloniti BOOTSTRAP_ADMIN_TOKEN

1. Kreirati prvog admina.
2. Obrisati env varijablu `BOOTSTRAP_ADMIN_TOKEN` ili je ostaviti praznu.
3. Restartovati Render servis.
4. Proveriti da bootstrap-admin endpoint više ne radi.

## Admin proxy Origin check

Admin API calls from the Next.js application go through `/api/admin/proxy/...` so the backend JWT stays in an httpOnly cookie instead of browser-accessible storage. Mutation methods (`POST`, `PATCH`, `PUT`, and `DELETE`) are additionally protected with an `Origin` check.

Proveriti:

- `NEXT_PUBLIC_SITE_URL` tačno pokazuje na produkcioni domen.
- `ADMIN_ALLOWED_ORIGINS` uključuje `https://cvecarairig.rs` i `https://www.cvecarairig.rs` ako se koristi www domen.
- www i non-www domen rade bez lažnih `403` grešaka za admin mutation requestove.
- Admin create product radi.
- Admin upload image radi preko proxy-ja.
- Admin update order status radi.
- Production mutation requests without an `Origin` header, or with a cross-site origin, return `403` with `detail="Invalid admin request origin."`.
- Development allows `http://localhost:3000`, `http://127.0.0.1:3000`, and missing `Origin` headers for local tooling.

A CSRF token cookie/header can be layered on later if stricter double-submit protection is required.

## Verify an order

1. Add an active product to cart.
2. Complete checkout and accept terms.
3. Confirm success page shows an order number.
4. In admin, verify order items include product snapshot data, variant label, and internal note field.

### Kako proveriti order lifecycle

1. Kreirati test porudžbinu.
2. Promeniti `new -> confirmed`.
3. Promeniti `confirmed -> packed`.
4. Promeniti `packed -> shipped`.
5. Promeniti `shipped -> delivered`.
6. Pokušati `delivered -> cancelled` i potvrditi da vraća `400`.

### Kako proveriti checkout validation

1. Testirati telefon `+381`.
2. Testirati telefon sa slovima.
3. Testirati poštanski broj `11000`.
4. Testirati poštanski broj `11A00`.
5. Potvrditi da checkout bez `accepted_terms` ne prolazi.
6. Potvrditi da prazan cart ne prolazi.

### Kako proveriti Cloudinary upload

1. U adminu kreirati proizvod.
2. Uploadovati sliku.
3. Proveriti `ProductImage` zapis.
4. Proveriti da slika dolazi sa `res.cloudinary.com`.
5. Proveriti audit log metadata za `product_id`, `image_url`, `content_type`, `size_bytes`.

## Verify email notifications

- Confirm SMTP variables are set if email notifications are enabled.
- Checkout must remain successful even if email delivery fails.
- Check backend logs for email errors.

## Verify logs

- Render backend logs: health checks, checkout, admin actions, migration startup.
- Netlify deploy logs: build and runtime errors.

## Verify Sentry

If `SENTRY_DSN` is configured:

1. Trigger a controlled non-sensitive error in staging.
2. Confirm it appears in Sentry with the correct environment.
3. Never include secrets or customer payment data in Sentry events.

## Restore a database backup

1. Download or select a Render PostgreSQL backup/snapshot.
2. Restore into a new database first when possible.
3. Point staging backend to restored database and validate health, products, and orders.
4. Promote only after validation.

## Rollback procedure

1. Roll back Netlify to the previous successful deploy.
2. Roll back Render backend to the previous successful deploy.
3. If migrations were applied, assess whether downgrade is safe; avoid destructive rollback without backup.
4. If needed, restore PostgreSQL from the latest known-good backup.
5. Re-run health, checkout smoke test, admin login, and product detail checks.
