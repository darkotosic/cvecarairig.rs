from app.crud.product import create_product
from app.schemas.product import ProductCreate


def _payload(product_id: int, **overrides):
    payload = {
        "customer_name": "Petar Petrović",
        "customer_phone": "+381 60 111-222",
        "shipping_city": "Beograd",
        "shipping_postal_code": "11000",
        "shipping_address": "Test ulica 1",
        "accepted_terms": True,
        "source": "web",
        "items": [{"product_id": product_id, "quantity": 1}],
    }
    payload.update(overrides)
    return payload


def _product(db):
    return create_product(
        db,
        ProductCreate(
            name="Validacioni proizvod",
            slug="validacioni-proizvod",
            price_cents=250000,
            stock_quantity=5,
        ),
    )


def test_guest_checkout_rejects_invalid_phone(client, db):
    product = _product(db)

    response = client.post(
        "/api/v1/orders/guest-checkout",
        json=_payload(product.id, customer_phone="060-ABC"),
    )

    assert response.status_code == 422
    assert "customer_phone" in response.text


def test_guest_checkout_accepts_serbian_phone_prefix(client, db):
    product = _product(db)

    response = client.post(
        "/api/v1/orders/guest-checkout",
        json=_payload(product.id, customer_phone=" +381 60/111-222 "),
    )

    assert response.status_code == 201, response.text
    assert response.json()["customer_phone"] == "+381 60/111-222"


def test_guest_checkout_accepts_five_digit_postal_code(client, db):
    product = _product(db)

    response = client.post(
        "/api/v1/orders/guest-checkout",
        json=_payload(product.id, shipping_postal_code="21000"),
    )

    assert response.status_code == 201, response.text
    assert response.json()["shipping_postal_code"] == "21000"


def test_guest_checkout_rejects_postal_code_with_letters(client, db):
    product = _product(db)

    response = client.post(
        "/api/v1/orders/guest-checkout",
        json=_payload(product.id, shipping_postal_code="11A00"),
    )

    assert response.status_code == 422
    assert "shipping_postal_code" in response.text


def test_guest_checkout_still_creates_order_with_valid_data(client, db):
    product = _product(db)

    response = client.post("/api/v1/orders/guest-checkout", json=_payload(product.id))

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["total_cents"] == 250000
    assert data["accepted_terms_at"] is not None
