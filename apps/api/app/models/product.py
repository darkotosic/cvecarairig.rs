from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=True)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    short_description = Column(String(500), nullable=True)
    price_cents = Column(Integer, nullable=False)
    compare_at_price_cents = Column(Integer, nullable=True)
    currency = Column(String(3), nullable=False, default="RSD", server_default="RSD")
    image_url = Column(String(1000), nullable=True)
    material = Column(String(255), nullable=True)
    care_instructions = Column(Text, nullable=True)
    arrangement_type = Column(String(120), nullable=True)
    occasion = Column(String(120), nullable=True)
    color_palette = Column(String(120), nullable=True)
    flower_count = Column(Integer, nullable=True)
    is_same_day_delivery = Column(Boolean, nullable=False, default=True, server_default="true")
    lead_time_hours = Column(Integer, nullable=False, default=2, server_default="2")
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(String(500), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0, server_default="0")
    stock_quantity = Column(Integer, nullable=False, default=0, server_default="0")
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
