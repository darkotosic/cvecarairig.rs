from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.core.middleware import RequestIdMiddleware, RequestLoggingMiddleware, SecurityHeadersMiddleware
from app.core.rate_limit import limiter

setup_logging(settings.LOG_LEVEL)
settings.validate_runtime_security()

if settings.SENTRY_DSN:
    import sentry_sdk

    sentry_sdk.init(dsn=settings.SENTRY_DSN, environment=settings.SENTRY_ENVIRONMENT, traces_sample_rate=0.05)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.PROJECT_VERSION,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(RequestIdMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

register_exception_handlers(app)
app.include_router(v1_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to SimeonShop.rs API",
        "docs": "/api/docs",
        "version": settings.PROJECT_VERSION,
    }
