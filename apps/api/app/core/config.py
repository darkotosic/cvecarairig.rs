import json
from functools import lru_cache
from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_PREFIX: str = "/api/v1"
    APP_NAME: str = "CvecaraIrig API"
    APP_ENV: str = "development"
    PROJECT_VERSION: str = "0.3.0"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    FRONTEND_URL: str = "http://localhost:3000"

    DATABASE_URL: str = "sqlite:///./cvecarairig.db"

    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ADMIN_EMAIL: str = "admin@cvecarairig.rs"
    ALLOW_PUBLIC_REGISTRATION: bool = False
    BOOTSTRAP_ADMIN_TOKEN: str | None = None

    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    SMTP_FROM_NAME: str = "Cvećara Irig"

    RATE_LIMIT_DEFAULT: str = "120/minute"
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_CHECKOUT: str = "5/minute"
    LOG_LEVEL: str = "INFO"
    MEDIA_PROVIDER: str = "external_url"
    CLOUDINARY_CLOUD_NAME: str | None = None
    CLOUDINARY_API_KEY: str | None = None
    CLOUDINARY_API_SECRET: str | None = None
    CLOUDFLARE_R2_ACCOUNT_ID: str | None = None
    CLOUDFLARE_R2_ACCESS_KEY_ID: str | None = None
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: str | None = None
    CLOUDFLARE_R2_BUCKET: str | None = None
    CLOUDFLARE_R2_PUBLIC_URL: str | None = None
    SENTRY_DSN: str | None = None
    SENTRY_ENVIRONMENT: str = "production"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        value = self.ALLOWED_ORIGINS.strip()
        if not value:
            return []

        if value.startswith("["):
            parsed: Any = json.loads(value)
            if not isinstance(parsed, list):
                raise ValueError("ALLOWED_ORIGINS JSON value must be a list.")
            return [str(origin).strip() for origin in parsed if str(origin).strip()]

        return [origin.strip() for origin in value.split(",") if origin.strip()]

    def validate_runtime_security(self) -> None:
        if self.APP_ENV.lower() == "production":
            if self.JWT_SECRET in {"change-me", "change-me-in-production", ""}:
                raise RuntimeError("JWT_SECRET must be changed in production.")
            if "*" in self.allowed_origins_list:
                raise RuntimeError("ALLOWED_ORIGINS cannot contain '*' in production.")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
