from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(1000), nullable=False)
    alt_text = Column(String(255), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0, server_default="0")
    is_primary = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    product = relationship("Product", back_populates="images")
