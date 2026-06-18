from datetime import date, datetime
import re

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from pydantic_core import PydanticCustomError


class CheckoutCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=255)
    customer_email: EmailStr | None = None
    customer_phone: str = Field(min_length=6, max_length=80)
    shipping_city: str = Field(min_length=2, max_length=160)
    shipping_postal_code: str = Field(min_length=5, max_length=5)
    shipping_address: str = Field(min_length=5, max_length=500)
    accepted_terms: Literal[True]
    note: str | None = None
    recipient_name: str | None = Field(default=None, max_length=255)
    recipient_phone: str | None = Field(default=None, max_length=80)
    delivery_date: date | None = None
    delivery_time_window: str | None = Field(default=None, max_length=120)
    card_message: str | None = Field(default=None, max_length=500)
    occasion: str | None = Field(default=None, max_length=120)

    @field_validator("customer_phone", "recipient_phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value is None or value == "":
            return None
        normalized = value.strip()
        if not re.fullmatch(r"[0-9+/\-\s]{6,80}", normalized):
            raise PydanticCustomError("phone_invalid_characters", "Phone number contains invalid characters.")
        digits = re.sub(r"\D", "", normalized)
        if len(digits) < 6:
            raise PydanticCustomError("phone_too_short", "Phone number is too short.")
        return normalized


    @field_validator("delivery_date")
    @classmethod
    def validate_delivery_date(cls, value: date | None) -> date | None:
        if value is not None and value < date.today():
            raise PydanticCustomError("delivery_date_past", "Delivery date cannot be in the past.")
        return value

    @field_validator("shipping_postal_code")
    @classmethod
    def validate_postal_code(cls, value: str) -> str:
        normalized = value.strip()
        if not re.fullmatch(r"\d{5}", normalized):
            raise PydanticCustomError("postal_code_invalid", "Postal code must contain exactly 5 digits.")
        return normalized


class GuestCheckoutItem(BaseModel):
    product_id: int
    variant_id: int | None = None
    quantity: int = Field(ge=1, le=99)


class GuestCheckoutCreate(CheckoutCreate):
    source: str | None = Field(default="web", max_length=80)
    idempotency_key: str | None = Field(default=None, max_length=120, pattern=r"^[A-Za-z0-9._:-]{8,120}$")
    items: list[GuestCheckoutItem] = Field(min_length=1, max_length=50)


class OrderStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|confirmed|packed|shipped|delivered|cancelled)$")


class OrderInternalNoteUpdate(BaseModel):
    internal_note: str | None = None


class OrderStatusEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    old_status: str | None
    new_status: str
    actor_user_id: int | None
    note: str | None
    created_at: datetime


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    product_name: str
    product_sku: str | None
    unit_price_cents: int
    quantity: int
    total_price_cents: int
    variant_id: int | None = None
    product_slug: str | None = None
    product_image_url: str | None = None
    variant_label: str | None = None
    currency: str = "RSD"
    discount_cents: int = 0
    tax_cents: int = 0


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    status: str
    payment_method: str
    total_cents: int
    currency: str
    customer_name: str
    customer_email: EmailStr | None
    customer_phone: str
    shipping_city: str
    shipping_postal_code: str
    shipping_address: str
    note: str | None
    recipient_name: str | None = None
    recipient_phone: str | None = None
    delivery_date: date | None = None
    delivery_time_window: str | None = None
    card_message: str | None = None
    occasion: str | None = None
    idempotency_key: str | None = None
    confirmed_at: datetime | None = None
    packed_at: datetime | None = None
    shipped_at: datetime | None = None
    delivered_at: datetime | None = None
    cancelled_at: datetime | None = None
    internal_note: str | None = None
    accepted_terms_at: datetime | None = None
    customer_ip: str | None = None
    user_agent: str | None = None
    source: str | None = "web"
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemRead]
    status_events: list[OrderStatusEventRead] = []


class AdminOrderListResponse(BaseModel):
    items: list[OrderRead]
    total: int
    page: int
    page_size: int
    pages: int


class LowStockProductRead(BaseModel):
    id: int
    name: str
    slug: str
    sku: str | None = None
    stock_quantity: int
    variant_stock_quantity: int
    effective_stock_quantity: int


class DailyRevenueRead(BaseModel):
    date: str
    revenue_cents: int


class DailyOrdersRead(BaseModel):
    date: str
    orders_count: int


class TopProductRead(BaseModel):
    product_name: str
    quantity_sold: int
    revenue_cents: int


class AdminSummaryRead(BaseModel):
    new_orders: int
    confirmed_orders: int
    packed_orders: int
    shipped_orders: int
    delivered_orders: int
    cancelled_orders: int
    active_products: int
    out_of_stock_products: int
    total_revenue_cents: int
    orders_count_period: int
    average_order_value_cents: int
    latest_orders: list[OrderRead]
    low_stock_products: list[LowStockProductRead]
    revenue_by_day: list[DailyRevenueRead]
    orders_by_day: list[DailyOrdersRead]
    top_products: list[TopProductRead]
