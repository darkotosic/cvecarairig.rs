from math import ceil
from typing import TypeVar, Generic

from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=12, ge=1, le=60)


def page_count(total: int, page_size: int) -> int:
    return max(1, ceil(total / page_size)) if total else 0


class PaginatedResponse(GenericModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int
