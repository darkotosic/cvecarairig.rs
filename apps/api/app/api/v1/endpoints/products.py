from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.product import get_product_by_slug, get_products
from app.schemas.product import ProductListResponse, ProductRead

router = APIRouter()


@router.get("/", response_model=ProductListResponse)
def read_products(
    q: str | None = Query(default=None),
    category: str | None = Query(default=None),
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    sort: str = Query(default="newest"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=60),
    db: Session = Depends(get_db),
):
    return get_products(db, search=q, category_slug=category, min_price=min_price, max_price=max_price, sort=sort, page=page, page_size=page_size)


@router.get("/{slug}", response_model=ProductRead)
def read_product(slug: str, db: Session = Depends(get_db)):
    product = get_product_by_slug(db, slug)

    if not product or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    return product

# Backward-compatible admin-protected product mutations. Prefer /api/v1/admin/products for new clients.
from sqlalchemy.exc import IntegrityError  # noqa: E402
from app.api.deps import get_current_admin  # noqa: E402
from app.crud.product import create_product, delete_product, get_product_by_id, update_product  # noqa: E402
from app.models.user import User  # noqa: E402
from app.schemas.product import ProductCreate, ProductUpdate  # noqa: E402


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def add_product(payload: ProductCreate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    try:
        return create_product(db, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product slug or SKU already exists.") from exc


@router.patch("/{product_id}", response_model=ProductRead)
def edit_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return update_product(db, product, payload)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_product(product_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    delete_product(db, product)
    return None
