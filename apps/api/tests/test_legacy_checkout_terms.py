from app.core.security import create_access_token
from app.crud.product import create_product
from app.crud.user import create_user
from app.models.cart import Cart, CartItem
from app.models.product_variant import ProductVariant
from app.schemas.product import ProductCreate
from app.schemas.user import UserCreate


def _auth_headers(db):
    user = create_user(
        db,
        UserCreate(email="legacy-buyer@example.com", full_name="Legacy Buyer", password="Secret123!"),
    )
    return user, {"Authorization": f"Bearer {create_access_token(user.id)}"}


def _cart_with_product(db, user_id: int):
    product = create_product(
        db,
        ProductCreate(
            name="Legacy proizvod",
            slug="legacy-proizvod",
            price_cents=120000,
            stock_quantity=3,
        ),
    )
    cart = Cart(user_id=user_id, status="active")
    db.add(cart)
    db.flush()
    db.add(CartItem(cart_id=cart.id, product_id=product.id, quantity=1))
    db.commit()
    return product


def _payload(**overrides):
    payload = {
        "customer_name": "Petar Petrović",
        "customer_phone": "+38160111222",
        "shipping_city": "Beograd",
        "shipping_postal_code": "11000",
        "shipping_address": "Test ulica 1",
    }
    payload.update(overrides)
    return payload


def test_legacy_checkout_without_accepted_terms_fails(client, db):
    user, headers = _auth_headers(db)
    _cart_with_product(db, user.id)

    response = client.post("/api/v1/orders/checkout", json=_payload(), headers=headers)

    assert response.status_code == 422
    assert "accepted_terms" in response.text


def test_legacy_checkout_with_accepted_terms_creates_order(client, db):
    user, headers = _auth_headers(db)
    _cart_with_product(db, user.id)

    response = client.post(
        "/api/v1/orders/checkout",
        json=_payload(accepted_terms=True),
        headers=headers,
    )

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["accepted_terms_at"] is not None
    assert data["source"] == "legacy_checkout"


def test_legacy_checkout_requires_authorization(client):
    response = client.post("/api/v1/orders/checkout", json=_payload(accepted_terms=True))

    assert response.status_code in (401, 403)


def test_legacy_checkout_rejects_variant_products_without_variant_support(client, db):
    user, headers = _auth_headers(db)
    product = _cart_with_product(db, user.id)
    db.add(ProductVariant(product_id=product.id, sku="LEG-L", size="L", stock_quantity=2, is_active=True))
    db.commit()

    response = client.post("/api/v1/orders/checkout", json=_payload(accepted_terms=True), headers=headers)

    assert response.status_code == 400
    assert "Select a product variant" in response.json()["detail"]
