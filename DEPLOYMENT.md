# Deployment Guide - cvecarairig.rs

Production deployment guide for the cvecarairig.rs storefront, admin dashboard, FastAPI API, and PostgreSQL database.

## Pre-deployment checklist

- [ ] All backend checks pass: `python -m compileall app`, `pytest`, `alembic upgrade head`.
- [ ] All frontend checks pass: `npm ci`, `npm run lint`, `npm run type-check`, `npm run build`.
- [ ] Netlify environment variables are configured.
- [ ] Render environment variables are configured.
- [ ] Render PostgreSQL is attached and backed up before migrations.
- [ ] Admin bootstrap token is temporary and removed after the initial admin account is created.
- [ ] Sentry DSN is set only if error tracking is enabled.

## Frontend deployment: Netlify

Netlify is the primary frontend target for `cvecarairig.rs`.

### Build configuration

The repository includes `netlify.toml` with the production build settings:

```toml
[build]
base = "apps/web"
command = "npm run build"
publish = ".next"

[build.environment]
NODE_VERSION = "22"
NEXT_PUBLIC_SITE_URL = "https://cvecarairig.rs"
NEXT_PUBLIC_BRAND_NAME = "Cvećara Irig"
NEXT_PUBLIC_DEFAULT_LOCALE = "sr"

[[plugins]]
package = "@netlify/plugin-nextjs"
```

The Next.js Netlify plugin is intentionally declared in `apps/web/package.json` so Netlify installs a deterministic dependency during `npm ci`.

### Required Netlify environment variables

Configure these in Netlify Site settings. Do not hardcode the Render URL in `netlify.toml`.

```env
API_BASE_URL=https://tvoj-render-backend.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://tvoj-render-backend.onrender.com
NEXT_PUBLIC_SITE_URL=https://cvecarairig.rs
ADMIN_ALLOWED_ORIGINS=https://cvecarairig.rs,https://www.cvecarairig.rs
NEXT_PUBLIC_BRAND_NAME=Cvećara Irig
NEXT_PUBLIC_DEFAULT_LOCALE=sr
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_CONTACT_PHONE=
NEXT_PUBLIC_LOGO_URL=
NEXT_PUBLIC_DELIVERY_NOTE=
NEXT_PUBLIC_RETURN_POLICY_SHORT=
NEXT_PUBLIC_COMPANY_NAME=
NEXT_PUBLIC_COMPANY_ADDRESS=
NEXT_PUBLIC_COMPANY_REGISTRATION_NUMBER=
NEXT_PUBLIC_COMPANY_TAX_ID=
```

Use the actual Render service URL for both `API_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL`; Netlify must have both variables so server-side rendering/proxy calls and browser API calls target the same backend contract.

### Deploy

1. Push the repository to GitHub.
2. Create a Netlify site from the repository.
3. Confirm Netlify is using `apps/web` as the base directory.
4. Confirm the build command is `npm run build` and publish directory is `.next`.
5. Configure the environment variables above.
6. Deploy and verify the storefront, product pages, cart, checkout, and legal pages.

## Backend deployment: Render

Render is the primary backend target. The backend must run database migrations before starting Uvicorn.

### Recommended Docker deployment

The API Docker image uses `/app/start.sh` as the container command. That script runs:

```sh
set -e
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers
```

This prevents production from serving a newer application against an unmigrated database.

### Render service configuration

1. Create a Render PostgreSQL database.
2. Create a Render Web Service from the GitHub repository.
3. Set the root directory to `apps/api`.
4. Use Docker deployment with `apps/api/Dockerfile`, or use a native Python service with Python 3.12.
5. If using Docker, keep the Docker `CMD ["/app/start.sh"]`.
6. If using a native Python service, the Render start command must execute migrations before Uvicorn:

```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers
```

### Required Render environment variables

```env
APP_ENV=production
APP_NAME=CvecaraIrig API
PROJECT_VERSION=0.3.0
API_PREFIX=/api/v1
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=https://cvecarairig.rs,https://www.cvecarairig.rs
FRONTEND_URL=https://cvecarairig.rs
DATABASE_URL=postgresql://...
JWT_SECRET=dug-random-secret-minimum-32-karaktera
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
ADMIN_EMAIL=admin@cvecarairig.rs
ALLOW_PUBLIC_REGISTRATION=false
BOOTSTRAP_ADMIN_TOKEN=privremeno-samo-za-prvo-kreiranje-admina
RATE_LIMIT_DEFAULT=120/minute
RATE_LIMIT_AUTH=10/minute
RATE_LIMIT_CHECKOUT=5/minute
LOG_LEVEL=INFO
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=Cvećara Irig
MEDIA_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
```

Use `JWT_SECRET` for token signing. `MEDIA_PROVIDER=cloudinary` requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` before admin uploads are production-ready. Remove or rotate `BOOTSTRAP_ADMIN_TOKEN` immediately after creating the first admin account, then restart the Render service and verify bootstrap admin creation no longer works.

## Local Docker Compose

Local development can be started with:

```bash
docker compose up --build
```

The compose stack uses:

- PostgreSQL 16 on `localhost:5432`.
- Backend on `localhost:8000`.
- Frontend on `localhost:3000`.
- Internal server-side frontend API base URL: `http://backend:8000`.

## Security considerations

### HTTPS and domains

- Enable HTTPS for Netlify and Render.
- Redirect all public traffic to `https://cvecarairig.rs`.
- Include both `https://cvecarairig.rs` and `https://www.cvecarairig.rs` in backend CORS only if both domains are active.

### Secrets

- Store credentials only in Netlify/Render environment variables.
- Never commit JWT secrets, database URLs, SMTP passwords, Cloudinary credentials, or bootstrap tokens.
- Rotate secrets after suspected exposure.

### Database

- Use Render PostgreSQL with SSL enabled by Render.
- Enable automated backups.
- Take a manual backup before production migrations.
- Restrict direct access to production credentials.

## Monitoring and logging

- Set `SENTRY_DSN` only when Sentry is configured.
- Leave `SENTRY_DSN` empty to run without Sentry.
- Do not log `DATABASE_URL`, JWTs, SMTP credentials, or bootstrap tokens.
- Check Render logs after every deploy and migration.

## Rollback procedure

### Frontend: Netlify

1. Open Netlify deploy history.
2. Select the last known-good deploy.
3. Click rollback/redeploy.
4. Verify homepage, product listing, product detail, cart, checkout, and legal routes.

### Backend: Render

1. Confirm whether a database migration was applied.
2. If schema changed, restore from a pre-migration backup or apply a tested downgrade procedure before rolling back code.
3. Redeploy the last known-good Render image or commit.
4. Verify `/api/v1/health`.
5. Check Render logs for migration and startup errors.

## Production verification commands

Backend:

```bash
cd apps/api
python -m compileall app
pytest
alembic upgrade head
```

Frontend:

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
