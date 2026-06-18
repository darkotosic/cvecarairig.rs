#!/usr/bin/env sh
set -e

alembic upgrade head
python -m app.scripts.seed_cvecara_irig
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers
