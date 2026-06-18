from app.crud.product import create_product
from app.schemas.product import ProductCreate


def _payload(product_id: int, accepted_terms=True):
    return {
        "customer_name": "Petar Petrović",
        "customer_phone": "+38160111222",
        "shipping_city": "Beograd",
        "shipping_postal_code": "11000",
        "shipping_address": "Test ulica 1",
        "accepted_terms": accepted_terms,
        "source": "web",
        "items": [{"product_id": product_id, "quantity": 1}],
    }


def test_checkout_without_accepted_terms_fails(client, db):
    product = create_product(db, ProductCreate(name="Majica", slug="majica", price_cents=1000, stock_quantity=2))
    response = client.post("/api/v1/orders/guest-checkout", json=_payload(product.id, accepted_terms=False))
    assert response.status_code == 422


def test_checkout_with_accepted_terms_stores_timestamp(client, db):
    product = create_product(db, ProductCreate(name="Duks", slug="duks", price_cents=1000, stock_quantity=2))
    response = client.post("/api/v1/orders/guest-checkout", json=_payload(product.id), headers={"user-agent": "pytest"})
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["accepted_terms_at"] is not None
    assert data["source"] == "web"
    assert data["user_agent"] == "pytest"
