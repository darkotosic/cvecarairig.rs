import re
from math import ceil

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductListResponse, ProductUpdate

_SERBIAN_LATIN = str.maketrans({"č": "c", "ć": "c", "š": "s", "đ": "dj", "ž": "z"})


def slugify(value: str) -> str:
    normalized = value.strip().lower().translate(_SERBIAN_LATIN)
    slug = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    return slug or "product"


def _product_query(db: Session):
    return db.query(Product).options(
        selectinload(Product.category),
        selectinload(Product.images),
        selectinload(Product.variants),
    )


def get_products(
    db: Session,
    *,
    search: str | None = None,
    category_slug: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    sort: str = "newest",
    page: int = 1,
    page_size: int = 12,
    include_inactive: bool = False,
) -> ProductListResponse:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 60)
    query = _product_query(db)

    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(Product.name.ilike(term), Product.description.ilike(term), Product.sku.ilike(term)))
    if category_slug:
        query = query.join(Product.category).filter(Category.slug == category_slug, Category.is_active.is_(True))
    if min_price is not None:
        query = query.filter(Product.price_cents >= min_price)
    if max_price is not None:
        query = query.filter(Product.price_cents <= max_price)

    total = query.with_entities(func.count(Product.id)).scalar() or 0

    sort_map = {
        "newest": Product.created_at.desc(),
        "price_asc": Product.price_cents.asc(),
        "price_desc": Product.price_cents.desc(),
        "name_asc": Product.name.asc(),
        "sort_order": (Product.sort_order.asc(), Product.created_at.desc()),
    }
    order_by = sort_map.get(sort, Product.created_at.desc())
    if isinstance(order_by, tuple):
        query = query.order_by(*order_by)
    else:
        query = query.order_by(order_by)

    items = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = ceil(total / page_size) if total else 0
    return ProductListResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


def get_product_by_id(db: Session, product_id: int) -> Product | None:
    return _product_query(db).filter(Product.id == product_id).first()


def get_product_by_slug(db: Session, slug: str) -> Product | None:
    return _product_query(db).filter(Product.slug == slug).first()


def create_product(db: Session, payload: ProductCreate) -> Product:
    product = Product(**payload.model_dump(exclude={"slug"}))
    product.slug = payload.slug or slugify(payload.name)
    db.add(product)
    db.commit()
    db.refresh(product)
    return get_product_by_id(db, product.id) or product


def update_product(db: Session, product: Product, payload: ProductUpdate) -> Product:
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and "slug" not in data:
        data["slug"] = slugify(data["name"])
    for field, value in data.items():
        setattr(product, field, value)
    db.add(product)
    db.commit()
    db.refresh(product)
    return get_product_by_id(db, product.id) or product


def delete_product(db: Session, product: Product) -> None:
    product.is_active = False
    db.add(product)
    db.commit()
