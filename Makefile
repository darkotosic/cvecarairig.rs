.PHONY: install dev lint typecheck validate build
install:
	cd apps/web && npm ci
dev:
	cd apps/web && npm run dev
lint:
	cd apps/web && npm run lint
typecheck:
	cd apps/web && npm run type-check
validate:
	cd apps/web && npm run validate:catalog
build:
	cd apps/web && npm run build
