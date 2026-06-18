from app.models.category import Category
from app.models.store_setting import StoreSetting
from app.scripts.seed_cvecara_irig import CATEGORIES, seed


def test_seed_creates_categories_and_public_settings_without_duplicates(db):
    seed(db)
    seed(db)

    categories = db.query(Category).all()
    assert len(categories) == len(CATEGORIES)
    assert {category.name for category in categories} == set(CATEGORIES)

    settings = {row.key: row for row in db.query(StoreSetting).all()}
    assert settings["company_name"].value == "Cvećara Irig"
    assert settings["store_email"].value == "info@cvecarairig.rs"
    assert settings["service_area"].is_public is True


def test_seed_does_not_overwrite_existing_settings(db):
    db.add(StoreSetting(key="store_email", value="custom@example.com", value_type="string", is_public=True))
    db.commit()

    seed(db)

    assert db.query(StoreSetting).filter(StoreSetting.key == "store_email").one().value == "custom@example.com"
