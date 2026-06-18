from typing import Any

from sqlalchemy.orm import Session

from app.models.store_setting import StoreSetting
from app.schemas.store import StoreSettingUpdate

PUBLIC_STORE_SETTING_KEYS = {
    "store_phone",
    "store_email",
    "instagram_url",
    "facebook_url",
    "delivery_note",
    "return_policy_short",
    "company_name",
    "company_address",
    "company_registration_number",
    "company_tax_id",
    "logo_url",
}


def get_public_store_settings(db: Session) -> dict[str, str | None]:
    settings = (
        db.query(StoreSetting)
        .filter(StoreSetting.is_public.is_(True), StoreSetting.key.in_(PUBLIC_STORE_SETTING_KEYS))
        .order_by(StoreSetting.key.asc())
        .all()
    )
    return {setting.key: setting.value for setting in settings}


def get_store_setting_by_key(db: Session, key: str) -> StoreSetting | None:
    return db.query(StoreSetting).filter(StoreSetting.key == key).first()


def upsert_store_setting(db: Session, key: str, payload: StoreSettingUpdate | dict[str, Any]) -> StoreSetting:
    setting = get_store_setting_by_key(db, key)
    if not setting:
        setting = StoreSetting(key=key)
        db.add(setting)

    data = payload.model_dump(exclude_unset=True) if hasattr(payload, "model_dump") else dict(payload)
    for field, value in data.items():
        setattr(setting, field, value)

    db.commit()
    db.refresh(setting)
    return setting
