from datetime import datetime, timezone
from secrets import token_hex

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem
from app.models.order_status_event import OrderStatusEvent
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.product_variant import ProductVariant
from app.schemas.order import CheckoutCreate, GuestCheckoutCreate


ALLOWED_STATUS_TRANSITIONS = {
    "new": {"confirmed", "cancelled"},
    "confirmed": {"packed", "cancelled"},
    "packed": {"shipped", "cancelled"},
    "shipped": {"delivered", "cancelled"},
    "delivered": set(),
    "cancelled": set(),
}


def get_allowed_next_statuses(current_status: str) -> set[str]:
    return ALLOWED_STATUS_TRANSITIONS.get(current_status, set())


def validate_order_status_transition(old_status: str, new_status: str) -> None:
    if old_status == new_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order status is already set to this value.",
        )

    allowed = get_allowed_next_statuses(old_status)
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid order status transition: {old_status} -> {new_status}.",
        )


def generate_order_number() -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"CIR-{stamp}-{token_hex(4).upper()}"


def create_order_from_cart(db: Session, user_id: int, payload: CheckoutCreate) -> Order:
    cart = (
        db.query(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.variants))
        .filter(Cart.user_id == user_id, Cart.status == "active")
        .first()
    )

    if not cart or not cart.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty.")

    total_cents = 0

    for item in cart.items:
        if not item.product or not item.product.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart contains unavailable product.")

        if any(variant.is_active for variant in item.product.variants):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Select a product variant for {item.product.name}.")

        if item.product.stock_quantity < item.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for {item.product.name}.")

        total_cents += item.quantity * item.product.price_cents

    order = Order(
        order_number=generate_order_number(),
        user_id=user_id,
        total_cents=total_cents,
        customer_name=payload.customer_name,
        customer_email=str(payload.customer_email) if payload.customer_email else None,
        customer_phone=payload.customer_phone,
        shipping_city=payload.shipping_city,
        shipping_postal_code=payload.shipping_postal_code,
        shipping_address=payload.shipping_address,
        note=payload.note,
        recipient_name=payload.recipient_name,
        recipient_phone=payload.recipient_phone,
        delivery_date=payload.delivery_date,
        delivery_time_window=payload.delivery_time_window,
        card_message=payload.card_message,
        occasion=payload.occasion,
        accepted_terms_at=datetime.now(timezone.utc),
        source="legacy_checkout",
    )

    db.add(order)
    db.flush()

    for item in cart.items:
        product: Product = item.product

        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                unit_price_cents=product.price_cents,
                quantity=item.quantity,
                total_price_cents=item.quantity * product.price_cents,
            )
        )

        product.stock_quantity -= item.quantity

    cart.status = "converted"

    db.commit()
    db.refresh(order)

    return get_order_by_id(db, order.id) or order


def get_order_by_id(db: Session, order_id: int) -> Order | None:
    return (
        db.query(Order)
        .options(selectinload(Order.items), selectinload(Order.status_events))
        .filter(Order.id == order_id)
        .first()
    )


def get_user_orders(db: Session, user_id: int) -> list[Order]:
    return (
        db.query(Order)
        .options(selectinload(Order.items), selectinload(Order.status_events))
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )


def get_orders(db: Session) -> list[Order]:
    return db.query(Order).options(selectinload(Order.items), selectinload(Order.status_events)).order_by(Order.created_at.desc()).all()


def update_order_status(db: Session, order: Order, status_value: str, actor_user_id: int | None = None, note: str | None = None) -> Order:
    old_status = order.status
    validate_order_status_transition(old_status, status_value)

    order.status = status_value
    now = datetime.now(timezone.utc)
    timestamp_field = {
        "confirmed": "confirmed_at",
        "packed": "packed_at",
        "shipped": "shipped_at",
        "delivered": "delivered_at",
        "cancelled": "cancelled_at",
    }.get(status_value)
    if timestamp_field and getattr(order, timestamp_field) is None:
        setattr(order, timestamp_field, now)
    db.add(OrderStatusEvent(order_id=order.id, old_status=old_status, new_status=status_value, actor_user_id=actor_user_id, note=note))
    db.add(order)
    db.commit()
    return get_order_by_id(db, order.id) or order


