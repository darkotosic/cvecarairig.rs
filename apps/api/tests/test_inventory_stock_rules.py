from app.crud.order import create_guest_order
from app.crud.product import create_product
from app.models.product import Product
from app.models.product_variant import ProductVariant
from app.schemas.order import GuestCheckoutCreate
from app.schemas.product import ProductCreate, ProductRead


def _payload(product_id, quantity=2, variant_id=None):
    item = {"product_id": product_id, "quantity": quantity}
    if variant_id is not None:
        item["variant_id"] = variant_id
    return GuestCheckoutCreate(
        customer_name="Petar Petrović",
        customer_phone="+38160111222",
        shipping_city="Beograd",
        shipping_postal_code="11000",
        shipping_address="Test ulica 1",
        accepted_terms=True,
        source="web",
        items=[item],
    )


def test_variant_checkout_decrements_only_variant_stock(db):
    product = create_product(db, ProductCreate(name="Variant product", slug="variant-product", price_cents=1000, stock_quantity=10))
    variant = ProductVariant(product_id=product.id, sku="VP-L", size="L", stock_quantity=5, is_active=True)
    db.add(variant)
    db.commit()

    create_guest_order(db, _payload(product.id, variant_id=variant.id))

    db.expire_all()
    assert db.get(Product, product.id).stock_quantity == 10
    assert db.get(ProductVariant, variant.id).stock_quantity == 3


def test_non_variant_checkout_decrements_product_stock(db):
    product = create_product(db, ProductCreate(name="Simple product", slug="simple-product", price_cents=1000, stock_quantity=5))

    create_guest_order(db, _payload(product.id))

    db.expire_all()
    assert db.get(Product, product.id).stock_quantity == 3


def test_inactive_variant_is_rejected(client, db):
    product = create_product(db, ProductCreate(name="Inactive variant product", slug="inactive-variant-product", price_cents=1000, stock_quantity=10))
    variant = ProductVariant(product_id=product.id, sku="IV-L", size="L", stock_quantity=5, is_active=False)
    db.add(variant)
    db.commit()

    response = client.post("/api/v1/orders/guest-checkout", json=_payload(product.id, variant_id=variant.id).model_dump())

    assert response.status_code == 400
    assert "variant is unavailable" in response.json()["detail"]


def test_variant_without_stock_is_rejected(client, db):
    product = create_product(db, ProductCreate(name="Empty variant product", slug="empty-variant-product", price_cents=1000, stock_quantity=10))
    variant = ProductVariant(product_id=product.id, sku="EV-L", size="L", stock_quantity=0, is_active=True)
    db.add(variant)
    db.commit()

    response = client.post("/api/v1/orders/guest-checkout", json=_payload(product.id, variant_id=variant.id).model_dump())

    assert response.status_code == 400
    assert "Insufficient stock" in response.json()["detail"]


def test_product_effective_stock_quantity_uses_active_variants(db):
    product = create_product(db, ProductCreate(name="Effective stock", slug="effective-stock", price_cents=1000, stock_quantity=50))
    db.add_all([
        ProductVariant(product_id=product.id, sku="ES-A", size="A", stock_quantity=2, is_active=True),
        ProductVariant(product_id=product.id, sku="ES-B", size="B", stock_quantity=3, is_active=True),
        ProductVariant(product_id=product.id, sku="ES-X", size="X", stock_quantity=99, is_active=False),
    ])
    db.commit()
    db.refresh(product)

    assert ProductRead.model_validate(product).effective_stock_quantity == 5


def test_guest_checkout_requires_variant_id_for_variant_product(client, db):
    product = create_product(db, ProductCreate(name="Requires variant product", slug="requires-variant-product", price_cents=1000, stock_quantity=10))
    db.add(ProductVariant(product_id=product.id, sku="RV-L", size="L", stock_quantity=5, is_active=True))
    db.commit()

    response = client.post("/api/v1/orders/guest-checkout", json=_payload(product.id).model_dump())

    assert response.status_code == 400
    assert "Select a product variant" in response.json()["detail"]
