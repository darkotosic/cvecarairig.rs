# cvecarairig.rs Launch Checklist

## Backend

- [ ] `python -m compileall app` passes in `apps/api`.
- [ ] `pytest` passes in `apps/api`.
- [ ] `alembic upgrade head` passes against production database.
- [ ] `/api/v1/health` returns `status=ok` and `database=ok`.
- [ ] CORS allows `https://cvecarairig.rs` and does not use `*` in production.
- [ ] `JWT_SECRET` is strong and not a default value.
- [ ] `BOOTSTRAP_ADMIN_TOKEN` is removed after first admin creation.
- [ ] SMTP settings are configured or explicitly disabled with checkout still succeeding.
- [ ] Sentry is configured if required.
- [ ] Rate limits are active for auth and checkout.

## Frontend

- [ ] `npm ci` passes in `apps/web`.
- [ ] `npm run lint` passes.
- [ ] `npm run type-check` passes.
- [ ] `npm run build` passes.
- [ ] `/sitemap.xml` includes static routes and active products.
- [ ] `/robots.txt` disallows `/admin`, `/checkout`, and `/checkout/success`.
- [ ] Product detail gallery, variant selection, price, SKU, and stock work.
- [ ] Cart keeps variant label and product image.
- [ ] Checkout requires accepted terms and creates order.
- [ ] Admin login works.
- [ ] Admin CRUD for products, categories, images, variants, settings, and orders works.
- [ ] Admin image upload works through the protected proxy without breaking multipart bodies.
- [ ] ADMIN_ALLOWED_ORIGINS uključuje https://cvecarairig.rs.
- [ ] ADMIN_ALLOWED_ORIGINS uključuje https://www.cvecarairig.rs.
- [ ] admin mutation requestovi ne vraćaju 403 na produkcionom domenu.

## Order lifecycle

- [ ] `new -> confirmed` radi.
- [ ] `confirmed -> packed` radi.
- [ ] `packed -> shipped` radi.
- [ ] `shipped -> delivered` radi.
- [ ] `new/confirmed/packed/shipped -> cancelled` radi.
- [ ] `delivered -> cancelled` je blokirano.
- [ ] `cancelled -> shipped` je blokirano.
- [ ] `status -> isti status` je blokirano.
- [ ] invalid status transition ne pravi `OrderStatusEvent`.
- [ ] invalid status transition ne pravi audit log.

## Checkout validation

- [ ] checkout bez `accepted_terms` je blokiran.
- [ ] guest checkout zahteva `accepted_terms`.
- [ ] legacy checkout zahteva `accepted_terms`.
- [ ] telefon sa `+381` formatom prolazi.
- [ ] telefon sa slovima je blokiran.
- [ ] poštanski broj mora imati 5 cifara.
- [ ] prazan cart ne može na checkout.
- [ ] frontend prikazuje validation greške.

- [ ] public frontend ne poziva `/api/v1/orders/checkout`.
- [ ] `/api/v1/orders/checkout` zahteva auth.
- [ ] `/api/v1/orders/checkout` je označen kao legacy/internal.

## Legacy checkout note

`POST /api/v1/orders/checkout` je legacy/internal logged-in checkout. Public storefront koristi `/api/v1/orders/guest-checkout`. Legacy checkout nije planiran kao primarni tok za prvu produkciju dok ne dobije idempotency i full order item snapshot.

## Cloudinary upload

- [ ] `MEDIA_PROVIDER=cloudinary`.
- [ ] `CLOUDINARY_CLOUD_NAME` podešen.
- [ ] `CLOUDINARY_API_KEY` podešen.
- [ ] `CLOUDINARY_API_SECRET` podešen.
- [ ] upload JPEG radi.
- [ ] upload PNG radi.
- [ ] upload WebP radi.
- [ ] upload preko 5MB je blokiran.
- [ ] pogrešan MIME type je blokiran.
- [ ] pogrešna ekstenzija je blokirana.
- [ ] audit log beleži `product_id`, `image_url`, `content_type`, `size_bytes`.

## Business

- [ ] Legal pages are reviewed by the business/legal owner.
- [ ] Contact email and phone are correct.
- [ ] Company name, address, registration number, and tax ID are correct.
- [ ] Delivery information is accurate.
- [ ] Return/exchange policy is accurate.
- [ ] Size guide is accurate.
- [ ] Test order is placed end-to-end.
- [ ] Admin status update is tested.
