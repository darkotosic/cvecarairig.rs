from app.crud.product import create_product
from app.models.product import Product
from app.schemas.product import ProductCreate


def test_guest_checkout_creates_order_and_decrements_stock(client, db):
    product = create_product(db, ProductCreate(name="Test buket", slug="test-buket", price_cents=150000, stock_quantity=3))
    response = client.post("/api/v1/orders/guest-checkout", json={
        "customer_name": "Petar Petrović",
        "customer_phone": "+38160111222",
        "shipping_city": "Beograd",
        "shipping_postal_code": "11000",
        "shipping_address": "Test ulica 1",
        "accepted_terms": True,
        "source": "web",
        "recipient_name": "Ana",
        "recipient_phone": "+38160111333",
        "delivery_time_window": "Popodne",
        "card_message": "Srećan rođendan",
        "occasion": "rođendan",
        "items": [{"product_id": product.id, "quantity": 2}],
    })
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["total_cents"] == 300000
    assert data["recipient_name"] == "Ana"
    assert data["card_message"] == "Srećan rođendan"
    db.expire_all()
    assert db.get(Product, product.id).stock_quantity == 1
