from app.crud.order import create_guest_order, update_order_status
from app.crud.product import create_product
from app.models.order_status_event import OrderStatusEvent
from app.schemas.order import GuestCheckoutCreate, GuestCheckoutItem
from app.schemas.product import ProductCreate


def _order(db):
    product = create_product(db, ProductCreate(name="Status majica", slug="status-majica", price_cents=10000, stock_quantity=5))
    return create_guest_order(db, GuestCheckoutCreate(customer_name="Kupac Test", customer_phone="060111222", shipping_city="Novi Sad", shipping_postal_code="21000", shipping_address="Adresa 1", accepted_terms=True, items=[GuestCheckoutItem(product_id=product.id, quantity=1)]))


def test_status_event_created_when_status_changes(db):
    order = _order(db)
    updated = update_order_status(db, order, "confirmed", actor_user_id=None)

    events = db.query(OrderStatusEvent).filter(OrderStatusEvent.order_id == order.id).all()
    assert len(events) == 1
    assert events[0].old_status == "new"
    assert events[0].new_status == "confirmed"
    assert updated.confirmed_at is not None


def test_cancelled_timestamp_is_populated(db):
    order = _order(db)
    updated = update_order_status(db, order, "cancelled", actor_user_id=None)

    assert updated.cancelled_at is not None
    assert db.query(OrderStatusEvent).filter(OrderStatusEvent.order_id == order.id, OrderStatusEvent.new_status == "cancelled").count() == 1
