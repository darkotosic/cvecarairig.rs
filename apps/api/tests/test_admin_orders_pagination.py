from datetime import datetime, timedelta

from app.core.security import create_access_token
from app.crud.user import create_user
from app.models.order import Order, OrderItem
from app.schemas.user import UserCreate


def _headers(db, *, is_admin=True, email="orders-admin@example.com"):
    user = create_user(db, UserCreate(email=email, full_name="Orders User", password="Secret123!"), is_admin=is_admin)
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


def _order(db, number, *, status="new", created_at=None, customer_name="Petar Petrović", customer_email="petar@example.com", customer_phone="+38160111222", shipping_city="Beograd"):
    order = Order(
        order_number=number,
        status=status,
        total_cents=2500,
        currency="RSD",
        customer_name=customer_name,
        customer_email=customer_email,
        customer_phone=customer_phone,
        shipping_city=shipping_city,
        shipping_postal_code="11000",
        shipping_address="Test ulica 1",
        accepted_terms_at=created_at or datetime.utcnow(),
        created_at=created_at or datetime.utcnow(),
        source="web",
    )
    db.add(order)
    db.flush()
    db.add(OrderItem(order_id=order.id, product_name="Majica", product_sku="SKU", unit_price_cents=2500, quantity=1, total_price_cents=2500))
    db.commit()
    return order


def test_admin_gets_paginated_orders_response(client, db):
    _order(db, "SIM-PAGE-1")
    response = client.get("/api/v1/admin/orders", headers=_headers(db))

    assert response.status_code == 200, response.text
    data = response.json()
    assert set(["items", "total", "page", "page_size", "pages"]).issubset(data)
    assert data["total"] == 1
    assert data["page"] == 1
    assert data["page_size"] == 25
    assert data["pages"] == 1
    assert data["items"][0]["order_number"] == "SIM-PAGE-1"
    assert data["items"][0]["items"][0]["product_name"] == "Majica"
    assert "status_events" in data["items"][0]


def test_non_admin_cannot_read_orders(client, db):
    response = client.get("/api/v1/admin/orders", headers=_headers(db, is_admin=False, email="orders-user@example.com"))
    assert response.status_code == 403


def test_page_and_page_size_work(client, db):
    now = datetime.utcnow()
    _order(db, "SIM-1", created_at=now - timedelta(minutes=2))
    _order(db, "SIM-2", created_at=now - timedelta(minutes=1))
    _order(db, "SIM-3", created_at=now)

    response = client.get("/api/v1/admin/orders?page=2&page_size=1", headers=_headers(db))

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["total"] == 3
    assert data["page"] == 2
    assert data["page_size"] == 1
    assert data["pages"] == 3
    assert [item["order_number"] for item in data["items"]] == ["SIM-2"]


def test_status_filter_works(client, db):
    _order(db, "SIM-NEW", status="new")
    _order(db, "SIM-SHIPPED", status="shipped")

    response = client.get("/api/v1/admin/orders?status=shipped", headers=_headers(db))

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["total"] == 1
    assert [item["order_number"] for item in data["items"]] == ["SIM-SHIPPED"]


def test_invalid_status_returns_400(client, db):
    response = client.get("/api/v1/admin/orders?status=invalid", headers=_headers(db))

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid order status filter."


def test_date_range_filter_works(client, db):
    _order(db, "SIM-OLD", created_at=datetime.utcnow() - timedelta(days=10))
    _order(db, "SIM-NEW", created_at=datetime.utcnow())

    response = client.get("/api/v1/admin/orders?date_from=2099-01-01&date_to=2099-01-02", headers=_headers(db))

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_invalid_date_range_returns_400(client, db):
    response = client.get("/api/v1/admin/orders?date_from=2026-05-09&date_to=2026-05-08", headers=_headers(db))

    assert response.status_code == 400
    assert response.json()["detail"] == "date_from must be before or equal to date_to."


def test_q_search_works_by_order_number(client, db):
    _order(db, "SIM-ABC-123", customer_name="Milan")
    _order(db, "SIM-XYZ-999", customer_name="Jovan")

    response = client.get("/api/v1/admin/orders?q=ABC-123", headers=_headers(db))

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["total"] == 1
    assert [item["order_number"] for item in data["items"]] == ["SIM-ABC-123"]


def test_q_search_works_by_customer_email_phone_and_shipping_city(client, db):
    _order(
        db,
        "SIM-SEARCH-EMAIL",
        customer_email="ana.special@example.com",
        customer_phone="+38160111111",
        shipping_city="Beograd",
    )
    _order(
        db,
        "SIM-SEARCH-PHONE",
        customer_email="marko@example.com",
        customer_phone="+38164999888",
        shipping_city="Novi Sad",
    )
    _order(
        db,
        "SIM-SEARCH-CITY",
        customer_email="jelena@example.com",
        customer_phone="+38160222222",
        shipping_city="Subotica",
    )

    headers = _headers(db, email="orders-search-admin@example.com")

    email_response = client.get("/api/v1/admin/orders?q=ana.special", headers=headers)
    phone_response = client.get("/api/v1/admin/orders?q=999888", headers=headers)
    city_response = client.get("/api/v1/admin/orders?q=Subotica", headers=headers)

    assert email_response.status_code == 200, email_response.text
    assert [item["order_number"] for item in email_response.json()["items"]] == ["SIM-SEARCH-EMAIL"]
    assert phone_response.status_code == 200, phone_response.text
    assert [item["order_number"] for item in phone_response.json()["items"]] == ["SIM-SEARCH-PHONE"]
    assert city_response.status_code == 200, city_response.text
    assert [item["order_number"] for item in city_response.json()["items"]] == ["SIM-SEARCH-CITY"]
