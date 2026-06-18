from app.crud.category import create_category
from app.crud.product import create_product, get_products
from app.schemas.category import CategoryCreate
from app.schemas.product import ProductCreate


def test_product_filters_search_category_price_sort(db):
    category = create_category(db, CategoryCreate(name="Majice", slug="majice"))
    create_product(db, ProductCreate(name="Bela majica", slug="bela-majica", price_cents=120000, category_id=category.id, stock_quantity=5))
    create_product(db, ProductCreate(name="Crni duks", slug="crni-duks", price_cents=300000, stock_quantity=2))

    result = get_products(db, search="bela", category_slug="majice", min_price=100000, max_price=150000, sort="price_asc")

    assert result.total == 1
    assert result.items[0].slug == "bela-majica"
