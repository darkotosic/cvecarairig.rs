from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    slug: str | None = Field(default=None, max_length=255)
    description: str | None = None
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    slug: str | None = Field(default=None, max_length=255)
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    updated_at: datetime
