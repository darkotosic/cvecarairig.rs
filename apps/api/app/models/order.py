from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(40), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(32), nullable=False, default="new", server_default="new")
    payment_method = Column(String(32), nullable=False, default="cash_on_delivery", server_default="cash_on_delivery")
    total_cents = Column(Integer, nullable=False, default=0, server_default="0")
    currency = Column(String(3), nullable=False, default="RSD", server_default="RSD")

    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(320), nullable=True)
    customer_phone = Column(String(80), nullable=False)
    shipping_city = Column(String(160), nullable=False)
    shipping_postal_code = Column(String(32), nullable=False)
    shipping_address = Column(String(500), nullable=False)
    note = Column(Text, nullable=True)
    recipient_name = Column(String(255), nullable=True)
    recipient_phone = Column(String(80), nullable=True)
    delivery_date = Column(Date, nullable=True)
    delivery_time_window = Column(String(120), nullable=True)
    card_message = Column(Text, nullable=True)
    occasion = Column(String(120), nullable=True)
    idempotency_key = Column(String(120), nullable=True, unique=True, index=True)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    packed_at = Column(DateTime(timezone=True), nullable=True)
    shipped_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    internal_note = Column(Text, nullable=True)
    accepted_terms_at = Column(DateTime(timezone=True), nullable=True)
    customer_ip = Column(String(64), nullable=True)
    user_agent = Column(String(500), nullable=True)
    source = Column(String(80), nullable=False, default="web", server_default="web")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    status_events = relationship("OrderStatusEvent", back_populates="order", cascade="all, delete-orphan", order_by="OrderStatusEvent.created_at")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=True)
    unit_price_cents = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price_cents = Column(Integer, nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True, index=True)
    product_slug = Column(String(255), nullable=True)
    product_image_url = Column(String(1000), nullable=True)
    variant_label = Column(String(255), nullable=True)
    currency = Column(String(3), nullable=False, default="RSD", server_default="RSD")
    discount_cents = Column(Integer, nullable=False, default=0, server_default="0")
    tax_cents = Column(Integer, nullable=False, default=0, server_default="0")

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    variant = relationship("ProductVariant")
