from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=99)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=99)


class CartProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    price_cents: int
    currency: str
    image_url: str | None = None


class CartItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    line_total_cents: int
    product: CartProductRead


class CartRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    total_cents: int
    created_at: datetime
    updated_at: datetime
    items: list[CartItemRead]
