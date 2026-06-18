from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.crud.product import slugify
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session, *, include_inactive: bool = False) -> list[Category]:
    query = db.query(Category)
    if not include_inactive:
        query = query.filter(Category.is_active.is_(True))
    return query.order_by(Category.sort_order.asc(), Category.name.asc()).all()


def get_category_by_id(db: Session, category_id: int) -> Category | None:
    return db.get(Category, category_id)


def get_category_by_slug(db: Session, slug: str) -> Category | None:
    return db.query(Category).filter(Category.slug == slug).first()


def create_category(db: Session, payload: CategoryCreate) -> Category:
    category = Category(**payload.model_dump(exclude={"slug"}))
    category.slug = payload.slug or slugify(payload.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category: Category, payload: CategoryUpdate) -> Category:
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and "slug" not in data:
        data["slug"] = slugify(data["name"])
    for field, value in data.items():
        setattr(category, field, value)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def soft_delete_category(db: Session, category: Category) -> None:
    category.is_active = False
    db.add(category)
    db.commit()
