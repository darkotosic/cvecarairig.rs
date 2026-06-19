from types import SimpleNamespace

from app.core.security import verify_password
from app.models.category import Category
from app.models.store_setting import StoreSetting
from app.models.user import User
from app.scripts import seed_cvecara_irig
from app.scripts.seed_cvecara_irig import CATEGORIES, seed


def test_seed_creates_categories_and_public_settings_without_duplicates(db):
    seed(db)
    seed(db)

    categories = db.query(Category).all()
    assert len(categories) == len(CATEGORIES)
    assert {category.name for category in categories} == set(CATEGORIES)

    settings = {row.key: row for row in db.query(StoreSetting).all()}
    assert settings["company_name"].value == "Online Cvećara Irig"
    assert settings["store_email"].value == "cvecaralotos022@gmail.com"
    assert settings["service_area"].is_public is True


def test_seed_does_not_overwrite_existing_settings(db):
    db.add(StoreSetting(key="store_email", value="custom@example.com", value_type="string", is_public=True))
    db.commit()

    seed(db)

    assert db.query(StoreSetting).filter(StoreSetting.key == "store_email").one().value == "custom@example.com"


def test_seed_creates_configured_admin_from_environment(db, monkeypatch):
    monkeypatch.setattr(
        seed_cvecara_irig,
        "settings",
        SimpleNamespace(
            ADMIN_EMAIL="cvecaralotos022@gmail.com",
            ADMIN_PASSWORD="Secret123!",
            ADMIN_FULL_NAME="Online Cvećara Irig Admin",
        ),
    )

    seed(db)

    admin = db.query(User).filter(User.email == "cvecaralotos022@gmail.com").one()
    assert admin.is_admin is True
    assert admin.is_active is True
    assert admin.full_name == "Online Cvećara Irig Admin"
    assert verify_password("Secret123!", admin.hashed_password)


def test_seed_promotes_existing_configured_admin_and_updates_password(db, monkeypatch):
    db.add(
        User(
            email="cvecaralotos022@gmail.com",
            full_name="Existing Admin",
            hashed_password="old-hash",
            is_admin=False,
            is_active=False,
        )
    )
    db.commit()
    monkeypatch.setattr(
        seed_cvecara_irig,
        "settings",
        SimpleNamespace(
            ADMIN_EMAIL="cvecaralotos022@gmail.com",
            ADMIN_PASSWORD="Secret123!",
            ADMIN_FULL_NAME="Online Cvećara Irig Admin",
        ),
    )

    seed(db)

    admin = db.query(User).filter(User.email == "cvecaralotos022@gmail.com").one()
    assert admin.is_admin is True
    assert admin.is_active is True
    assert admin.full_name == "Existing Admin"
    assert verify_password("Secret123!", admin.hashed_password)
