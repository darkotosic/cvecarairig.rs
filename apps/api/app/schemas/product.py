from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from app.schemas.category import CategoryRead
from app.services.media import validate_image_url




class ProductImageCreate(BaseModel):
    image_url: str = Field(max_length=1000)

    @field_validator("image_url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        return validate_image_url(value)
    alt_text: str | None = Field(default=None, max_length=255)
    sort_order: int = 0
    is_primary: bool = False


class ProductImageUpdate(BaseModel):
    image_url: str | None = Field(default=None, max_length=1000)

    @field_validator("image_url")
    @classmethod
    def validate_url(cls, value: str | None) -> str | None:
        return validate_image_url(value) if value else value
    alt_text: str | None = Field(default=None, max_length=255)
    sort_order: int | None = None
    is_primary: bool | None = None


class ProductVariantCreate(BaseModel):
    sku: str | None = Field(default=None, max_length=120)
    size: str | None = Field(default=None, max_length=50)
    color: str | None = Field(default=None, max_length=80)
    price_cents: int | None = Field(default=None, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    is_active: bool = True


class ProductVariantUpdate(BaseModel):
    sku: str | None = Field(default=None, max_length=120)
    size: str | None = Field(default=None, max_length=50)
    color: str | None = Field(default=None, max_length=80)
    price_cents: int | None = Field(default=None, ge=0)
    stock_quantity: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ProductImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    image_url: str
    alt_text: str | None
    sort_order: int
    is_primary: bool
    created_at: datetime


class ProductVariantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    sku: str | None
    size: str | None
    color: str | None
    price_cents: int | None
    stock_quantity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    slug: str | None = Field(default=None, max_length=255)
    sku: str | None = Field(default=None, max_length=120)
    description: str | None = None
    category_id: int | None = None
    short_description: str | None = Field(default=None, max_length=500)
    price_cents: int = Field(ge=0)
    compare_at_price_cents: int | None = Field(default=None, ge=0)
    currency: str = Field(default="RSD", min_length=3, max_length=3)
    image_url: str | None = Field(default=None, max_length=1000)
    material: str | None = Field(default=None, max_length=255)
    care_instructions: str | None = None
    arrangement_type: str | None = Field(default=None, max_length=120)
    occasion: str | None = Field(default=None, max_length=120)
    color_palette: str | None = Field(default=None, max_length=120)
    flower_count: int | None = Field(default=None, ge=0)
    is_same_day_delivery: bool = True
    lead_time_hours: int = Field(default=2, ge=0)
    seo_title: str | None = Field(default=None, max_length=255)
    seo_description: str | None = Field(default=None, max_length=500)
    sort_order: int = 0
    stock_quantity: int = Field(default=0, ge=0)
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    slug: str | None = Field(default=None, max_length=255)
    sku: str | None = Field(default=None, max_length=120)
    description: str | None = None
    category_id: int | None = None
    short_description: str | None = Field(default=None, max_length=500)
    price_cents: int | None = Field(default=None, ge=0)
    compare_at_price_cents: int | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    image_url: str | None = Field(default=None, max_length=1000)
    material: str | None = Field(default=None, max_length=255)
    care_instructions: str | None = None
    arrangement_type: str | None = Field(default=None, max_length=120)
    occasion: str | None = Field(default=None, max_length=120)
    color_palette: str | None = Field(default=None, max_length=120)
    flower_count: int | None = Field(default=None, ge=0)
    is_same_day_delivery: bool | None = None
    lead_time_hours: int | None = Field(default=None, ge=0)
    seo_title: str | None = Field(default=None, max_length=255)
    seo_description: str | None = Field(default=None, max_length=500)
    sort_order: int | None = None
    stock_quantity: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    updated_at: datetime
    category: CategoryRead | None = None
    images: list[ProductImageRead] = []
    variants: list[ProductVariantRead] = []

    @computed_field
    @property
    def effective_stock_quantity(self) -> int:
        if self.variants:
            return sum(variant.stock_quantity for variant in self.variants if variant.is_active)
        return self.stock_quantity


class ProductListResponse(BaseModel):
    items: list[ProductRead]
    total: int
    page: int
    page_size: int
    pages: int
