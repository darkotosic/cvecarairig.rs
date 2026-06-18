import csv
import io
import json
from datetime import date, datetime, timedelta

from app.core.security import create_access_token
from app.crud.user import create_user
from app.models.audit_log import AuditLog
from app.models.order import Order, OrderItem
from app.schemas.user import UserCreate


def _headers(db, *, is_admin=True, email="export-admin@example.com"):
    user = create_user(db, UserCreate(email=email, full_name="Export User", password="Secret123!"), is_admin=is_admin)
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


def _order(db, number, status="new", created_at=None):
    order = Order(
        order_number=number,
        status=status,
        total_cents=2500,
        currency="RSD",
        customer_name="Petar Petrović",
        customer_email="petar@example.com",
        customer_phone="+38160111222",
        shipping_city="Beograd",
        shipping_postal_code="11000",
        shipping_address="Test ulica 1",
        accepted_terms_at=created_at or datetime.utcnow(),
        created_at=created_at or datetime.utcnow(),
        internal_note="Proveriti adresu",
        source="web",
    )
    db.add(order)
    db.flush()
    db.add(OrderItem(order_id=order.id, product_name="Majica", variant_label="L / Crna", product_sku="SKU-L", unit_price_cents=2500, quantity=1, total_price_cents=2500))
    db.commit()
    return order


def test_non_admin_cannot_export_orders(client, db):
    response = client.get("/api/v1/admin/orders/export.csv", headers=_headers(db, is_admin=False, email="export-user@example.com"))
    assert response.status_code == 403


def test_admin_can_export_orders_csv_with_order_number(client, db):
    _order(db, "SIM-EXPORT-1")

    response = client.get("/api/v1/admin/orders/export.csv", headers=_headers(db))

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith("text/csv; charset=utf-8")
    assert response.text.startswith("\ufeff")
    assert response.headers["content-disposition"] == f'attachment; filename="orders-export-{date.today().isoformat()}.csv"'
    rows = list(csv.DictReader(io.StringIO(response.text.lstrip("\ufeff"))))
    assert rows[0]["order_number"] == "SIM-EXPORT-1"
    assert rows[0]["items_summary"] == "Majica / L / Crna x 1"


def test_export_status_filter_works(client, db):
    _order(db, "SIM-NEW", status="new")
    _order(db, "SIM-DELIVERED", status="delivered")

    response = client.get("/api/v1/admin/orders/export.csv?status=delivered", headers=_headers(db))

    assert response.status_code == 200, response.text
    rows = list(csv.DictReader(io.StringIO(response.text.lstrip("\ufeff"))))
    assert [row["order_number"] for row in rows] == ["SIM-DELIVERED"]


def test_export_date_filters_and_audit_log(client, db):
    _order(db, "SIM-OLD", created_at=datetime.utcnow() - timedelta(days=10))
    _order(db, "SIM-NEW", created_at=datetime.utcnow())
    headers = _headers(db)

    response = client.get("/api/v1/admin/orders/export.csv?date_from=2099-01-01&date_to=2099-01-02", headers=headers)

    assert response.status_code == 200, response.text
    rows = list(csv.DictReader(io.StringIO(response.text.lstrip("\ufeff"))))
    assert rows == []
    log = db.query(AuditLog).filter(AuditLog.action == "export", AuditLog.entity_type == "order").one()
    metadata = json.loads(log.metadata_json)
    assert metadata == {"status": None, "date_from": "2099-01-01", "date_to": "2099-01-02", "rows_count": 0, "max_rows": 5000, "truncated": False}
    assert response.headers["x-export-rows"] == "0"
    assert response.headers["x-export-truncated"] == "false"


def test_export_invalid_status_returns_400(client, db):
    response = client.get("/api/v1/admin/orders/export.csv?status=invalid", headers=_headers(db))

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid order status filter."


def test_export_invalid_date_range_returns_400(client, db):
    response = client.get("/api/v1/admin/orders/export.csv?date_from=2026-05-09&date_to=2026-05-08", headers=_headers(db))

    assert response.status_code == 400
    assert response.json()["detail"] == "date_from must be before or equal to date_to."


def test_export_max_rows_limit_headers_and_audit_metadata(client, db):
    now = datetime.utcnow()
    _order(db, "SIM-LIMIT-1", created_at=now - timedelta(minutes=2))
    _order(db, "SIM-LIMIT-2", created_at=now - timedelta(minutes=1))
    _order(db, "SIM-LIMIT-3", created_at=now)
    headers = _headers(db, email="export-limit-admin@example.com")

    response = client.get("/api/v1/admin/orders/export.csv?max_rows=2", headers=headers)

    assert response.status_code == 200, response.text
    rows = list(csv.DictReader(io.StringIO(response.text.lstrip("\ufeff"))))
    assert [row["order_number"] for row in rows] == ["SIM-LIMIT-3", "SIM-LIMIT-2"]
    assert response.headers["x-export-rows"] == "2"
    assert response.headers["x-export-truncated"] == "true"
    log = db.query(AuditLog).filter(AuditLog.action == "export", AuditLog.entity_type == "order").one()
    metadata = json.loads(log.metadata_json)
    assert metadata["rows_count"] == 2
    assert metadata["max_rows"] == 2
    assert metadata["truncated"] is True


def test_export_max_rows_truncated_with_date_filter(client, db):
    _order(db, "SIM-DATED-1")
    _order(db, "SIM-DATED-2")
    headers = _headers(db, email="export-dated-admin@example.com")

    response = client.get("/api/v1/admin/orders/export.csv?max_rows=1&date_from=2000-01-01", headers=headers)

    assert response.status_code == 200, response.text
    assert response.headers["x-export-rows"] == "1"
    assert response.headers["x-export-truncated"] == "true"
    log = db.query(AuditLog).filter(AuditLog.action == "export", AuditLog.entity_type == "order").one()
    metadata = json.loads(log.metadata_json)
    assert metadata["max_rows"] == 1
    assert metadata["truncated"] is True


def test_export_not_truncated_when_all_matching_rows_returned(client, db):
    _order(db, "SIM-FULL-1")
    _order(db, "SIM-FULL-2")
    headers = _headers(db, email="export-full-admin@example.com")

    response = client.get("/api/v1/admin/orders/export.csv?max_rows=10", headers=headers)

    assert response.status_code == 200, response.text
    rows = list(csv.DictReader(io.StringIO(response.text.lstrip("\ufeff"))))
    assert len(rows) == 2
    assert response.headers["x-export-rows"] == "2"
    assert response.headers["x-export-truncated"] == "false"
    log = db.query(AuditLog).filter(AuditLog.action == "export", AuditLog.entity_type == "order").one()
    metadata = json.loads(log.metadata_json)
    assert metadata["rows_count"] == 2
    assert metadata["max_rows"] == 10
    assert metadata["truncated"] is False
