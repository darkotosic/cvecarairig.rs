from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.store_setting import StoreSetting

CATEGORIES = [
    "Buketi", "Ruže", "Flower Box", "Korpe i aranžmani", "Pokloni", "Svadbe i proslave", "Saučešće", "Sezonsko cveće",
]
SETTINGS = {
    "company_name": "Cvećara Irig",
    "store_email": "info@cvecarairig.rs",
    "service_area": "Irig, Vrdnik, Rivica, Ruma i okolna mesta po dogovoru",
    "same_day_cutoff": "Dostava istog dana za potvrđene porudžbine do 15:00",
    "payment_methods": "Plaćanje pouzećem, uplata na račun ili po dogovoru",
    "business_hours": "Pon-sub 08:00-20:00, nedelja po dogovoru",
}

def slugify(value: str) -> str:
    table = str.maketrans({"ć":"c","č":"c","š":"s","đ":"dj","ž":"z","Ć":"c","Č":"c","Š":"s","Đ":"dj","Ž":"z"})
    return "-".join(value.translate(table).lower().replace("&", " ").split())

def seed(db: Session) -> None:
    for index, name in enumerate(CATEGORIES):
        slug = slugify(name)
        if not db.query(Category).filter(Category.slug == slug).first():
            db.add(Category(name=name, slug=slug, sort_order=index, is_active=True))
    for key, value in SETTINGS.items():
        if not db.query(StoreSetting).filter(StoreSetting.key == key).first():
            db.add(StoreSetting(key=key, value=value, value_type="string", is_public=True))
    db.commit()

def main() -> None:
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()

if __name__ == "__main__":
    main()
