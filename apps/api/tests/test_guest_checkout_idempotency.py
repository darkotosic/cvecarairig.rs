from app.crud.product import create_product
from app.models.product import Product
from app.schemas.product import ProductCreate


def _payload(product_id: int, key: str):
    return {
        "customer_name": "Petar Petrović",
        "customer_phone": "+38160111222",
        "shipping_city": "Beograd",
        "shipping_postal_code": "11000",
        "shipping_address": "Test ulica 1",
        "idempotency_key": key,
        "accepted_terms": True,
        "items": [{"product_id": product_id, "quantity": 2}],
    }


def test_guest_checkout_idempotency_key_does_not_decrement_stock_twice(client, db):
    product = create_product(db, ProductCreate(name="Idem majica", slug="idem-majica", price_cents=150000, stock_quantity=3))

    first = client.post("/api/v1/orders/guest-checkout", json=_payload(product.id, "checkout-test-key-1"))
    second = client.post("/api/v1/orders/guest-checkout", json=_payload(product.id, "checkout-test-key-1"))

    assert first.status_code == 201, first.text
    assert second.status_code == 201, second.text
    assert second.json()["id"] == first.json()["id"]
    db.expire_all()
    assert db.get(Product, product.id).stock_quantity == 1
