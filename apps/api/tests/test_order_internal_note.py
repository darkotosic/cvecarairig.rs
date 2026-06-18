from app.core.security import create_access_token
from app.crud.product import create_product
from app.crud.user import create_user
from app.models.audit_log import AuditLog
from app.schemas.product import ProductCreate
from app.schemas.user import UserCreate


def _user_headers(db, email, is_admin):
    user = create_user(db, UserCreate(email=email, full_name="User", password="Secret123!"), is_admin=is_admin)
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


def _create_order(client, db):
    product = create_product(db, ProductCreate(name="Majica", slug="majica", price_cents=1000, stock_quantity=2))
    response = client.post("/api/v1/orders/guest-checkout", json={
        "customer_name": "Petar Petrović",
        "customer_phone": "+38160111222",
        "shipping_city": "Beograd",
        "shipping_postal_code": "11000",
        "shipping_address": "Test ulica 1",
        "accepted_terms": True,
        "items": [{"product_id": product.id, "quantity": 1}],
    })
    assert response.status_code == 201, response.text
    return response.json()["id"]


def test_admin_can_update_internal_note_and_audit_log(client, db):
    order_id = _create_order(client, db)
    response = client.patch(
        f"/api/v1/admin/orders/{order_id}/internal-note",
        json={"internal_note": "Pozvati pre slanja"},
        headers=_user_headers(db, "admin-note@example.com", True),
    )
    assert response.status_code == 200, response.text
    assert response.json()["internal_note"] == "Pozvati pre slanja"
    log = db.query(AuditLog).filter(AuditLog.action == "update_internal_note", AuditLog.entity_type == "order").first()
    assert log is not None
    assert log.entity_id == str(order_id)


def test_non_admin_cannot_update_internal_note(client, db):
    order_id = _create_order(client, db)
    response = client.patch(
        f"/api/v1/admin/orders/{order_id}/internal-note",
        json={"internal_note": "Nope"},
        headers=_user_headers(db, "customer-note@example.com", False),
    )
    assert response.status_code == 403
