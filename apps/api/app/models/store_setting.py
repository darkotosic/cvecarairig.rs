from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func

from app.db.base import Base


class StoreSetting(Base):
    __tablename__ = "store_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(120), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=True)
    value_type = Column(String(40), nullable=False, default="string", server_default="string")
    is_public = Column(Boolean, nullable=False, default=False, server_default="false", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
