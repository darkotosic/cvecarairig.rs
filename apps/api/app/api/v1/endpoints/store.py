from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.store_setting import get_public_store_settings
from app.schemas.store import PublicStoreSettingsRead

router = APIRouter()


@router.get("/settings", response_model=PublicStoreSettingsRead)
def public_store_settings(db: Session = Depends(get_db)):
    return get_public_store_settings(db)
