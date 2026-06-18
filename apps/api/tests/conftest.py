import os
import tempfile
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("DATABASE_URL", f"sqlite:///{tempfile.gettempdir()}/cvecarairig_test.db")
os.environ.setdefault("JWT_SECRET", "test-secret-not-for-production")
os.environ.setdefault("BOOTSTRAP_ADMIN_TOKEN", "test-bootstrap-token")
os.environ.setdefault("ALLOW_PUBLIC_REGISTRATION", "false")
os.environ.setdefault("RATE_LIMIT_CHECKOUT", "1000/minute")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.api.deps import get_db
from app.db.base import Base
from app.main import app
from app.models import *  # noqa: F401,F403

engine = create_engine(os.environ["DATABASE_URL"], connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    return TestClient(app)
