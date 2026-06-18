from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class StoreSettingUpdate(BaseModel):
    value: str | None = None
    value_type: str | None = Field(default=None, max_length=40)
    is_public: bool | None = None


class StoreSettingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    key: str
    value: str | None
    value_type: str
    is_public: bool
    created_at: datetime
    updated_at: datetime


class PublicStoreSettingsRead(BaseModel):
    store_phone: str | None = None
    store_email: str | None = None
    instagram_url: str | None = None
    facebook_url: str | None = None
    delivery_note: str | None = None
    return_policy_short: str | None = None
    company_name: str | None = None
    company_address: str | None = None
    company_registration_number: str | None = None
    company_tax_id: str | None = None
    logo_url: str | None = None
