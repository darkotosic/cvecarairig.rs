import pytest
from fastapi import HTTPException

from app.crud.order import create_guest_order, update_order_status
from app.crud.product import create_product
from app.models.order_status_event import OrderStatusEvent
from app.schemas.order import GuestCheckoutCreate, GuestCheckoutItem
from app.schemas.product import ProductCreate


def _order(db, slug="status-majica"):
    product = create_product(db, ProductCreate(name=f"Status {slug}", slug=slug, price_cents=10000, stock_quantity=5))
    return create_guest_order(
        db,
        GuestCheckoutCreate(
            customer_name="Kupac Test",
            customer_phone="060111222",
            shipping_city="Novi Sad",
            shipping_postal_code="21000",
            shipping_address="Adresa 1",
            accepted_terms=True,
            items=[GuestCheckoutItem(product_id=product.id, quantity=1)],
        ),
    )


def _event_count(db, order_id: int) -> int:
    return db.query(OrderStatusEvent).filter(OrderStatusEvent.order_id == order_id).count()


@pytest.mark.parametrize(
    "path",
    [
        ["confirmed"],
        ["confirmed", "packed"],
        ["confirmed", "packed", "shipped"],
        ["confirmed", "packed", "shipped", "delivered"],
        ["cancelled"],
        ["confirmed", "cancelled"],
        ["confirmed", "packed", "cancelled"],
        ["confirmed", "packed", "shipped", "cancelled"],
    ],
)
def test_allowed_order_status_transitions_create_events(db, path):
    order = _order(db, slug="-".join(path))

    for status in path:
        order = update_order_status(db, order, status)

    assert order.status == path[-1]
    assert _event_count(db, order.id) == len(path)


@pytest.mark.parametrize(
    ("path", "rejected_status"),
    [
        (["confirmed", "packed", "shipped", "delivered"], "cancelled"),
        (["cancelled"], "shipped"),
        (["confirmed", "packed", "shipped", "delivered"], "packed"),
    ],
)
def test_invalid_order_status_transitions_are_rejected_without_events(db, path, rejected_status):
    order = _order(db, slug=f"invalid-{rejected_status}-{'-'.join(path)}")
    for status in path:
        order = update_order_status(db, order, status)
    before_count = _event_count(db, order.id)
    old_status = order.status

    with pytest.raises(HTTPException) as exc_info:
        update_order_status(db, order, rejected_status)

    assert exc_info.value.status_code == 400
    assert f"Invalid order status transition: {old_status} -> {rejected_status}." == exc_info.value.detail
    db.refresh(order)
    assert order.status == old_status
    assert _event_count(db, order.id) == before_count


@pytest.mark.parametrize("current_status", ["new", "confirmed", "packed", "shipped", "delivered", "cancelled"])
def test_order_status_cannot_be_set_to_same_status(db, current_status):
    order = _order(db, slug=f"same-{current_status}")
    path_to_status = {
        "new": [],
        "confirmed": ["confirmed"],
        "packed": ["confirmed", "packed"],
        "shipped": ["confirmed", "packed", "shipped"],
        "delivered": ["confirmed", "packed", "shipped", "delivered"],
        "cancelled": ["cancelled"],
    }[current_status]
    for status in path_to_status:
        order = update_order_status(db, order, status)
    before_count = _event_count(db, order.id)

    with pytest.raises(HTTPException) as exc_info:
        update_order_status(db, order, current_status)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Order status is already set to this value."
    assert _event_count(db, order.id) == before_count

from app.core.security import create_access_token
from app.crud.user import create_user
from app.models.audit_log import AuditLog
from app.schemas.user import UserCreate


def _admin_headers(db):
    admin = create_user(db, UserCreate(email="status-admin@example.com", full_name="Status Admin", password="Secret123!"), is_admin=True)
    return {"Authorization": f"Bearer {create_access_token(admin.id)}"}


def test_admin_status_update_audit_log_includes_old_and_new_status(client, db):
    order = _order(db, slug="admin-audit-status")

    response = client.patch(
        f"/api/v1/admin/orders/{order.id}/status",
        json={"status": "confirmed"},
        headers=_admin_headers(db),
    )

    assert response.status_code == 200, response.text
    log = db.query(AuditLog).filter(AuditLog.action == "update_status", AuditLog.entity_type == "order").first()
    assert log is not None
    assert '"old_status": "new"' in log.metadata_json
    assert '"new_status": "confirmed"' in log.metadata_json


def test_admin_invalid_status_update_does_not_create_audit_log(client, db):
    order = _order(db, slug="admin-invalid-status")

    response = client.patch(
        f"/api/v1/admin/orders/{order.id}/status",
        json={"status": "delivered"},
        headers=_admin_headers(db),
    )

    assert response.status_code == 400
    assert db.query(AuditLog).filter(AuditLog.action == "update_status", AuditLog.entity_type == "order").count() == 0
    assert _event_count(db, order.id) == 0
