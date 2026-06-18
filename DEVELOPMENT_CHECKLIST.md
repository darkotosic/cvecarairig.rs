# Development Checklist

## Catalog

- [x] Category model, CRUD, public category API and admin category API
- [x] Product images and variants models
- [x] Product listing filters, pagination and sorting
- [x] Product detail page backed by API
- [ ] Bulk product import tooling

## Cart

- [x] Guest localStorage cart without extra dependencies
- [x] Add-to-cart button for listing/detail pages
- [x] Quantity update, removal and total calculation
- [ ] Cart synchronization for logged-in users

## Checkout

- [x] Guest checkout endpoint
- [x] Stock validation and decrement on order creation
- [x] Order snapshot items
- [x] SMTP-safe email notification service that does not break checkout
- [ ] Payment gateway integration

## Admin

- [x] Bootstrap admin endpoint guarded by token
- [x] Public registration disabled by default
- [x] Protected admin summary/products/orders/categories/settings endpoints
- [x] Minimal admin login/dashboard using sessionStorage token
- [ ] httpOnly-cookie admin auth hardening

## SEO/legal

- [x] Serbian copy cleanup with proper Latin characters
- [x] robots.ts and sitemap.ts
- [x] Organization/WebSite JSON-LD
- [x] Product JSON-LD on product detail pages
- [x] Privacy policy and terms templates with legal review warning
- [ ] Final legal review by licensed advisor

## Deployment

- [x] Netlify configuration hardened with security headers
- [x] Frontend Dockerfile uses Node 22 production build/start
- [x] Backend Dockerfile uses Python 3.12 slim, non-root user and healthcheck
- [x] GitHub Actions use strict frontend/backend quality gates
- [ ] Configure production Render services and environment variables

## Monitoring

- [x] Structured backend request logging baseline
- [ ] Error tracking integration
- [ ] Admin audit-log write helpers for every mutation
- [ ] Uptime checks and alerting