def _primary_image_url(product: Product) -> str | None:
    images = sorted(product.images or [], key=lambda image: (not image.is_primary, image.sort_order, image.id))
    if images:
        return images[0].image_url
    return product.image_url


def _variant_label(variant: ProductVariant | None) -> str | None:
    if not variant:
        return None
    parts = [part for part in [variant.size, variant.color] if part]
    return " / ".join(parts) if parts else None


def create_guest_order(db: Session, payload: GuestCheckoutCreate, customer_ip: str | None = None, user_agent: str | None = None) -> Order:
    if payload.idempotency_key:
        existing = db.query(Order).options(selectinload(Order.items), selectinload(Order.status_events)).filter(Order.idempotency_key == payload.idempotency_key).first()
        if existing:
            return existing

    total_cents = 0
    order_lines: list[tuple[Product, ProductVariant | None, int, int]] = []

    try:
        for item in payload.items:
            product_query = db.query(Product).options(selectinload(Product.images), selectinload(Product.variants)).filter(Product.id == item.product_id, Product.is_active.is_(True))
            if db.bind and db.bind.dialect.name != "sqlite":
                product_query = product_query.with_for_update()
            product = product_query.first()
            if not product:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product is unavailable.")

            variant = None
            unit_price = product.price_cents
            active_variants = [variant for variant in product.variants if variant.is_active]
            if active_variants and item.variant_id is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Select a product variant for {product.name}.")

            if item.variant_id is not None:
                variant_query = db.query(ProductVariant).filter(
                    ProductVariant.id == item.variant_id,
                    ProductVariant.product_id == product.id,
                    ProductVariant.is_active.is_(True),
                )
                if db.bind and db.bind.dialect.name != "sqlite":
                    variant_query = variant_query.with_for_update()
                variant = variant_query.first()
                if not variant:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product variant is unavailable.")
                if variant.stock_quantity < item.quantity:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for {product.name}.")
                unit_price = variant.price_cents if variant.price_cents is not None else product.price_cents
            elif product.stock_quantity < item.quantity:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for {product.name}.")

            total_cents += unit_price * item.quantity
            order_lines.append((product, variant, item.quantity, unit_price))

        order = Order(
            order_number=generate_order_number(),
            user_id=None,
            total_cents=total_cents,
            customer_name=payload.customer_name,
            customer_email=str(payload.customer_email) if payload.customer_email else None,
            customer_phone=payload.customer_phone,
            shipping_city=payload.shipping_city,
            shipping_postal_code=payload.shipping_postal_code,
            shipping_address=payload.shipping_address,
            note=payload.note,
        recipient_name=payload.recipient_name,
        recipient_phone=payload.recipient_phone,
        delivery_date=payload.delivery_date,
        delivery_time_window=payload.delivery_time_window,
        card_message=payload.card_message,
        occasion=payload.occasion,
            idempotency_key=payload.idempotency_key,
            accepted_terms_at=datetime.now(timezone.utc) if payload.accepted_terms else None,
            customer_ip=customer_ip,
            user_agent=user_agent[:500] if user_agent else None,
            source=payload.source or "web",
        )
        db.add(order)
        db.flush()

        for product, variant, quantity, unit_price in order_lines:
            sku = variant.sku if variant and variant.sku else product.sku
            suffix = []
            if variant and variant.size:
                suffix.append(variant.size)
            if variant and variant.color:
                suffix.append(variant.color)
            product_name = product.name + (f" ({', '.join(suffix)})" if suffix else "")
            db.add(OrderItem(
                order_id=order.id,
                product_id=product.id,
                variant_id=variant.id if variant else None,
                product_name=product_name,
                product_sku=sku,
                product_slug=product.slug,
                product_image_url=_primary_image_url(product),
                variant_label=_variant_label(variant),
                unit_price_cents=unit_price,
                quantity=quantity,
                total_price_cents=unit_price * quantity,
                currency=product.currency,
                discount_cents=0,
                tax_cents=0,
            ))
            if variant:
                variant.stock_quantity -= quantity
            else:
                product.stock_quantity -= quantity

        db.commit()
    except Exception:
        db.rollback()
        raise

    return get_order_by_id(db, order.id) or order


def update_order_internal_note(db: Session, order: Order, internal_note: str | None) -> Order:
    order.internal_note = internal_note
    db.add(order)
    db.commit()
    return get_order_by_id(db, order.id) or order
