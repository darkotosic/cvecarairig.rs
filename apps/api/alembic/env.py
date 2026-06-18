from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.dialects.sqlite.base import SQLiteCompiler

from app.core.config import settings
from app.db.base import Base
import app.models  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql://", 1)
    return database_url



def patch_sqlite_now_default() -> None:
    original_visit_textclause = SQLiteCompiler.visit_textclause

    def visit_textclause(self, textclause, add_to_result_map=None, **kw):  # type: ignore[no-untyped-def]
        if getattr(textclause, "text", "").lower() == "now()":
            return "CURRENT_TIMESTAMP"
        return original_visit_textclause(self, textclause, add_to_result_map=add_to_result_map, **kw)

    SQLiteCompiler.visit_textclause = visit_textclause

target_metadata = Base.metadata
config.set_main_option("sqlalchemy.url", normalize_database_url(settings.DATABASE_URL).replace("%", "%%"))


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    if normalize_database_url(settings.DATABASE_URL).startswith("sqlite"):
        patch_sqlite_now_default()

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, render_as_batch=connection.dialect.name == "sqlite")

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
